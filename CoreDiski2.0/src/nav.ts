export type NavPage = {
  href: string;
  label: string;
};

export const navPages: NavPage[] = [
  { href: '/', label: 'Home' },
  { href: '/shop.html', label: 'Shop' },
];

export const renderNav = (currentPathname: string) =>
  navPages
    .map((page) => {
      const active = page.href === currentPathname || (page.href === '/' && currentPathname === '/index.html');
      return `<a href="${page.href}" ${active ? 'aria-current="page"' : ''}>${page.label}</a>`;
    })
    .join('');
