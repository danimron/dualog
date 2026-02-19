import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getUserPosts } from '@/lib/actions/posts'
import { EditPostForm } from '@/components/EditPostForm'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect('/login')
  }

  const result = await getUserPosts(session.user.id)
  if (!result.success) {
    redirect('/dashboard')
  }

  const post = result.data.find(p => p.id === id)

  if (!post) {
    redirect('/dashboard')
  }

  return <EditPostForm post={post} />
}
