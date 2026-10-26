import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/app/lib/db'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax' as const,
    path: '/',
  }
}

// Call from Server Actions or Route Handlers, where cookies can be changed.
export async function createSession(userId: string) {
  const cookieStore = await cookies()
  const previousToken = cookieStore.get('session')?.value
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await db.$transaction(async (tx) => {
    // Replace the browser's previous session instead of leaving it active.
    if (previousToken && TOKEN_PATTERN.test(previousToken)) {
      await tx.session.deleteMany({ where: { tokenHash: hashToken(previousToken) } })
    }
    await tx.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } })
  })

  cookieStore.set('session', token, cookieOptions(expiresAt))
}

// Read-only: safe to use in Server Components. Never trust cookie presence alone.
export async function getSession() {
  const token = (await cookies()).get('session')?.value
  if (!token || !TOKEN_PATTERN.test(token)) return null

  return db.session.findFirst({
    where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } },
    select: {
      id: true,
      expiresAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function requireSession() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function updateSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token || !TOKEN_PATTERN.test(token)) {
    cookieStore.delete('session')
    return false
  }

  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  // Never revive an expired or revoked session, even during concurrent requests.
  const result = await db.session.updateMany({
    where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } },
    data: { expiresAt },
  })
  if (result.count === 0) {
    cookieStore.delete('session')
    return false
  }
  cookieStore.set('session', token, cookieOptions(expiresAt))
  return true
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (token && TOKEN_PATTERN.test(token)) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } })
  }
  cookieStore.delete('session')
}
