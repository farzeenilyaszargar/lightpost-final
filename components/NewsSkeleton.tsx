export default function NewsSkeleton() {
  return (
    <main
      id="main"
      aria-label="Loading news"
      className="w-5/6 mx-auto border-l border-r border-border p-5 font-main min-h-[60vh]"
    >
      <p className="text-string-secondary text-sm mb-5">
        Loading the latest news…
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="border border-border rounded-2xl h-64 motion-safe:animate-pulse"
          />
        ))}
      </div>
    </main>
  );
}
