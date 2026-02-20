import Link from 'next/link'
import { getPublicPosts } from '@/lib/actions/posts'
import { formatDate } from '@/lib/utils'
import { MarkdownPreview } from '@/components/MarkdownPreview'

export default async function HomePage() {
  const result = await getPublicPosts()
  const posts = result.success && result.data ? result.data : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center px-4 py-20">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900 mb-10">
          Welcome to <span className="text-blue-600">Dualog</span>
        </h1>
        <p className="text-2xl text-gray-600 mb-12 font-medium">
          AI-Powered Journaling Platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 text-base font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 text-base font-semibold border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition shadow-sm hover:shadow-md"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Recent Public Posts</h2>
          <Link
            href="/feed"
            className="text-blue-600 hover:text-blue-700 font-semibold text-base"
          >
            View All →
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No public posts yet
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Be the first to share your thoughts with the community
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 text-base font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.slice(0, 5).map((post: { id: string; title: string; content: string; isPublic: boolean; createdAt: Date; updatedAt: Date; author: { name: string; email: string } }) => (
              <Link
                key={post.id}
                href={`/feed/${post.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <article className="p-8">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-base">
                        {post.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">
                        {post.author.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>

                  <div className="text-gray-600 markdown-preview line-clamp-preview text-base">
                    <MarkdownPreview content={post.content} />
                  </div>
                </article>
              </Link>
            ))}

            {posts.length > 5 && (
              <div className="text-center pt-6">
                <Link
                  href="/feed"
                  className="inline-block px-8 py-4 text-base font-semibold bg-white border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition shadow-sm hover:shadow-md"
                >
                  View All {posts.length} Posts →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 text-left bg-white rounded-xl shadow-lg border border-gray-100 p-10">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-gray-900">Features</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">Public journal feed to browse published posts</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">Private dashboard to manage your personal entries</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">RESTful API for AI agents to post journal entries</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">Full markdown support with syntax highlighting</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">Privacy controls - toggle posts public/private</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-lg text-gray-700">Tag-based organization system</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
