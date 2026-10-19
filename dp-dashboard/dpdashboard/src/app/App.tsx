import { BrowserRouter, Routes } from 'react-router-dom'
import { authRoutes } from './(auth)/auth.routes'
import { dashboardRoutes } from './(dashboard)/dashboard.routes'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {authRoutes}
        {dashboardRoutes}
      </Routes>
    </BrowserRouter>
  )
}

export default App
