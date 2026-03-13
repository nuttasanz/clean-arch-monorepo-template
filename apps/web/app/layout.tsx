import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Providers } from "@/providers/providers";

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
