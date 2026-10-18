import VisualTitle from "./VisualTitle";

export default function NewsSkeleton({ title }: { title?: string }) {
  return (
    <main id="main" aria-label="Loading news" aria-busy="true" className="w-full flex flex-col items-center font-main">
      {title && <VisualTitle title={title} />}
      <div className="w-5/6 border-l border-r border-border p-5 min-h-[60vh]">
        <p className="text-string-secondary text-sm mb-5" role="status">
          Loading the latest news…
        </p>
        <div className="news-columns" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border border-border rounded-2xl h-64 motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
