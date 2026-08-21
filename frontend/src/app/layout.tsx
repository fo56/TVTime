import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";
import RefreshButton from "@/components/RefreshButton";

export const metadata: Metadata = {
  title: "TVTime Export Library",
  description: "A beautiful interface for your TVTime data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var stored = localStorage.getItem('theme');
              if (stored === 'dark' || stored === 'light') {
                document.documentElement.setAttribute('data-theme', stored);
              } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
              } else {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch (e) {}
          })();
        `}} />
      </head>
      <body>
        <nav className="top-nav">
          <div style={{ flex: 1, display: 'flex', minWidth: '150px' }}>
            <Link href="/" className="top-nav-logo">
              TV Time
            </Link>
          </div>
          
          <div style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
            <SearchBar />
          </div>

          <div style={{ flex: 1, display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center', minWidth: '150px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
            <Link href="/movies" className="t-subhead" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>Movies</Link>
            <Link href="/shows" className="t-subhead" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>Shows</Link>
            <ThemeToggle />
            <RefreshButton />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
