import { HomeLayout } from "fumadocs-ui/layouts/home";
import { AIChatWidget } from "@/components/ai/chat-widget";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout {...baseOptions()}>
      <AIChatWidget mode="overlay" />
      {children}
    </HomeLayout>
  );
}
