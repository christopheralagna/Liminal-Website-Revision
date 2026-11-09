export function Notice({ children }: { children: React.ReactNode }) {
  return <p role="status" className="rounded-lg border border-charcoal-600 bg-charcoal-900 p-5 text-cream-200">{children}</p>;
}
