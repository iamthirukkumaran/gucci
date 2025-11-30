"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: "women" | "men";
  image: string;
  createdAt?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface User {
  _id?: string;
  name: string;
  email: string;
  role?: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  // Auth states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});
  const [registerData, setRegisterData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});
  const [authLoading, setAuthLoading] = useState(false);
  
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    checkAuthStatus();
    loadCart();
    loadProducts();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auth functions
  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem('gucci-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAdmin(userData.role === 'admin' || userData.role === 'superadmin');
    }
  };

  const loadCart = () => {
    const savedUser = localStorage.getItem('gucci-user');
    let cartKey = 'gucci-cart';
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      cartKey = `gucci-cart-${userData._id || userData.email}`;
    }
    
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Toast notification function
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = toastCounter + 1;
    setToastCounter(id);
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Form validation functions
  const validateLogin = (): boolean => {
    const errors: FormErrors = {};
    if (!loginData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) errors.email = "Invalid email format";
    if (!loginData.password.trim()) errors.password = "Password is required";
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = (): boolean => {
    const errors: FormErrors = {};
    if (!registerData.name.trim()) errors.name = "Name is required";
    if (!registerData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) errors.email = "Invalid email format";
    if (!registerData.password.trim()) errors.password = "Password is required";
    else if (registerData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!registerData.confirmPassword.trim()) errors.confirmPassword = "Confirm password is required";
    else if (registerData.password !== registerData.confirmPassword) errors.confirmPassword = "Passwords don't match";
    
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateLogin()) return;

    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAdmin(data.user.role === 'admin' || data.user.role === 'superadmin');
        localStorage.setItem('gucci-user', JSON.stringify(data.user));
        const cartKey = `gucci-cart-${data.user._id || data.user.email}`;
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        } else {
          setCart([]);
        }
        setIsLoginOpen(false);
        setLoginData({ email: "", password: "" });
        setLoginErrors({});
        showToast("Login successful!", "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast('Login failed. Please try again.', "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateRegister()) return;

    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAdmin(data.user.role === 'admin' || data.user.role === 'superadmin');
        localStorage.setItem('gucci-user', JSON.stringify(data.user));
        setIsRegisterOpen(false);
        setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
        setRegisterErrors({});
        showToast('Registration successful!', "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast('Registration failed. Please try again.', "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (user) {
      const cartKey = `gucci-cart-${user._id || user.email}`;
      localStorage.removeItem(cartKey);
    }
    setUser(null);
    setIsAdmin(false);
    setCart([]);
    localStorage.removeItem('gucci-user');
    setIsSideNavOpen(false);
    showToast("Logged out successfully", "success");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product._id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      }];
    }
    
    setCart(newCart);
    
    // Save to user-specific cart key if user is logged in
    if (user) {
      const cartKey = `gucci-cart-${user._id || user.email}`;
      localStorage.setItem(cartKey, JSON.stringify(newCart));
    }
    
    // Show toast notification
    showToast(`${product.name} added to cart!`, "success");
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Filter featured products for homepage
  const featuredProducts = products.slice(0, 8);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-1 text-sm text-black">
              <span>+</span>
              <button className="font-light hover:underline tracking-wider">CONTACT US</button>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-4xl font-serif tracking-[0.3em] text-black">GUCCI</h1>
            </div>
            <div className="flex items-center gap-8 text-black">
              <button className="p-1 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="font-light text-sm tracking-wider cursor-pointer">MENU</button>
            </div>
          </div>
        </header>
        <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-light tracking-widest text-gray-400">GUCCI</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "bg-white/95 backdrop-blur-md border-b border-gray-100" : "bg-transparent"
      }`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Left: Contact Us */}
          <div className={`flex items-center gap-1 text-sm transition-colors duration-300 ${
            isScrolled ? "text-black" : "text-white"
          }`}>
            <span></span>
            <button className="font-light hover:underline tracking-wider"></button>
          </div>

          {/* Center: Gucci Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <button onClick={() => router.push('/')} className="cursor-pointer">
              <h1 className={`text-4xl font-serif tracking-[0.3em] transition-all duration-500 ${
                isScrolled ? "text-black scale-90" : "text-white"
              }`}>GUCCI</h1>
            </button>
          </div>

          {/* Right: Search, Cart and Menu */}
          <div className={`flex items-center gap-6 transition-colors duration-300 ${
            isScrolled ? "text-black" : "text-white"
          }`}>
            {user && (
              <span className={`text-sm font-light tracking-wider ${
                isScrolled ? "text-black" : "text-white"
              }`}>
                Welcome, {user.name}
              </span>
            )}
            
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-1 hover:opacity-70 transition-opacity duration-300 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => router.push('/cart')}
              className="p-1 hover:opacity-70 transition-opacity duration-300 cursor-pointer relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </button>

            <button 
              onClick={() => setIsSideNavOpen(true)}
              className="font-light text-sm tracking-wider hover:opacity-70 transition-opacity duration-300 cursor-pointer"
            >
              MENU
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl p-8 transform transition-all duration-500 scale-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif tracking-widest">SEARCH PRODUCTS</h2>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for luxury products..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-300 text-lg"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Side Navigation */}
      {isSideNavOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSideNavOpen(false)}>
          </div>
          
          <div className="absolute right-0 top-0 h-full w-96 bg-white transform transition-transform duration-500 ease-in-out">
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <h2 className="text-2xl font-serif tracking-widest">GUCCI</h2>
              <button 
                onClick={() => setIsSideNavOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {user && (
              <div className="p-6 border-b border-gray-200">
                <p className="text-lg font-light">Welcome back,</p>
                <p className="text-xl font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                {isAdmin && (
                  <span className="inline-block px-3 py-1 text-xs bg-gold text-white tracking-widest mt-2 rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
            )}

            <nav className="p-8 space-y-8">
              <div>
                <h3 className="text-sm font-light tracking-widest text-gray-500 mb-4">COLLECTIONS</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      router.push('/women');
                      setIsSideNavOpen(false);
                    }}
                    className="block text-2xl font-light tracking-wide hover:opacity-70 transition-opacity duration-300 text-left cursor-pointer"
                  >
                    Women's Collection
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/men');
                      setIsSideNavOpen(false);
                    }}
                    className="block text-2xl font-light tracking-wide hover:opacity-70 transition-opacity duration-300 text-left cursor-pointer"
                  >
                    Men's Collection
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/products');
                      setIsSideNavOpen(false);
                    }}
                    className="block text-2xl font-light tracking-wide hover:opacity-70 transition-opacity duration-300 text-left cursor-pointer"
                  >
                    All Products
                  </button>
                </div>
              </div>

              {/* Auth Section */}
              <div>
                <h3 className="text-sm font-light tracking-widest text-gray-500 mb-4">ACCOUNT</h3>
                <div className="space-y-4">
                  {user ? (
                    <>
                      {isAdmin && (
                        <button 
                          onClick={() => {
                            router.push('/admin');
                            setIsSideNavOpen(false);
                          }}
                          className="block text-lg font-light tracking-wide text-gold hover:opacity-70 transition-opacity duration-300 text-left cursor-pointer"
                        >
                          Admin Dashboard
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          router.push('/my-orders');
                          setIsSideNavOpen(false);
                        }}
                        className="block text-lg font-light tracking-wide hover:opacity-70 transition-opacity duration-300 text-left cursor-pointer"
                      >
                        My Orders
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="block text-lg font-light tracking-wide text-red-600 hover:opacity-70 transition-opacity duration-300 text-left cursor-pointer"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setIsLoginOpen(true);
                          setIsSideNavOpen(false);
                        }}
                        className="block text-lg font-light tracking-wide hover:opacity-70 transition-opacity duration-300 text-left cursor-pointer"
                      >
                        Login
                      </button>
                      <button 
                        onClick={() => {
                          setIsRegisterOpen(true);
                          setIsSideNavOpen(false);
                        }}
                        className="block text-lg font-light tracking-wide hover:opacity-70 transition-opacity duration-300 text-left cursor-pointer"
                      >
                        Register
                      </button>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-8 transform transition-all duration-500 scale-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif tracking-widest">LOGIN</h2>
                <button 
                  onClick={() => {
                    setIsLoginOpen(false);
                    setLoginErrors({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-light tracking-widest mb-2">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => {
                      setLoginData({...loginData, email: e.target.value});
                      if (loginErrors.email) {
                        const newErrors = {...loginErrors};
                        delete newErrors.email;
                        setLoginErrors(newErrors);
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                      loginErrors.email 
                        ? 'border-red-500 focus:border-red-600 bg-red-50' 
                        : 'border-gray-300 focus:border-black'
                    }`}
                  />
                  {loginErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{loginErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-light tracking-widest mb-2">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData({...loginData, password: e.target.value});
                        if (loginErrors.password) {
                          const newErrors = {...loginErrors};
                          delete newErrors.password;
                          setLoginErrors(newErrors);
                        }
                      }}
                      className={`w-full p-3 pr-12 border rounded-lg focus:outline-none transition-colors duration-300 ${
                        loginErrors.password 
                          ? 'border-red-500 focus:border-red-600 bg-red-50' 
                          : 'border-gray-300 focus:border-black'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      {showLoginPassword ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3a7 7 0 016.402 3.998l1.414-1.414C15.505 2.954 13.027 1 10 1S4.495 2.954 2.184 5.584l1.414 1.414A7 7 0 0110 3zm7 7a7.001 7.001 0 01-11.385 5.97l-1.414 1.414C4.495 17.046 6.973 19 10 19s5.505-1.954 7.816-4.584l-1.414-1.414A7.001 7.001 0 0110 17a4 4 0 000-8z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-red-600 text-sm mt-1">{loginErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {authLoading ? "LOGGING IN..." : "LOGIN"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginOpen(false);
                      setIsRegisterOpen(true);
                      setLoginErrors({});
                    }}
                    className="text-black hover:underline font-light cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-8 transform transition-all duration-500 scale-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif tracking-widest">REGISTER</h2>
                <button 
                  onClick={() => {
                    setIsRegisterOpen(false);
                    setRegisterErrors({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-light tracking-widest mb-2">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => {
                      setRegisterData({...registerData, name: e.target.value});
                      if (registerErrors.name) {
                        const newErrors = {...registerErrors};
                        delete newErrors.name;
                        setRegisterErrors(newErrors);
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                      registerErrors.name 
                        ? 'border-red-500 focus:border-red-600 bg-red-50' 
                        : 'border-gray-300 focus:border-black'
                    }`}
                  />
                  {registerErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{registerErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-light tracking-widest mb-2">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => {
                      setRegisterData({...registerData, email: e.target.value});
                      if (registerErrors.email) {
                        const newErrors = {...registerErrors};
                        delete newErrors.email;
                        setRegisterErrors(newErrors);
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                      registerErrors.email 
                        ? 'border-red-500 focus:border-red-600 bg-red-50' 
                        : 'border-gray-300 focus:border-black'
                    }`}
                  />
                  {registerErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{registerErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-light tracking-widest mb-2">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({...registerData, password: e.target.value});
                        if (registerErrors.password) {
                          const newErrors = {...registerErrors};
                          delete newErrors.password;
                          setRegisterErrors(newErrors);
                        }
                      }}
                      className={`w-full p-3 pr-12 border rounded-lg focus:outline-none transition-colors duration-300 ${
                        registerErrors.password 
                          ? 'border-red-500 focus:border-red-600 bg-red-50' 
                          : 'border-gray-300 focus:border-black'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      {showRegisterPassword ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3a7 7 0 016.402 3.998l1.414-1.414C15.505 2.954 13.027 1 10 1S4.495 2.954 2.184 5.584l1.414 1.414A7 7 0 0110 3zm7 7a7.001 7.001 0 01-11.385 5.97l-1.414 1.414C4.495 17.046 6.973 19 10 19s5.505-1.954 7.816-4.584l-1.414-1.414A7.001 7.001 0 0110 17a4 4 0 000-8z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="text-red-600 text-sm mt-1">{registerErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-light tracking-widest mb-2">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData({...registerData, confirmPassword: e.target.value});
                        if (registerErrors.confirmPassword) {
                          const newErrors = {...registerErrors};
                          delete newErrors.confirmPassword;
                          setRegisterErrors(newErrors);
                        }
                      }}
                      className={`w-full p-3 pr-12 border rounded-lg focus:outline-none transition-colors duration-300 ${
                        registerErrors.confirmPassword 
                          ? 'border-red-500 focus:border-red-600 bg-red-50' 
                          : 'border-gray-300 focus:border-black'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3a7 7 0 016.402 3.998l1.414-1.414C15.505 2.954 13.027 1 10 1S4.495 2.954 2.184 5.584l1.414 1.414A7 7 0 0110 3zm7 7a7.001 7.001 0 01-11.385 5.97l-1.414 1.414C4.495 17.046 6.973 19 10 19s5.505-1.954 7.816-4.584l-1.414-1.414A7.001 7.001 0 0110 17a4 4 0 000-8z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {registerErrors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{registerErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {authLoading ? "REGISTERING..." : "REGISTER"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterOpen(false);
                      setIsLoginOpen(true);
                      setRegisterErrors({});
                    }}
                    className="text-black hover:underline font-light cursor-pointer"
                  >
                    Login here
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative w-full h-screen min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="/gu.avif"
            alt="Gucci Gift - Luxury Bags"
            fill
            className="object-cover scale-110"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/10 to-black/30"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center mt-90">
          {/* Animated Title */}
          <div className="overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-light text-white tracking-widest mb-2 animate-slide-up">
              GUCCI GIFT
            </h2>
          </div>
          
          {/* Subtle decorative line */}
          <div className="w-20 h-px bg-white/60 mb-4 animate-scale-in"></div>

          {/* Enhanced Buttons with luxury hover effects */}
          <div className="flex gap-6 md:gap-8 mt-4">
            <button
              onClick={() => router.push('/women')}
              className="luxury-button bg-white cursor-pointer text-black px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-50 transition-all duration-500 transform hover:-translate-y-1"
            >
              FOR HER
            </button>
            <button
              onClick={() => router.push('/men')}
              className="luxury-button bg-white cursor-pointer text-black px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-50 transition-all duration-500 transform hover:-translate-y-1"
            >
              FOR HIM
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-px h-12 bg-white/60"></div>
        </div>
      </main>

      {/* Featured Products Section */}
      <section className="w-full bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Section Title */}
          <div className="overflow-hidden mb-16">
            <h2 className="text-5xl font-light text-center tracking-widest text-black animate-fade-in-up">
              FEATURED COLLECTION
            </h2>
          </div>

          {/* Enhanced Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {featuredProducts.length > 0 ? featuredProducts.map((product, index) => (
              <div 
                key={product._id}
                className="flex flex-col items-center gap-6 group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div 
                  className="relative w-full aspect-square bg-gray-50 overflow-hidden rounded-sm"
                  onClick={() => router.push(`/product/${product._id}`)}
                >
                  <Image
                    src={product.image || "/mens-bag-gu.avif"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-2 text-xs tracking-widest font-light opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-20 cursor-pointer"
                  >
                    ADD TO CART
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-lg font-light text-black tracking-wide">{product.name}</p>
                  <p className="text-gray-600 mt-2">${product.price}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-gray-500 text-lg">No featured products available yet.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/products')}
              className="luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
            >
              VIEW ALL PRODUCTS
            </button>
          </div>
        </div>
      </section>

    

      {/* Second Hero Section */}
      <section className="relative w-full h-screen min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="/men.avif"
            alt="Gucci Gift - Luxury Bags"
            fill
            className="object-cover scale-110"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/10 to-black/30"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center">
          <div className="overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-light text-white tracking-widest mb-2 animate-slide-up">
              THE ART OF GIFTING
            </h2>
          </div>
          <div className="w-20 h-px bg-white/60 mb-4 animate-scale-in"></div>
          <div className="flex gap-6 md:gap-8 mt-4">
            <button
              onClick={() => router.push('/products')}
              className="luxury-button bg-white text-black px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-50 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
            >
              DISCOVER MORE
            </button>
          </div>
        </div>
      </section>


       {/* Luxury Showcase Section */}
      <section className="luxury-showcase py-20 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light tracking-wider mb-4">Crafting Timeless Elegance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover the artistry and heritage behind our iconic collections</p>
          </div>
          
          {/* Luxury Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="border-l-4 border-[#d4af37] pl-6">
                <h3 className="text-2xl font-light mb-4">Italian Artistry</h3>
                <p className="text-gray-600 leading-relaxed">
                  Each piece is meticulously crafted by master artisans in Florence, 
                  combining traditional techniques with contemporary design.
                </p>
              </div>
              
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-light text-[#d4af37] mb-2">1921</div>
                  <div className="text-sm text-gray-500">Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-[#d4af37] mb-2">100+</div>
                  <div className="text-sm text-gray-500">Artisans</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-[#d4af37] mb-2">∞</div>
                  <div className="text-sm text-gray-500">Possibilities</div>
                </div>
              </div>
              
              <button className="bg-black text-white px-8 py-3 font-light tracking-wider hover:bg-gray-800 transition-colors duration-300 cursor-pointer">
                EXPLORE HERITAGE
              </button>
            </div>
            
            {/* Right Image */}
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src="/mens-bag-gu.avif"
                  alt="Luxury Product Showcase - Men's Bag"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#d4af37]/20 rounded-full"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#d4af37]/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
     <footer className="bg-black text-white py-24 px-6 relative overflow-hidden">
  <div className="max-w-7xl mx-auto relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
      <div>
        <h3 className="text-sm font-light tracking-widest mb-6 text-gray-400">ABOUT GUCCI</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Since 1921, Gucci has been a leading name in luxury fashion, representing Italian craftsmanship 
          and innovative design.
        </p>
      </div>
      
      <div>
        <h3 className="text-sm font-light tracking-widest mb-6 text-gray-400">CUSTOMER CARE</h3>
        <div className="space-y-3">
          <button className="block text-sm text-gray-400 hover:text-white transition-colors duration-300 tracking-wide text-left cursor-pointer">
            Contact Us
          </button>
          <button className="block text-sm text-gray-400 hover:text-white transition-colors duration-300 tracking-wide text-left cursor-pointer">
            Shipping Info
          </button>
          <button className="block text-sm text-gray-400 hover:text-white transition-colors duration-300 tracking-wide text-left cursor-pointer">
            Returns
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-light tracking-widest mb-6 text-gray-400">QUICK LINKS</h3>
        <div className="space-y-3">
          <button className="block text-sm text-gray-400 hover:text-white transition-colors duration-300 tracking-wide text-left cursor-pointer">
            Women's Collection
          </button>
          <button className="block text-sm text-gray-400 hover:text-white transition-colors duration-300 tracking-wide text-left cursor-pointer">
            Men's Collection
          </button>
          <button className="block text-sm text-gray-400 hover:text-white transition-colors duration-300 tracking-wide text-left cursor-pointer">
            All Products
          </button>
        </div>
      </div>
    </div>

    <div className="border-t border-gray-800 pt-12">
      <p className="text-xs text-gray-500 tracking-wide">
        © 2014 - 2025 Gucci Gucci S.p.A. - All rights reserved. SMS LICENCE # 27641/19765 and 26427/19756
      </p>
    </div>
  </div>

  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <h2 className="text-[20vw] font-light text-white/5 tracking-widest select-none">
      GUCCI
    </h2>
  </div>
</footer>
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-9999 space-y-3 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              p-4 rounded-lg shadow-lg font-light tracking-wider text-sm
              transform transition-all duration-500 ease-out
              animate-slide-up
              ${
                toast.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : toast.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && (
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Inter:wght@300;400;500&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        .font-serif {
          font-family: 'Cormorant Garamond', serif;
        }

        .text-gold {
          color: #D4AF37;
        }

        .bg-gold {
          background-color: #D4AF37;
        }

        /* Animations */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseSlow {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.05; }
        }

        .animate-slide-up {
          animation: slideUp 1s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 1s ease-out 0.5s both;
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out both;
        }

        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }

        /* Luxury button effects */
        .luxury-button {
          position: relative;
          overflow: hidden;
        }

        .luxury-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.7s ease;
        }

        .luxury-button:hover::before {
          left: 100%;
        }

        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: rgba(0, 0, 0, 0.8);
          color: white;
        }
      `}</style>
    </div>
  );
}