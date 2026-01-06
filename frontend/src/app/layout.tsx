import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedInsight AI - Medical Report Analysis Platform",
  description:
    "AI-powered medical test report interpretation. Upload your lab reports and get instant analysis with clear, patient-friendly explanations.",
  keywords: [
    "medical report analysis",
    "lab test interpretation",
    "health insights",
    "AI medical analysis",
    "blood test results",
  ],
  authors: [{ name: "MedInsight AI Team" }],
  openGraph: {
    title: "MedInsight AI - Medical Report Analysis Platform",
    description:
      "Upload your medical reports and get AI-powered analysis in simple, patient-friendly language.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
