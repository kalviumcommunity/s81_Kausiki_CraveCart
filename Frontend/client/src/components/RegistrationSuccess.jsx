import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Success Icon Header */}
          <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-12 text-center">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 translate-y-20"></div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome Aboard! 🎉
              </h1>
              <p className="text-purple-100 text-lg">
                Your kitchen registration was successful
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Alert Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Awaiting Approval</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Your application is currently being reviewed by our team. We'll verify your documents to maintain quality standards across our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">What's Next</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                      1
                    </div>
                    <div className="w-0.5 h-full bg-purple-200 mt-2"></div>
                  </div>
                  <div className="pb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Document Verification</h3>
                    <p className="text-gray-600 text-sm">Our team reviews your FSSAI license and uploaded documents</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                      2
                    </div>
                    <div className="w-0.5 h-full bg-purple-200 mt-2"></div>
                  </div>
                  <div className="pb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Location Check</h3>
                    <p className="text-gray-600 text-sm">We verify your kitchen location and service area</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Get Approved</h3>
                    <p className="text-gray-600 text-sm">Receive email confirmation and start your journey (24-48 hrs)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/kitchen-dashboard")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-md transition-all transform hover:scale-105"
              >
                View Dashboard →
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 transition-all"
              >
                ← Back Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
