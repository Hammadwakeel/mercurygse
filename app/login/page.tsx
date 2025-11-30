// Updated Login Page with Microsoft Login + Orange/Zinc Theme

"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { login } from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const response = await login(email, password)

      localStorage.setItem("accessToken", response.access_token)
      localStorage.setItem("refreshToken", response.refresh_token)
      localStorage.setItem("tokenType", response.token_type)
      localStorage.setItem("authToken", JSON.stringify({ 
        email, 
        authenticated: true, 
        timestamp: Date.now(),
        accessToken: response.access_token
      }))

      router.push("/")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError(errorMessage)
      console.error("[v0] Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = () => {
    console.log("[v0] Social login with: Microsoft")
    // Redirect to your Microsoft OAuth endpoint
  }

  return (
    
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Light Theme Background */}
      <div 
        className="absolute inset-0 -z-10 dark:hidden"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #fff7f0 40%, #ffe8cc 100%)"
        }}
      ></div>

      {/* Dark Theme Background */}
      <div 
        className="absolute inset-0 -z-10 hidden dark:block"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #111 40%, #161616 100%)"
        }}
      ></div>

      {/* Subtle Grid overlay (dark mode only). Lines are dim and spaced out; hidden in light theme. */}
      <div
        className="absolute inset-0 -z-10 hidden dark:block pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          opacity: 0.04
        }}
      />

      <div className="absolute inset-x-6 top-6 z-20 flex items-center justify-between pointer-events-auto">
          <Link href="/" className="z-20">
            <Button variant="outline" className="border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2 rounded-lg">
              ← Back
            </Button>
          </Link>
          <ThemeToggle />
        </div>

      <div className="w-full max-w-md float-card">
        <div className="bg-white dark:bg-zinc-900/80 rounded-3xl shadow-2xl dark:shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm">

          {/* Header */}
          <div className="px-6 md:px-8 pt-8 pb-6 text-center border-b border-zinc-200 dark:border-zinc-700">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Welcome Back</h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400">Sign in to your account</p>
          </div>

          {/* Body */}
          <div className="px-6 md:px-8 pb-10">
            {error && (
              <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/30 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/30 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 font-semibold text-base rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 dark:from-orange-500 dark:to-amber-500 dark:hover:from-orange-600 dark:hover:to-amber-600 text-white shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400">Or continue with</span>
              </div>
            </div>

            {/* Microsoft Login */}
            <Button
              type="button"
              onClick={handleSocialLogin}
              variant="outline"
              className="w-full py-3 border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-2 text-zinc-800 dark:text-zinc-100 font-medium"
            >
              {/* Microsoft Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <rect width="10" height="10" x="1" y="1" fill="#F25022" />
                <rect width="10" height="10" x="13" y="1" fill="#7FBA00" />
                <rect width="10" height="10" x="1" y="13" fill="#00A4EF" />
                <rect width="10" height="10" x="13" y="13" fill="#FFB900" />
              </svg>
              Microsoft
            </Button>

            <div className="mt-8 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
