import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
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
      aria-label="Neighborhood kitchen illustration"
    >
      <defs>
        <linearGradient id="ccWarm" x1="72" y1="44" x2="288" y2="232" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" stopOpacity="0.95" />
          <stop offset="1" stopColor="#DC2626" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Soft warm blob */}
      <path
        d="M58 178c0-48 44-86 98-86h48c54 0 98 38 98 86 0 40-30 72-70 82-38 10-82 10-122 0-40-10-70-42-70-82Z"
        fill="url(#ccWarm)"
        opacity="0.12"
      />

      {/* House */}
      <path
        d="M128 124 180 82l52 42v86c0 10-8 18-18 18h-68c-10 0-18-8-18-18v-86Z"
        fill="#FFFFFF"
        stroke="#1F2933"
        strokeOpacity="0.18"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M118 132 180 74l62 58"
        stroke="#1F2933"
        strokeOpacity="0.18"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Door */}
      <path
        d="M166 228v-46c0-8 6-14 14-14s14 6 14 14v46"
        fill="#FFF7ED"
        stroke="#1F2933"
        strokeOpacity="0.18"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="188" cy="204" r="3" fill="#DC2626" opacity="0.8" />

      {/* Chef hat */}
      <path
        d="M206 120c0-10 8-18 18-18 4 0 8 1 11 4 2-7 9-12 17-12 10 0 18 8 18 18 0 8-5 15-13 17v11c0 7-6 13-13 13h-38c-7 0-13-6-13-13v-11c-8-2-13-9-13-17Z"
        fill="#FFFFFF"
        stroke="#1F2933"
        strokeOpacity="0.18"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M212 154h56"
        stroke="#F97316"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Plate */}
      <ellipse cx="140" cy="220" rx="48" ry="14" fill="#FFFFFF" />
      <ellipse cx="140" cy="220" rx="48" ry="14" fill="#1F2933" opacity="0.08" />
      <ellipse cx="140" cy="220" rx="32" ry="9" fill="url(#ccWarm)" opacity="0.35" />
    </svg>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const profileMenuRef = useRef(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announceVisible, setAnnounceVisible] = useState(true);

  const isAuthed = Boolean(localStorage.getItem("token"));
  const role = getStoredRole();

  const avatarLetter = (() => {
    const source = String(me?.name || me?.email || "").trim();
    if (source) return source.slice(0, 1).toUpperCase();
    return "U";
  })();

  const displayName = (() => {
    const name = String(me?.name || "").trim();
    if (name) return name;
    return "Profile";
  })();

  const handleLoginClick = () => navigate("/login");
  const handleBrowseKitchens = () => navigate("/browse-kitchens");
  const handleRegisterKitchen = () => navigate("/register-kitchen");

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const handleOrders = () => {
    navigate(isAuthed ? "/my-orders" : "/login");
  };

  const handleOffers = () => {
    navigate(isAuthed ? "/offers" : "/login");
  };

  useEffect(() => {
    if (!isAuthed) {
      setMe(null);
      return;
    }

    let alive = true;

    (async () => {
      try {
        const res = await apiFetch("/user/me");
        if (!alive) return;
        setMe(res?.user || res || null);
      } catch {
        if (!alive) return;
        setMe(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isAuthed]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch("/user/announcements");
        if (!alive) return;
        setAnnouncements(res.announcements || []);
      } catch (err) {
        // ignore failures silently
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

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
            <img
              src="/icon.png"
              alt="CraveCart"
              className="h-11 w-11 rounded-2xl bg-white p-1 ring-1 ring-black/5 shadow-md shadow-black/10 object-contain"
              loading="eager"
            />
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            <a
              href="#about"
              className="text-sm font-medium text-[#1F2933]/80 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 rounded-lg px-2 py-1"
            >
              About
            </a>
            <button
              type="button"
              onClick={handleOffers}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1F2933]/80 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 rounded-lg px-2 py-1"
              aria-label="View kitchens with offers"
            >
              <img
                src="/offer.png"
                alt="Offer"
                className="h-5 w-5 object-contain mix-blend-multiply"
              />
              Offers
            </button>
            <button
              onClick={handleOrders}
              className="text-sm font-medium text-[#1F2933]/80 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 rounded-lg px-2 py-1"
            >
              Orders
            </button>
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
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#1F2933] shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:-translate-y-[1px] hover:bg-[#FFF7ED] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                    aria-haspopup="menu"
                    aria-expanded={profileMenuOpen}
                    aria-label="Open profile menu"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] to-[#DC2626] text-white">
                      {avatarLetter}
                    </span>
                    <span className="hidden max-w-[10rem] truncate sm:inline">{displayName}</span>
                    <span className="text-[#6B7280]" aria-hidden="true">▾</span>
                  </button>

                  {profileMenuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/10 ring-1 ring-black/5"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-[#1F2933] hover:bg-[#FFF7ED]"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/my-orders");
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-[#1F2933] hover:bg-[#FFF7ED]"
                      >
                        Orders
                      </button>
                      <div className="h-px bg-black/5" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-[#DC2626] hover:bg-[#FFF7ED]"
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
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
            <a
              href="#about"
              className="rounded-full bg-white px-3 py-1 text-[#1F2933]/80 shadow-sm shadow-black/5 ring-1 ring-black/5 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
            >
              About
            </a>
            <button
              type="button"
              onClick={handleOffers}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[#1F2933]/80 shadow-sm shadow-black/5 ring-1 ring-black/5 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
              aria-label="View kitchens with offers"
            >
              <img
                src="/offer.png"
                alt="Offer"
                className="h-5 w-5 object-contain mix-blend-multiply"
              />
              Offers
            </button>
            <button
              onClick={handleOrders}
              className="rounded-full bg-white px-3 py-1 text-[#1F2933]/80 shadow-sm shadow-black/5 ring-1 ring-black/5 transition hover:text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
            >
              Orders
            </button>
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

      {announceVisible && announcements && announcements.length > 0 ? (
        <div className="w-full bg-white border-b border-black/5">
          <div className="mx-auto max-w-6xl px-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-red-600">{announcements[0].body}</p>
              <button onClick={() => setAnnounceVisible(false)} className="text-sm text-red-600 font-medium">✕</button>
            </div>
          </div>
        </div>
      ) : null}

      <main id="top">
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:pt-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <motion.div
              {...fadeUp}
              transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-[#15803D] shadow-sm shadow-black/5 ring-1 ring-black/5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#15803D]" aria-hidden="true" />
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
                      “Home-style meals that taste truly homemade.”
                    </p>
                    <p className="mt-4 text-sm text-[#6B7280]">— CraveCart customer</p>
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
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 mx-auto max-w-6xl px-4 pb-14 md:pb-18">
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