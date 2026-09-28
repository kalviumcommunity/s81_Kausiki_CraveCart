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
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-4xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="micro-label text-[#4F6815]">WELCOME TO CRAVECART</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#75070C] mt-2">
            Continue Your Culinary Journey
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5C52] mt-2 max-w-md mx-auto">
            Select whether you are joining to savor wholesome home-cooked meals or share your recipes.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <motion.button
            type="button"
            onClick={() => navigate("/browse-kitchens")}
            className="group bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 text-left transition-all duration-300 hover:border-[#75070C] hover:shadow-lg focus:outline-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <span className="micro-label bg-[#FFFBEA] text-[#75070C] px-3 py-1 rounded-full border border-[#F5EBCE]">
              EPICURE & DINER
            </span>
            <div className="font-serif text-2xl font-bold text-[#75070C] mt-4">
              Browse Home Kitchens
            </div>
            <div className="text-xs sm:text-sm text-[#6E5C52] mt-2 leading-relaxed">
              Order fresh daily meals, explore chef tasting platters, and subscribe to recurring lunch/dinner boxes.
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-[#75070C] font-bold text-xs uppercase tracking-wider">
              Enter Marketplace <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigate("/register-kitchen")}
            className="group bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 text-left transition-all duration-300 hover:border-[#4F6815] hover:shadow-lg focus:outline-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            <span className="micro-label bg-[#4F6815] text-[#FFFBEA] px-3 py-1 rounded-full">
              HOME CHEF & BAKER
            </span>
            <div className="font-serif text-2xl font-bold text-[#4F6815] mt-4">
              Register Home Kitchen
            </div>
            <div className="text-xs sm:text-sm text-[#6E5C52] mt-2 leading-relaxed">
              Set your menus, define portion availability, pre-book orders, and build your neighborhood culinary brand.
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-[#4F6815] font-bold text-xs uppercase tracking-wider">
              Start Chef Application <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
