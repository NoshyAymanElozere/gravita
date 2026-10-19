import { z } from 'zod'

// Messages are i18n keys — field components run them through t() at render time.

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'auth.errors.emailRequired').email('auth.errors.invalidEmail'),
  password: z.string().min(1, 'auth.errors.passwordRequired'),
  remember: z.boolean(),
})
export type LoginForm = z.infer<typeof loginSchema>
