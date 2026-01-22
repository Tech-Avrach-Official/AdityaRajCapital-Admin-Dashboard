import { Route, Router, Routes } from "react-router-dom";
// import Home from "../pages/home/Home";
import AdminLayout from "../admin/layout/AdminLayout";
// import HomePage from "../pages/home/components/HomePage";
import Dashboard from "../admin/pages/Dashboard/Dashboard";
import Home from "@/pages/Home/Home";

const AllRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
    
        {/* <Route path="products/edit/:id" element={<EditProduct />} /> */}

      <Route path="/" element={<Home />} />

      <Route
        path="/admin"
        element={
            <AdminLayout />
          // <ProtectedAdminRoute>
          // </ProtectedAdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        {/* <Route path="/admin/users" element={<HomePage />} /> */}
      

        
        {/* <Route path="products/edit/:id" element={<EditProduct />} /> */}
      </Route>

      {/* <Route
        path="/clinic"
        element={
          <ProtectedClinicRoute>
            <ClinicLayout />
          </ProtectedClinicRoute>
        }
      >
        <Route index element={<ClinicDashboard />} />
        <Route path="/clinic/users" element={<HomePage />} />
       
        <Route path="/clinic/profile" element={<HomePage />} />
        <Route path="/clinic/profile/:id" element={<ClinicProfile />} />

        <Route path="/clinic/off-days" element={<ClinicOffDaysPage />} />
        <Route path="/clinic/weekly-off" element={<WeeklyOffPage />} />
        <Route path="/clinic/accepted-appointments" element={<AcceptedAppointments />} />
        <Route path="/clinic/completed-appointments" element={<CompletedClinicBookings />} />

      </Route> */}

    </Routes>
  );
};

export default AllRoutes;
