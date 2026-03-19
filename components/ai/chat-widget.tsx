"use client";

import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { MessageCircleIcon } from "lucide-react";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/ai/search";
import { cn } from "@/lib/cn";

export function AIChatWidget({ mode = "docs" }: { mode?: "docs" | "overlay" }) {
  return (
    <AISearch>
      <AISearchPanel mode={mode} />
      <AISearchTrigger
        position="float"
        className={cn(
          buttonVariants({
            className:
              "text-fd-primary bg-fd-card border-fd-border hover:border-fd-primary hover:bg-fd-card rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg",
          }),
        )}
      >
        <MessageCircleIcon className="size-4.5" />
        Ask AI
      </AISearchTrigger>
    </AISearch>
  );
}
