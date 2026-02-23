import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenClawfice | Virtual Office for OpenClaw Agents",
  description: "A charming retro office dashboard for your OpenClaw AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
