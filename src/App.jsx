import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import AppRoutes from './routes'
import BottomNav from './components/layout/BottomNav'
import { seedDatabase } from './services/seedData'

function App() {
  // The database is now seeded by the Laravel backend, so we don't need local mock data.

  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
            <AppRoutes />
            <BottomNav />
            <Toaster position="top-center" />
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
