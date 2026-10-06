import { createFileRoute, useNavigate, useHydrated } from "@tanstack/react-router";
import { useEffect } from "react";
import { getDb } from "@/data/db";
import { Logo, TAGLINE } from "@/components/mine/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MINE — Your things. Your people. Find them back." },
      { name: "description", content: "QR tags and safety ID cards that let finders reach you privately." },
      { property: "og:title", content: "MINE — Lost & Found QR" },
      { property: "og:description", content: "QR tags and safety ID cards that let finders reach you privately." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      const d = getDb();
      if (!d.onboarded) navigate({ to: "/onboarding", replace: true });
      else if (!d.user) navigate({ to: "/login", replace: true });
      else if (d.notifPermission === null) navigate({ to: "/permissions", replace: true });
      else navigate({ to: "/home", replace: true });
    }, 1200);
    return () => clearTimeout(t);
  }, [hydrated, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Logo size="lg" />
      <p className="max-w-xs text-muted-foreground">{TAGLINE}</p>
    </div>
  );
}
