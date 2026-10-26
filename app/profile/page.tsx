import { Suspense } from 'react'
import Link from 'next/link'
import { requireSession } from '@/app/lib/session'
import { logout } from '@/app/actions/auth'

async function Profile() {
  const { user } = await requireSession()
  return (
    <div className="space-y-4">
      <p>Merhaba, {user.name}.</p>
      <p>{user.email}</p>
      <form action={logout}>
        <button type="submit" className="rounded-lg bg-blue-600 px-5 py-3 text-white">Çıkış yap</button>
      </form>
      <Link href="/" className="inline-block underline">Ana sayfa</Link>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">Hesabım</h1>
      <Suspense fallback={<p role="status">Hesap bilgileri yükleniyor…</p>}>
        <Profile />
      </Suspense>
    </main>
  )
}
