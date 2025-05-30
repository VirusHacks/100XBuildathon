import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await dbConnect()

        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        console.log("User authenticated with role:", user.role)

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber,
          profile: user.profile,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.phoneNumber = user.phoneNumber
        token.profile = user.profile
      }
      console.log("JWT token with role:", token.role)
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.phoneNumber = token.phoneNumber
        session.user.profile = token.profile
      }
      console.log("Session with role:", session.user.role)
      return session
    },
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "github") {
        await dbConnect()

        // Check if user exists
        const existingUser = await User.findOne({ email: profile.email })

        if (!existingUser) {
          // Create new user if doesn't exist
          await User.create({
            email: profile.email,
            name: profile.name || profile.login,
            role: "user", // Default role
            provider: account.provider,
            profile: {
              profilePhoto: profile.image || profile.avatar_url,
            },
          })
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Don't redirect here, let the client-side handle it based on user role
      return baseUrl
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

