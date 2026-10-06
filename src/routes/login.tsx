import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/mine/Logo";
import { DemoTag } from "@/components/mine/AppShell";
import { authService } from "@/services";
import { getDb } from "@/data/db";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — MINE" }, { name: "description", content: "Sign in to MINE with your mobile number." }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [busy, setBusy] = useState(false);
  const full = `+91 ${phone.replace(/\D/g, "")}`;

  const send = async () => {
    setBusy(true);
    try {
      await authService.sendOtp(phone);
      toast.success("OTP sent");
      setStep("otp");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const verify = async () => {
    setBusy(true);
    try {
      await authService.verifyOtp(full, otp);
      navigate({ to: getDb().notifPermission === null ? "/permissions" : "/home", replace: true });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <div className="flex items-center justify-between">
        <Logo />
        <DemoTag />
      </div>
      <div className="mt-16">
        {step === "phone" ? (
          <>
            <h1 className="text-3xl font-bold">Enter your mobile number</h1>
            <p className="mt-2 text-muted-foreground">We'll send a one-time code to verify it.</p>
            <div className="mt-8 flex items-center gap-2">
              <span className="surface px-3 py-2 text-sm font-semibold">+91</span>
              <Input inputMode="numeric" autoFocus placeholder="98765 43210" value={phone} maxLength={11}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, ""))} className="h-11 text-base" />
            </div>
            <Button size="lg" className="mt-6 w-full" disabled={busy} onClick={send}>{busy ? "Sending…" : "Continue"}</Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Verify OTP</h1>
            <p className="mt-2 text-muted-foreground">Enter the 6-digit code sent to {full}.</p>
            <Input inputMode="numeric" autoFocus placeholder="••••••" maxLength={6} value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && otp.length === 6 && verify()}
              className="mt-8 h-12 text-center text-xl tracking-[0.5em]" />
            <Button size="lg" className="mt-6 w-full" disabled={busy || otp.length !== 6} onClick={verify}>{busy ? "Verifying…" : "Verify"}</Button>
            <div className="mt-4 flex justify-between text-sm">
              <button className="text-muted-foreground underline" onClick={() => setStep("phone")}>Change number</button>
              <button className="text-primary underline" onClick={send}>Resend OTP</button>
            </div>
            <p className="mt-10 text-center text-xs text-muted-foreground">No SMS is sent in this prototype. Demo code: see Help &amp; Support.</p>
          </>
        )}
      </div>
    </div>
  );
}
