import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/dashboard">
        Dashboard
      </Link>

      {" | "}

      <Link href="/users">
        Users
      </Link>

      {" | "}

      <Link href="/categories">
        Categories
      </Link>

      {" | "}

      <Link href="/expenses">
        Expenses
      </Link>
    </nav>
  );
}