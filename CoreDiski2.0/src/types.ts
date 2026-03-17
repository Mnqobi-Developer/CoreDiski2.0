export type Shirt = {
  id: string;
  clubOrNation: string;
  title: string;
  season: string;
  variant: string;
  price: number;
  imageUrl: string;
  tags: string[];
  featured?: boolean;
};

export type CreateShirtInput = Omit<Shirt, 'id'>;

export type NewsletterSubscription = {
  email: string;
  subscribedAt: string;
};

export type ShirtSize = 'S' | 'M' | 'L' | 'XL';

export type CartItem = {
  id: string;
  shirtId: string;
  size: ShirtSize;
  quantity: number;
  addedAt: string;
};

export type WishlistItem = {
  id: string;
  shirtId: string;
  size: ShirtSize;
  addedAt: string;
};

export type UserAccount = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  emailPreferences?: string;
  createdAt: string;
  isAdmin?: boolean;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationSentAt?: string;
};

export type AuthSession = {
  userId: string;
  signedInAt: string;
};

export type AdminUserRecord = Omit<UserAccount, 'password'>;

export type OrderItem = {
  shirtId: string;
  size: ShirtSize;
  quantity: number;
  unitPrice: number;
};

export type PaymentMethod = 'yoco_hosted';

export type PaymentGatewayRequest = {
  amount: number;
  currency: 'ZAR';
  provider: 'yoco';
  method: PaymentMethod;
  customerEmail: string;
};

export type PaymentGatewayResult = {
  success: boolean;
  provider: 'yoco';
  checkoutId?: string;
  checkoutUrl?: string;
  transactionId?: string;
  message: string;
};

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  billingAddress: string;
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'paid';
  createdAt: string;
  items: OrderItem[];
};


export type OutgoingEmail = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
};

export type AdminSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: 'ZAR' | 'USD' | 'EUR';
  taxRate: number;
  shippingFlatRate: number;
  lowStockThreshold: number;
  maintenanceMode: boolean;
  orderNotifications: boolean;
  newsletterDoubleOptIn: boolean;
  updatedAt: string;
};

export type UpdateAdminSettingsInput = Omit<AdminSettings, 'updatedAt'>;
