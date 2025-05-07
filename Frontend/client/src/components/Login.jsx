import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      navigate("/");
    } else {
      alert("Please enter both username and password!");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#F4FDFC] flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Header */}
      <motion.header
        className="text-center mb-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-[#3EB489]">Login to CraveCart</h1>
        <p className="mt-4 text-lg text-[#4B3F36]">
          Please enter your credentials to continue.
        </p>
      </motion.header>

      {/* Login Form */}
      <motion.form
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="mb-6">
          <label htmlFor="username" className="block text-[#4B3F36] mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3EB489]"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-[#4B3F36] mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3EB489]"
            required
          />
        </div>

        <motion.button
          type="submit"
          className="w-full bg-[#3EB489] hover:bg-[#31997A] text-white font-semibold px-6 py-2 rounded-full transition"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          Login
        </motion.button>
      </motion.form>

      {/* Footer */}
      <motion.footer
        className="mt-8 text-center text-[#6B5E53] text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        Don't have an account?{" "}
        <span
          className="text-[#3EB489] hover:underline cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Register here
        </span>
      </motion.footer>
    </motion.div>
  );
};

export default Login;
