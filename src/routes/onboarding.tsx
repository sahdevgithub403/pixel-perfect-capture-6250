import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, PhoneCall, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — MINE" }, { name: "description", content: "How MINE helps you recover what matters." }] }),
  component: Onboarding,
});

const SLIDES = [
  { icon: QrCode, title: "Protect what matters.", body: "Add a MINE QR to the things and people you care about." },
  { icon: PhoneCall, title: "If it's lost, someone can reach you.", body: "A finder can scan the QR and contact you without needing the MINE app." },
  { icon: ShieldCheck, title: "Scan. Contact. Recover.", body: "Simple recovery communication when it matters." },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const finish = () => {
    authService.completeOnboarding();
    navigate({ to: "/login" });
  };
  const S = SLIDES[i];
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-6">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={finish}>Skip</Button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-10 grid size-40 place-items-center rounded-[2.5rem] bg-secondary">
          <S.icon className="size-16 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold">{S.title}</h1>
        <p className="mt-3 max-w-xs text-muted-foreground">{S.body}</p>
      </div>
      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, k) => (
          <span key={k} className={cn("h-2 rounded-full transition-all", k === i ? "w-6 bg-primary" : "w-2 bg-border")} />
        ))}
      </div>
      {i < 2 ? (
        <Button size="lg" onClick={() => setI(i + 1)}>Next</Button>
      ) : (
        <Button size="lg" onClick={finish}>Get Started</Button>
      )}
    </div>
  );
}
