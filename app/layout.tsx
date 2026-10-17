import type { Metadata } from "next";
import "./globals.css";
import { fontPreloads } from "@/lib/fonts";

// meta -------------------------------------------------------------------------------
export const metadata: Metadata = {
  title: "Lightpost | Latest news",
  description:
    "The latest headlines from BBC News and The Guardian, in the Lightpost newspaper.",
};

// root -------------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {fontPreloads.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body
        id="top"
        className="border-border bg-background text-string-primary"
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        {children}
      </body>
    </html>
  );
}
