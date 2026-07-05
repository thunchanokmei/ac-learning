import BottomNav from "./BottomNav";

export default function MobileShell({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff5f5_0%,#ffffff_100%)]">
      <div className="mx-auto min-h-screen max-w-md bg-white/90 px-4 pb-24 pt-5 shadow-xl">
        {title && (
          <h1 className="mb-4 text-2xl font-bold text-red-700">{title}</h1>
        )}
        {children}
      </div>
      <BottomNav />
    </main>
  );
}