import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { AxiosError } from 'axios'
import type { ApiEnvelope } from '../types/auth.types'

export type AuthError = AxiosError<ApiEnvelope>

export function getErrorStatus(err: unknown): number | undefined {
  return (err as AuthError)?.response?.status
}

export function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as AuthError
  if (!e?.response) return fallback
  return e.response.data?.message || fallback
}

/**
 * Maps Laravel 422 `errors` onto form fields.
 * `fieldMap` translates API keys (e.g. `translations.1.name`) into form field names.
 * Returns the form fields that received an error.
 */
export function applyFieldErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Record<string, Path<T>> = {}
): Path<T>[] {
  const errors = (err as AuthError)?.response?.data?.errors
  if (!errors) return []

  const applied: Path<T>[] = []
  for (const [key, messages] of Object.entries(errors)) {
    const field = fieldMap[key] ?? (key as Path<T>)
    if (!messages?.length) continue
    setError(field, { type: 'server', message: messages[0] }, { shouldFocus: applied.length === 0 })
    applied.push(field)
  }
  return applied
}
