import { useState, lazy, Suspense } from 'react'
import {
  Settings,
  BarChart3,
  FileText,
  Menu,
  X,
  Home,
  Package,
  Shield,
  Inbox
} from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

// Lazy load pages
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const PackagesPage = lazy(() => import('../pages/PackagesPage'))
const OrdersPage = lazy(() => import('../pages/OrdersPage'))
const AdminsPage = lazy(() => import('../pages/AdminsPage'))
const SubmissionsPage = lazy(() => import('../pages/SubmissionsPage'))
const EmptyPage = lazy(() => import('../pages/EmptyPage'))

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const menuItems = [
    { icon: Home, label: 'Dashboard', key: 'dashboard' },
    { icon: Package, label: 'Packages', key: 'packages' },
    { icon: Shield, label: 'Admins', key: 'admins' },
    { icon: FileText, label: 'Orders', key: 'orders' },
    { icon: Inbox, label: 'Submissions', key: 'submissions' },
    { icon: BarChart3, label: 'Analytics', key: 'analytics' },
    { icon: Settings, label: 'Settings', key: 'settings' },
  ]

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-700 to-blue-600 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-purple-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Galaxy Name Lab</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl mb-2 transition-all duration-200 ${activeTab === item.key
                  ? 'bg-white/20 text-white shadow-lg transform scale-[1.02]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={onLogout}
            className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 hidden lg:block">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab}
              </h1>

            </div>

          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<LoadingSpinner text="Loading..." className="py-12" />}>
            {activeTab === 'dashboard' && <DashboardPage />}

            {activeTab === 'packages' && <PackagesPage />}

            {activeTab === 'admins' && <AdminsPage />}

            {activeTab === 'orders' && <OrdersPage />}

            {activeTab === 'submissions' && <SubmissionsPage />}

            {activeTab === 'analytics' && (
              <EmptyPage
                title="Analytics"
                description="Analytics and reporting features will be implemented here"
                icon={BarChart3}
              />
            )}

            {activeTab === 'settings' && (
              <EmptyPage
                title="Settings"
                description="Settings and configuration options will be implemented here"
                icon={Settings}
              />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  )
}