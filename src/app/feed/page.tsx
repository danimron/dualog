import Link from 'next/link'
import { getPublicPosts } from '@/lib/actions/posts'
import { formatDate } from '@/lib/utils'
import { MarkdownPreview } from '@/components/MarkdownPreview'
import { Navbar } from '@/components/Navbar'

export default async function FeedPage() {
  let result
  let errorMsg = ''
  
  try {
    result = await getPublicPosts()
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : String(e)
    result = { success: false, error: errorMsg }
  }

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Public Journal Feed
            </h1>
            <p className="text-gray-600">
              Unable to load posts. Please try again later.
            </p>
            {errorMsg && (
              <p className="text-red-500 text-sm mt-4 font-mono">
                Error: {errorMsg}
              </p>
            )}
            {result.error && (
              <p className="text-orange-500 text-sm mt-2 font-mono">
                Result Error: {result.error}
              </p>
            )}
            {result.errorMessage && (
              <p className="text-red-600 text-xs mt-1">
                Message: {result.errorMessage}
              </p>
            )}
            {result.errorType && (
              <p className="text-blue-600 text-xs mt-1">
                Type: {result.errorType}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const posts = result.data

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 mb-6">No public posts yet</p>
            <Link
              href="/register"
              className="inline-block px-6 py-3 text-base font-semibold bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Be the first to post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/feed/${post.id}`}
                className="block py-8 group"
              >
                <article>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-700 font-medium text-sm">
                        {post.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm">
                        {post.author.name}
                      </p>
                      <span className="text-gray-300">·</span>
                      <p className="text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:underline">
                    {post.title}
                  </h2>

                  <div className="text-gray-600 markdown-preview line-clamp-preview text-base leading-relaxed">
                    <MarkdownPreview content={post.content} />
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Journal</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500">4 min read</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
