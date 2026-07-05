import type { Metadata } from "next";
import ToastProvider from "@/components/Providers/ToastProvider";
import ThemeProvider from "@/components/Providers/ThemeProvider";
import { notoSansHeading, nunitoSans } from "@/lib/fonts";
import { LayoutProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: { template: "%s | Open Exam", default: "Open Exam" },
  description: "A collaborative exam management platform",
};

const RootLayout = ({ children }: LayoutProps) => {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        "font-sans",
        nunitoSans.variable,
        notoSansHeading.variable,
      )}
      suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute={"class"}
          defaultTheme="dark"
          enableSystem={false}>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
