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
};

export type AuthSession = {
  userId: string;
  signedInAt: string;
};


export type AdminUserRecord = Omit<UserAccount, 'password'>;
