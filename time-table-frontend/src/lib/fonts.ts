import { Noto_Kufi_Arabic } from "next/font/google";

export const arabicFont = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});
