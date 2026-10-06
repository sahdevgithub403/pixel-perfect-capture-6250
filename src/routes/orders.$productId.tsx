import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { AppShell } from "@/components/mine/AppShell";
import { Button } from "@/components/ui/button";
import { PRODUCTS, formatINR } from "@/data/products";
import type { ProductId } from "@/types";

export const Route = createFileRoute("/orders/$productId")({
  loader: ({ params }) => {
    const p = PRODUCTS[params.productId as ProductId];
    if (!p) throw notFound();
    return { id: p.id };
  },
  head: ({ loaderData }) => {
    const p = loaderData ? PRODUCTS[loaderData.id] : null;
    return { meta: [{ title: p ? `${p.name} — MINE` : "Product — MINE" }, { name: "description", content: p?.short ?? "MINE product" }] };
  },
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useLoaderData();
  const p = PRODUCTS[id];
  const [qty, setQty] = useState(1);
  return (
    <AppShell title={p.name} back>
      <img src={p.image} alt={p.name} width={1024} height={768} className="aspect-[4/3] w-full rounded-2xl object-cover" />
      <h2 className="mt-5 text-2xl font-bold">{p.name}</h2>
      <p className="mt-2 text-muted-foreground">{p.description}</p>
      <ul className="mt-4 space-y-2">
        {p.features.map((f) => <li key={f} className="flex gap-2 text-sm"><Check className="size-4 text-success" />{f}</li>)}
      </ul>
      <div className="surface mt-6 flex items-center justify-between p-4">
        <div>
          <p className="text-xs text-muted-foreground">{formatINR(p.price)} each</p>
          <p className="font-display text-2xl font-bold">{formatINR(p.price * qty)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="icon" variant="outline" aria-label="Decrease" disabled={qty <= 1} onClick={() => setQty(qty - 1)}><Minus /></Button>
          <span className="w-6 text-center text-lg font-bold" aria-live="polite">{qty}</span>
          <Button size="icon" variant="outline" aria-label="Increase" disabled={qty >= 10} onClick={() => setQty(qty + 1)}><Plus /></Button>
        </div>
      </div>
      <Button asChild size="lg" className="mt-4 w-full">
        <Link to="/checkout" search={{ product: p.id, qty }}>Order Now</Link>
      </Button>
    </AppShell>
  );
}
