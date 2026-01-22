import React, { useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  Menu,
  Package,
  Tag,
  X,
  ShoppingCartIcon,
  Contact,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      id: "contactList",
      name: "Contact List",
      icon: Contact,
      path: "/admin/contact-list",
    },
    {
      id: "assignedAppointments",
      name: "Assigned Appointments",
      icon: ShoppingCartIcon,
      path: "/admin/assigned-appointments",
    },
    {
      id: "completedAppointments",
      name: "Completed Appointments",
      icon: Tag,
      path: "/admin/completed-appointments",
    },
    {
      id: "clinic",
      name: "Clinics",
      icon: Package,
      subItems: [
        {
          id: "allClinics",
          name: "Manage Clinics",
          path: "/admin/all-clinics",
        },
        {
          id: "createClinic",
          name: "Create Clinic",
          path: "/admin/create-clinic",
        },
      ],
    },
  ];

  const toggleSubMenu = (id) => {
    if (!sidebarOpen) setSidebarOpen(true);
    setOpenSubMenu(openSubMenu === id ? null : id);
  };

  return (
    <div
      className={`bg-gray-900 text-white sticky top-0 h-screen flex flex-col transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1
          className={`font-bold text-xl transition-all ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          ADMIN
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleSubMenu(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 ${
                    openSubMenu === item.id ? "bg-gray-800" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </div>
                  {sidebarOpen && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        openSubMenu === item.id ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {openSubMenu === item.id && sidebarOpen && (
                  <div className="bg-gray-800">
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.id}
                        to={sub.path}
                        className={({ isActive }) =>
                          `block px-4 py-2 ml-6 pl-7 border-l-2 text-sm transition-colors
                          ${
                            isActive
                              ? "bg-gray-700 text-white border-blue-500"
                              : "text-gray-300 border-gray-600 hover:bg-gray-700"
                          }`
                        }
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 hover:bg-gray-800 transition-all
                  ${
                    isActive
                      ? "bg-gray-800 border-l-4 border-blue-500"
                      : ""
                  }`
                }
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Logout UI Only */}
      <div className="border-t border-gray-800 p-4">
        <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-800 rounded-lg">
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
