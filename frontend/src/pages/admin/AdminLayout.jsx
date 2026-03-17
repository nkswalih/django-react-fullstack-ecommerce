import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '../../contexts/AuthContext'

const AdminLayout
 = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Double check if user is admin
  if (!isAdmin()) {
    toast.error("Access denied!");
    navigate("/");
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-900 bg-gradient-to-t from-gray-700 to-gray-900  font-sans">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden rounded-3xl m-4 border border-gray-200 bg-white">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
