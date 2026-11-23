import { Suspense } from 'react'
import Link from 'next/link'
import { requireAdmin } from '@/app/lib/session'

async function AdminDashboard() {
  const { user } = await requireAdmin()

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Yönetim paneli</h1>
      <p>Hoş geldin, {user.name}.</p>
      <Link href="/profile" className="inline-block underline">Hesabım</Link>
    </div>
  )
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <Suspense fallback={<p role="status">Yönetim paneli yükleniyor…</p>}>
        <AdminDashboard />
      </Suspense>
    </main>
  )
}
