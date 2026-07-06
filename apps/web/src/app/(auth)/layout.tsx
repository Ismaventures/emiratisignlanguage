export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-white to-primary-50">
      <div className="flex w-full items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
