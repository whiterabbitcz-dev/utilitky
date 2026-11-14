import type { Metadata } from "next"
import { Toaster } from "sonner"
import Script from "next/script"
import "./globals.css"

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
    <html lang="cs">
      <body className="bg-bg text-white font-sans">
        {children}
        <Toaster
          position="bottom-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#FFFFFF",
              border: "1px solid #FFC107",
            },
          }}
        />
        <Script
          src="https://spendlik.prod.whiterabbit.cz/s.js"
          data-projekt="utilitky"
          data-verze={process.env.VERCEL_GIT_COMMIT_SHA}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
