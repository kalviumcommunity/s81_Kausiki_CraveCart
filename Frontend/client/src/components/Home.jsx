import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiFetch, resolveUploadUrl } from "../api";
import { clearAuthSession, getStoredRole } from "../roleUtils";

// Categories data with editorial styling
const CATEGORIES_DATA = [
  {
    id: "pizza",
    code: "WOODFIRED",
    name: "Pizza",
    desc: "Neapolitan & Sourdough",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "breakfast",
    code: "MORNING",
    name: "Hearth & Bakery",
    desc: "Wild Sourdough & Viennoiserie",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "burgers",
    code: "DAY-TO-MID",
    name: "Burgers",
    desc: "Dry-Aged & Brioche Buns",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "asian",
    code: "WOKS & FLOCK",
    name: "Asian",
    desc: "Hand-Pulled Noodles & Dim Sum",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "healthy",
    code: "ROOTS & HARVEST",
    name: "Greens",
    desc: "Organic Macro Bowls & Crudos",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "desserts",
    code: "PÂTISSERIE",
    name: "Desserts",
    desc: "Single-Origin & Galettes",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "drinks",
    code: "CELLAR",
    name: "Wine & Pantry",
    desc: "Cold-Pressed & Ferments",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "indian",
    code: "SLOW SPICED",
    name: "Indian",
    desc: "Awadhi Dum & Clay Oven",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
  },
];

// Featured Kitchens / Restaurants
const FEATURED_RESTAURANTS = [
  {
    id: "rest-1",
    name: "L'Atelier Sourdough & Pâtisserie",
    cuisine: "Modern French & Hearth",
    reviews: "320+ reviews",
    rating: 4.9,
    wait: "20 mins wait",
    priceForOne: "₹280 for one",
    isPromoted: true,
    discountBadge: "20% OFF UP TO ₹120",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80",
    tag: "Wood-Fired Hearth",
    signatureDish: "Poached Heritage Egg Country Toast",
  },
  {
    id: "rest-2",
    name: "The Green Table",
    cuisine: "Slow-cooked Hearth & Organic",
    reviews: "210+ reviews",
    rating: 4.8,
    wait: "25 mins wait",
    priceForOne: "₹240 for one",
    isPromoted: false,
    discountBadge: "25% OFF ORDERS ₹300+",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80",
    tag: "Farm to Fork",
    signatureDish: "Smoked Burrata & Heirloom Salad",
  },
  {
    id: "rest-3",
    name: "Sakura Botanicals & Hokuto",
    cuisine: "Day-boat Sashimi & Robata",
    reviews: "450+ reviews",
    rating: 4.9,
    wait: "28 mins wait",
    priceForOne: "₹350 for one",
    isPromoted: true,
    discountBadge: "FLAT ₹100 OFF FIRST ORDER",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=80",
    tag: "Artisanal Broths",
    signatureDish: "Tiger Prawn & Egg Shoyu Ramen",
  },
  {
    id: "rest-4",
    name: "The Copper Pot Brasserie",
    cuisine: "Heritage Confit & Stews",
    reviews: "290+ reviews",
    rating: 4.7,
    wait: "22 mins wait",
    priceForOne: "₹260 for one",
    isPromoted: false,
    discountBadge: "15% OFF SPECIALTY",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80",
    tag: "Slow Braised",
    signatureDish: "Slow Simmered Beef Pot Roast",
  },
];

// Recommended / Neighborhood spotlight kitchens
const RECOMMENDED_KITCHENS = [
  {
    id: "rec-1",
    name: "Little Fri Artisanal Bakery",
    specialty: "Wild Ferment Breads & Morning Buns",
    area: "Mayfair Central",
    rating: 4.9,
    orders: "1.2k orders",
    time: "15-20 min",
    badge: "Master Baker",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rec-2",
    name: "Kyoto Hearth & Dumpling",
    specialty: "Gyoza & Steamed Bao Baskets",
    area: "Soho East",
    rating: 4.8,
    orders: "940 orders",
    time: "25-30 min",
    badge: "Verified Chef",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "rec-3",
    name: "Botanica Garden Bistro",
    specialty: "Seasonal Greens & Cold-Pressed Juices",
    area: "Kensington Gate",
    rating: 4.9,
    orders: "810 orders",
    time: "20-25 min",
    badge: "100% Organic",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const profileMenuRef = useRef(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announceVisible, setAnnounceVisible] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeDishTab, setActiveDishTab] = useState("all");

  // Selected Restaurant State (Single active selection with highlight)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("rest-1");

  // Live Kitchens, Real Dishes & Favorites from Backend
  const [kitchens, setKitchens] = useState([]);
  const [realDishes, setRealDishes] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Slide-over Cart State
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState("");

  const isAuthed = Boolean(localStorage.getItem("token"));
  const role = getStoredRole();

  // If user is a kitchen owner, redirect immediately to their Kitchen Owner Portal
  useEffect(() => {
    if (isAuthed && role === "kitchen") {
      navigate("/kitchen-dashboard", { replace: true });
    }
  }, [isAuthed, role, navigate]);

  // Load User & Announcements
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
      } catch {
        // ignore silently
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Fetch verified kitchens & favorites from API
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const k = await apiFetch("/api/kitchens");
        if (!alive) return;
        setKitchens(k.kitchens || []);

        try {
          const d = await apiFetch("/api/kitchens/explore/dishes");
          if (!alive) return;
          setRealDishes(d.dishes || []);
        } catch {
          // ignore
        }

        if (isAuthed) {
          try {
            const f = await apiFetch("/api/favorites/my");
            if (!alive) return;
            setFavorites(f.favorites || []);
          } catch {
            // ignore
          }
        }
      } catch {
        // fallback to default
      }
    })();

    return () => {
      alive = false;
    };
  }, [isAuthed]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const onMouseDown = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setProfileMenuOpen(false);
        setCartOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const favoriteIds = useMemo(() => {
    return new Set((favorites || []).map((k) => String(k._id)));
  }, [favorites]);

  const toggleFavorite = async (kitchenId) => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    try {
      const res = await apiFetch(`/api/favorites/${kitchenId}/toggle`, { method: "POST" });
      setFavorites(res.favorites || []);
    } catch {
      // ignore
    }
  };

  // Cart calculations
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty, 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [cartItems]);

  const deliveryFee = cartItems.length > 0 ? (cartSubtotal > 500 || appliedPromo === "FREEDEL" ? 0 : 35) : 0;
  
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo === "BUTTER15") return Math.round(cartSubtotal * 0.15);
    if (appliedPromo === "CHERRY20") return Math.round(cartSubtotal * 0.20);
    if (appliedPromo === "FIRSTBITE" || appliedPromo === "CRAVE150") return Math.min(150, cartSubtotal);
    return 0;
  }, [appliedPromo, cartSubtotal]);

  const cartTotal = Math.max(0, cartSubtotal + deliveryFee - discountAmount);

  const addToCart = (dish) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === dish.id);
      if (exists) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: dish.id,
          name: dish.name,
          chef: dish.chef || dish.name,
          price: dish.rawPrice || 240,
          qty: 1,
          image: dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80",
        },
      ];
    });
    setCartOpen(true);
  };

  const updateCartQty = (id, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleApplyPromo = (code) => {
    const formatted = String(code || "").trim().toUpperCase();
    if (["BUTTER15", "CHERRY20", "FREEDEL", "FIRSTBITE", "CRAVE150"].includes(formatted)) {
      setAppliedPromo(formatted);
      setCouponCode(formatted);
      setCartOpen(true);
    } else {
      alert("Invalid coupon code. Try BUTTER15, FREEDEL, or FIRSTBITE");
    }
  };

  const handleCheckout = () => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    setOrderSuccessMsg("Order pre-booked successfully! Preparing your artisanal dining.");
    setTimeout(() => {
      setCartItems([]);
      setAppliedPromo(null);
      setCouponCode("");
      setOrderSuccessMsg("");
      setCartOpen(false);
      navigate("/my-orders");
    }, 1800);
  };

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
  const handleOrders = () => navigate(isAuthed ? "/my-orders" : "/login");
  const handleOffers = () => navigate(isAuthed ? "/offers" : "/login");
  const handleSubscriptions = () => navigate(isAuthed ? "/subscriptions" : "/login");

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  // Selected Restaurant Reference
  const currentSelectedRestaurant = useMemo(() => {
    return FEATURED_RESTAURANTS.find((r) => r.id === selectedRestaurantId) || FEATURED_RESTAURANTS[0];
  }, [selectedRestaurantId]);

  // Real dishes available from verified kitchens
  const allAvailableDishes = useMemo(() => {
    return (realDishes || []).map((m) => {
      const portionsLeft = Math.max(0, (m.totalQty || 0) - (m.soldQty || 0));
      return {
        id: m._id,
        _id: m._id,
        kitchenId: m.kitchenId?._id || m.kitchenId,
        name: m.title,
        chef: m.kitchenId?.name || "Artisanal Home Kitchen",
        cuisine: `${m.mealType ? m.mealType.charAt(0).toUpperCase() + m.mealType.slice(1) : "Breakfast"} • Home-Cooked`,
        mealType: m.mealType || "breakfast",
        rating: Number((m.kitchenId?.avgRating || 4.9).toFixed(1)),
        reviews: m.kitchenId?.ratingCount || 15,
        time: "20 min",
        price: `₹${m.price}`,
        rawPrice: m.price,
        tag: portionsLeft > 0 ? `${portionsLeft} left` : "Fresh Prep",
        isVeg: true,
        image: resolveUploadUrl(m.imageUrl) || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
        description: m.description || `Fresh artisanal ${m.mealType || "meal"} prepared by ${m.kitchenId?.name || "home chef"}.`,
        isReal: true,
      };
    });
  }, [realDishes]);

  // Filtered popular dishes
  const filteredDishes = useMemo(() => {
    let list = allAvailableDishes;

    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase();
      list = list.filter(
        (dish) =>
          (dish.mealType && dish.mealType.toLowerCase() === cat) ||
          dish.cuisine.toLowerCase().includes(cat) ||
          dish.name.toLowerCase().includes(cat)
      );
    }

    if (activeDishTab === "veg") {
      list = list.filter((d) => d.isVeg);
    } else if (activeDishTab === "top") {
      list = list.filter((d) => d.rating >= 4.8);
    } else if (activeDishTab === "fast") {
      list = list.filter((d) => parseInt(d.time) <= 25);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.chef.toLowerCase().includes(q) ||
          d.cuisine.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allAvailableDishes, selectedCategory, activeDishTab, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const el = document.getElementById("popular-dishes");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F0E6DA] text-[#23120B] font-sans antialiased selection:bg-[#FFEDAB] selection:text-[#75070C]">
      
      {/* Announcement Bar */}
      {announceVisible && announcements && announcements.length > 0 ? (
        <div className="w-full bg-[#75070C] text-[#FFFBEA] px-4 py-2 border-b border-[#5E0509]">
          <div className="mx-auto max-w-7xl flex items-center justify-between text-xs sm:text-sm font-medium">
            <span className="tracking-wide">✦ {announcements[0].body}</span>
            <button
              onClick={() => setAnnounceVisible(false)}
              className="ml-4 hover:opacity-75 transition"
              aria-label="Dismiss announcement"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      {/* Editorial Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#F0E6DA]/95 backdrop-blur-md border-b border-[#E4D5C3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <a href="#top" className="flex items-center gap-3 group focus:outline-none">
                <div className="h-10 w-10 rounded-xl bg-[#75070C] text-[#FFFBEA] flex items-center justify-center font-serif text-2xl font-bold shadow-xs group-hover:scale-105 transition-transform duration-200">
                  C
                </div>
                <div>
                  <span className="font-serif text-2xl font-extrabold tracking-tight text-[#75070C] block leading-none">
                    CraveCart
                  </span>
                  <span className="micro-label text-[#4F6815] block mt-0.5 tracking-widest text-[9px]">
                    EPISODE & KITCHENS
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
              <button
                onClick={handleBrowseKitchens}
                className="text-sm font-semibold text-[#23120B] hover:text-[#75070C] transition py-1 focus:outline-none"
              >
                Kitchens
              </button>
              <a
                href="#categories"
                className="text-sm font-semibold text-[#23120B] hover:text-[#75070C] transition py-1 focus:outline-none"
              >
                Browse Menu
              </a>
              <a
                href="#featured-restaurants"
                className="text-sm font-semibold text-[#23120B] hover:text-[#75070C] transition py-1 focus:outline-none"
              >
                Editions
              </a>
              <button
                onClick={handleOffers}
                className="text-sm font-semibold text-[#23120B] hover:text-[#75070C] transition py-1 focus:outline-none"
              >
                Offers
              </button>
              <button
                onClick={handleSubscriptions}
                className="text-sm font-semibold text-[#23120B] hover:text-[#75070C] transition py-1 focus:outline-none"
              >
                Subscriptions
              </button>

              {/* Delivery location chip */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#E4D5C3] text-xs text-[#23120B]">
                <span className="text-[#4F6815]">📍</span>
                <span className="font-medium">Mayfair, W1</span>
                <span className="text-[#6E5C52]">· 25m</span>
              </div>

              {/* Auth / Profile */}
              {isAuthed ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((v) => !v)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#23120B] hover:text-[#75070C] transition py-1 focus:outline-none"
                  >
                    <div className="h-7 w-7 rounded-full bg-[#75070C] text-[#FFFBEA] flex items-center justify-center font-bold text-xs">
                      {avatarLetter}
                    </div>
                    <span className="max-w-[100px] truncate">{displayName}</span>
                    <span className="text-xs opacity-60">▾</span>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#FAF6F0] border border-[#E4D5C3] shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#E4D5C3]">
                        <p className="text-xs font-bold text-[#75070C]">{displayName}</p>
                        <p className="micro-label text-[#4F6815] mt-0.5">{role || "Customer"}</p>
                      </div>
                      <button
                        onClick={() => { setProfileMenuOpen(false); navigate("/profile"); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#23120B] hover:bg-[#FFFBEA]"
                      >
                        Profile Account
                      </button>
                      <button
                        onClick={() => { setProfileMenuOpen(false); navigate("/my-orders"); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#23120B] hover:bg-[#FFFBEA]"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() => { setProfileMenuOpen(false); navigate("/subscriptions"); }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#23120B] hover:bg-[#FFFBEA]"
                      >
                        Subscriptions
                      </button>
                      {role === "kitchen" && (
                        <button
                          onClick={() => { setProfileMenuOpen(false); navigate("/kitchen-dashboard"); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-[#4F6815] hover:bg-[#FFFBEA]"
                        >
                          Chef Kitchen Console
                        </button>
                      )}
                      {role === "admin" && (
                        <button
                          onClick={() => { setProfileMenuOpen(false); navigate("/admin-dashboard"); }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-[#75070C] hover:bg-[#FFFBEA]"
                        >
                          Admin Console
                        </button>
                      )}
                      <div className="h-px bg-[#E4D5C3] my-1" />
                      <button
                        onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-[#75070C] hover:bg-[#75070C]/10"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="text-sm font-semibold text-[#23120B] hover:text-[#75070C] transition py-1 focus:outline-none"
                >
                  Sign In
                </button>
              )}

              {/* Editorial Cart Button */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] px-4 py-2 rounded-xl font-semibold text-xs transition duration-200 shadow-xs"
                aria-label="Open Cart"
              >
                <span>Store</span>
                <span>•</span>
                <span>₹{cartTotal}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded bg-[#FFFBEA]/20 text-[10px]">
                  {totalCartCount}
                </span>
              </button>
            </nav>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="h-9 px-3 rounded-xl bg-[#75070C] text-[#FFFBEA] font-semibold text-xs flex items-center gap-1.5"
              >
                <span>Cart</span>
                <span className="h-5 w-5 rounded-full bg-[#FFFBEA] text-[#75070C] flex items-center justify-center font-bold text-[10px]">
                  {totalCartCount}
                </span>
              </button>

              {isAuthed ? (
                <button
                  onClick={() => navigate("/profile")}
                  className="h-9 w-9 rounded-xl bg-[#FAF6F0] border border-[#E4D5C3] text-[#75070C] flex items-center justify-center font-bold text-xs"
                >
                  {avatarLetter}
                </button>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="cc-btn-primary text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Sign In
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile secondary quick tabs */}
        <div className="lg:hidden border-t border-[#E4D5C3] px-4 py-2 overflow-x-auto flex items-center gap-2">
          <button
            onClick={handleBrowseKitchens}
            className="whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold bg-[#FAF6F0] border border-[#E4D5C3]"
          >
            Kitchens
          </button>
          <a
            href="#categories"
            className="whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold bg-[#FAF6F0] border border-[#E4D5C3]"
          >
            Categories
          </a>
          <button
            onClick={handleOffers}
            className="whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold bg-[#FAF6F0] border border-[#E4D5C3]"
          >
            Offers
          </button>
          <button
            onClick={handleOrders}
            className="whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold bg-[#FAF6F0] border border-[#E4D5C3]"
          >
            Orders
          </button>
        </div>
      </header>

      <main id="top">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Editorial Food Delivery Layout */}
        {/* ========================================================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Search / Discovery Bar */}
            <motion.div
              className="lg:col-span-7 flex flex-col justify-center"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <span className="micro-label text-[#4F6815]">
                  ISSUE N°14 • AUTUMN TASTING
                </span>
              </div>

              <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#75070C] tracking-tight leading-[1.06]">
                Good food.<br />
                <span className="italic font-normal text-[#23120B]">No overthinking.</span>
              </h1>

              <p className="mt-4 max-w-xl text-base sm:text-lg text-[#23120B]/85 font-normal leading-relaxed">
                Local kitchens, woodfired sourdough, and neighborhood regulars — delivered warm to your dining table.
              </p>

              {/* Integrated Search / Discovery Bar */}
              <form onSubmit={handleSearchSubmit} className="mt-7 max-w-xl">
                <div className="flex items-center bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-1.5 shadow-xs focus-within:border-[#75070C] focus-within:ring-2 focus-within:ring-[#75070C]/20 transition-all duration-200">
                  <div className="pl-3 pr-2 text-[#6E5C52]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search dishes, bakes, kitchens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm text-[#23120B] placeholder-[#6E5C52]/70 focus:outline-none focus:ring-0 px-2 py-2"
                  />
                  <button
                    type="submit"
                    className="bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-xs font-semibold px-5 py-3 rounded-xl transition duration-200 whitespace-nowrap shadow-xs"
                  >
                    Order tonight →
                  </button>
                </div>
              </form>

              {/* Sub-bar / Trust Signals */}
              <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#6E5C52]">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4F6815]" />
                  Mayfair & Soho Delivery
                </span>
                <span>•</span>
                <span>Average 24 mins</span>
                <span>•</span>
                <span>Free delivery over ₹199</span>
              </div>
            </motion.div>

            {/* Right Column: Hero Food Photography Showcase */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {allAvailableDishes.length > 0 ? (
                <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-4 shadow-sm relative overflow-hidden group">
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-[#E4D5C3]">
                    <img
                      src={allAvailableDishes[0].image}
                      alt={allAvailableDishes[0].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="micro-label bg-[#FAF6F0]/90 backdrop-blur-sm text-[#75070C] px-2.5 py-1 rounded-xl border border-[#E4D5C3] shadow-xs">
                        TODAY'S SPECIAL
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 pb-2 px-2 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#75070C]">
                        {allAvailableDishes[0].name}
                      </h3>
                      <p className="text-xs text-[#6E5C52] mt-1 leading-relaxed">
                        by {allAvailableDishes[0].chef} • {allAvailableDishes[0].cuisine}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(allAvailableDishes[0])}
                      className="bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
                    >
                      Add {allAvailableDishes[0].price}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[300px]">
                  <span className="text-5xl mb-4">🍳</span>
                  <span className="micro-label text-[#4F6815] mb-1">FRESH ARTISANAL COOKING</span>
                  <h3 className="font-serif text-2xl font-bold text-[#75070C]">Authentic Home Kitchens</h3>
                  <p className="text-xs text-[#6E5C52] mt-2 max-w-sm leading-relaxed">
                    Explore daily rotational menus handcrafted with heritage recipes by home chefs near you.
                  </p>
                  <button
                    onClick={handleBrowseKitchens}
                    className="mt-5 bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs"
                  >
                    Explore Kitchens →
                  </button>
                </div>
              )}
            </motion.div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. FOOD CATEGORIES: "Your usual? Or something new?" */}
        {/* ========================================================================= */}
        <section id="categories" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E4D5C3]">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#75070C]">
                Your usual? Or something new?
              </h2>
            </div>
            <button
              onClick={handleBrowseKitchens}
              className="text-xs font-semibold text-[#4F6815] hover:text-[#75070C] transition"
            >
              Filter kitchens →
            </button>
          </div>

          {/* Horizontal Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {CATEGORIES_DATA.slice(0, 7).map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? "all" : cat.id)}
                  className={`text-left rounded-2xl p-3.5 border transition-all duration-200 flex flex-col justify-between h-28 focus:outline-none ${
                    isSelected
                      ? "border-2 border-[#4F6815] bg-[#FFFBEA] shadow-sm"
                      : "border-[#E4D5C3] bg-[#FAF6F0] hover:border-[#4F6815]/50 hover:-translate-y-0.5 shadow-xs"
                  }`}
                >
                  <div>
                    <span className="micro-label block text-[8px] tracking-wider text-[#6E5C52]">
                      {cat.code}
                    </span>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#23120B] mt-0.5 truncate">
                      {cat.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#E4D5C3]/40">
                    <span className="text-[10px] text-[#4F6815] font-medium">Explore</span>
                    <span className="text-xs text-[#75070C]">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. FEATURED RESTAURANTS: "Worth ordering tonight." with Selection State */}
        {/* ========================================================================= */}
        <section id="featured-restaurants" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-3">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#75070C]">
                Worth ordering tonight.
              </h2>
              <p className="text-xs sm:text-sm text-[#6E5C52] mt-1">
                Select a kitchen to set your active basket and explore freshly baked or fried dishes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E4D5C3] text-[#4F6815] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#4F6815]" />
                {kitchens.length > 0 ? `${kitchens.length} kitchens active` : "16 kitchens active"}
              </span>
              <button
                onClick={handleBrowseKitchens}
                className="text-xs font-semibold text-[#75070C] hover:underline"
              >
                View all 24 →
              </button>
            </div>
          </div>

          {/* Selected Restaurant Banner (Active Order Bar) */}
          <div className="mb-6 bg-[#FFFBEA] border border-[#F5EBCE] rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-5 w-5 rounded-full bg-[#4F6815] text-[#FFFBEA] flex items-center justify-center font-bold text-[10px]">
                ✓
              </span>
              <span className="text-[#23120B]">
                Selected for order: <strong className="text-[#75070C]">{currentSelectedRestaurant.name}</strong> • Menu ready to browse
              </span>
            </div>
            <span className="micro-label text-[#4F6815] text-[9px] tracking-wider">
              SINGLE-KITCHEN ORDER MODE
            </span>
          </div>

          {/* Restaurant Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_RESTAURANTS.map((restaurant) => {
              const isSelected = selectedRestaurantId === restaurant.id;
              return (
                <div
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurantId(restaurant.id)}
                  className={`group rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-200 ease-out ${
                    isSelected
                      ? "border-2 border-[#4F6815] -translate-y-1 shadow-[0_10px_24px_-4px_rgba(79,104,21,0.22)] bg-[#FAF6F0]"
                      : "border border-[#E4D5C3] hover:border-[#4F6815]/50 hover:-translate-y-0.5 shadow-sm bg-[#FAF6F0]"
                  }`}
                >
                  <div>
                    {/* Large Food / Restaurant Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-[#E4D5C3]">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Promoted Badge */}
                      {restaurant.isPromoted && (
                        <div className="absolute top-3 left-3">
                          <span className="micro-label bg-[#23120B]/80 backdrop-blur-sm text-[#FFFBEA] text-[9px] px-2 py-0.5 rounded-lg">
                            PROMOTED
                          </span>
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(restaurant.id);
                        }}
                        className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-xs shadow-sm hover:scale-110 transition"
                        title="Save to favorites"
                      >
                        {favoriteIds.has(String(restaurant.id)) ? "❤️" : "🤍"}
                      </button>

                      {/* Discount Badge across bottom of image */}
                      {restaurant.discountBadge && (
                        <div className="absolute bottom-2.5 left-2.5 bg-[#FFFBEA]/95 backdrop-blur-sm border border-[#F5EBCE] px-2.5 py-0.5 rounded-lg shadow-xs">
                          <span className="micro-label text-[#75070C] text-[9px]">
                            {restaurant.discountBadge}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-base font-bold text-[#23120B] group-hover:text-[#75070C] transition leading-snug">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-[#4F6815] text-[#FFFBEA] px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0">
                          ★ {restaurant.rating}
                        </div>
                      </div>

                      <p className="text-xs text-[#6E5C52] mt-1 truncate">
                        {restaurant.cuisine} • {restaurant.reviews}
                      </p>

                      <div className="flex items-center justify-between text-xs text-[#6E5C52] mt-3 pt-2.5 border-t border-[#E4D5C3]/60">
                        <span>⏱ {restaurant.wait}</span>
                        <span className="font-medium text-[#23120B]">{restaurant.priceForOne}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected / Action Indicator Footer */}
                  <div className="px-4 pb-4 pt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <span className="micro-label text-[#4F6815] flex items-center gap-1 text-[9px]">
                          <span className="h-2 w-2 rounded-full bg-[#4F6815]" />
                          ACTIVE SELECTION
                        </span>
                      ) : (
                        <span className="micro-label text-[#6E5C52] text-[9px]">
                          CLICK TO CHOOSE
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/browse-kitchens");
                      }}
                      className="bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                    >
                      View Menu →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. POPULAR DISHES: Food-Focused Discovery & Instant Ordering */}
        {/* ========================================================================= */}
        <section id="popular-dishes" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="micro-label text-[#4F6815]">CHEF'S SIGNATURE CREATIONS</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#75070C] mt-1">
                Popular Dishes
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Dishes" },
                { id: "top", label: "Top Rated (4.9★)" },
                { id: "veg", label: "Pure Veg 🌱" },
                { id: "fast", label: "Under 20 mins ⏱" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDishTab(tab.id)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition ${
                    activeDishTab === tab.id
                      ? "bg-[#75070C] text-[#FFFBEA] shadow-xs"
                      : "bg-[#FAF6F0] text-[#23120B] border border-[#E4D5C3] hover:border-[#75070C]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Grid */}
          {filteredDishes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#E4D5C3] bg-[#FAF6F0]/80 p-10 sm:p-14 text-center">
              <span className="text-4xl">🍲</span>
              <h3 className="font-serif text-xl font-bold text-[#75070C] mt-3">
                No active dishes found for this filter
              </h3>
              <p className="text-xs text-[#6E5C52] mt-1.5 max-w-md mx-auto leading-relaxed">
                Dishes appear here in real-time as verified home kitchens publish their daily menu preparations.
              </p>
              <button
                onClick={handleBrowseKitchens}
                className="mt-5 inline-block bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs"
              >
                Browse Kitchens & Menus →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="group rounded-2xl bg-[#FAF6F0] border border-[#E4D5C3] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
                >
                  <div>
                    {/* Dish Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-[#E4D5C3]">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="micro-label bg-[#FAF6F0]/95 backdrop-blur-sm text-[#75070C] px-2 py-0.5 rounded-lg border border-[#E4D5C3] text-[9px]">
                          {dish.tag}
                        </span>
                        {dish.isVeg ? (
                          <span className="micro-label bg-[#4F6815] text-[#FFFBEA] px-2 py-0.5 rounded-lg text-[9px]">
                            VEG 🌱
                          </span>
                        ) : (
                          <span className="micro-label bg-[#75070C] text-[#FFFBEA] px-2 py-0.5 rounded-lg text-[9px]">
                            NON-VEG
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 bg-[#23120B]/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-lg">
                        ⏱ {dish.time}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center justify-between text-xs text-[#6E5C52]">
                        <span className="micro-label text-[#4F6815]">{dish.cuisine}</span>
                        <span className="font-semibold text-[#75070C] flex items-center gap-1">
                          ★ {dish.rating} <span className="text-[#6E5C52] font-normal">({dish.reviews})</span>
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#23120B] mt-1 group-hover:text-[#75070C] transition leading-snug">
                        {dish.name}
                      </h3>
                      <p className="text-xs text-[#6E5C52] mt-0.5">by <span className="font-semibold text-[#23120B]">{dish.chef}</span></p>
                      <p className="text-xs text-[#6E5C52]/90 mt-2 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-4 pb-4 pt-2 border-t border-[#E4D5C3]/60 flex items-center justify-between">
                    <span className="font-serif text-base font-extrabold text-[#75070C]">
                      {dish.price}
                    </span>
                    <button
                      onClick={() => addToCart(dish)}
                      className="bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-xs font-bold py-2 px-4 rounded-xl transition shadow-xs"
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. OFFERS & DEALS: "A little more delicious." */}
        {/* ========================================================================= */}
        <section id="offers" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-3xl p-6 sm:p-10 shadow-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-[#E4D5C3] pb-4">
              <div>
                <span className="micro-label text-[#4F6815]">SPECIAL PROMOTIONS & VOUCHERS</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#75070C] mt-1">
                  A little more delicious.
                </h2>
                <p className="text-xs text-[#6E5C52] mt-1">
                  Apply promo code at checkout or directly to your bag.
                </p>
              </div>
              <span className="micro-label text-[#75070C] text-[10px]">
                WEEK 42 • PER KS
              </span>
            </div>

            {/* Promo Vouchers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Offer 1: Evening Tasting */}
              <div className="rounded-2xl bg-white border border-[#E4D5C3] p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="micro-label text-[#6E5C52] text-[9px]">EVENING TASTING</span>
                  <h3 className="font-serif text-2xl font-extrabold text-[#75070C] mt-1">
                    20% off
                  </h3>
                  <p className="text-xs text-[#6E5C52] mt-2 leading-relaxed">
                    Deal on woodfired pizzas and fresh pastas ordered tonight.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4D5C3] flex items-center justify-between">
                  <span className="micro-label bg-[#FFFBEA] border border-[#F5EBCE] text-[#75070C] px-2 py-1 rounded-lg">
                    BUTTER15
                  </span>
                  <button
                    onClick={() => handleApplyPromo("BUTTER15")}
                    className="text-xs font-bold text-[#75070C] hover:underline"
                  >
                    Apply code →
                  </button>
                </div>
              </div>

              {/* Offer 2: Free Delivery */}
              <div className="rounded-2xl bg-white border border-[#E4D5C3] p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="micro-label text-[#4F6815] text-[9px]">COURIER PASS</span>
                  <h3 className="font-serif text-2xl font-extrabold text-[#4F6815] mt-1">
                    Free delivery
                  </h3>
                  <p className="text-xs text-[#6E5C52] mt-2 leading-relaxed">
                    Temperature-controlled express delivery across Mayfair & Soho.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4D5C3] flex items-center justify-between">
                  <span className="micro-label bg-[#FAF6F0] border border-[#E4D5C3] text-[#4F6815] px-2 py-1 rounded-lg">
                    FREEDEL
                  </span>
                  <button
                    onClick={() => handleApplyPromo("FREEDEL")}
                    className="text-xs font-bold text-[#4F6815] hover:underline"
                  >
                    Apply code →
                  </button>
                </div>
              </div>

              {/* Offer 3: First Harvest */}
              <div className="rounded-2xl bg-white border border-[#E4D5C3] p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="micro-label text-[#75070C] text-[9px]">FIRST HARVEST</span>
                  <h3 className="font-serif text-2xl font-extrabold text-[#75070C] mt-1">
                    ₹150 credit
                  </h3>
                  <p className="text-xs text-[#6E5C52] mt-2 leading-relaxed">
                    Applied on your first order over ₹400 from any partner kitchen.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4D5C3] flex items-center justify-between">
                  <span className="micro-label bg-[#FFFBEA] border border-[#F5EBCE] text-[#75070C] px-2 py-1 rounded-lg">
                    FIRSTBITE
                  </span>
                  <button
                    onClick={() => handleApplyPromo("FIRSTBITE")}
                    className="text-xs font-bold text-[#75070C] hover:underline"
                  >
                    Apply code →
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. RECENTLY VIEWED & RECOMMENDED RESTAURANTS */}
        {/* ========================================================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E4D5C3]">
            <div>
              <span className="micro-label text-[#4F6815]">CURATED SUGGESTIONS</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#75070C] mt-0.5">
                Recommended For You
              </h2>
            </div>
            <button
              onClick={handleBrowseKitchens}
              className="text-xs font-semibold text-[#75070C] hover:underline"
            >
              Explore all kitchens →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {RECOMMENDED_KITCHENS.map((item) => (
              <div
                key={item.id}
                className="bg-[#FAF6F0] border border-[#E4D5C3] rounded-2xl p-4 flex items-center gap-4 shadow-xs hover:border-[#4F6815]/50 hover:-translate-y-0.5 transition duration-200"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-xl object-cover border border-[#E4D5C3] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="micro-label text-[#4F6815] text-[8px]">{item.badge}</span>
                    <span className="text-xs font-bold text-[#75070C]">★ {item.rating}</span>
                  </div>
                  <h3 className="font-serif text-sm font-bold text-[#23120B] truncate mt-0.5">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[#6E5C52] truncate">{item.specialty}</p>
                  <div className="flex items-center justify-between text-[11px] text-[#6E5C52] mt-2">
                    <span>⏱ {item.time}</span>
                    <button
                      onClick={handleBrowseKitchens}
                      className="text-[#75070C] font-semibold hover:underline"
                    >
                      Menu →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* CART DRAWER: Slide-over Drawer with Instant Pricing & Discount Calculation */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-[#23120B]/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                className="w-screen max-w-md bg-[#FAF6F0] border-l border-[#E4D5C3] shadow-2xl flex flex-col justify-between"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-[#E4D5C3] flex items-center justify-between bg-[#F0E6DA]">
                  <div>
                    <span className="micro-label text-[#4F6815]">YOUR BASKET</span>
                    <h2 className="font-serif text-2xl font-bold text-[#75070C]">Your Order</h2>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="h-8 w-8 rounded-full bg-[#FAF6F0] border border-[#E4D5C3] flex items-center justify-center text-[#23120B] hover:bg-[#FFFBEA] transition font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Body / Item List */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  {orderSuccessMsg ? (
                    <div className="bg-[#4F6815]/15 border border-[#4F6815]/30 p-6 rounded-2xl text-center">
                      <span className="text-3xl">🌿</span>
                      <h3 className="font-serif text-xl font-bold text-[#4F6815] mt-2">Order Confirmed!</h3>
                      <p className="text-xs text-[#23120B] mt-1">{orderSuccessMsg}</p>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="text-center py-16">
                      <span className="text-4xl">🛒</span>
                      <h3 className="font-serif text-lg font-bold text-[#75070C] mt-3">Your bag is empty</h3>
                      <p className="text-xs text-[#6E5C52] mt-1">Explore our culinary marketplace to add dishes.</p>
                      <button
                        onClick={() => setCartOpen(false)}
                        className="mt-6 bg-[#75070C] text-[#FFFBEA] text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs"
                      >
                        Explore Food
                      </button>
                    </div>
                  ) : (
                    <>
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#E4D5C3]"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 rounded-xl object-cover border border-[#E4D5C3]"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-sm font-bold text-[#23120B] truncate">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-[#6E5C52] truncate">{item.chef}</p>
                            <p className="font-serif text-xs font-bold text-[#75070C] mt-1">
                              ₹{item.price * item.qty}
                            </p>
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center gap-2 bg-[#FAF6F0] border border-[#E4D5C3] px-2 py-1 rounded-xl">
                            <button
                              onClick={() => updateCartQty(item.id, -1)}
                              className="text-xs font-bold text-[#75070C] hover:scale-110"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-[#23120B] min-w-[14px] text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.id, 1)}
                              className="text-xs font-bold text-[#4F6815] hover:scale-110"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Coupon form */}
                      <div className="mt-4 bg-[#FFFBEA] p-3.5 rounded-2xl border border-[#F5EBCE]">
                        <label className="micro-label text-[#75070C] block mb-1.5">
                          PROMO CODE (TRY "BUTTER15")
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter promo code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 bg-white text-xs border border-[#E4D5C3] px-3 py-1.5 rounded-xl uppercase font-semibold"
                          />
                          <button
                            onClick={() => handleApplyPromo(couponCode)}
                            className="bg-[#75070C] text-[#FFFBEA] text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#5E0509] transition"
                          >
                            Apply
                          </button>
                        </div>
                        {appliedPromo && (
                          <p className="text-[11px] text-[#4F6815] font-semibold mt-1">
                            ✓ {appliedPromo} promo code applied successfully!
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Footer Summary & Checkout */}
                {cartItems.length > 0 && !orderSuccessMsg && (
                  <div className="p-6 bg-[#F0E6DA] border-t border-[#E4D5C3] space-y-3">
                    <div className="space-y-1.5 text-xs text-[#6E5C52]">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold text-[#23120B]">₹{cartSubtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Courier & Packaging</span>
                        <span className="font-semibold text-[#23120B]">
                          {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                        </span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-[#4F6815] font-semibold">
                          <span>Discount ({appliedPromo})</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-serif font-bold text-[#75070C] pt-2 border-t border-[#E4D5C3]">
                        <span>Total Due</span>
                        <span>₹{cartTotal}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-[#75070C] hover:bg-[#5E0509] text-[#FFFBEA] text-xs uppercase tracking-wider font-bold py-3.5 rounded-xl transition shadow-sm mt-2"
                    >
                      {isAuthed ? `Checkout • ₹${cartTotal}` : "Sign In to Order →"}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 7. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#FAF6F0] border-t border-[#E4D5C3] text-[#23120B] mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand & Note */}
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#75070C] text-[#FFFBEA] flex items-center justify-center font-serif text-base font-bold">
                  C
                </div>
                <span className="font-serif text-lg font-bold text-[#75070C]">CraveCart</span>
              </div>
              <p className="text-xs text-[#6E5C52] mt-3 leading-relaxed">
                Independent dining and purveyors across Mayfair and Soho. Clean ingredients, local wood ovens, and neighborhood kitchens delivered warm.
              </p>
            </div>

            {/* Column 2: Explore */}
            <div>
              <h4 className="micro-label text-[#75070C] mb-3">EXPLORE</h4>
              <ul className="space-y-2 text-xs font-semibold text-[#6E5C52]">
                <li><button onClick={handleBrowseKitchens} className="hover:text-[#75070C]">Kitchens & Bins</button></li>
                <li><a href="#categories" className="hover:text-[#75070C]">Groceries & Hearth</a></li>
                <li><a href="#featured-restaurants" className="hover:text-[#75070C]">Seasonal Editions</a></li>
                <li><button onClick={handleOffers} className="hover:text-[#75070C]">Weekly Perks</button></li>
              </ul>
            </div>

            {/* Column 3: Standards */}
            <div>
              <h4 className="micro-label text-[#4F6815] mb-3">STANDARDS</h4>
              <p className="text-xs text-[#6E5C52] leading-relaxed">
                100% provenance verification. Direct relationships with every baker, chef, and grower.
              </p>
              <div className="mt-3">
                <button
                  onClick={handleRegisterKitchen}
                  className="text-xs font-bold text-[#4F6815] hover:underline"
                >
                  Join as Partner Chef →
                </button>
              </div>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 className="micro-label text-[#75070C] mb-3">DISPATCH</h4>
              <p className="text-xs text-[#6E5C52] mb-3 leading-relaxed">
                Receive weekly curated tasting menus and neighborhood specials.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-white border border-[#E4D5C3] px-3 py-2 text-xs rounded-xl flex-1 text-[#23120B]"
                />
                <button
                  onClick={() => alert("Subscribed to CraveCart Dispatch!")}
                  className="bg-[#75070C] text-[#FFFBEA] text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#5E0509] transition"
                >
                  Join
                </button>
              </div>
            </div>

          </div>

          <div className="mt-12 pt-6 border-t border-[#E4D5C3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6E5C52] gap-4">
            <p>© {new Date().getFullYear()} CraveCart Purveyors Inc.</p>
            <div className="flex gap-4">
              <span className="hover:text-[#75070C] cursor-pointer">Privacy</span>
              <span className="hover:text-[#75070C] cursor-pointer">Terms</span>
              <span className="hover:text-[#75070C] cursor-pointer">Provenance</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}