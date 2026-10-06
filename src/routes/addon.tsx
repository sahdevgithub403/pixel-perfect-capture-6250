import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/mine/AppShell";

export const Route = createFileRoute("/addon")({
  head: () => ({ meta: [{ title: "MINE" }] }),
  component: () => (
    <AppShell back>
      <p className="surface p-4 text-sm text-muted-foreground">This screen is not built yet.</p>
    </AppShell>
  ),
});
