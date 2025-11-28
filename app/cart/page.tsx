"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  const router = useRouter();

  useEffect(() => {
    loadCart();
    checkAuthStatus();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('gucci-cart');
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

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(newCart);
    if (user) {
      const cartKey = `gucci-cart-${user._id || user.email}`;
      localStorage.setItem(cartKey, JSON.stringify(newCart));
    }
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    if (user) {
      const cartKey = `gucci-cart-${user._id || user.email}`;
      localStorage.setItem(cartKey, JSON.stringify(newCart));
    }
  };

  const clearCart = () => {
    setCart([]);
    if (user) {
      const cartKey = `gucci-cart-${user._id || user.email}`;
      localStorage.setItem(cartKey, JSON.stringify([]));
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShipping = () => {
    return getSubtotal() > 0 ? 0 : 0; // Free shipping for demo
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getTotal = () => {
    return getSubtotal() + getShipping() + getTax();
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = toastCounter + 1;
    setToastCounter(id);
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Redirect to checkout page
    setTimeout(() => {
      showToast('Proceeding to checkout...', 'info');
      setIsCheckingOut(false);
      router.push('/checkout');
    }, 800);
  };

  if (cart.length === 0) {
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

        {/* Empty Cart */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-light tracking-widest mb-4">YOUR CART IS EMPTY</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Discover our luxury collections and find something special.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/women')}
                className="luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
              >
                SHOP WOMEN'S
              </button>
              <button
                onClick={() => router.push('/men')}
                className="luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
              >
                SHOP MEN'S
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <button 
            onClick={() => router.push('/')}
            className="font-light hover:underline tracking-wider text-sm"
          >
            ← BACK TO HOME
          </button>

          <button onClick={() => router.push('/')}>
            <h1 className="text-4xl font-serif tracking-[0.3em] text-black">GUCCI</h1>
          </button>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/cart')}
              className="p-1 hover:opacity-70 transition-opacity duration-300 relative"
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
              className="font-light text-sm tracking-wider hover:opacity-70 transition-opacity duration-300"
            >
              MENU
            </button>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-light tracking-widest">SHOPPING CART</h1>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-light tracking-widest transition-colors duration-300 cursor-pointer"
                >
                  CLEAR CART
                </button>
              </div>

              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="shrink-0 w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
                      <Image
                        src={item.image || "/mens-bag-gu.avif"}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="grow">
                      <h3 className="text-lg font-light text-black tracking-wide mb-2">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-lg font-light">${item.price}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-l border-r border-gray-300 min-w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                          disabled={item.quantity >= 10}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-300 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-light text-black">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-8 sticky top-24">
                <h2 className="text-2xl font-light tracking-widest mb-6">ORDER SUMMARY</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Tax</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-xl font-light">
                      <span>Total</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-lg hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCheckingOut ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      PROCESSING...
                    </div>
                  ) : (
                    `PROCEED TO CHECKOUT - $${getTotal().toFixed(2)}`
                  )}
                </button>

                {/* Additional Info */}
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Free worldwide shipping
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    30-day return policy
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Secure payment
                  </div>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/products')}
                  className="text-black hover:underline font-light tracking-widest transition-colors duration-300 cursor-pointer"
                >
                  ← CONTINUE SHOPPING
                </button>
              </div>
            </div>
          </div>
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