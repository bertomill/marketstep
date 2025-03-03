'use client';

import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body>
        <Theme appearance="dark" accentColor="blue" radius="large">
          <main style={{ 
            maxWidth: '100vw', 
            overflowX: 'hidden',
            minHeight: '100vh',
            backgroundColor: 'var(--gray-1)'
          }}>
            {children}
          </main>
        </Theme>
      </body>
    </html>
  );
}
