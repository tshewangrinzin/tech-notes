import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { AIChatWidget } from "@/components/ai/chat-widget";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      <AIChatWidget mode="docs" />

      {children}
    </DocsLayout>
  );
}
