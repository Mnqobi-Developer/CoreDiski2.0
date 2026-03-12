import type { CreateShirtInput } from './types';

export const seedShirts: CreateShirtInput[] = [
  {
    clubOrNation: 'Manchester United',
    title: 'Manchester United',
    season: '1998-1999',
    variant: 'Home',
    price: 250,
    imageUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
    tags: ['manchester united', 'premier league', 'treble'],
    featured: true,
  },
  {
    clubOrNation: 'Barcelona',
    title: 'Barcelona',
    season: '2008-2009',
    variant: 'Home',
    price: 275,
    imageUrl:
      'https://images.unsplash.com/photo-1606925797300-0b35e9df0b35?auto=format&fit=crop&w=600&q=80',
    tags: ['barcelona', 'la liga', 'pep'],
    featured: true,
  },
  {
    clubOrNation: 'Italy',
    title: 'Italy',
    season: '1994',
    variant: 'Home',
    price: 180,
    imageUrl:
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80',
    tags: ['italy', 'national', 'world cup'],
    featured: true,
  },
  {
    clubOrNation: 'Brazil',
    title: 'Brazil',
    season: '2002',
    variant: 'Home',
    price: 300,
    imageUrl:
      'https://images.unsplash.com/photo-1521417531039-9b8f60d96f9e?auto=format&fit=crop&w=600&q=80',
    tags: ['brazil', 'world cup', 'ronaldo'],
    featured: true,
  },
  {
    clubOrNation: 'Real Madrid',
    title: 'Real Madrid',
    season: '2011-2012',
    variant: 'Away',
    price: 225,
    imageUrl:
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80',
    tags: ['real madrid', 'la liga', 'away kit'],
    featured: true,
  },
];

export const popularQueries = ['Manchester United', 'Barcelona', 'Bafana Bafana', 'PSG'];
