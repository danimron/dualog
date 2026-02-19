import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const result = await auth.api.signOut({
      headers: await headers()
    })

    // Redirect to home after successful logout
    return Response.redirect(new URL('/', request.url), 302)
  } catch (error: any) {
    return Response.json(
      { error: { message: error.message || 'Logout failed' } },
      { status: 500 }
    )
  }
}
