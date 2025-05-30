import { Inter } from "next/font/google"
import "./globals.css"
import AuthStatus from "@/components/auth-status"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import SessionProvider from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Next.js Auth System",
  description: "Authentication and authorization with Next.js and NextAuth.js",
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          {/* <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1 className="text-xl font-bold">
                <a href="/">Next.js Auth</a>
              </h1>
              <AuthStatus />
            </div>
          </header> */}
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}

