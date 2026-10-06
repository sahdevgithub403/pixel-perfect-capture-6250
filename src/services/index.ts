/**
 * Local mock services. Each object mirrors a future REST API surface
 * (e.g. Spring Boot) but persists to localStorage via the db module.
 * Swap implementations here without touching pages.
 */
import { getDb, now, resetDb, setDb } from "@/data/db";
import { PRODUCTS } from "@/data/products";
import type {
  Address,
  Asset,
  DB,
  Message,
  Order,
  OrderStatus,
  PaymentMethod,
  Profile,
  ProductId,
  TrustedContact,
} from "@/types";

export const DEMO_OTP = "123456";
const DAY = 24 * 60 * 60 * 1000;

const uid = () => crypto.randomUUID();
const hex = (n: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

async function network(ms?: number) {
  await delay(ms);
  if (getDb().settings.failNetwork) throw new Error("Network unavailable (simulated). Turn off in Demo Control Center.");
}

export const maskPhone = (p: string) => {
  const d = p.replace(/\D/g, "");
  return d.length >= 5 ? `+91 XXXXX ${d.slice(-5)}` : p;
};

export const emptyAddress = (label = "Home"): Address => ({
  id: uid(),
  label,
  house: "",
  street: "",
  area: "",
  city: "",
  state: "",
  pin: "",
});

export const formatAddress = (a: Address) =>
  [a.house, a.street, a.area, a.city, a.state, a.pin].filter(Boolean).join(", ");

/* ---------------- notificationService ---------------- */
export const notificationService = {
  push(title: string, body: string, link: string) {
    setDb((d) => {
      d.notifications.unshift({ id: uid(), title, body, link, read: false, createdAt: now() });
    });
    const perm = getDb().notifPermission;
    if (perm === "granted" && typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(title, { body });
      } catch {
        /* some browsers require a service worker; local center still works */
      }
    }
  },
  async requestPermission() {
    let result: "granted" | "denied" | "default" = "granted";
    if (typeof Notification !== "undefined") {
      try {
        result = await Notification.requestPermission();
      } catch {
        result = "granted";
      }
    }
    setDb((d) => {
      d.notifPermission = result;
    });
    return result;
  },
  setPermission(p: DB["notifPermission"]) {
    setDb((d) => {
      d.notifPermission = p;
    });
  },
  markRead(id: string) {
    setDb((d) => {
      const n = d.notifications.find((x) => x.id === id);
      if (n) n.read = true;
    });
  },
  markAllRead() {
    setDb((d) => d.notifications.forEach((n) => (n.read = true)));
  },
};

/* ---------------- authService ---------------- */
export const authService = {
  async sendOtp(phone: string) {
    await network(700);
    if (phone.replace(/\D/g, "").length < 10) throw new Error("Enter a valid 10-digit mobile number");
    return { sent: true };
  },
  async verifyOtp(phone: string, otp: string) {
    await network(600);
    if (otp !== DEMO_OTP) throw new Error("Incorrect OTP. Please try again.");
    setDb((d) => {
      d.user = { id: d.user?.id ?? uid(), phone, verifiedAt: Date.now() };
      if (!d.profile) d.profile = { name: "", phone, email: "", address: emptyAddress() };
    });
  },
  logout() {
    setDb((d) => {
      d.user = null;
    });
  },
  completeOnboarding() {
    setDb((d) => {
      d.onboarded = true;
    });
  },
};

/* ---------------- profileService ---------------- */
export const profileService = {
  completion(p: Profile | null) {
    if (!p) return 0;
    const fields = [p.name, p.phone, p.email, p.address.house, p.address.street, p.address.area, p.address.city, p.address.state, p.address.pin];
    return Math.round((fields.filter((f) => f && f.trim()).length / fields.length) * 100);
  },
  async save(p: Profile) {
    await network(400);
    setDb((d) => {
      d.profile = p;
    });
  },
  addAddress(a: Address) {
    setDb((d) => {
      d.addresses.push(a);
    });
  },
};

/* ---------------- locationService ---------------- */
export const DEMO_LOCATION = { lat: 12.9716, lng: 77.5946, accuracy: 120 };
export const locationService = {
  current(): Promise<{ lat: number; lng: number; accuracy: number; demo: boolean }> {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) return resolve({ ...DEMO_LOCATION, demo: true });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, demo: false }),
        () => resolve({ ...DEMO_LOCATION, demo: true }),
        { timeout: 8000, enableHighAccuracy: false },
      );
    });
  },
  async reverse(lat: number, lng: number, demo: boolean): Promise<Partial<Address>> {
    // No geocoding API in serverless mode: fill only what we can honestly infer.
    if (demo) return { area: "MG Road", city: "Bengaluru", state: "Karnataka", pin: "560001" };
    return { street: `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}` };
  },
};

/* ---------------- paymentService ---------------- */
export const paymentService = {
  async pay(method: PaymentMethod, amount: number) {
    await delay(1600);
    if (getDb().settings.failPayment) throw new Error("Payment failed (simulated). Disable failure in Demo Control Center.");
    return { txnId: `DEMO-TXN-${hex(4)}`, method, amount };
  },
};

/* ---------------- qrService ---------------- */
export const qrService = {
  newPublicId() {
    const existing = new Set(getDb().assets.map((a) => a.publicId));
    let id = `MINE-${hex(3)}`;
    while (existing.has(id)) id = `MINE-${hex(3)}`;
    return id;
  },
  finderUrl(publicId: string) {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/f/${publicId}`;
  },
};

/* ---------------- assetService ---------------- */
export const assetService = {
  generateForOrder(d: DB, order: Order) {
    const p = PRODUCTS[order.productId];
    const ownerId = d.user?.id ?? "unknown";
    const taken = new Set(d.assets.map((a) => a.publicId));
    for (let i = 0; i < order.quantity; i++) {
      let pid = `MINE-${hex(3)}`;
      while (taken.has(pid)) pid = `MINE-${hex(3)}`;
      taken.add(pid);
      d.assets.push({
        id: uid(),
        publicId: pid,
        ownerId,
        orderId: order.id,
        productId: order.productId,
        kind: p.kind,
        name: `${p.kind === "thing" ? "Lost & Found QR" : "Person ID"} ${d.assets.filter((a) => a.productId === order.productId).length + 1}`,
        category: p.kind === "thing" ? "Other" : "Family member",
        notes: "",
        status: "ACTIVE",
        scanCount: 0,
        createdAt: now(),
      });
    }
    order.assetsGenerated = true;
  },
  update(id: string, patch: Partial<Pick<Asset, "name" | "category" | "notes">>) {
    setDb((d) => {
      const a = d.assets.find((x) => x.id === id);
      if (a) Object.assign(a, patch);
    });
  },
  setStatus(id: string, status: Asset["status"]) {
    let asset: Asset | undefined;
    setDb((d) => {
      asset = d.assets.find((x) => x.id === id);
      if (asset) asset.status = status;
    });
    if (!asset) return;
    if (status === "LOST") notificationService.push("Asset marked lost", `Your ${asset.name} was marked as lost.`, `/assets/${id}`);
    if (status === "RECOVERED") notificationService.push("Asset recovered", `Your ${asset.name} has been marked as recovered.`, `/assets/${id}`);
  },
  findPublic(publicId: string) {
    return getDb().assets.find((a) => a.publicId.toUpperCase() === publicId.toUpperCase());
  },
};

/* ---------------- orderService ---------------- */
const STATUS_FLOW: OrderStatus[] = ["Placed", "Processing", "Shipped", "Delivered"];
export const orderService = {
  STATUS_FLOW,
  async create(input: { productId: ProductId; quantity: number; address: Address; paymentMethod: PaymentMethod }) {
    await network(300);
    const p = PRODUCTS[input.productId];
    const order: Order = {
      id: uid(),
      number: `MINE-ORD-${10000 + Math.floor(Math.random() * 89999)}`,
      productId: input.productId,
      quantity: input.quantity,
      unitPrice: p.price,
      total: p.price * input.quantity,
      address: input.address,
      paymentMethod: input.paymentMethod,
      status: "Placed",
      createdAt: now(),
      assetsGenerated: false,
    };
    setDb((d) => {
      d.orders.unshift(order);
    });
    notificationService.push("Order placed", `${order.number} · ${p.name} × ${order.quantity}`, `/order/${order.id}`);
    return order;
  },
  advance(id: string, to?: OrderStatus) {
    let o: Order | undefined;
    setDb((d) => {
      o = d.orders.find((x) => x.id === id);
      if (!o) return;
      const next: OrderStatus = to ?? STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(o.status) + 1, 3)]!;
      o.status = next;
      if (next === "Delivered" && !o.assetsGenerated) assetService.generateForOrder(d, o);
    });
    if (!o) return;
    if (o.status === "Shipped") notificationService.push("Order shipped", `${o.number} is on its way.`, `/order/${o.id}`);
    if (o.status === "Delivered") notificationService.push("QR activated", `${o.quantity} QR code(s) from ${o.number} are now active.`, "/assets");
  },
};

/* ---------------- messageService ---------------- */
export const messageService = {
  active(d: DB) {
    const t = d.settings.timeOffsetMs + Date.now();
    return d.messages.filter((m) => m.expiresAt > t).sort((a, b) => b.createdAt - a.createdAt);
  },
  create(m: Omit<Message, "id" | "read" | "createdAt" | "expiresAt">) {
    const created = now();
    const msg: Message = { ...m, id: uid(), read: false, createdAt: created, expiresAt: created + DAY };
    setDb((d) => {
      d.messages.unshift(msg);
    });
    const asset = getDb().assets.find((a) => a.publicId === m.qrId);
    const name = asset?.name ?? m.qrId;
    const titles = { text: "New message received", voice: "Voice message received", location: "Location received", recovery: "Finder tried to call" };
    notificationService.push(titles[m.type], `About your ${name}`, `/messages/${msg.id}`);
    return msg;
  },
  markRead(id: string) {
    setDb((d) => {
      const m = d.messages.find((x) => x.id === id);
      if (m) m.read = true;
    });
  },
  expireAll() {
    setDb((d) => {
      d.settings.timeOffsetMs += DAY + 1000;
    });
  },
};

/* ---------------- finderService ---------------- */
export const DEMO_TRANSCRIPTS = [
  "I found your bag near the park entrance.",
  "Hi, I picked this up at the bus stop. I'll leave it at the security desk.",
  "Found this in the cafe on 4th street, please contact me.",
];
export const finderService = {
  recordScan(publicId: string) {
    const a = assetService.findPublic(publicId);
    if (!a) return;
    setDb((d) => {
      const x = d.assets.find((y) => y.id === a.id);
      if (x) x.scanCount += 1;
    });
    notificationService.push("Someone scanned your QR", `Your ${a.name} was just scanned.`, `/assets/${a.id}`);
  },
  async call(publicId: string) {
    await delay(1500);
    messageService.create({ qrId: publicId, type: "recovery", content: "A finder attempted to call you via MINE (demo call)." });
  },
  async sendText(publicId: string, content: string) {
    await network(500);
    return messageService.create({ qrId: publicId, type: "text", content });
  },
  async sendVoice(publicId: string, audioUrl: string | undefined, durationSec: number) {
    await network(800);
    const transcript = DEMO_TRANSCRIPTS[Math.floor(Math.random() * DEMO_TRANSCRIPTS.length)];
    return messageService.create({ qrId: publicId, type: "voice", content: "Voice message", ...(audioUrl ? { audioUrl } : {}), durationSec, transcript: transcript ?? "", demoAudio: !audioUrl });
  },
  async sendLocation(publicId: string) {
    const loc = await locationService.current();
    await network(300);
    return messageService.create({
      qrId: publicId,
      type: "location",
      content: loc.demo ? "Demo location shared" : "Approximate location shared",
      lat: loc.lat,
      lng: loc.lng,
      accuracy: loc.accuracy,
      demoLocation: loc.demo,
    });
  },
};

/* ---------------- contactService ---------------- */
export const contactService = {
  save(c: TrustedContact) {
    setDb((d) => {
      const i = d.contacts.findIndex((x) => x.id === c.id);
      if (i >= 0) d.contacts[i] = c;
      else d.contacts.push(c);
    });
  },
  remove(id: string) {
    setDb((d) => {
      d.contacts = d.contacts.filter((c) => c.id !== id);
    });
  },
  newId: uid,
  seedDemo() {
    setDb((d) => {
      if (d.contacts.some((c) => c.name === "Rahul")) return;
      d.contacts.push(
        { id: uid(), name: "Rahul", relationship: "Brother", phone: "+91 98765 43210", status: "Active" },
        { id: uid(), name: "Priya", relationship: "Sister", phone: "+91 91234 12345", status: "Pending" },
      );
    });
  },
};

/* ---------------- demoService ---------------- */
export const demoService = {
  reset: resetDb,
  createSampleUser() {
    setDb((d) => {
      d.onboarded = true;
      d.notifPermission = d.notifPermission ?? "default";
      d.user = { id: d.user?.id ?? uid(), phone: "+91 9876543210", verifiedAt: Date.now() };
      d.profile = {
        name: "Ananya Sharma",
        phone: "+91 9876543210",
        email: "ananya@example.com",
        address: { id: uid(), label: "Home", house: "Flat 302, Lotus Residency", street: "12th Cross", area: "Indiranagar", city: "Bengaluru", state: "Karnataka", pin: "560038" },
      };
    });
  },
  async sampleOrder(productId: ProductId = "lost-found", quantity = 2) {
    const d = getDb();
    if (!d.user) demoService.createSampleUser();
    const o = await orderService.create({ productId, quantity, address: getDb().profile!.address, paymentMethod: "UPI" });
    return o;
  },
  async sampleQr() {
    const o = await demoService.sampleOrder("lost-found", 1);
    orderService.advance(o.id, "Delivered");
  },
  simulateDuplicate() {
    setDb((d) => {
      d.duplicateScans += 1;
      const purchased = d.orders.filter((o) => o.assetsGenerated).reduce((s, o) => s + o.quantity, 0);
      d.alerts.unshift({
        id: uid(),
        title: "Possible QR duplication detected.",
        detail: `Purchased: ${purchased} · Assigned: ${d.assets.length} · Active: ${d.assets.filter((a) => a.status !== "INACTIVE").length + d.duplicateScans}`,
        createdAt: now(),
      });
    });
  },
  toggle(key: "failPayment" | "failNetwork") {
    setDb((d) => {
      d.settings[key] = !d.settings[key];
    });
  },
};
