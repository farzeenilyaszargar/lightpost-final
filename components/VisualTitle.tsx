export default function DispPageTitle({ title }: { title: string }) {
  return (
    <div className="w-5/6 border-border border-l border-r">
      <h1 className="section-title font-logo text-string-primary border-border border-y my-5">
        {title}
      </h1>
    </div>
  );
}
