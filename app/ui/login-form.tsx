'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/app/actions/auth'

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="block">E-posta</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required
          aria-describedby={state?.errors?.email ? 'email-error' : undefined} />
        {state?.errors?.email && <p id="email-error" role="alert">{state.errors.email.join(' ')}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="block">Parola</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required
          aria-describedby={state?.errors?.password ? 'password-error' : undefined} />
        {state?.errors?.password && <p id="password-error" role="alert">{state.errors.password.join(' ')}</p>}
      </div>
      {state?.message && <p role="alert">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Giriş yapılıyor…' : 'Giriş yap'}
      </Button>
    </form>
  )
}
