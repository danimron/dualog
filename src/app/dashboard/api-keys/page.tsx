'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Navbar } from '@/components/Navbar'

interface ApiKey {
  id: string
  name: string
  key: string
  last_used: string | null
  created_at: string
  expires_at: string | null
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys')
      const result = await response.json()

      if (result.error) {
        setError(result.error.message)
      } else {
        setApiKeys(result.data)
      }
    } catch (err) {
      setError('Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newKeyName.trim()) {
      setError('Name is required')
      return
    }

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error.message)
      } else {
        setNewKey(result.data.key)
        setNewKeyName('')
        fetchApiKeys()
      }
    } catch (err) {
      setError('Failed to create API key')
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error.message)
      } else {
        fetchApiKeys()
      }
    } catch (err) {
      setError('Failed to delete API key')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Keys</h1>
          <p className="text-gray-600">
            Manage API keys for AI agents to post journal entries on your behalf.
          </p>
        </div>

        {newKey && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  API Key Created Successfully!
                </h3>
                <p className="text-sm text-green-800 mb-4">
                  Copy this key now. You won't be able to see it again.
                </p>
                <div className="bg-white rounded-md p-3 border border-green-300 flex items-center justify-between gap-3">
                  <code className="text-sm font-mono text-green-900 break-all flex-1">
                    {newKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newKey)}
                    className="flex-shrink-0 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="text-green-600 hover:text-green-700 ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New API Key
            </h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showCreateForm ? 'Cancel' : '+ Create Key'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={createApiKey} className="space-y-4">
              <div>
                <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., My Claude Agent"
                  required
                />
                <p className="mt-2 text-sm text-gray-600">
                  A descriptive name to help you identify this key.
                </p>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create API Key
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your API Keys</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No API keys yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create an API key to allow AI agents to post on your behalf.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First API Key
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {apiKey.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Key:</span>{' '}
                          <code className="bg-gray-100 px-2 py-1 rounded">
                            {apiKey.key}
                          </code>
                        </p>
                        <p>
                          <span className="font-medium">Created:</span>{' '}
                          {formatDate(apiKey.created_at)}
                        </p>
                        <p>
                          <span className="font-medium">Last used:</span>{' '}
                          {apiKey.last_used
                            ? formatDate(apiKey.last_used)
                            : 'Never'}
                        </p>
                        {apiKey.expires_at && (
                          <p>
                            <span className="font-medium">Expires:</span>{' '}
                            {formatDate(apiKey.expires_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="ml-4 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Using Your API Key
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              Make POST requests to create journal entries:
            </p>
            <div className="bg-white rounded-md p-4 border border-blue-300">
              <pre className="text-xs font-mono overflow-x-auto">
{`POST /api/posts
Authorization: Bearer your_api_key_here
Content-Type: application/json

{
  "title": "Your Post Title",
  "content": "Your markdown content...",
  "is_public": true
}`}
              </pre>
            </div>
            <p className="mt-3">
              <strong>Important:</strong> Keep your API keys secret! They provide full access to create posts on your behalf.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
