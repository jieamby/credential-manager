interface ApiErrorShape {
  status?: number
  data?: { message?: string | string[] }
}

export const getApiErrorMessage = (e: unknown, fallback = 'Terjadi kesalahan.'): string => {
  const err = e as ApiErrorShape
  if (err.status === undefined) return 'Tidak dapat terhubung ke server. Periksa backend dan pengaturan CORS.'
  const message = err.data?.message
  if (Array.isArray(message)) return message.join('. ')
  return message ?? fallback
}