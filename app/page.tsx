"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getMe, getAvatarImage } from '@/lib/api'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [userAvatar, setUserAvatar] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const authToken = localStorage.getItem('authToken')
      const accessToken = localStorage.getItem('accessToken')

      if (authToken && accessToken) {
        try {
          const auth = JSON.parse(authToken)
          if (auth.authenticated) {
            setIsAuthenticated(true)
            const data = await getMe(accessToken)
            setUserData(data)
            
            if (data.avatar) {
              const avatarUrl = await getAvatarImage(data.avatar)
              if (avatarUrl) {
                setUserAvatar(avatarUrl)
              }
            }
          }
        } catch (error) {
          console.error('[v0] Error fetching user data:', error)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsAuthenticated(false)
    setUserData(null)
    setUserAvatar(null)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation Bar (replaced with Navbar component) */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 pattern-grid-lg text-zinc-900 dark:text-white" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800 dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-300">
              24/7 Breakdown Service Available
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tight text-balance uppercase">
              Top-Tier GSE <span className="text-orange-600">Rentals, Leasing,</span> & Sales
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto text-balance font-light">
              Hold onto capital. Gain flexibility. Keep your fleet moving with smarter leasing solutions and the highest quality ground support equipment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <button
                  onClick={() => router.push('/chat')}
                  className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-orange-600 rounded-sm hover:bg-zinc-900 hover:scale-105 transition duration-200 uppercase tracking-wider shadow-xl"
                >
                  Talk to an Agent
                </button>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-orange-600 rounded-sm hover:bg-zinc-900 hover:scale-105 transition duration-200 uppercase tracking-wider shadow-xl"
                  >
                    Request a Quote
                  </Link>
                  <Link
                    href="#rentals"
                    className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-zinc-900 dark:text-white border-2 border-zinc-900 dark:border-white rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition uppercase tracking-wider"
                  >
                    View Inventory
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Services (The Mercury Advantage) */}
      <section id="leasing" className="bg-white dark:bg-zinc-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-wide sm:text-4xl">
              Keep Your Fleet Moving
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Leverage tailored leasing solutions to keep your ground operations running smoothly. From peak season support to long-term expansion.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Flexible Leasing',
                description: 'Preserve your capital and stay agile. Our leasing programs are built around your financial needs.',
                icon: '📋',
              },
              {
                title: 'MRO & Support',
                description: 'Maintain the highest standards of safety with our maintenance, repair, and overhaul support.',
                icon: '🔧',
              },
              {
                title: 'Immediate Delivery',
                description: 'Servicing rentals across the U.S. and Canada. We deliver equipment wherever you need it.',
                icon: '🚚',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-orange-500 dark:hover:border-orange-500 transition-colors duration-300"
              >
                <div className="absolute top-0 left-0 h-1 w-0 bg-orange-600 transition-all duration-300 group-hover:w-full" />
                <div className="text-4xl mb-6 p-3 bg-white dark:bg-zinc-800 w-fit rounded-lg shadow-sm text-orange-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Categories (Solutions) */}
      <section id="rentals" className="bg-zinc-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-zinc-800 pb-8">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-wide text-white">
                Premium <span className="text-orange-500">GSE Inventory</span>
              </h2>
              <p className="mt-2 text-zinc-400">Reliable equipment. On your terms.</p>
            </div>
            <Link href="/signup" className="hidden md:inline-flex items-center text-orange-500 hover:text-white transition font-bold uppercase tracking-wide text-sm">
              Explore All Categories →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'Cargo Loaders',
              'Pushback Tractors',
              'Ground Power Units',
              'Air Start Units',
              'Air Conditioners',
              'Baggage Tugs',
              'Belt Loaders',
              'Aircraft Stairs',
            ].map((item, index) => (
              <div
                key={index}
                className="group cursor-pointer p-6 bg-zinc-800 hover:bg-orange-600 transition-colors duration-300 rounded-sm"
              >
                <div className="h-2 w-8 bg-orange-600 group-hover:bg-white mb-4 transition-colors" />
                <h3 className="font-bold text-lg text-zinc-100 group-hover:text-white">
                  {item}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries & Trust */}
      <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase">
              Your Partner on the Tarmac
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              To keep up in summer and peak seasons, you can't deal with unnecessary downtime. From making sure everything is in top condition to offering around-the-clock support, the Mercury GSE team keeps you moving.
            </p>
            <div className="space-y-4 pt-4">
              {[
                'Airlines: Ensure seamless operations and passenger satisfaction.',
                'Cargo & Logistics: Optimize supply chain efficiency.',
                'Ground Handlers: Deliver efficient turnaround times.'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <span className="h-2 w-2 rounded-full bg-orange-600" />
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800">
             <h3 className="font-bold text-zinc-900 dark:text-white mb-6 uppercase text-sm tracking-wider">Trusted Around the Globe</h3>
             <div className="grid grid-cols-2 gap-8 opacity-60 grayscale">
                {/* Placeholders for client logos */}
                <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4"></div>
                <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
                <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded w-full"></div>
                <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded w-2/3"></div>
             </div>
             <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
                <p className="italic text-zinc-600 dark:text-zinc-400">
                  "Mercury GSE has been an outstanding resource for fulfilling our Ground Support Equipment requirements..."
                </p>
                <p className="mt-2 font-bold text-zinc-900 dark:text-white text-sm">— Director of GSE, Alaska Airlines</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-orange-600 bg-zinc-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <span className="text-2xl font-black tracking-tighter text-white">MERCURY</span>
              <span className="text-sm font-bold tracking-widest text-orange-500 ml-1">GSE</span>
              <p className="mt-4 text-zinc-400 max-w-sm">
                Industry-leading GSE rentals, sales, and 24/7 support empowering you to deliver efficient turnaround times.
              </p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-sm mb-4 text-orange-500">Equipment</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white">Pushback Tractors</a></li>
                <li><a href="#" className="hover:text-white">Cargo Loaders</a></li>
                <li><a href="#" className="hover:text-white">Ground Power Units</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-sm mb-4 text-orange-500">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-8 text-center text-sm text-zinc-500">
            <p>© 2025 Mercury GSE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
