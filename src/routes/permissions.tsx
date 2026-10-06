import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services";

export const Route = createFileRoute("/permissions")({
  head: () => ({ meta: [{ title: "Stay Updated — MINE" }, { name: "description", content: "Enable notifications for finder messages." }] }),
  component: Permissions,
});

function Permissions() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-8 grid size-28 place-items-center rounded-full bg-accent/30">
          <BellRing className="size-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Stay Updated</h1>
        <p className="mt-3 max-w-xs text-muted-foreground">Get notified when someone finds your item or sends you a message.</p>
      </div>
      <Button size="lg" onClick={async () => { await notificationService.requestPermission(); navigate({ to: "/home" }); }}>Allow Notifications</Button>
      <Button variant="ghost" className="mt-2" onClick={() => { notificationService.setPermission("denied"); navigate({ to: "/home" }); }}>Not Now</Button>
    </div>
  );
}
