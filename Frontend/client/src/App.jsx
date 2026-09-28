import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import GoogleSuccess from './components/GoogleSuccess';
import BrowseKitchens from './components/BrowseKitchens';
import KitchenDetail from './components/KitchenDetail';
import Subscriptions from './components/Subscriptions';
import MyOrders from './components/MyOrders';
import RegisterKitchen from './components/RegisterKitchen';
import KitchenDashboard from './components/KitchenDashboard';
import ChooseRole from './components/ChooseRole';
import AdminPasskeyGate from './components/AdminPasskeyGate';
import { getStoredRole, clearAuthSession } from './roleUtils';
import { apiFetch } from './api';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ManageMenu from './components/ManageMenu';
import Profile from './components/Profile';
import Offers from './components/Offers';
import SearchPage from './components/SearchPage';
import KitchenOwnerPortal from './components/KitchenOwnerPortal';

function isAuthed() {
  return Boolean(localStorage.getItem('token'));
}

function RequireAuth({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function RequireRole({ children, allowedRoles = [] }) {
  const [checking, setChecking] = useState(true);
  const [currentRole, setCurrentRole] = useState(getStoredRole());
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setChecking(false);
      return;
    }

    // Verify current role directly with backend
    apiFetch("/user/me")
      .then((res) => {
        const backendRole = res?.user?.role || "customer";
        localStorage.setItem("userRole", backendRole);
        setCurrentRole(backendRole);
        setUserEmail(res?.user?.email || "");
      })
      .catch(() => {
        clearAuthSession();
        setCurrentRole("");
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F0E6DA] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#75070C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthed()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return (
      <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 shadow-sm text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#75070C]/10 text-[#75070C] mx-auto flex items-center justify-center font-bold text-2xl mb-4">
            🔒
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#75070C]">
            Admin Access Required
          </h2>
          <p className="text-sm text-[#6E5C52] mt-2 leading-relaxed">
            {userEmail ? (
              <>
                You are currently signed in as <span className="font-semibold text-[#23120B]">{userEmail}</span> (role: <span className="font-mono text-xs bg-[#E4D5C3]/60 px-1.5 py-0.5 rounded">{currentRole}</span>).
                <br />
                This dashboard requires administrator privileges.
              </>
            ) : (
              <>Your current account does not have administrator privileges.</>
            )}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                clearAuthSession();
                navigate("/login");
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#75070C] text-[#FFFBEA] font-bold text-sm hover:bg-[#5C0509] transition shadow-sm"
            >
              Sign In with Admin Account
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-2.5 px-4 rounded-xl border border-[#E4D5C3] text-[#6E5C52] text-sm hover:bg-[#E4D5C3]/40 transition"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
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
            <Route path='/' element={<RedirectKitchenToDashboard><Home /></RedirectKitchenToDashboard>} />
            <Route path='/search' element={<RedirectKitchenToDashboard><SearchPage /></RedirectKitchenToDashboard>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/signup' element={<Signup/>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/google-success" element={<GoogleSuccess />}></Route>
            <Route path="/choose-role" element={<RequireAuth><ChooseRole /></RequireAuth>} />

            <Route path="/browse-kitchens" element={<RequireAuth><RedirectKitchenToDashboard><BrowseKitchens /></RedirectKitchenToDashboard></RequireAuth>} />
            <Route path="/kitchens/:id" element={<RequireAuth><RedirectKitchenToDashboard><KitchenDetail /></RedirectKitchenToDashboard></RequireAuth>} />
            <Route path="/subscriptions" element={<RequireAuth><RedirectKitchenToDashboard><Subscriptions /></RedirectKitchenToDashboard></RequireAuth>} />
            <Route path="/my-orders" element={<RequireAuth><RedirectKitchenToDashboard><MyOrders /></RedirectKitchenToDashboard></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/offers" element={<RequireAuth><RedirectKitchenToDashboard><Offers /></RedirectKitchenToDashboard></RequireAuth>} />
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
              path="/kitchen-owner"
              element={<KitchenOwnerPortal />}
            />
            <Route
              path="/admin-dashboard"
              element={<AdminPasskeyGate />}
            />
            <Route
              path="/admin"
              element={<AdminPasskeyGate />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
      
    </div>
  );
}

export default App;