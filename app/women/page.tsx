"use client";

import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

function WomenCollectionContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  // Toast notification function
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = toastCounter + 1;
    setToastCounter(id);
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    loadProducts();
    loadCart();
    checkAuthStatus();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, sortBy, priceRange]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        const womensProducts = data.products.filter((p: Product) => p.category === "women");
        setProducts(womensProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCart = () => {
    if (!user) {
      setCart([]);
      return;
    }
    const cartKey = `gucci-cart-${user._id || user.email}`;
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem('gucci-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAdmin(userData.role === 'admin' || userData.role === 'superadmin');
      const cartKey = `gucci-cart-${userData._id || userData.email}`;
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } else {
      setCart([]);
    }
  };

  const filterProducts = () => {
    let filtered = products.filter(product => 
      product.category === "women"
    );

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
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
    if (user) {
      const cartKey = `gucci-cart-${user._id || user.email}`;
      localStorage.setItem(cartKey, JSON.stringify(newCart));
    }
    showToast(`${product.name} added to cart!`, "success");
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <button 
            onClick={() => router.push('/')}
            className="font-light hover:underline tracking-wider text-sm cursor-pointer"
          >
            ← BACK TO HOME
          </button>

          <button onClick={() => router.push('/')} className="cursor-pointer">
            <h1 className="text-4xl font-serif tracking-[0.3em] text-black">GUCCI</h1>
          </button>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/cart')}
              className="p-1 hover:opacity-70 transition-opacity duration-300 relative cursor-pointer"
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

      {/* Hero Section */}
      <section className="relative h-96 bg-pink-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-r from-pink-900/60 to-pink-700/40"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-6xl font-serif tracking-widest mb-4">WOMEN'S COLLECTION</h1>
          <p className="text-xl font-light tracking-wide">Elegant luxury for the sophisticated woman</p>
        </div>
      </section>

      {/* Filters and Sorting */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex gap-6 items-center">
              <div>
                <label className="text-sm font-light tracking-widest mr-3">SORT BY:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-light tracking-widest mr-3">PRICE RANGE:</label>
                <select 
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                >
                  <option value={10000}>All Prices</option>
                  <option value={500}>Under $500</option>
                  <option value={1000}>Under $1000</option>
                  <option value={2000}>Under $2000</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredProducts.length} products found
              {searchQuery && ` for "${searchQuery}"`}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product._id}
                  className="group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div 
                    className="relative aspect-square bg-gray-50 overflow-hidden rounded-sm mb-4"
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
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 text-sm tracking-widest font-light opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-20 cursor-pointer"
                    >
                      ADD TO CART
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-light text-black tracking-wide mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-lg">${product.price}</p>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-light text-gray-500 mb-4">
                {searchQuery ? `No products found for "${searchQuery}"` : 'No products available'}
              </h3>
              <button
                onClick={() => router.push('/products')}
                className="luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
              >
                BROWSE ALL PRODUCTS
              </button>
            </div>
          )}
        </div>
      </section>

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

      {/* Animations */}
      <style jsx global>{`
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

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function WomenCollection() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <WomenCollectionContent />
    </Suspense>
  );
}