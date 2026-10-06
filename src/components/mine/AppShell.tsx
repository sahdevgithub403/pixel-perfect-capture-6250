import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useHydrated } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell, Home, Package, PlusCircle, MessageSquare, User, Menu, QrCode, Settings, HelpCircle, Info, LogOut, ArrowLeft, FlaskConical,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDb } from "@/data/db";
import { authService, messageService } from "@/services";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/addon", label: "Add-on", icon: PlusCircle },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const MENU = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/assets", label: "My QR / Assets", icon: QrCode },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/addon", label: "Add-on", icon: PlusCircle },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help & Support", icon: HelpCircle },
  { to: "/about", label: "About MINE", icon: Info },
  { to: "/demo", label: "Demo Control Center", icon: FlaskConical },
] as const;

/** Redirects to login when signed out. Returns true when content can render. */
export function useRequireAuth() {
  const db = useDb();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  useEffect(() => {
    if (hydrated && !db.user) navigate({ to: db.onboarded ? "/login" : "/onboarding", replace: true });
  }, [hydrated, db.user, db.onboarded, navigate]);
  return hydrated && !!db.user;
}

export function AppShell({ children, title, back }: { children: ReactNode; title?: string; back?: boolean }) {
  const ok = useRequireAuth();
  const db = useDb();
  const router = useRouter();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unreadN = db.notifications.filter((n) => !n.read).length;
  const unreadM = messageService.active(db).filter((m) => !m.read).length;

  if (!ok) return <div className="min-h-screen bg-background" />;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/90 px-3 py-3 backdrop-blur">
        {back ? (
          <button aria-label="Back" onClick={() => router.history.back()} className="rounded-full p-2 hover:bg-muted">
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-full p-2 hover:bg-muted">
            <Menu className="size-5" />
          </button>
        )}
        <div className="flex-1 truncate">
          {title ? <h1 className="truncate text-lg font-semibold">{title}</h1> : <Logo />}
        </div>
        <Link to="/notifications" aria-label="Notifications" className="relative rounded-full p-2 hover:bg-muted">
          <Bell className="size-5" />
          {unreadN > 0 && (
            <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-lost px-1 text-[10px] font-bold text-lost-foreground">
              {unreadN}
            </span>
          )}
        </Link>
        <Link to="/profile" aria-label="Profile" className="grid size-8 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
          {(db.profile?.name || "M").charAt(0).toUpperCase()}
        </Link>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-5">
          {TABS.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to}
                className="relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
                activeProps={{ className: "text-primary" }}
              >
                <t.icon className="size-5" />
                {t.label}
                {t.to === "/messages" && unreadM > 0 && (
                  <span className="absolute right-[22%] top-1.5 size-2 rounded-full bg-lost" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle><Logo /></SheetTitle>
          </SheetHeader>
          <ul className="mt-2 space-y-0.5 px-2">
            {MENU.map((m) => (
              <li key={m.to}>
                <Link
                  to={m.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                >
                  <m.icon className="size-4" /> {m.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  authService.logout();
                  setOpen(false);
                  navigate({ to: "/login" });
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-muted"
              >
                <LogOut className="size-4" /> Logout
              </button>
            </li>
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-secondary text-secondary-foreground",
    LOST: "bg-lost text-lost-foreground",
    RECOVERED: "bg-success text-success-foreground",
    INACTIVE: "bg-muted text-muted-foreground",
    Placed: "bg-muted text-foreground",
    Processing: "bg-accent text-accent-foreground",
    Shipped: "bg-secondary text-secondary-foreground",
    Delivered: "bg-success text-success-foreground",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", styles[status])}>
      {status}
    </span>
  );
}

export function DemoTag({ children = "Demo mode" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-accent bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
      {children}
    </span>
  );
}
