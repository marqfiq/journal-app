import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Home, Calendar, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col glassmorphism border-r border-white/20">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800">Helen's Journal</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  active
                    ? 'bg-white/30 text-gray-900'
                    : 'text-gray-700 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glassmorphism border-t border-white/20 z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  active ? 'text-gray-900' : 'text-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default MainLayout

