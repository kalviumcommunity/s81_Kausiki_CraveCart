const DEFAULT_ROLE = "customer";

export const getStoredRole = () => localStorage.getItem("userRole") || DEFAULT_ROLE;

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
};

export const persistAuthSession = (token, role) => {
  if (token) {
    localStorage.setItem("token", token);
  }
  if (role) {
    localStorage.setItem("userRole", role);
  } else if (!localStorage.getItem("userRole")) {
    localStorage.setItem("userRole", DEFAULT_ROLE);
  }
};

export const getRedirectForRole = (role) => {
  if (role === "admin") return "/admin-dashboard";
  if (role === "kitchen") return "/kitchen-dashboard";
  return "/";
};
