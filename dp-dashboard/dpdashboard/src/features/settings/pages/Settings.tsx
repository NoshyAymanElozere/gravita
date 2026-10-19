import { Outlet } from 'react-router-dom'
export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 w-full">
        <div className="space-y-6 w-full animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
