import { Bell, ChevronDown, Search } from 'lucide-react'
import React from 'react'
// import logo from '@/assets/logo-red.png'

const AdminHeader = () => {
  return (
     <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
            >
              <Menu className="w-5 h-5" />
            </button> */}

            <div className="flex items-center gap-4 flex-1">
              {/* <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}

              {/* <img src={logo} alt="logo" className=" h-10" /> */}
              <h1 className="text-2xl font-bold text-black">Admin Panel</h1>
            </div>

            <div className="flex items-center gap-4">
             

              <div className="flex items-center gap-3 pl-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  D
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Dr Mandloi</p>
                  <a 
  href="https://mail.google.com/mail/?view=cm&fs=1&to=Service@doctorsaab.com" 
  target="_blank" 
  rel="noopener noreferrer"
  className="text-sm text-gray-600 hover:underline"
>
  Service@doctorsaab.com
</a>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>
  )
}

export default AdminHeader