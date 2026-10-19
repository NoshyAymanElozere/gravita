import { BrowserRouter, Routes } from 'react-router-dom'
import { authRoutes } from './(auth)/auth.routes'
import { dashboardRoutes } from './(dashboard)/dashboard.routes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {authRoutes}
        {dashboardRoutes}
      </Routes>
    </BrowserRouter>
  )
}

export default App
