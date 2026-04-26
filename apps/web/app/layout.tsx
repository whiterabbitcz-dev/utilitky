import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Nástroje | White Rabbit",
  description: "Zdarma nástroje pro lidi co dělají obsah. Od White Rabbit.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" className={nunito.variable}>
      <body className="bg-bg text-white font-sans">
        {children}
        <Toaster
          position="bottom-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#FFFFFF",
              border: "1px solid #00E5FF",
            },
          }}
        />
      </body>
    </html>
  )
}
