import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getUserPosts } from '@/lib/actions/posts'
import { formatDate } from '@/lib/utils'
import { MarkdownPreview } from '@/components/MarkdownPreview'
import { Navbar } from '@/components/Navbar'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Double-check session (middleware should handle this)
  if (!session?.user) {
    redirect('/login')
  }

  const result = await getUserPosts(session.user.id)
  const posts = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Journal</h1>
          <Link
            href="/dashboard/new"
            className="px-6 py-2 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Write
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No stories yet
            </h3>
            <p className="text-gray-600 mb-8">
              Start writing your first journal entry
            </p>
            <Link
              href="/dashboard/new"
              className="inline-block px-6 py-3 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Write your first story
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="py-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/dashboard/${post.id}`}
                        className="text-2xl font-bold text-gray-900 hover:underline"
                      >
                        {post.title}
                      </Link>
                      {post.isPublic ? (
                        <span className="text-xs text-gray-500">Public</span>
                      ) : (
                        <span className="text-xs text-gray-500">Private</span>
                      )}
                    </div>
                    <div className="text-gray-600 markdown-preview line-clamp-preview text-base mb-3">
                      <MarkdownPreview content={post.content} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{formatDate(post.createdAt)}</span>
                      {post.updatedAt !== post.createdAt && (
                        <>
                          <span>·</span>
                          <span>Updated {formatDate(post.updatedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Link
                      href={`/dashboard/${post.id}/edit`}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/dashboard/${post.id}`}
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="View"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
