import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostById } from '@/lib/actions/posts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { formatDate } from '@/lib/utils'
import { Navbar } from '@/components/Navbar'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getPostById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const post = result.data

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <article className="max-w-4xl mx-auto px-4 py-16">
        <Link
          href="/feed"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-10 text-base font-semibold"
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
          Back to feed
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-10">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                {post.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-base">{post.user.name}</p>
              <p className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              {post.tags.map((tagRelation) => (
                <span
                  key={tagRelation.tag.id}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tagRelation.tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-xl max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  )
}
