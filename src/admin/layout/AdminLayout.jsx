import React from 'react'
// import Sidebar from './components/Sidebar'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminHeader from '../components/AdminHeader'
// import AdminNav from './components/AdminNav'

const AdminLayout = () => {
  return (
     <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Right side content */}
      <div className="flex-1">
        {/* <Navbar /> */}
       <div className='sticky top-0 z-50'>
         <AdminHeader/>
       </div>
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  )
}

export default AdminLayout