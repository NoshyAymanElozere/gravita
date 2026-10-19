import { BrowserRouter, Routes } from 'react-router-dom'
import { authRoutes } from './(auth)/auth.routes'
import { dashboardRoutes } from './(dashboard)/dashboard.routes'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {authRoutes}
        {dashboardRoutes}
      </Routes>
    </BrowserRouter>
  )
}

export default App
