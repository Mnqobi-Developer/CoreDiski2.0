import { seedShirts } from './data';
import type {
  AuthSession,
  CartItem,
  CreateShirtInput,
  NewsletterSubscription,
  Shirt,
  ShirtSize,
  UserAccount,
  WishlistItem,
} from './types';

const SHIRTS_KEY = 'corediski_shirts';
const NEWSLETTER_KEY = 'corediski_newsletter';
const CART_KEY = 'corediski_cart';
const WISHLIST_KEY = 'corediski_wishlist';
const USERS_KEY = 'corediski_users';
const SESSION_KEY = 'corediski_session';

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



const readUsers = (): UserAccount[] => {
  const users = readJsonArray<UserAccount>(USERS_KEY);

  if (users.some((user) => user.email.toLowerCase() === 'admin@corediski.com')) {
    return users;
  }

  const adminUser: UserAccount = {
    id: randomId(),
    fullName: 'Core Diski Admin',
    email: 'admin@corediski.com',
    password: 'Admin@12345',
    createdAt: new Date().toISOString(),
    isAdmin: true,
  };

  const seeded = [adminUser, ...users];
  writeUsers(seeded);
  return seeded;
};

export const shirtRepository = {
  async list(search = ''): Promise<Shirt[]> {
    const normalized = search.trim().toLowerCase();
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

    const shirts = readShirts();
    return shirts.find((shirt) => shirt.id === id) ?? null;
  },

  async create(input: CreateShirtInput): Promise<Shirt> {
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

    const user: UserAccount = {
      id: randomId(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
      isAdmin: false,
    };

    writeUsers([user, ...users]);
    writeSession({ userId: user.id, signedInAt: new Date().toISOString() });

    return { user };
  },

  async signIn(email: string, password: string): Promise<{ user?: UserAccount; error?: string }> {
    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password);

    if (!user) {
      return { error: 'Invalid email or password.' };
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

  async isSignedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return Boolean(user);
  },

  async signOut(): Promise<void> {
    writeSession(null);
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
