"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { signup } from "@/lib/api"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // password checks
  const checks = useMemo(() => {
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    const minLength = password.length >= 8
    return { hasLower, hasUpper, hasNumber, hasSpecial, minLength }
  }, [password])

  const strengthScore = useMemo(() => {
    // count how many of the 5 checks are true (max 5)
    const vals = Object.values(checks)
    return vals.filter(Boolean).length
  }, [checks])

  const strengthLabel = useMemo(() => {
    switch (strengthScore) {
      case 0:
      case 1:
        return "Very weak"
      case 2:
        return "Weak"
      case 3:
        return "Fair"
      case 4:
        return "Good"
      case 5:
        return "Strong"
      default:
        return ""
    }
  }, [strengthScore])

  const strengthColorClass = useMemo(() => {
    // return a tailwind bg color based on score
    if (strengthScore <= 1) return "bg-red-500"
    if (strengthScore === 2) return "bg-amber-500"
    if (strengthScore === 3) return "bg-yellow-400"
    if (strengthScore === 4) return "bg-lime-500"
    return "bg-green-500"
  }, [strengthScore])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // require all checks
    if (!checks.hasLower || !checks.hasUpper || !checks.hasNumber || !checks.hasSpecial || !checks.minLength) {
      setError("Password must be at least 8 characters and include one lowercase, one uppercase, one number and one special character")
      return
    }

    setIsLoading(true)
    try {
      const response = await signup(fullName, email, password)

      localStorage.setItem("accessToken", response.access_token)
      localStorage.setItem("refreshToken", response.refresh_token)
      localStorage.setItem("tokenType", response.token_type)
      localStorage.setItem("authToken", JSON.stringify({
        email,
        fullName,
        authenticated: true,
        timestamp: Date.now()
      }))

      router.push("/")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account"
      setError(errorMessage)
      console.error("[v0] Signup error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = (provider: string) => {
    console.log("[v0] Social signup with:", provider)
  }

  const percent = Math.round((strengthScore / 5) * 100)

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">


      <div className="absolute inset-x-6 top-6 z-20 flex items-center justify-between pointer-events-auto">
          <Link href="/" className="z-20">
            <Button variant="outline" className="border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2 rounded-lg">
              ← Back
            </Button>
          </Link>
          <ThemeToggle />
        </div>


      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md float-card z-10">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">

          <div className="px-6 md:px-8 pt-8 md:pt-10 pb-6 text-center border-b border-zinc-200 dark:border-zinc-800">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Create Account
            </h1>
            <p className="text-base text-zinc-500 dark:text-zinc-400">
              Join us to get started
            </p>
          </div>

          <div className="px-6 md:px-8 pb-8 md:pb-10">
            {error && (
              <div
                className="mb-5 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm font-medium"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  required
                  aria-describedby="password-requirements password-strength-label"
                />

                {/* Strength bar */}
                <div className="mt-3">
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColorClass}`}
                      style={{ width: `${percent}%` }}
                      aria-hidden
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div id="password-strength-label" className="text-zinc-600 dark:text-zinc-300">{strengthLabel}</div>
                    <div className="text-zinc-500 dark:text-zinc-400">{percent}%</div>
                  </div>

                  {/* Checklist */}
                  <ul id="password-requirements" className="mt-3 grid grid-cols-1 gap-1 text-xs">
                    <li className={`flex items-center gap-2 ${checks.minLength ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      <span className={`inline-block w-4 h-4 rounded-full ${checks.minLength ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} aria-hidden />
                      At least 8 characters
                    </li>
                    <li className={`flex items-center gap-2 ${checks.hasLower ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      <span className={`inline-block w-4 h-4 rounded-full ${checks.hasLower ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} aria-hidden />
                      Lowercase letter (a-z)
                    </li>
                    <li className={`flex items-center gap-2 ${checks.hasUpper ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      <span className={`inline-block w-4 h-4 rounded-full ${checks.hasUpper ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} aria-hidden />
                      Uppercase letter (A-Z)
                    </li>
                    <li className={`flex items-center gap-2 ${checks.hasNumber ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      <span className={`inline-block w-4 h-4 rounded-full ${checks.hasNumber ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} aria-hidden />
                      Number (0-9)
                    </li>
                    <li className={`flex items-center gap-2 ${checks.hasSpecial ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      <span className={`inline-block w-4 h-4 rounded-full ${checks.hasSpecial ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} aria-hidden />
                      Special character (e.g. !@#$%)
                    </li>
                  </ul>
                </div>

              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 md:py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            <div className="relative my-6 md:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-zinc-200 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
                  Or sign up with
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => handleSocialSignup("Microsoft")}
              variant="outline"
              className="w-full py-3 md:py-4 border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center gap-2 text-zinc-900 dark:text-zinc-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
                <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
                <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
                <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
              </svg>
              Sign up with Microsoft
            </Button>

            <div className="mt-6 md:mt-8 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-orange-600 dark:text-orange-400">
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
