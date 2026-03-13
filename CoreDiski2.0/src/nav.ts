export type NavPage = {
  href: string;
  label: string;
};

const SESSION_KEY = 'corediski_session';

const isSignedIn = (): boolean => {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as { userId?: string };
    return Boolean(parsed.userId);
  } catch {
    return false;
  }
};

const baseNavPages: NavPage[] = [
  { href: '/', label: 'Home' },
  { href: '/shop.html', label: 'Shop' },
  { href: '/cart.html', label: 'Cart' },
  { href: '/wishlist.html', label: 'Wishlist' },
];

export const renderNav = (currentPathname: string) => {
  const signedIn = isSignedIn();
  const navPages = [
    ...baseNavPages,
    ...(signedIn ? [{ href: '/profile.html', label: 'Profile' }] : []),
    ...(!signedIn ? [{ href: '/signin.html', label: 'Sign In' }] : []),
  ];

  return navPages
    .map((page) => {
      const active = page.href === currentPathname || (page.href === '/' && currentPathname === '/index.html');
      return `<a href="${page.href}" ${active ? 'aria-current="page"' : ''}>${page.label}</a>`;
    })
    .join('');
};
