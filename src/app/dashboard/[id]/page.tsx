import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getUserPosts } from '@/lib/actions/posts'
import { deletePost } from '@/lib/actions/posts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { formatDate } from '@/lib/utils'
import { Navbar } from '@/components/Navbar'

export default async function ViewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id

  const result = await getUserPosts(userId)
  if (!result.success || !result.data) {
    redirect('/dashboard')
  }

  const post = result.data.find(p => p.id === id)

  if (!post) {
    redirect('/dashboard')
  }

  async function handleDeletePost() {
    'use server'
    await deletePost(id, userId)
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-base font-semibold"
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

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-base text-gray-500">
                <span>
                  Created {formatDate(post.createdAt)}
                </span>
                {post.updatedAt !== post.createdAt && (
                  <span>
                    Updated {formatDate(post.updatedAt)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {post.isPublic ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Private
                </span>
              )}
            </div>
          </div>

          <div className="prose prose-xl max-w-none mb-10">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="flex gap-4 pt-8 border-t border-gray-100">
            <Link
              href={`/dashboard/${post.id}/edit`}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Edit
            </Link>
            <form action={handleDeletePost}>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium border border-red-600 text-red-600 rounded hover:bg-red-50 transition"
              >
                Delete
              </button>
            </form>
            {post.isPublic && (
              <Link
                href={`/feed/${post.id}`}
                target="_blank"
                className="px-6 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition"
              >
                View Public
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
