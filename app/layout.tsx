import type { Metadata } from "next";
import "./globals.css";
import {
  Gothic_A1,
  Instrument_Serif,
  Inria_Serif,
  Cabin,
} from "next/font/google";

// fonts -------------------------------------------------------------------------------

const gothic = Gothic_A1({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-menu",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-logo",
});

const inriaSerif = Inria_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-main",
});

const cabin = Cabin({
  subsets: ["latin"],
  variable: "--font-numbers",
});

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
    <html
      lang="en"
      className={` ${gothic.variable} ${instrumentSerif.variable} ${inriaSerif.variable} ${cabin.variable}`}
    >
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
