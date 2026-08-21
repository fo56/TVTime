import Link from 'next/link';

interface Stats {
  shows: number;
  movies: number;
  total_episodes_watched: number;
  total_movies_watched: number;
}

async function getStats(): Promise<Stats> {
  const res = await fetch('http://127.0.0.1:8000/api/dashboard/stats', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export default async function Home() {
  let stats: Stats | null = null;

  try {
    stats = await getStats();
  } catch (error) {
    console.error("Error fetching stats", error);
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <section className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 'var(--spacing-section) var(--spacing-md)' }}>
        <h1 className="t-display-xl" style={{ marginBottom: '24px', maxWidth: '900px' }}>Your TVTime Universe.</h1>
        <p className="t-subhead" style={{ maxWidth: '600px', marginBottom: '48px', color: 'var(--colors-text-muted)' }}>
          {stats ? `You've watched ${stats.total_episodes_watched.toLocaleString()} episodes across ${stats.shows.toLocaleString()} shows, and ${stats.total_movies_watched.toLocaleString()} movies.` : 'Connect your backend to see your statistics.'}
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/shows" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.25rem' }}>
            Browse TV Shows
          </Link>
          <Link href="/movies" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.25rem' }}>
            Browse Movies
          </Link>
        </div>
      </section>

      <footer className="container section-gap" style={{ borderTop: '1px solid var(--colors-hairline-soft)', paddingTop: '48px', width: '100%' }}>
        <div className="t-caption" style={{ textAlign: 'center', color: 'var(--colors-text-muted)' }}>POWERED BY TVTIME EXPORT</div>
      </footer>
    </main>
  );
}
