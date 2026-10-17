export default function DispPageTitle({ title }: { title: string }) {
  return (
    <div className="w-5/6 border-border border-l border-r">
      <h1 className="sr-only">{title}</h1>
      <div aria-hidden="true" className="section-title font-logo text-string-primary border-border border-y my-5">
        {[0, 1].map((track) => (
          <div key={track} className="marq section-title-track">
            {Array.from({ length: 8 }, (_, index) => <span key={index}>{title}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}
