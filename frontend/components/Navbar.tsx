"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { GraduationCap, Moon, Sun, Search, MapPin, Route, Map as MapIcon, BookOpen, Users, FileCheck2 } from "lucide-react";

const links = [
  { href: "/careers", label: "Careers", icon: BookOpen },
  { href: "/colleges", label: "Colleges", icon: MapPin },
  { href: "/map", label: "Map", icon: MapIcon },
  { href: "/roadmaps", label: "Roadmaps", icon: Route },
  { href: "/entrance", label: "Exams", icon: FileCheck2 },
  { href: "/alumni", label: "Alumni", icon: Users },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)", borderColor: "var(--line)" }}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-btn text-white">
            <GraduationCap size={18} />
          </span>
          <span className="leading-tight">
            <span className="block font-grotesk text-lg font-bold tracking-tight">Mero<span className="text-brand">Bhawishya</span></span>
            <span className="block text-[10px] font-medium" style={{ color: "var(--mut)" }}>shaping future of every nepali sprout</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 text-sm md:flex" style={{ color: "var(--mut)" }}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-1.5 transition hover:text-[var(--ink)]">
              <l.icon size={15} /> {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/eligibility" className="hidden items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold sm:flex" style={{ borderColor: "var(--line)" }}>
            <Search size={15} /> Check eligibility
          </Link>
          <button
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid h-9 w-9 place-items-center rounded-lg border transition"
            style={{ borderColor: "var(--line)" }}
          >
            {mounted && theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </nav>
    </header>
  );
}
