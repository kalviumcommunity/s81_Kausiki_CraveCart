import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, getStoredRole } from "../roleUtils";

function BasketIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 10h12l-1 10H7L6 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 10 12 4l3 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2 20 6v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m9.5 12 1.7 1.7L15.8 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparklesIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2l1.1 4.1L17 7.2l-3.9 1.1L12 12l-1.1-3.7L7 7.2l3.9-1.1L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M19 12l.7 2.6L22 15.3l-2.3.7L19 18l-.7-2-2.3-.7 2.3-.7.7-2.6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M4 13l.8 3L7 16.8l-2.2.7L4 20l-.8-2.5L1 16.8l2.2-.7L4 13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16 11a4 4 0 1 0-8 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 22c1.5-4 5-6 8-6s6.5 2 8 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 8a3 3 0 1 0-2.5 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BowlIllustration({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Warm bowl illustration"
    >
      <defs>
        <linearGradient id="ccSoup" x1="70" y1="30" x2="290" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" stopOpacity="0.95" />
          <stop offset="1" stopColor="#DC2626" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="ccSteam" x1="180" y1="10" x2="180" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M120 62c-10-16 6-28 0-42"
        stroke="url(#ccSteam)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M180 58c-10-16 6-28 0-42"
        stroke="url(#ccSteam)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M240 62c-10-16 6-28 0-42"
        stroke="url(#ccSteam)"
        strokeWidth="10"
        strokeLinecap="round"
      />

      <ellipse cx="180" cy="150" rx="116" ry="48" fill="url(#ccSoup)" opacity="0.16" />
      <path
        d="M88 142c0 57 41 96 92 96h0c51 0 92-39 92-96"
        stroke="#1F2933"
        strokeOpacity="0.18"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M92 140c0 54 39 90 88 90h0c49 0 88-36 88-90"
        stroke="#FFFFFF"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M112 140c0 44 28 74 68 74h0c40 0 68-30 68-74"
        fill="url(#ccSoup)"
        opacity="0.9"
      />
      <circle cx="150" cy="168" r="9" fill="#FFF7ED" opacity="0.7" />
      <circle cx="196" cy="176" r="7" fill="#FFF7ED" opacity="0.6" />
      <circle cx="214" cy="160" r="6" fill="#FFF7ED" opacity="0.55" />
    </svg>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const isAuthed = Boolean(localStorage.getItem("token"));
  const role = getStoredRole();

  const handleLoginClick = () => navigate("/login");
  const handleBrowseKitchens = () => navigate("/browse-kitchens");
  const handleRegisterKitchen = () => navigate("/register-kitchen");

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const fadeUp = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen text-[#1F2933]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#FFF7ED]/75 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a
            href="#top"
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#F97316]/35"
            aria-label="CraveCart home"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-md shadow-black/10 ring-1 ring-black/5">
              <BasketIcon className="h-5 w-5 text-[#F97316] transition group-hover:scale-[1.05]" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-[#1F2933]">Crave</span>
              <span className="text-[#DC2626]">Cart</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            <button
              onClick={handleBrowseKitchens}
              className="text-sm font-medium text-[#1F2933]/80 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 rounded-lg px-2 py-1"
            >
              Explore Kitchens
            </button>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-[#1F2933]/80 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 rounded-lg px-2 py-1"
            >
              How It Works
            </a>
            <button
              onClick={handleRegisterKitchen}
              className="text-sm font-medium text-[#1F2933]/80 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 rounded-lg px-2 py-1"
            >
              Become a Chef
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthed ? (
              <>
                <button
                  onClick={handleBrowseKitchens}
                  className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#F97316] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#EA580C] hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
                >
                  Browse
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#DC2626] shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:bg-[#DC2626] hover:text-white hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30"
                  aria-label="Log out"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="inline-flex items-center justify-center rounded-full bg-[#F97316] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#EA580C] hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
              >
                Sign In / Join Now
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-4 md:hidden">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              onClick={handleBrowseKitchens}
              className="rounded-full bg-white px-3 py-1 text-[#1F2933]/80 shadow-sm shadow-black/5 ring-1 ring-black/5 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
            >
              Explore Kitchens
            </button>
            <a
              href="#how-it-works"
              className="rounded-full bg-white px-3 py-1 text-[#1F2933]/80 shadow-sm shadow-black/5 ring-1 ring-black/5 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
            >
              How It Works
            </a>
            <button
              onClick={handleRegisterKitchen}
              className="rounded-full bg-white px-3 py-1 text-[#1F2933]/80 shadow-sm shadow-black/5 ring-1 ring-black/5 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
            >
              Become a Chef
            </button>
            {isAuthed ? (
              <span className="ml-1 text-xs text-[#6B7280]">Logged in as {role || "user"}</span>
            ) : null}
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:pt-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <motion.div
              {...fadeUp}
              transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-[#DC2626] shadow-sm shadow-black/5 ring-1 ring-black/5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#DC2626]" aria-hidden="true" />
                  Verified Kitchens
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-[#F97316] shadow-sm shadow-black/5 ring-1 ring-black/5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#F97316]" aria-hidden="true" />
                  Freshly Prepared Daily
                </div>
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#1F2933] sm:text-5xl lg:text-6xl">
                Fresh Home-Cooked Meals, Just Around the Corner.
              </h1>

              <p className="mt-4 max-w-xl text-base text-[#6B7280] sm:text-lg">
                Meet trusted home chefs in your neighborhood. Enjoy healthy, homemade meals cooked
                fresh to order—built on community, care, and real ingredients.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={handleBrowseKitchens}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#F97316] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#EA580C] hover:-translate-y-[1px] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 sm:w-auto"
                >
                  Browse Kitchens
                </button>
                <button
                  onClick={handleRegisterKitchen}
                  className="inline-flex w-full items-center justify-center rounded-full bg-transparent px-6 py-3 text-base font-semibold text-[#F97316] shadow-sm shadow-black/5 ring-1 ring-[#F97316]/40 transition hover:bg-white hover:-translate-y-[1px] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#F97316]/40 sm:w-auto"
                >
                  Become a Home Chef
                </button>
              </div>

              {isAuthed ? (
                <p className="mt-4 text-sm text-[#6B7280]">
                  You’re signed in as <span className="font-medium text-[#1F2933]">{role || "user"}</span>.
                </p>
              ) : (
                <p className="mt-4 text-sm text-[#6B7280]">
                  Customer or chef—start in seconds.{" "}
                  <button
                    onClick={() => navigate("/signup")}
                    className="font-semibold text-[#DC2626] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[#DC2626]/25 rounded"
                  >
                    Join free
                  </button>
                  .
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#F97316]/18 via-white/40 to-[#DC2626]/14 blur-2xl" aria-hidden="true" />
              <div className="relative rounded-[1.75rem] bg-white p-6 shadow-xl shadow-black/10 ring-1 ring-black/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#DC2626]">A community-driven marketplace</p>
                    <p className="mt-3 text-xl font-semibold leading-snug text-[#1F2933]">
                      “Feels like ordering from a neighbor who really cares.”
                    </p>
                    <p className="mt-4 text-sm text-[#6B7280]">— Verified customer</p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#DC2626] text-white shadow-lg shadow-black/10">
                      <span className="text-lg font-semibold" aria-hidden="true">
                        ♥
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-[#FFF7ED] p-4 ring-1 ring-black/5">
                  <BowlIllustration className="h-48 w-full" />
                  <p className="mt-2 text-center text-xs text-[#6B7280]">
                    Light, fast illustration—no heavy photography.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="highlights" className="scroll-mt-24 mx-auto max-w-6xl px-4 pb-14 md:pb-18">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#1F2933] sm:text-3xl">Why CraveCart?</h2>
              <p className="mt-2 max-w-2xl text-[#6B7280]">
                Warm, trustworthy, and simple—built for customers and home chefs.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-3xl bg-white p-6 shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:-translate-y-[2px]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#DC2626]/15 to-[#F97316]/15 text-[#DC2626] ring-1 ring-black/5">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#1F2933]">Verified Home Kitchens</h3>
              <p className="mt-2 text-sm text-[#6B7280]">Safety-first checks and clear standards.</p>
            </div>

            <div className="group rounded-3xl bg-white p-6 shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:-translate-y-[2px]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316]/15 to-[#DC2626]/10 text-[#F97316] ring-1 ring-black/5">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#1F2933]">Freshly Cooked Meals</h3>
              <p className="mt-2 text-sm text-[#6B7280]">Cooked to order for real homemade taste.</p>
            </div>

            <div className="group rounded-3xl bg-white p-6 shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:-translate-y-[2px]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316]/12 to-[#DC2626]/12 text-[#DC2626] ring-1 ring-black/5">
                <span className="text-lg font-semibold" aria-hidden="true">₹</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#1F2933]">Affordable Pricing</h3>
              <p className="mt-2 text-sm text-[#6B7280]">Comfort food that fits everyday budgets.</p>
            </div>

            <div className="group rounded-3xl bg-white p-6 shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:-translate-y-[2px]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#DC2626]/12 to-[#F97316]/15 text-[#DC2626] ring-1 ring-black/5">
                <UsersIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#1F2933]">Community Support</h3>
              <p className="mt-2 text-sm text-[#6B7280]">Every order supports local home chefs.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-6xl px-4 pb-14 md:pb-18">
          <div className="rounded-[2rem] bg-white/70 p-6 shadow-lg shadow-black/10 ring-1 ring-black/5 backdrop-blur sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[#1F2933] sm:text-3xl">How It Works</h2>
            <p className="mt-2 max-w-2xl text-[#6B7280]">
              A friendly flow for customers—plus a clear path for chefs to start selling.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5 shadow-sm shadow-black/5">
                <p className="text-sm font-semibold text-[#DC2626]">01</p>
                <h3 className="mt-2 text-lg font-semibold text-[#1F2933]">Explore kitchens</h3>
                <p className="mt-2 text-sm text-[#6B7280]">Browse local home chefs and menus you’ll love.</p>
              </div>
              <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5 shadow-sm shadow-black/5">
                <p className="text-sm font-semibold text-[#DC2626]">02</p>
                <h3 className="mt-2 text-lg font-semibold text-[#1F2933]">Order fresh</h3>
                <p className="mt-2 text-sm text-[#6B7280]">Meals are cooked to order—freshly prepared daily.</p>
              </div>
              <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5 shadow-sm shadow-black/5">
                <p className="text-sm font-semibold text-[#DC2626]">03</p>
                <h3 className="mt-2 text-lg font-semibold text-[#1F2933]">Support community</h3>
                <p className="mt-2 text-sm text-[#6B7280]">Every order supports real local cooks and families.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-6xl px-4 pb-16">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F97316]/15 via-white to-[#DC2626]/12 p-6 shadow-xl shadow-black/10 ring-1 ring-black/5 sm:p-8">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#F97316]/20 blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#DC2626]/18 blur-2xl" aria-hidden="true" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#1F2933] sm:text-3xl">Ready for something homemade?</h2>
                <p className="mt-2 max-w-2xl text-[#6B7280]">
                  Start exploring nearby kitchens—or become a chef and share your signature dishes.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleBrowseKitchens}
                  className="inline-flex items-center justify-center rounded-full bg-[#F97316] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#EA580C] hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#F97316]/40"
                >
                  Start Exploring
                </button>
                <button
                  onClick={handleRegisterKitchen}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-[#DC2626] shadow-sm shadow-black/5 ring-1 ring-black/5 transition hover:-translate-y-[1px] hover:bg-[#FFF7ED] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/25"
                >
                  Become a Home Chef
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white/40">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-sm text-[#6B7280]">© {new Date().getFullYear()} CraveCart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;