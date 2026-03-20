import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { type ModelMessage, streamText, tool, type UIMessage } from "ai";
import { Document, type DocumentData } from "flexsearch";
import { z } from "zod";
import { source } from "@/lib/source";

interface DocSection {
  title: string;
  url: string; // page url + anchor, e.g. /docs/database#sql-vs-nosql
}

// CustomDocument stored in FlexSearch — sections must be kept separate
// because DocumentData's index signature only allows scalar DocumentValue types
interface CustomDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}

// EnrichedDocument is a plain interface (not extending DocumentData) so that
// sections: DocSection[] doesn't conflict with the DocumentData index signature
interface EnrichedDocument {
  url: string;
  title: string;
  description: string;
  content: string;
  sections: DocSection[];
}

const ToolOutputSchema = z.array(
  z.object({
    url: z.string(),
    title: z.string(),
    description: z.string(),
    content: z.string(),
    sections: z.array(z.object({ title: z.string(), url: z.string() })).default([]),
  }),
);


function getRequiredEnv(name: "OPENROUTER_API_KEY"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getOptionalEnv(
  name: "OPENROUTER_MODEL" | "OPENROUTER_BASE_URL",
  fallback: string,
): string {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

const searchServer = createSearchServer();
const openrouterApiKey = getRequiredEnv("OPENROUTER_API_KEY");
const openrouterModel = getOptionalEnv(
  "OPENROUTER_MODEL",
  "minimax/minimax-m2.5:free",
);
const openrouterBaseUrl = getOptionalEnv(
  "OPENROUTER_BASE_URL",
  "https://openrouter.ai/api/v1",
);

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: "url",
      index: ["title", "description", "content"],
      store: true,
    },
  });

  // Store sections separately since DocSection[] can't go inside FlexSearch DocumentData
  const sectionsMap = new Map<string, DocSection[]>();

  try {
    const docs = await chunkedAll(
      source.getPages().map(async (page) => {
        if (!("getText" in page.data)) return null;

        // Build section links from the page's table of contents
        const toc: Array<{ url: string; title: unknown }> = Array.isArray(page.data.toc)
          ? (page.data.toc as Array<{ url: string; title: unknown }>)
          : [];
        const sections: DocSection[] = toc
          .filter((item) => typeof item.url === "string" && item.url.startsWith("#"))
          .map((item) => ({
            title: typeof item.title === "string" ? item.title : String(item.title ?? ""),
            url: `${page.url}${item.url}`,
          }));

        return {
          title: page.data.title,
          description: page.data.description,
          url: page.url,
          content: await page.data.getText("processed"),
          sections,
        };
      }),
    );

    for (const doc of docs) {
      if (doc) {
        const { sections, ...docWithoutSections } = doc;
        sectionsMap.set(doc.url, sections);
        search.add(docWithoutSections as CustomDocument);
      }
    }
  } catch (error) {
    console.error("[chat] failed to initialize docs search index", error);
  }

  return { search, sectionsMap };
}


async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}

const openrouter = createOpenRouter({
  apiKey: openrouterApiKey,
  baseURL: openrouterBaseUrl,
});

const baseSystemPrompt = [
  "You are an AI assistant for a documentation site.",
  "Give direct, concise, practical answers with clear markdown sections and short bullet points when useful.",
  "Do not expose chain-of-thought or thinking process in the visible response. Keep reasoning internal.",
  "Use the provided documentation context as the primary source of truth when it is relevant to the question.",
  "Always cite your sources as clickable markdown links. Prefer linking to the most specific section possible:",
  "  - If a doc section (from the `sections` list) directly covers the topic, use that section's URL (e.g. [SQL vs NoSQL](/docs/database#sql-vs-nosql)).",
  "  - Otherwise fall back to the page URL (e.g. [Database](/docs/database)).",
  "  - Never invent URLs — only use `url` and `sections[].url` values from the provided context.",
  "If documentation context does not contain the answer, clearly say what is missing and suggest a better search query.",
].join("\n");


const docsContextFallback =
  "No relevant documentation snippets were found for this question. If unsure, state that and suggest a more specific query.";

function stripHarmonyMarkers(text: string): string {
  return text.replace(/<\|[^>]+\|>/g, "").trim();
}

function extractHarmonyFinal(text: string): string {
  const finalMatch =
    text.match(
      /<\|start\|>assistant[\s\S]*?<\|channel\|>final<\|message\|>([\s\S]*?)(?:<\|end\|>|$)/i,
    ) ??
    text.match(/<\|channel\|>final<\|message\|>([\s\S]*?)(?:<\|end\|>|$)/i);

  return stripHarmonyMarkers(finalMatch?.[1] ?? text);
}

function extractVisibleTextFromMessage(message: UIMessage): string {
  const chunks: string[] = [];

  for (const part of message.parts ?? []) {
    if (part.type === "text") {
      const visible = extractHarmonyFinal(part.text).replace(
        /<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi,
        "",
      );
      if (visible.trim().length > 0) chunks.push(visible.trim());
    }
  }

  if (chunks.length === 0) {
    const candidate = message as UIMessage & {
      content?: unknown;
    };

    if (typeof candidate.content === "string") {
      const fallback = extractHarmonyFinal(candidate.content).replace(
        /<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi,
        "",
      );
      if (fallback.trim().length > 0) return fallback.trim();
    }

    if (Array.isArray(candidate.content)) {
      const parts = candidate.content
        .map((part) => {
          if (typeof part === "string") return part;
          if (
            typeof part === "object" &&
            part !== null &&
            "text" in part &&
            typeof part.text === "string"
          ) {
            return part.text;
          }
          return "";
        })
        .filter((part) => part.trim().length > 0);

      if (parts.length > 0) return parts.join("\n\n").trim();
    }
  }

  return chunks.join("\n\n").trim();
}

function toModelHistory(messages: UIMessage[]): ModelMessage[] {
  const history: ModelMessage[] = [];

  for (const message of messages) {
    if (message.role !== "user" && message.role !== "assistant") continue;

    const text = extractVisibleTextFromMessage(message);
    if (!text) continue;

    history.push({
      role: message.role,
      content: text,
    });
  }

  return history;
}

function isFirstTurn(history: ModelMessage[]): boolean {
  let userCount = 0;
  let assistantCount = 0;

  for (const message of history) {
    if (message.role === "user") userCount += 1;
    if (message.role === "assistant") assistantCount += 1;
  }

  return userCount === 1 && assistantCount === 0;
}

function getLatestUserText(history: ModelMessage[]): string {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const message = history[i];
    if (message.role !== "user") continue;

    if (typeof message.content === "string") return message.content;

    if (Array.isArray(message.content)) {
      const text = message.content
        .map((part) => {
          if (typeof part === "string") return part;
          if (
            typeof part === "object" &&
            part !== null &&
            "text" in part &&
            typeof part.text === "string"
          ) {
            return part.text;
          }
          return "";
        })
        .join(" ")
        .trim();

      if (text.length > 0) return text;
    }
  }

  return "";
}

function snippet(text: string, max = 1200): string {
  return text.replace(/\s+/g, " ").trim().slice(0, max);
}

async function getDocsContextForQuery(
  query: string,
  limit = 4,
): Promise<EnrichedDocument[]> {
  if (query.trim().length === 0) return [];

  const { search, sectionsMap } = await searchServer;
  const raw = await search.searchAsync(query, {
    limit,
    merge: true,
    enrich: true,
  });
  const normalized = normalizeSearchResults(raw);
  return normalized.slice(0, limit).map((doc) => ({
    ...doc,
    sections: sectionsMap.get(doc.url) ?? [],
  }));
}


function buildDocsContext(docs: EnrichedDocument[]): string {
  if (docs.length === 0) return docsContextFallback;

  const lines = docs.map((doc, index) => {
    const sectionLines =
      doc.sections.length > 0
        ? `   sections:\n${doc.sections
            .map((s: DocSection) => `     - [${s.title}](${s.url})`)
            .join("\n")}`
        : "";
    return [
      `${index + 1}. title: ${doc.title}`,
      `   url: ${doc.url}`,
      `   description: ${doc.description}`,
      `   excerpt: ${snippet(doc.content as string)}`,
      sectionLines,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return ["Relevant documentation context for this question:", ...lines].join(
    "\n",
  );
}

function formatHistoryForSingleTurnModel(history: ModelMessage[]): string {
  const lines: string[] = [];

  for (const message of history) {
    if (typeof message.content !== "string") continue;
    const role = message.role === "assistant" ? "Assistant" : "User";
    const content = message.content.trim();
    if (content.length === 0) continue;
    lines.push(`${role}: ${content}`);
  }

  return lines.join("\n\n");
}

function buildModelMessages(history: ModelMessage[]): ModelMessage[] {
  if (history.length <= 1) return history;

  const transcript = formatHistoryForSingleTurnModel(history);
  const latestUserText = getLatestUserText(history);

  return [
    {
      role: "user",
      content: [
        "Conversation history for context:",
        transcript,
        "Latest user question to answer now:",
        latestUserText,
      ]
        .filter((section) => section.trim().length > 0)
        .join("\n\n"),
    },
  ];
}

export async function POST(req: Request) {
  try {
    const reqJson: { messages?: UIMessage[] } = await req.json();
    const incomingMessages = Array.isArray(reqJson.messages)
      ? reqJson.messages
      : [];
    const history = toModelHistory(incomingMessages);
    const latestUserText = getLatestUserText(history);
    const docs = await getDocsContextForQuery(latestUserText);
    const docsContext = buildDocsContext(docs);
    const systemPrompt = [baseSystemPrompt, docsContext]
      .filter(Boolean)
      .join("\n\n");
    const modelMessages = buildModelMessages(history);

    const result = streamText({
      model: openrouter.chat(openrouterModel),
      messages: [{ role: "system", content: systemPrompt }, ...modelMessages],
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[chat] request failed", error);

    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while starting the chat response.";

    return Response.json({ error: message }, { status: 500 });
  }
}

function normalizeSearchResults(raw: unknown): CustomDocument[] {
  const queue = [raw];
  const results: CustomDocument[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (typeof current !== "object") {
      continue;
    }

    const candidate = current as Record<string, unknown>;
    if (
      typeof candidate.url === "string" &&
      typeof candidate.title === "string" &&
      typeof candidate.description === "string" &&
      typeof candidate.content === "string"
    ) {
      results.push({
        url: candidate.url,
        title: candidate.title,
        description: candidate.description,
        content: candidate.content,
      });
      continue;
    }

    for (const value of Object.values(candidate)) {
      if (
        Array.isArray(value) ||
        (typeof value === "object" && value !== null)
      ) {
        queue.push(value);
      }
    }
  }

  return ToolOutputSchema.parse(results);
}

const searchTool = tool({
  description: "Search the docs content and return raw JSON results.",
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  async execute({ query, limit }) {
    const { search } = await searchServer;
    const raw = await search.searchAsync(query, {
      limit,
      merge: true,
      enrich: true,
    });
    return normalizeSearchResults(raw);
  },
});

export type SearchTool = typeof searchTool;
