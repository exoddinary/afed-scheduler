import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-noto-sans"
});

export const metadata: Metadata = {
    title: "Meeting Room Scheduler",
    description: "Book and manage meeting rooms",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={notoSans.className}>
                <div className="mobile-container">
                    {children}
                </div>
            </body>
        </html>
    );
}
