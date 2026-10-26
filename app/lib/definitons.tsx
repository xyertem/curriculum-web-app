import * as z from 'zod'

export const SignupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'Name must be at least 2 characters long.' }),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Please enter a valid email.' })),
  password: z
    .string()
    .min(8, { error: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { error: 'Contain at least one letter.' })
    .regex(/[0-9]/, { error: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      error: 'Contain at least one special character.',
    })
    .refine((value) => new TextEncoder().encode(value).length <= 72, {
      error: 'Password must be at most 72 bytes long.',
    }),
})

export const LoginFormSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ error: 'Please enter a valid email.' })),
  password: z.string().min(1, { error: 'Please enter your password.' })
    .refine((value) => new TextEncoder().encode(value).length <= 72, {
      error: 'Password must be at most 72 bytes long.',
    }),
})

export type FormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined
