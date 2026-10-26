'use server'

import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'
import { Prisma } from '@/src/generated/prisma/client'
import { db } from '@/app/lib/db'
import { LoginFormSchema, SignupFormSchema, type FormState } from '@/app/lib/definitons'
import { createSession, deleteSession } from '@/app/lib/session'

export async function signup(_state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { name, email, password } = validatedFields.data
  let user: { id: string }
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    user = await db.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { errors: { email: ['Bu e-posta adresi zaten kullanılıyor.'] } }
    }
    return { message: 'Hesap oluşturulamadı. Lütfen tekrar deneyin.' }
  }

  await createSession(user.id)
  redirect('/profile')
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  let user: { id: string; password: string } | null
  let passwordMatches: boolean
  try {
    user = await db.user.findUnique({
      where: { email: validatedFields.data.email },
      select: { id: true, password: true },
    })
    // Still perform a hash comparison for an unknown account.
    passwordMatches = await bcrypt.compare(
      validatedFields.data.password,
      user?.password ?? '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    )
  } catch {
    return { message: 'Giriş yapılamadı. Lütfen tekrar deneyin.' }
  }
  if (!user || !passwordMatches) {
    return { message: 'E-posta adresi veya parola hatalı.' }
  }
  await createSession(user.id)
  redirect('/profile')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
