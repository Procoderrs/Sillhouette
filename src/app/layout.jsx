import { Halant } from "next/font/google";
import "./globals.css";

const halant = Halant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-halant",
});

export const metadata = { title: "Silhouette" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={halant.variable}>
      <body>{children}</body>
    </html>
  );
}