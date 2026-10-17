export default function Loading() {
  return (
    <main
      id="main"
      className="site-container loading-state"
      aria-label="Loading headlines"
    >
      <div className="eyebrow">LIGHTPOST</div>
      <h1>Gathering a little perspective…</h1>
      <div className="skeleton-grid">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton" />
        ))}
      </div>
    </main>
  );
}
