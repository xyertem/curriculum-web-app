import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import LoginForm from '@/app/ui/login-form'

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <Card>
        <CardHeader><h1 className="text-3xl font-bold">Giriş yap</h1></CardHeader>
        <CardContent><LoginForm /></CardContent>
      </Card>
      <p className="mt-6">Hesabın yok mu? <Link href="/signup" className="underline">Kayıt ol</Link></p>
      <Link href="/" className="mt-4 inline-block underline">Ana sayfa</Link>
    </main>
  )
}
