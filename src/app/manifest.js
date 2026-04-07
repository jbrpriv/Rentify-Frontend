export default function manifest() {
  return {
    name: 'RentifyPro',
    short_name: 'Rentify',
    description: 'Rental Agreement Platform',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b1220',
    theme_color: '#0b1220',
    categories: ['business', 'productivity', 'finance'],
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}