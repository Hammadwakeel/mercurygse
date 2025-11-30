"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { getMe, getAvatarImage } from "@/lib/api"

export default function Navbar() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [userAvatar, setUserAvatar] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const authToken = localStorage.getItem("authToken")
      const accessToken = localStorage.getItem("accessToken")

      if (authToken && accessToken) {
        try {
          const auth = JSON.parse(authToken)
          if (auth.authenticated) {
            setIsAuthenticated(true)
            const data = await getMe(accessToken)
            setUserData(data)

            if (data.avatar) {
              const avatarUrl = await getAvatarImage(data.avatar)
              if (avatarUrl) setUserAvatar(avatarUrl)
            }
          }
        } catch (error) {
          console.error("Error fetching user:", error)
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* --- ✅ Logo Added --- */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/images/logo.jpeg" 
              alt="GSE Logo" 
              className="h-12 w-12 object-contain rounded-sm"
            />
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                MERCURY
              </span>
              <span className="text-sm font-bold tracking-widest text-orange-600">
                GSE
              </span>
            </div>
          </Link>
          {/* --- END LOGO --- */}

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {["rentals", "leasing", "about"].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="text-sm font-medium text-zinc-700 hover:text-orange-600 dark:text-zinc-300 dark:hover:text-orange-500 transition uppercase tracking-wide"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            {isLoading ? (
              <div className="h-8 w-8 animate-pulse bg-zinc-200 rounded-full dark:bg-zinc-800" />
            ) : isAuthenticated && userData ? (
              <div className="flex items-center gap-4">

                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <div className="h-9 w-9 rounded-full bg-zinc-200 overflow-hidden flex items-center justify-center border-2 border-orange-600">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userData.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-zinc-900">
                        {userData?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>

              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-sm font-bold text-zinc-700 hover:text-orange-600 dark:text-zinc-300 dark:hover:text-white transition uppercase">
                  Login
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}
