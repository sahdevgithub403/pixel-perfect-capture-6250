export type Address = {
  id: string;
  label: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pin: string;
};

export type User = { id: string; phone: string; verifiedAt: number };

export type Profile = {
  name: string;
  phone: string;
  email: string;
  address: Address;
};

export type ProductId = "lost-found" | "person-id";
export type OrderStatus = "Placed" | "Processing" | "Shipped" | "Delivered";
export type PaymentMethod = "UPI" | "Card" | "Net Banking" | "Cash on Delivery";

export type Order = {
  id: string;
  number: string;
  productId: ProductId;
  quantity: number;
  unitPrice: number;
  total: number;
  address: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
  assetsGenerated: boolean;
};

export type AssetStatus = "ACTIVE" | "LOST" | "RECOVERED" | "INACTIVE";
export type Asset = {
  id: string;
  publicId: string;
  ownerId: string;
  orderId: string;
  productId: ProductId;
  kind: "thing" | "person";
  name: string;
  category: string;
  notes: string;
  status: AssetStatus;
  scanCount: number;
  createdAt: number;
};

export type MessageType = "text" | "voice" | "location" | "recovery";
export type Message = {
  id: string;
  qrId: string;
  type: MessageType;
  content: string;
  audioUrl?: string;
  durationSec?: number;
  transcript?: string;
  demoAudio?: boolean;
  lat?: number;
  lng?: number;
  accuracy?: number;
  demoLocation?: boolean;
  read: boolean;
  createdAt: number;
  expiresAt: number;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: number;
};

export type TrustedContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  status: "Active" | "Pending";
};

export type Alert = { id: string; title: string; detail: string; createdAt: number };

export type Settings = {
  failPayment: boolean;
  failNetwork: boolean;
  timeOffsetMs: number;
};

export type DB = {
  onboarded: boolean;
  notifPermission: "granted" | "denied" | "default" | null;
  user: User | null;
  profile: Profile | null;
  addresses: Address[];
  contacts: TrustedContact[];
  orders: Order[];
  assets: Asset[];
  messages: Message[];
  notifications: Notification[];
  alerts: Alert[];
  duplicateScans: number;
  settings: Settings;
};
