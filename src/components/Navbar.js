"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/categories", label: "Categories" },
  { href: "/expenses", label: "Expenses" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              isActive
                ? "nav__link nav__link--active"
                : "nav__link"
            }
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
