import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Expense Management System",
  description: "Personal expense management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        {children}
      </body>
    </html>
  );
}