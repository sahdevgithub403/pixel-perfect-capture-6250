import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/mine/AppShell";

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({ product: String(s.product ?? "lost-found"), qty: Number(s.qty ?? 1) }),
  head: () => ({ meta: [{ title: "Checkout — MINE" }] }),
  component: () => (
    <AppShell title="Checkout" back>
      <p className="surface p-4 text-sm text-muted-foreground">Checkout is not built yet.</p>
    </AppShell>
  ),
});
