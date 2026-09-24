import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Josefin_Sans } from "next/font/google";
import "./globals.css";
import "./landing.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { FavouritesProvider } from "@/components/favourites-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Refined DEVHUB wordmark voice: clean, modern, slightly elegant —
// tech without boredom. Used for brand wordmarks only, never body copy.
const devhubWordmark = Josefin_Sans({
  variable: "--font-devhub-wordmark",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "DevHub — Open-source signal map",
    template: "%s · DevHub",
  },
  description:
    "DevHub turns scattered GitHub activity into connected intelligence — search developers and repositories, then compare the signals.",
};

export const viewport: Viewport = {
  themeColor: "#fcfafa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
   <html
  lang="en"
  suppressHydrationWarning
  className={`${geistSans.variable} ${geistMono.variable} ${devhubWordmark.variable} h-full antialiased`}
>
      <head>
        <ThemeScript />
      </head>

      <body className="min-h-dvh">
        <ThemeProvider>
          <FavouritesProvider>{children}</FavouritesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}