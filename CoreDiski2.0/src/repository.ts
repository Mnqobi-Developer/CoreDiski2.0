import { seedShirts } from './data';
import type { CreateShirtInput, NewsletterSubscription, Shirt } from './types';

const SHIRTS_KEY = 'corediski_shirts';
const NEWSLETTER_KEY = 'corediski_newsletter';

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const hydrateSeed = (): Shirt[] =>
  seedShirts.map((shirt) => ({
    ...shirt,
    id: randomId(),
  }));

const readShirts = (): Shirt[] => {
  const raw = localStorage.getItem(SHIRTS_KEY);

  if (!raw) {
    const initial = hydrateSeed();
    localStorage.setItem(SHIRTS_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as Shirt[];
    return parsed;
  } catch {
    const fallback = hydrateSeed();
    localStorage.setItem(SHIRTS_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

const writeShirts = (shirts: Shirt[]) => {
  localStorage.setItem(SHIRTS_KEY, JSON.stringify(shirts));
};

export const shirtRepository = {
  async list(search = ''): Promise<Shirt[]> {
    const normalized = search.trim().toLowerCase();
    const shirts = readShirts();

    if (!normalized) {
      return shirts;
    }

    return shirts.filter((shirt) => {
      const haystack = [
        shirt.clubOrNation,
        shirt.title,
        shirt.season,
        shirt.variant,
        ...shirt.tags,
      ]
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
