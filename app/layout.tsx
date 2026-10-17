import type { Metadata } from "next";
import { Instrument_Serif, Cabin } from "next/font/google";
import "./globals.css";
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-editorial",
});
const sans = Cabin({ subsets: ["latin"], variable: "--font-sans" });
export const metadata: Metadata = {
  title: { default: "Lightpost — A clearer view", template: "%s | Lightpost" },
  description:
    "A considered collection of the latest headlines from BBC News and The Guardian. Find your perspective, follow your curiosity.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
