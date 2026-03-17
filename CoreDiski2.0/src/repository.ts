import { seedShirts } from './data';
import { hasSupabaseConfig, supabaseBaseUrl, supabaseHeaders } from './supabase';
import type {
  AuthSession,
  CartItem,
  CreateShirtInput,
  NewsletterSubscription,
  Shirt,
  ShirtSize,
  UserAccount,
  WishlistItem,
  AdminUserRecord,
  Order,
  PaymentGatewayRequest,
  PaymentGatewayResult,
  PaymentMethod,
  OutgoingEmail,
<<<<<<< codex/fetch-latest-changes-using-git-fetch-ajqeph
=======
  AdminSettings,
  UpdateAdminSettingsInput,
>>>>>>> main
} from './types';

const SHIRTS_KEY = 'corediski_shirts';
const NEWSLETTER_KEY = 'corediski_newsletter';
const CART_KEY = 'corediski_cart';
const WISHLIST_KEY = 'corediski_wishlist';
const USERS_KEY = 'corediski_users';
const SESSION_KEY = 'corediski_session';
const ORDERS_KEY = 'corediski_orders';
const PAYMENT_TRANSACTIONS_KEY = 'corediski_payment_transactions';
const YOCO_PUBLIC_KEY = 'pk_test_corediski_yoco';
const YOCO_PAYMENT_PAGE_URL = 'https://pay.yoco.com/corediski';
const EMAIL_OUTBOX_KEY = 'corediski_email_outbox';
<<<<<<< codex/fetch-latest-changes-using-git-fetch-ajqeph
=======
const ADMIN_SETTINGS_KEY = 'corediski_admin_settings';
>>>>>>> main

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const hydrateSeed = (): Shirt[] =>
  seedShirts.map((shirt) => ({
    ...shirt,
    id: randomId(),
  }));



const readJsonArray = <T>(key: string): T[] => {
  const raw = localStorage.getItem(key);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
};

const readShirts = (): Shirt[] => {
  const raw = localStorage.getItem(SHIRTS_KEY);

  if (!raw) {
    const initial = hydrateSeed();
    localStorage.setItem(SHIRTS_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(raw) as Shirt[];
  } catch {
    const fallback = hydrateSeed();
    localStorage.setItem(SHIRTS_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

const writeShirts = (shirts: Shirt[]) => {
  localStorage.setItem(SHIRTS_KEY, JSON.stringify(shirts));
};

const writeCart = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

const writeWishlist = (items: WishlistItem[]) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
};

const writeUsers = (users: UserAccount[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const writeOrders = (orders: Order[]) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

const writeSession = (session: AuthSession | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const readSession = (): AuthSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

const buildVerificationUrl = (token: string) =>
  `${window.location.origin}/verify-email.html?token=${encodeURIComponent(token)}`;

const emailService = {
  async sendVerificationEmail(fullName: string, email: string, token: string): Promise<OutgoingEmail> {
    const verificationUrl = buildVerificationUrl(token);
    const message: OutgoingEmail = {
      id: randomId(),
      to: email,
      subject: 'Verify your Core Diski account',
      body: `Hi ${fullName}, verify your account: ${verificationUrl}`,
      sentAt: new Date().toISOString(),
    };

    const outbox = readJsonArray<OutgoingEmail>(EMAIL_OUTBOX_KEY);
    localStorage.setItem(EMAIL_OUTBOX_KEY, JSON.stringify([message, ...outbox]));
    return message;
  },
};
<<<<<<< codex/fetch-latest-changes-using-git-fetch-ajqeph
=======




const defaultAdminSettings = (): AdminSettings => ({
  storeName: 'Core Diski',
  supportEmail: 'support@corediski.com',
  supportPhone: '+27 67 123 4567',
  currency: 'ZAR',
  taxRate: 15,
  shippingFlatRate: 0,
  lowStockThreshold: 5,
  maintenanceMode: false,
  orderNotifications: true,
  newsletterDoubleOptIn: true,
  updatedAt: new Date().toISOString(),
});

const readAdminSettings = (): AdminSettings => {
  const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);

  if (!raw) {
    const initial = defaultAdminSettings();
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AdminSettings>;
    const base = defaultAdminSettings();

    const hydrated: AdminSettings = {
      ...base,
      ...parsed,
      currency: parsed.currency === 'USD' || parsed.currency === 'EUR' ? parsed.currency : 'ZAR',
      taxRate: Number.isFinite(parsed.taxRate) ? Number(parsed.taxRate) : base.taxRate,
      shippingFlatRate: Number.isFinite(parsed.shippingFlatRate) ? Number(parsed.shippingFlatRate) : base.shippingFlatRate,
      lowStockThreshold: Number.isFinite(parsed.lowStockThreshold) ? Number(parsed.lowStockThreshold) : base.lowStockThreshold,
      maintenanceMode: Boolean(parsed.maintenanceMode),
      orderNotifications: parsed.orderNotifications !== false,
      newsletterDoubleOptIn: parsed.newsletterDoubleOptIn !== false,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : base.updatedAt,
    };

    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(hydrated));
    return hydrated;
  } catch {
    const fallback = defaultAdminSettings();
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

const writeAdminSettings = (input: UpdateAdminSettingsInput): AdminSettings => {
  const settings: AdminSettings = {
    ...input,
    updatedAt: new Date().toISOString(),
  };
>>>>>>> main

  localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
  return settings;
};



const toShirt = (row: {
  id: string;
  club_or_nation: string;
  title: string;
  season: string;
  variant: string;
  price: number;
  image_url: string;
  tags: string[] | null;
  featured: boolean | null;
}): Shirt => ({
  id: row.id,
  clubOrNation: row.club_or_nation,
  title: row.title,
  season: row.season,
  variant: row.variant,
  price: Number(row.price),
  imageUrl: row.image_url,
  tags: row.tags ?? [],
  featured: row.featured ?? false,
});

const toShirtInsert = (input: CreateShirtInput) => ({
  club_or_nation: input.clubOrNation,
  title: input.title,
  season: input.season,
  variant: input.variant,
  price: input.price,
  image_url: input.imageUrl,
  tags: input.tags,
  featured: input.featured ?? false,
});

const readUsers = (): UserAccount[] => {
  const users = readJsonArray<UserAccount>(USERS_KEY);

  const seedAccounts: UserAccount[] = [
    {
      id: randomId(),
      fullName: 'Core Diski Admin',
      email: 'admin@corediski.com',
      password: 'Admin@12345',
      createdAt: new Date().toISOString(),
      isAdmin: true,
      emailVerified: true,
    },
    {
      id: randomId(),
      fullName: 'Lenka Ntereke',
      email: 'Lenkantereke25@gmail.com',
      password: 'Germansteel@25',
      createdAt: new Date().toISOString(),
      isAdmin: false,
      emailVerified: true,
    },
    {
      id: randomId(),
      fullName: 'Roberto Fentse Nkomo',
      email: 'Robertofentsenkomo@gmail.com',
      password: 'FentseNkomo',
      createdAt: new Date().toISOString(),
      isAdmin: true,
      emailVerified: true,
    },
  ];

  const missing = seedAccounts.filter(
    (account) => !users.some((user) => user.email.toLowerCase() === account.email.toLowerCase()),
  );

  if (!missing.length) {
    return users;
  }

  const seeded = [...missing, ...users];
  writeUsers(seeded);
  return seeded;
};

export const shirtRepository = {
  async list(search = ''): Promise<Shirt[]> {
    const normalized = search.trim().toLowerCase();

    if (hasSupabaseConfig) {
      const response = await fetch(
        `${supabaseBaseUrl}/rest/v1/shirts?select=id,club_or_nation,title,season,variant,price,image_url,tags,featured`,
        { headers: supabaseHeaders },
      );

      if (response.ok) {
        const data = (await response.json()) as Array<{
          id: string;
          club_or_nation: string;
          title: string;
          season: string;
          variant: string;
          price: number;
          image_url: string;
          tags: string[] | null;
          featured: boolean | null;
        }>;

        const shirts = data.map(toShirt);

        if (!normalized) {
          return shirts;
        }

        return shirts.filter((shirt) => {
          const haystack = [shirt.clubOrNation, shirt.title, shirt.season, shirt.variant, ...shirt.tags]
            .join(' ')
            .toLowerCase();

          return haystack.includes(normalized);
        });
      }
    }

    const shirts = readShirts();

    if (!normalized) {
      return shirts;
    }

    return shirts.filter((shirt) => {
      const haystack = [shirt.clubOrNation, shirt.title, shirt.season, shirt.variant, ...shirt.tags]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalized);
    });
  },

  async getById(id: string): Promise<Shirt | null> {
    if (!id) {
      return null;
    }

    if (hasSupabaseConfig) {
      const response = await fetch(
        `${supabaseBaseUrl}/rest/v1/shirts?select=id,club_or_nation,title,season,variant,price,image_url,tags,featured&id=eq.${encodeURIComponent(id)}&limit=1`,
        { headers: supabaseHeaders },
      );

      if (response.ok) {
        const data = (await response.json()) as Array<{
          id: string;
          club_or_nation: string;
          title: string;
          season: string;
          variant: string;
          price: number;
          image_url: string;
          tags: string[] | null;
          featured: boolean | null;
        }>;

        if (data.length) {
          return toShirt(data[0]);
        }
      }
    }

    const shirts = readShirts();
    return shirts.find((shirt) => shirt.id === id) ?? null;
  },

  async create(input: CreateShirtInput): Promise<Shirt> {
    if (hasSupabaseConfig) {
      const response = await fetch(`${supabaseBaseUrl}/rest/v1/shirts?select=id,club_or_nation,title,season,variant,price,image_url,tags,featured`, {
        method: 'POST',
        headers: { ...supabaseHeaders, Prefer: 'return=representation' },
        body: JSON.stringify(toShirtInsert(input)),
      });

      if (response.ok) {
        const data = (await response.json()) as Array<{
          id: string;
          club_or_nation: string;
          title: string;
          season: string;
          variant: string;
          price: number;
          image_url: string;
          tags: string[] | null;
          featured: boolean | null;
        }>;

        if (data.length) {
          return toShirt(data[0]);
        }
      }
    }

    const shirts = readShirts();
    const created: Shirt = {
      ...input,
      id: randomId(),
    };

    const updated = [created, ...shirts];
    writeShirts(updated);
    return created;
  },

  async update(id: string, input: CreateShirtInput): Promise<Shirt | null> {
    if (hasSupabaseConfig) {
      const response = await fetch(`${supabaseBaseUrl}/rest/v1/shirts?select=id,club_or_nation,title,season,variant,price,image_url,tags,featured&id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { ...supabaseHeaders, Prefer: 'return=representation' },
        body: JSON.stringify(toShirtInsert(input)),
      });

      if (response.ok) {
        const data = (await response.json()) as Array<{
          id: string;
          club_or_nation: string;
          title: string;
          season: string;
          variant: string;
          price: number;
          image_url: string;
          tags: string[] | null;
          featured: boolean | null;
        }>;

        if (data.length) {
          return toShirt(data[0]);
        }
      }
    }

    const shirts = readShirts();
    const existing = shirts.find((shirt) => shirt.id === id);

    if (!existing) {
      return null;
    }

    const updatedShirt: Shirt = {
      ...existing,
      ...input,
      id: existing.id,
    };

    writeShirts(shirts.map((shirt) => (shirt.id === id ? updatedShirt : shirt)));
    return updatedShirt;
  },
};


export const cartRepository = {
  async list(): Promise<CartItem[]> {
    return readJsonArray<CartItem>(CART_KEY);
  },

  async add(shirtId: string, size: ShirtSize): Promise<CartItem> {
    const items = readJsonArray<CartItem>(CART_KEY);
    const existing = items.find((item) => item.shirtId === shirtId && item.size === size);

    if (existing) {
      const updated = items.map((item) =>
        item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item,
      );
      writeCart(updated);
      return { ...existing, quantity: existing.quantity + 1 };
    }

    const created: CartItem = {
      id: randomId(),
      shirtId,
      size,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    writeCart([created, ...items]);
    return created;
  },

  async updateQuantity(id: string, quantity: number): Promise<void> {
    const items = readJsonArray<CartItem>(CART_KEY);

    if (quantity <= 0) {
      writeCart(items.filter((item) => item.id !== id));
      return;
    }

    writeCart(items.map((item) => (item.id === id ? { ...item, quantity } : item)));
  },

  async remove(id: string): Promise<void> {
    const items = readJsonArray<CartItem>(CART_KEY);
    writeCart(items.filter((item) => item.id !== id));
  },

  async clear(): Promise<void> {
    writeCart([]);
  },
};

export const wishlistRepository = {
  async list(): Promise<WishlistItem[]> {
    return readJsonArray<WishlistItem>(WISHLIST_KEY);
  },

  async add(shirtId: string, size: ShirtSize): Promise<WishlistItem> {
    const items = readJsonArray<WishlistItem>(WISHLIST_KEY);
    const existing = items.find((item) => item.shirtId === shirtId && item.size === size);

    if (existing) {
      return existing;
    }

    const created: WishlistItem = {
      id: randomId(),
      shirtId,
      size,
      addedAt: new Date().toISOString(),
    };

    writeWishlist([created, ...items]);
    return created;
  },

  async remove(id: string): Promise<void> {
    const items = readJsonArray<WishlistItem>(WISHLIST_KEY);
    writeWishlist(items.filter((item) => item.id !== id));
  },

  async clear(): Promise<void> {
    writeWishlist([]);
  },
};

export const authRepository = {
  async register(fullName: string, email: string, password: string): Promise<{ user?: UserAccount; error?: string }> {
    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      return { error: 'An account with this email already exists.' };
    }

    const verificationToken = randomId();
    const user: UserAccount = {
      id: randomId(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
      isAdmin: false,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationSentAt: new Date().toISOString(),
    };

    writeUsers([user, ...users]);
    await emailService.sendVerificationEmail(user.fullName, user.email, verificationToken);

    return { user };
  },

  async signIn(email: string, password: string): Promise<{ user?: UserAccount; error?: string }> {
    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password);

    if (!user) {
      return { error: 'Invalid email or password.' };
    }

    if (!user.emailVerified && !user.isAdmin) {
      return { error: 'Please verify your email before signing in.' };
    }

    writeSession({ userId: user.id, signedInAt: new Date().toISOString() });
    return { user };
  },

  async getCurrentUser(): Promise<UserAccount | null> {
    const session = readSession();

    if (!session) {
      return null;
    }

    const users = readUsers();
    return users.find((user) => user.id === session.userId) ?? null;
  },



  async updateCurrentUser(
    updates: Pick<UserAccount, 'fullName' | 'email' | 'phone' | 'address' | 'emailPreferences'>,
  ): Promise<{ user?: UserAccount; error?: string }> {
    const session = readSession();

    if (!session) {
      return { error: 'You must be signed in to update your profile.' };
    }

    const users = readUsers();
    const user = users.find((entry) => entry.id === session.userId);

    if (!user) {
      return { error: 'Unable to find your account.' };
    }

    const normalizedEmail = updates.email.trim().toLowerCase();
    const emailTaken = users.some((entry) => entry.id !== user.id && entry.email.toLowerCase() === normalizedEmail);

    if (emailTaken) {
      return { error: 'Another account is already using this email.' };
    }

    const updatedUser: UserAccount = {
      ...user,
      fullName: updates.fullName.trim(),
      email: normalizedEmail,
      phone: updates.phone?.trim() || '',
      address: updates.address?.trim() || '',
      emailPreferences: updates.emailPreferences?.trim() || '',
    };

    writeUsers(users.map((entry) => (entry.id === user.id ? updatedUser : entry)));
    return { user: updatedUser };
  },

  async verifyEmail(token: string): Promise<{ user?: UserAccount; error?: string }> {
    const trimmedToken = token.trim();

    if (!trimmedToken) {
      return { error: 'Invalid verification token.' };
    }

    const users = readUsers();
    const user = users.find((entry) => entry.emailVerificationToken === trimmedToken);

    if (!user) {
      return { error: 'Verification link is invalid or expired.' };
    }

    const updatedUser: UserAccount = {
      ...user,
      emailVerified: true,
      emailVerificationToken: '',
    };

    writeUsers(users.map((entry) => (entry.id === user.id ? updatedUser : entry)));
    writeSession({ userId: updatedUser.id, signedInAt: new Date().toISOString() });

    return { user: updatedUser };
  },

  async resendVerificationEmail(email: string): Promise<{ ok?: boolean; error?: string }> {
    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((entry) => entry.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { error: 'Unable to find an account with that email.' };
    }

    if (user.emailVerified || user.isAdmin) {
      return { ok: true };
    }

    const verificationToken = randomId();
    const updatedUser: UserAccount = {
      ...user,
      emailVerificationToken: verificationToken,
      emailVerificationSentAt: new Date().toISOString(),
    };

    writeUsers(users.map((entry) => (entry.id === user.id ? updatedUser : entry)));
    await emailService.sendVerificationEmail(updatedUser.fullName, updatedUser.email, verificationToken);

    return { ok: true };
  },

  async isSignedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return Boolean(user);
  },

  async signOut(): Promise<void> {
    writeSession(null);
  },
};

const sanitizeUser = (user: UserAccount): AdminUserRecord => {
  const { password: _password, ...safe } = user;
  return safe;
};

export const adminRepository = {
  async listUsers(): Promise<AdminUserRecord[]> {
    return readUsers().map(sanitizeUser);
  },

  async getSettings(): Promise<AdminSettings> {
    return readAdminSettings();
  },

  async updateSettings(input: UpdateAdminSettingsInput): Promise<AdminSettings> {
    return writeAdminSettings(input);
  },

  async resetSettings(): Promise<AdminSettings> {
    const defaults = defaultAdminSettings();
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(defaults));
    return defaults;
  },


  async listOrders(): Promise<Order[]> {
    return readJsonArray<Order>(ORDERS_KEY);
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    const orders = readJsonArray<Order>(ORDERS_KEY);
    const target = orders.find((order) => order.id === orderId);

    if (!target) {
      return null;
    }

    const updated: Order = {
      ...target,
      status,
    };

    writeOrders(orders.map((order) => (order.id === orderId ? updated : order)));
    return updated;
  },

  async updateUserRole(userId: string, isAdmin: boolean): Promise<AdminUserRecord | null> {
    const users = readUsers();
    const user = users.find((entry) => entry.id === userId);

    if (!user) {
      return null;
    }

    const admins = users.filter((entry) => entry.isAdmin);
    if (user.isAdmin && !isAdmin && admins.length === 1) {
      return null;
    }

    const updatedUser: UserAccount = {
      ...user,
      isAdmin,
    };

    writeUsers(users.map((entry) => (entry.id === userId ? updatedUser : entry)));
    return sanitizeUser(updatedUser);
  },

  async deleteUser(userId: string): Promise<boolean> {
    const users = readUsers();
    const user = users.find((entry) => entry.id === userId);

    if (!user) {
      return false;
    }

    const admins = users.filter((entry) => entry.isAdmin);
    if (user.isAdmin && admins.length === 1) {
      return false;
    }

    writeUsers(users.filter((entry) => entry.id !== userId));

    const session = readSession();
    if (session?.userId === userId) {
      writeSession(null);
    }

    return true;
  },
};


export const yocoGateway = {
  async processPayment(input: PaymentGatewayRequest): Promise<PaymentGatewayResult> {
    if (input.provider !== 'yoco') {
      return { success: false, provider: 'yoco', message: 'Unsupported payment provider.' };
    }

    if (input.amount <= 0) {
      return { success: false, provider: 'yoco', message: 'Payment amount must be greater than zero.' };
    }

    if (input.method !== 'yoco_hosted') {
      return { success: false, provider: 'yoco', message: 'Only Yoco hosted checkout is supported.' };
    }

    if (!input.customerEmail.includes('@')) {
      return { success: false, provider: 'yoco', message: 'A valid email is required for Yoco checkout.' };
    }

    const checkoutId = `yoco_chk_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    const transactionId = `yoco_pay_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    const transactions = readJsonArray<{
      id: string;
      amount: number;
      currency: 'ZAR';
      method: PaymentMethod;
      customerEmail: string;
      createdAt: string;
      status: 'initiated';
      provider: 'yoco';
      checkoutId: string;
      checkoutUrl: string;
      publicKey: string;
    }>(PAYMENT_TRANSACTIONS_KEY);

    const record = {
      id: transactionId,
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      customerEmail: input.customerEmail.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
      status: 'initiated' as const,
      provider: 'yoco' as const,
      checkoutId,
      checkoutUrl: YOCO_PAYMENT_PAGE_URL,
      publicKey: YOCO_PUBLIC_KEY,
    };

    localStorage.setItem(PAYMENT_TRANSACTIONS_KEY, JSON.stringify([record, ...transactions]));

    return {
      success: true,
      provider: 'yoco',
      checkoutId,
      checkoutUrl: YOCO_PAYMENT_PAGE_URL,
      transactionId,
      message: 'Redirecting to Yoco secure checkout.',
    };
  },
};



export const orderRepository = {
  async listCurrentUser(): Promise<Order[]> {
    const session = readSession();

    if (!session) {
      return [];
    }

    const orders = readJsonArray<Order>(ORDERS_KEY);
    return orders.filter((order) => order.userId === session.userId);
  },

  async createCurrentUserOrder(input: {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    billingAddress: string;
    shippingMethod: string;
    paymentMethod: PaymentMethod;
    paymentReference: string;
    status?: Order['status'];
  }): Promise<{ order?: Order; error?: string }> {
    const session = readSession();

    if (!session) {
      return { error: 'You must be signed in to place an order.' };
    }

    const cartItems = readJsonArray<CartItem>(CART_KEY);

    if (!cartItems.length) {
      return { error: 'Your cart is empty.' };
    }

    const shirts = readShirts();
    const validItems = cartItems
      .map((item) => {
        const shirt = shirts.find((entry) => entry.id === item.shirtId);

        if (!shirt) {
          return null;
        }

        return {
          shirtId: shirt.id,
          size: item.size,
          quantity: item.quantity,
          unitPrice: shirt.price,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (!validItems.length) {
      return { error: 'Unable to create an order because cart items are unavailable.' };
    }

    const subtotal = validItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const shippingCost = 0;
    const order: Order = {
      id: randomId(),
      userId: session.userId,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim().toLowerCase(),
      shippingAddress: input.shippingAddress.trim(),
      billingAddress: input.billingAddress.trim(),
      shippingMethod: input.shippingMethod,
      paymentMethod: input.paymentMethod,
      paymentReference: input.paymentReference,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      status: input.status ?? 'paid',
      createdAt: new Date().toISOString(),
      items: validItems,
    };

    const orders = readJsonArray<Order>(ORDERS_KEY);
    writeOrders([order, ...orders]);
    writeCart([]);

    return { order };
  },
};


export const newsletterRepository = {
  async subscribe(email: string): Promise<NewsletterSubscription> {
    const entry: NewsletterSubscription = {
      email,
      subscribedAt: new Date().toISOString(),
    };

    const raw = localStorage.getItem(NEWSLETTER_KEY);
    const existing = raw ? (JSON.parse(raw) as NewsletterSubscription[]) : [];

    localStorage.setItem(NEWSLETTER_KEY, JSON.stringify([entry, ...existing]));
    return entry;
  },
};
