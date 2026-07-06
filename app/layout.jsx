import { Anton, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

export const metadata = {
  title: "The League Ledger",
  description: "Weekly standings, power rankings, and recaps for the dynasty league.",
};

const NAV = [
  { href: "/", label: "Standings" },
  { href: "/power-rankings", label: "Power Rankings" },
  { href: "/predictions", label: "Predictions" },
  { href: "/transactions", label: "Transactions" },
  { href: "/recaps", label: "Recaps" },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body min-h-screen">
        <header className="border-b border-paper/10 bg-ink/95 sticky top-0 z-10 backdrop-blur">
          <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="font-display text-3xl tracking-wide text-paper">
                LEAGUE LEDGER
              </span>
              <span className="stat text-xs text-gold uppercase tracking-[0.2em]">
                Est. Dynasty
              </span>
            </Link>
            <nav className="flex gap-1 flex-wrap">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="stat text-xs uppercase tracking-wider px-3 py-2 rounded-sm text-paper/70 hover:text-paper hover:bg-paper/5 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        <footer className="max-w-5xl mx-auto px-6 py-10 text-paper/40 text-xs stat">
          Data refreshes automatically from Sleeper. Last computed at request time.
        </footer>
      </body>
    </html>
  );
}
