export const metadata = {
  title: "My Project",
  description: "Monorepo boilerplate with shared schemas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
