import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChakraProviders } from "@/lib/ChakraProviders";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
});

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} chakra-ui-dark`}
            >
                <ChakraProviders>{children}</ChakraProviders>
            </body>
        </html>
    );
}
