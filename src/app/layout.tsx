import type { Metadata } from "next";
import "./globals.css";
import "./reference.css";
import { StoreProvider, Shell } from "@/components/store";
export const metadata: Metadata = {
  title: {
    default: "Blooms by Marra | Flowers for meaningful moments",
    template: "%s | Blooms by Marra",
  },
  description:
    "Explore the Blooms by Marra demo storefront. Thoughtful flowers, delivery and pickup in Metro Manila and Pampanga, subject to confirmation.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
