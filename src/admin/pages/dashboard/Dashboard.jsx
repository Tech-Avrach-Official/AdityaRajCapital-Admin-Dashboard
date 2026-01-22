import React from "react";
import {
  Calendar,
  User,
  ClipboardList,
  Activity,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Today Appointments */}
        <div className="bg-white shadow rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Today Appointments</p>
            <h2 className="text-2xl font-bold">12</h2>
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white shadow rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Patients</p>
            <h2 className="text-2xl font-bold">248</h2>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="bg-white shadow rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <ClipboardList className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pending Appointments</p>
            <h2 className="text-2xl font-bold">36</h2>
          </div>
        </div>

        {/* Clinic Status */}
        <div className="bg-white shadow rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Activity className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Clinic Status</p>
            <h2 className="text-2xl font-bold text-green-600">
              Active
            </h2>
          </div>
        </div>
      </div>

      {/* Section Placeholder */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Pending Appointments
        </h2>

        <div className="text-gray-500 text-sm">
          Appointment list UI will appear here
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
