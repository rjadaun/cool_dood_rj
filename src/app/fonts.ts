import { Fraunces, Inter } from "next/font/google";

/** Editorial display serif with optical sizing. */
export const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

/** Clean UI / body sans-serif. */
export const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
