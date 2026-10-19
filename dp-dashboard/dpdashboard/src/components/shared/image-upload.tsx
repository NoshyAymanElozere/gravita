import React, { useState, useRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/utils'

interface ImageUploadProps {
  name: string
  label?: string
  disabled?: boolean
  currentImageUrl?: string
  className?: string
  aspectRatio?: string // e.g. "aspect-video", "aspect-square", "h-28 w-44"
}

export function ImageUpload({
  name,
  label,
  disabled = false,
  currentImageUrl,
  className,
  aspectRatio = "h-32 w-full"
}: ImageUploadProps) {
  const { t } = useTranslation()
  const { control } = useFormContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const [preview, setPreview] = useState<string | null>(currentImageUrl || null)

        // Sync with external initial values
        React.useEffect(() => {
          if (currentImageUrl) {
            setPreview(currentImageUrl)
          } else if (!value) {
            setPreview(null)
          }
        }, [currentImageUrl, value])

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const files = e.target.files
          if (files && files[0]) {
            const file = files[0]
            onChange(files) // Update react-hook-form value
            const reader = new FileReader()
            reader.onloadend = () => {
              setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
          }
        }

        const handleRemove = (e: React.MouseEvent) => {
          e.stopPropagation()
          if (disabled) return
          onChange(null)
          setPreview(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }

        const triggerFileInput = () => {
          if (disabled) return
          fileInputRef.current?.click()
        }

        return (
          <div className={cn('w-full flex flex-col gap-1.5', className)}>
            {label && (
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {label}
              </label>
            )}

            <div
              onClick={triggerFileInput}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-2xl overflow-hidden transition-all duration-200',
                aspectRatio,
                disabled 
                  ? 'border border-gray-150 bg-gray-50/30 cursor-default' 
                  : 'border-2 border-dashed border-gray-300 hover:border-main hover:bg-gray-50/50 cursor-pointer bg-gray-50/30',
                error && 'border-rose-500'
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={disabled}
              />

              {preview ? (
                <div className="relative w-full h-full group">
                  <img
                    src={preview}
                    alt="upload preview"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
                  />
                  {!disabled && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-200">
                      <button
                        type="button"
                        onClick={handleRemove}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors backdrop-blur-md"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : disabled ? (
                <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400">
                  <ImageIcon className="h-6 w-6 mb-1.5 opacity-40 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400">
                    {t('noImage') || 'No image available'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="p-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 mb-2">
                    <UploadCloud className="h-6 w-6 text-gray-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">
                    {t('uploadImage') || 'Upload Image'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">
                    PNG, JPG or GIF up to 5MB
                  </span>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-semibold">{error.message}</p>
            )}
          </div>
        )
      }}
    />
  )
}
