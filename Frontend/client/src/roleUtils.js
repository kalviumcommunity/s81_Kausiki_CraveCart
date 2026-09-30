const DEFAULT_ROLE = "customer";

export const getStoredToken = () => {
  return sessionStorage.getItem("token") || localStorage.getItem("token") || "";
};

export const getStoredRole = () => {
  return sessionStorage.getItem("userRole") || localStorage.getItem("userRole") || DEFAULT_ROLE;
};

export const clearAuthSession = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userRole");
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
};

export const persistAuthSession = (token, role) => {
  if (token) {
    sessionStorage.setItem("token", token);
  }
  if (role) {
    sessionStorage.setItem("userRole", role);
  } else if (!sessionStorage.getItem("userRole")) {
    sessionStorage.setItem("userRole", DEFAULT_ROLE);
  }
};

export const getRedirectForRole = (role) => {
  if (role === "admin") return "/admin-dashboard";
  if (role === "kitchen") return "/kitchen-dashboard";
  return "/";
};
