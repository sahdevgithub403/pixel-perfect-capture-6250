import { cn } from "@/lib/utils";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-extrabold tracking-tight text-primary", big ? "text-4xl" : "text-xl")}>
      <span className={cn("grid place-items-center rounded-lg bg-primary text-primary-foreground", big ? "size-12 text-2xl" : "size-7 text-sm")}>M</span>
      MINE
    </span>
  );
}

export const TAGLINE = "Your things. Your people. Find them back.";
