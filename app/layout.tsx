import type { Metadata } from "next";
import "./globals.css";
import { themeInitScript } from "@/lib/theme";
import { fontPreloads } from "@/lib/fonts";

// meta -------------------------------------------------------------------------------
export const metadata: Metadata = {
  title: { default: "Latest news | Lightpost", template: "%s | Lightpost" },
  icons: { icon: "/favicon.png" },
  description:
    "The latest headlines from BBC News and The Guardian, in the Lightpost newspaper.",
};

// root -------------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
