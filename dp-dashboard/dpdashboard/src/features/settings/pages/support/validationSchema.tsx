import { z } from 'zod'

export const schema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  subject: z.string(),
  message: z.string()
})

export const getInitialValues = (editingItem: any | null) => {
  return {
    name: editingItem?.name || '',
    email: editingItem?.email || '',
    phone: editingItem?.phone || '',
    subject: editingItem?.subject || '',
    message: editingItem?.message || ''
  }
}
