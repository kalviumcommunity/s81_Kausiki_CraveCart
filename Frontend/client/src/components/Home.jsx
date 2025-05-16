    import React from "react";
    import { motion } from "framer-motion";
    import { useNavigate } from "react-router-dom";

    const Home = () => {
      const navigate = useNavigate();

      const handleLoginClick = () => navigate("/login");
      const handleBrowseKitchens = () => navigate("/browse-kitchens");
      const handleRegisterKitchen = () => navigate("/register-kitchen");

      return (
        <motion.div
          className="min-h-screen bg-[#F4FDFC] flex flex-col items-center justify-start px-4 pt-6 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Login Button */}
          <div className="absolute top-10 right-10">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleLoginClick}
              className="bg-[#3EB489] hover:bg-[#31997A] text-white font-semibold px-5 py-2 rounded-full shadow transition"
            >
              Login
            </motion.button>
          </div>

          {/* Header */}
          <motion.header
            className="text-center mb-10 mt-20"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#4B3F36]">
              Welcome to CraveCart
            </h1>
            <p className="mt-4 text-lg text-[#4B3F36]">
              Home-cooked meals, made with love by local chefs near you.
            </p>
          </motion.header>

          {/* Two Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
            {/* Food Lovers */}
            <motion.div
              className="bg-white shadow-md rounded-2xl p-6 text-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-2xl font-semibold text-[#3EB489] mb-4">
                For Food Lovers
              </h2>
              <p className="text-[#4B3F36] mb-4">
                Find and enjoy healthy, fresh food from trusted home kitchens nearby.
              </p>
              <motion.button
                className="bg-[#3EB489] hover:bg-[#31997A] text-white font-semibold px-6 py-2 rounded-full transition"
                onClick={handleBrowseKitchens}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                Browse Kitchens
              </motion.button>
            </motion.div>

            {/* Home Chefs */}
            <motion.div
              className="bg-white shadow-md rounded-2xl p-6 text-center"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <h2 className="text-2xl font-semibold text-[#3EB489] mb-4">
                For Home Chefs
              </h2>
              <p className="text-[#4B3F36] mb-4">
                Start your home kitchen business and share your recipes with the world.
              </p>
              <motion.button
                className="bg-[#3EB489] hover:bg-[#31997A] text-white font-semibold px-6 py-2 rounded-full transition"
                onClick={handleRegisterKitchen}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                Register Your Kitchen
              </motion.button>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer
            className="mt-16 text-[#6B5E53] text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            &copy; {new Date().getFullYear()} CraveCart. All rights reserved.
          </motion.footer>
        </motion.div>
      );
    };

    export default Home;