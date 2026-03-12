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
