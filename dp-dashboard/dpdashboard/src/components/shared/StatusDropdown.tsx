import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface StatusDropdownProps {
  /** Current status value from the server */
  value: boolean
  /**
   * Called only when the user selects a *different* status.
   * Must return a Promise so the component can manage its own loading state.
   * Throw/reject to trigger an automatic rollback.
   */
  onChange: (newValue: boolean) => Promise<unknown>
  usePortal?: boolean
  disabled?: boolean
}

export function StatusDropdown({ value, onChange, usePortal = true, disabled = false }: StatusDropdownProps) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const [localValue, setLocalValue] = useState(value)
  const [isPending, setIsPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sync server value changes (e.g. after refetch) only when it actually differs
  const committedValueRef = useRef(value)
  useEffect(() => {
    if (value !== committedValueRef.current && !isPending) {
      setLocalValue(value)
      committedValueRef.current = value
    }
  }, [value, isPending])

  // Close dropdown on outside click; calculate portal coords when opening
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node
      if (!containerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    if (usePortal && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom, left: rect.left, width: rect.width })
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, usePortal])

  const handleSelect = useCallback(async (newValue: boolean) => {
    setIsOpen(false)
    // No-op if user selects the already-active status
    if (newValue === committedValueRef.current) return
    setLocalValue(newValue)
    setIsPending(true)
    try {
      await onChange(newValue)
      committedValueRef.current = newValue
    } catch {
      // Rollback on failure
      setLocalValue(committedValueRef.current)
    } finally {
      setIsPending(false)
    }
  }, [onChange])

  // Skeleton while loading
  if (isPending) {
    return <div className="h-[26px] w-[75px] bg-gray-100 dark:bg-zinc-800/60 animate-pulse rounded-full" />
  }

  const colorCls = localValue
    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15'
    : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/15'

  const dropdownMenu = (
    <>
      <button
        type="button"
        onClick={() => handleSelect(true)}
        className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/5 hover:text-emerald-500 text-left text-xs font-semibold text-foreground/90 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>{t('active') || 'Active'}</span>
        </div>
        {localValue && <Check className="h-3 w-3" />}
      </button>
      <button
        type="button"
        onClick={() => handleSelect(false)}
        className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-rose-500/5 hover:text-rose-500 text-left text-xs font-semibold text-foreground/90 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span>{t('inactive') || 'Inactive'}</span>
        </div>
        {!localValue && <Check className="h-3 w-3" />}
      </button>
    </>
  )

  const dropdownPanel = (
    <div
      ref={dropdownRef}
      className={
        usePortal
          ? 'fixed rounded-xl border border-border/60 bg-card p-1 shadow-lg z-[9999] animate-in fade-in slide-in-from-top-1 duration-150'
          : `absolute mt-1.5 rounded-xl border border-border/60 bg-card p-1 shadow-lg z-[9999] animate-in fade-in slide-in-from-top-1 duration-150 ${isRtl ? 'right-0' : 'left-0'}`
      }
      style={usePortal ? { top: coords.top + 6, left: coords.left, minWidth: '120px' } : { minWidth: '120px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {dropdownMenu}
    </div>
  )

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        ref={buttonRef}
        disabled={disabled}
        onClick={(e) => {
          if (disabled) return
          e.stopPropagation()
          setIsOpen((o) => !o)
        }}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 border ${colorCls} ${
          disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${localValue ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <span>{localValue ? t('active') || 'Active' : t('inactive') || 'Inactive'}</span>
        {!disabled && (
          <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>
      {isOpen && !disabled && (usePortal ? createPortal(dropdownPanel, document.body) : dropdownPanel)}
    </div>
  )
}
