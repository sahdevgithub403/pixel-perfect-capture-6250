import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AppShell, StatusBadge } from "@/components/mine/AppShell";
import { Button } from "@/components/ui/button";
import { PRODUCTS, formatINR } from "@/data/products";
import { useDb } from "@/data/db";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: "Orders — MINE" }, { name: "description", content: "Order MINE QR tags and Safety ID cards." }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const db = useDb();
  return (
    <AppShell title="Orders">
      <div className="space-y-4">
        {Object.values(PRODUCTS).map((p) => (
          <div key={p.id} className="surface overflow-hidden">
            <img src={p.image} alt={p.name} width={1024} height={768} loading="lazy" className="aspect-[16/9] w-full object-cover" />
            <div className="p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold">{p.name}</h2>
                <span className="font-display font-bold text-primary">{formatINR(p.price)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.short}</p>
              <ul className="mt-3 space-y-1">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex gap-2 text-sm"><Check className="size-4 text-success" />{f}</li>
                ))}
              </ul>
              <Button asChild className="mt-4 w-full"><Link to="/orders/$productId" params={{ productId: p.id }}>View Details</Link></Button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wider text-muted-foreground">My orders</h3>
      {db.orders.length === 0 ? (
        <p className="surface p-4 text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="space-y-2">
          {db.orders.map((o) => (
            <li key={o.id}>
              <Link to="/order/$orderId" params={{ orderId: o.id }} className="surface flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-semibold">{o.number}</p>
                  <p className="text-xs text-muted-foreground">{PRODUCTS[o.productId].name} × {o.quantity} · {formatINR(o.total)}</p>
                </div>
                <StatusBadge status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
