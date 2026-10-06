import lostFoundImg from "@/assets/product-lostfound.jpg";
import personIdImg from "@/assets/product-personid.jpg";
import type { ProductId } from "@/types";

export type Product = {
  id: ProductId;
  name: string;
  short: string;
  description: string;
  features: string[];
  price: number;
  image: string;
  kind: "thing" | "person";
};

export const PRODUCTS: Record<ProductId, Product> = {
  "lost-found": {
    id: "lost-found",
    name: "Lost & Found QR",
    short: "For phones, bags, keys, wallets and more.",
    description:
      "A durable QR tag for your belongings. If it's lost, a finder scans it and can reach you privately — no app needed.",
    features: ["Private contact — your number stays hidden", "Text, voice & location from finders", "Mark lost or recovered anytime", "Waterproof tag + sticker"],
    price: 199,
    image: lostFoundImg,
    kind: "thing",
  },
  "person-id": {
    id: "person-id",
    name: "Person ID / Safety Card",
    short: "For children, elderly and family members.",
    description:
      "A safety card with a QR that helps anyone who finds your loved one contact you quickly and safely.",
    features: ["Wearable card with lanyard", "Emergency helplines on scan", "Location sharing by helper", "No personal details exposed"],
    price: 299,
    image: personIdImg,
    kind: "person",
  },
};

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
