// app/chat/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AIAssistantUI from '@/components/AIAssistantUI'

export default function ChatPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for auth token
    const authToken = localStorage.getItem('authToken')
    let auth = false

    if (authToken) {
      try {
        const parsed = JSON.parse(authToken)
        auth = Boolean(parsed?.authenticated)
      } catch (err) {
        console.warn('Failed to parse authToken', err)
        auth = false
      }
    }

    setIsAuthenticated(auth)
    setIsLoading(false)

    // If not authenticated, send user to login page
    if (!auth) {
      // use replace so user can't go "back" to the protected page
      router.replace('/login')
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading || isAuthenticated === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  // If not authenticated we already redirected; this guards rendering on the off-chance redirect hasn't happened yet.
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen">
      <AIAssistantUI />
    </div>
  )
}
