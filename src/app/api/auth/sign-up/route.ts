import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(request: Request) {
  const body = await request.json()

  // Better Auth requires a name field, we'll use email as fallback
  const userData = {
    ...body,
    name: body.name || body.email.split('@')[0]
  }

  try {
    const result = await auth.api.signUpEmail({
      body: userData,
      headers: await headers()
    })

    return Response.json(result)
  } catch (error: any) {
    return Response.json(
      { error: { message: error.message || 'Registration failed' } },
      { status: 400 }
    )
  }
}
