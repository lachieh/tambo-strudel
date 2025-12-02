export function Frame({ children }: { children: React.ReactNode }) {
  return (<div
    className="h-screen w-screen flex bg-background text-foreground overflow-hidden"
  >
    {children}
  </div>);
}