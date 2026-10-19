import { z } from 'zod'

export const registrationSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  pass: z.string().min(6, 'Password must be at least 6 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>
