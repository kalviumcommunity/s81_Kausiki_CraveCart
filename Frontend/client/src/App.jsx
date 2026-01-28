import React from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import GoogleSuccess from './components/GoogleSuccess';
import BrowseKitchens from './components/BrowseKitchens';
import KitchenDetail from './components/KitchenDetail';
import Subscriptions from './components/Subscriptions';
import MyOrders from './components/MyOrders';
import RegisterKitchen from './components/RegisterKitchen';
import KitchenDashboard from './components/KitchenDashboard';
import ChooseRole from './components/ChooseRole';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import { getRedirectForRole, getStoredRole } from './roleUtils';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ManageMenu from './components/ManageMenu';

function isAuthed() {
  return Boolean(localStorage.getItem('token'));
}

function RequireAuth({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function RequireRole({ children, allowedRoles = [] }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;

  const role = getStoredRole();
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getRedirectForRole(role)} replace />;
  }

  return children;
}

function RedirectKitchenToDashboard({ children }) {
  const role = getStoredRole();
  if (role === "kitchen") {
    return <Navigate to="/kitchen-dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <div>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login/>} />
            <Route path='/signup' element={<Signup/>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/google-success" element={<GoogleSuccess />}></Route>
            <Route path="/choose-role" element={<RequireAuth><ChooseRole /></RequireAuth>} />

            <Route path="/browse-kitchens" element={<RequireAuth><BrowseKitchens /></RequireAuth>} />
            <Route path="/kitchens/:id" element={<RequireAuth><KitchenDetail /></RequireAuth>} />
            <Route path="/subscriptions" element={<RequireAuth><Subscriptions /></RequireAuth>} />
            <Route path="/my-orders" element={<RequireAuth><MyOrders /></RequireAuth>} />
            <Route
              path="/register-kitchen"
              element={
                <RequireAuth>
                  <RedirectKitchenToDashboard>
                    <RegisterKitchen />
                  </RedirectKitchenToDashboard>
                </RequireAuth>
              }
            />
            <Route
              path="/kitchen-dashboard"
              element={
                <RequireRole allowedRoles={["kitchen", "admin"]}>
                  <KitchenDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/kitchen-menu"
              element={
                <RequireRole allowedRoles={["kitchen", "admin"]}>
                  <ManageMenu />
                </RequireRole>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RequireRole>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
      
    </div>
  );
}

export default App;