"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          setUser(data.data?.user || data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to fetch session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                Dualog
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Dualog
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              // Logged in navigation
              <>
                <Link
                  href="/feed"
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Feed
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/api-keys"
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  API Keys
                </Link>
                <span className="text-sm text-gray-500">{user.email}</span>
                <form action="/api/auth/sign-out" method="POST">
                  <button
                    type="submit"
                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              // Logged out navigation
              <>
                <Link
                  href="/feed"
                  className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Feed
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
