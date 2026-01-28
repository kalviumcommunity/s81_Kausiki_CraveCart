import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getRedirectForRole, getStoredRole } from "../roleUtils";

export default function ChooseRole() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = getStoredRole();
    if (role) {
      navigate(getRedirectForRole(role), { replace: true });
    }
  }, [navigate]);

  return (
    <div className="cc-page-lg">
      <div className="mx-auto w-full max-w-4xl">
        <motion.header
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F2933]">
            Continue as
          </h1>
          <p className="mt-3 cc-muted">
            Choose what you want to do in CraveCart.
          </p>
        </motion.header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <motion.button
            type="button"
            onClick={() => navigate("/browse-kitchens")}
            className="group cc-card p-6 text-left transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/40"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <div className="text-sm font-medium text-[#F97316]">Customer</div>
            <div className="mt-2 text-xl font-semibold text-[#1F2933]">
              Browse kitchens
            </div>
            <div className="mt-2 cc-muted">
              Order home-cooked meals from nearby chefs.
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-[#F97316] font-semibold">
              Continue
              <span className="transition group-hover:translate-x-0.5">→</span>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigate("/register-kitchen")}
            className="group cc-card p-6 text-left transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/40"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            <div className="text-sm font-medium text-[#DC2626]">Seller</div>
            <div className="mt-2 text-xl font-semibold text-[#1F2933]">
              Register and sell
            </div>
            <div className="mt-2 cc-muted">
              Register your kitchen to start selling your products.
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-[#DC2626] font-semibold">
              Continue
              <span className="transition group-hover:translate-x-0.5">→</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
