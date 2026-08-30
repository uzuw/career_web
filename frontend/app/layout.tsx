import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", weight: ["500", "600", "700"] });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "College Choices Nepal",
  description: "Clear, verified guidance on careers, colleges, and entrance exams for +2 Science graduates in Nepal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${grotesk.variable} ${sans.variable} font-sans`}>
        <Providers>
          <div className="grid-backdrop" />
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
