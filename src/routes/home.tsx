import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PlayCircle, QrCode, IdCard, Boxes, MessageSquare, ShieldAlert, ChevronRight } from "lucide-react";
import { AppShell, StatusBadge } from "@/components/mine/AppShell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useDb } from "@/data/db";
import { profileService } from "@/services";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "Home — MINE" }, { name: "description", content: "Your MINE dashboard." }] }),
  component: HomePage,
});

const ACTIONS = [
  { to: "/orders/$productId", params: { productId: "lost-found" }, label: "Lost & Found", icon: QrCode },
  { to: "/orders/$productId", params: { productId: "person-id" }, label: "Person ID", icon: IdCard },
  { to: "/assets", label: "My QR / Assets", icon: Boxes },
  { to: "/messages", label: "Messages", icon: MessageSquare },
] as const;

function HomePage() {
  const db = useDb();
  const pct = profileService.completion(db.profile);
  const [video, setVideo] = useState(false);
  const lost = db.assets.filter((a) => a.status === "LOST");
  const first = db.profile?.name?.split(" ")[0];

  return (
    <AppShell>
      <h2 className="text-2xl font-bold">{first ? `Hi, ${first}` : "Welcome to MINE"}</h2>
      <p className="text-sm text-muted-foreground">Your things. Your people. Find them back.</p>

      {pct < 100 && (
        <Link to="/profile/edit" className="surface mt-5 block p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Complete your profile</p>
              <p className="text-xs text-muted-foreground">Required before placing an order</p>
            </div>
            <span className="font-display text-xl font-bold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="mt-3 h-2" />
        </Link>
      )}

      {lost.length > 0 && (
        <div className="mt-4 space-y-2">
          {lost.map((a) => (
            <Link key={a.id} to="/assets/$assetId" params={{ assetId: a.id }} className="flex items-center gap-3 rounded-xl bg-lost/10 p-3">
              <ShieldAlert className="size-5 text-lost" />
              <span className="flex-1 text-sm font-semibold">{a.name}</span>
              <StatusBadge status="LOST" />
            </Link>
          ))}
        </div>
      )}

      <h3 className="mb-3 mt-7 text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((a) => (
          <Link key={a.label} to={a.to} params={"params" in a ? a.params : undefined} className="surface flex flex-col gap-3 p-4 hover:border-primary">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary"><a.icon className="size-5 text-primary" /></span>
            <span className="text-sm font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      <h3 className="mb-3 mt-7 text-sm font-bold uppercase tracking-wider text-muted-foreground">How MINE works</h3>
      <button onClick={() => setVideo(true)} className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground">
        <PlayCircle className="size-14" strokeWidth={1.25} />
        <span className="absolute bottom-3 left-4 text-sm font-semibold">Watch: Scan. Contact. Recover. (1:20)</span>
      </button>

      <h3 className="mb-3 mt-7 text-sm font-bold uppercase tracking-wider text-muted-foreground">Safety guidance</h3>
      <ul className="surface divide-y">
        {[
          "Mark an item Lost as soon as you notice it's missing.",
          "Never share OTPs or personal details with finders.",
          "Meet finders in public places when collecting items.",
          "For a missing person, call 112 first, then use MINE.",
        ].map((t) => (
          <li key={t} className="flex items-start gap-3 p-3 text-sm"><ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />{t}</li>
        ))}
      </ul>

      <Dialog open={video} onOpenChange={setVideo}>
        <DialogContent>
          <DialogHeader><DialogTitle>How MINE works</DialogTitle></DialogHeader>
          <div className="grid aspect-video place-items-center rounded-xl bg-muted text-center text-sm text-muted-foreground">
            Video placeholder — the product video will appear here.
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Attach a MINE QR to your item or give a Safety Card to a loved one.</li>
            <li>A finder scans it with any phone camera.</li>
            <li>They message, call or share location — your number stays private.</li>
          </ol>
          <Button onClick={() => setVideo(false)}>Got it</Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
