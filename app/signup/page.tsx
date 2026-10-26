import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import SignupForm from '@/app/ui/signup-form'

export default function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <Card>
        <CardHeader><h1 className="text-3xl font-bold">Kayıt ol</h1></CardHeader>
        <CardContent><SignupForm /></CardContent>
      </Card>
      <p className="mt-6">Zaten hesabın var mı? <Link href="/login" className="underline">Giriş yap</Link></p>
      <Link href="/" className="mt-4 inline-block underline">Ana sayfa</Link>
    </main>
  )
}
