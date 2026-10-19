import React, { Suspense } from 'react'

export const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading...</p>
    </div>
  )
}

export const withSuspense = (Component: React.ComponentType) => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}
