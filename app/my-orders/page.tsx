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

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  deliveryOption: string;
  paymentMethod: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem("gucci-user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAdmin(userData.role === "admin" || userData.role === "superadmin");
    } else {
      router.push("/");
    }
  };

  const loadUserOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders?userId=${user._id || user.email}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        showToast("Failed to load orders", "error");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      showToast("Error loading orders", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="font-light hover:underline tracking-wider text-sm cursor-pointer"
          >
            ← BACK TO HOME
          </button>

          <button onClick={() => router.push("/")} className="cursor-pointer">
            <h1 className="text-4xl font-serif tracking-[0.3em] text-black">GUCCI</h1>
          </button>

          <button
            onClick={() => setIsSideNavOpen(true)}
            className="font-light text-sm tracking-wider hover:opacity-70 transition-opacity duration-300 cursor-pointer"
          >
            MENU
          </button>
        </div>
      </header>

      {/* Side Navigation */}
      {isSideNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsSideNavOpen(false)}></div>
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isSideNavOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-light tracking-widest">MENU</h2>
          <button
            onClick={() => setIsSideNavOpen(false)}
            className="text-2xl font-light cursor-pointer"
          >
            ✕
          </button>
        </div>

        <nav className="p-6 space-y-6">
          {user && (
            <>
              <div className="pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600 font-light mb-2">LOGGED IN AS</p>
                <p className="font-light text-lg">{user.name}</p>
                <p className="text-sm text-gray-600 font-light">{user.email}</p>
              </div>

              <button
                onClick={() => {
                  router.push("/my-orders");
                  setIsSideNavOpen(false);
                }}
                className="block w-full text-left font-light tracking-wider hover:opacity-60 transition-opacity text-lg cursor-pointer"
              >
                MY ORDERS
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                router.push("/admin");
                setIsSideNavOpen(false);
              }}
              className="block w-full text-left font-light tracking-wider hover:opacity-60 transition-opacity text-lg text-blue-600 cursor-pointer"
            >
              ADMIN PANEL
            </button>
          )}

          <button
            onClick={() => router.push("/products")}
            className="block w-full text-left font-light tracking-wider hover:opacity-60 transition-opacity text-lg cursor-pointer"
          >
            SHOP ALL
          </button>

          <button
            onClick={() => router.push("/women")}
            className="block w-full text-left font-light tracking-wider hover:opacity-60 transition-opacity text-lg cursor-pointer"
          >
            WOMEN'S
          </button>

          <button
            onClick={() => router.push("/men")}
            className="block w-full text-left font-light tracking-wider hover:opacity-60 transition-opacity text-lg cursor-pointer"
          >
            MEN'S
          </button>

          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.removeItem("gucci-user");
                router.push("/");
              }}
              className="w-full luxury-button border-2 border-black text-black px-6 py-3 font-light tracking-widest text-sm hover:bg-gray-50 transition-all duration-300"
            >
              LOGOUT
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <section className="py-16 px-6 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light tracking-widest mb-12">MY ORDERS</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="font-light tracking-wider">Loading your orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-light tracking-widest mb-4">NO ORDERS YET</h2>
              <p className="text-gray-600 mb-8 text-lg">You haven't placed any orders yet.</p>
              <button
                onClick={() => router.push("/products")}
                className="luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 cursor-pointer"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Order Header */}
                  <div
                    className="p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order._id ? null : order._id
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-light tracking-widest text-lg">
                            {order.orderId}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-light ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-light">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-light text-black">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 font-light">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="ml-4">
                        <svg
                          className={`w-6 h-6 transform transition-transform ${
                            expandedOrderId === order._id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  {expandedOrderId === order._id && (
                    <div className="p-6 border-t border-gray-200 space-y-6">
                      {/* Order Items */}
                      <div>
                        <h3 className="font-light tracking-widest text-lg mb-4">
                          ORDER ITEMS
                        </h3>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="shrink-0 w-16 h-16 bg-white rounded-lg overflow-hidden">
                                <img
                                  src={item.image || "/mens-bag-gu.avif"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-light text-black">{item.name}</p>
                                <p className="text-sm text-gray-600 font-light">
                                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-light">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Details */}
                      <div>
                        <h3 className="font-light tracking-widest text-lg mb-4">
                          SHIPPING DETAILS
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <p className="font-light">
                            {order.shippingAddress.firstName}{" "}
                            {order.shippingAddress.lastName}
                          </p>
                          <p className="font-light text-gray-600">
                            {order.shippingAddress.street}
                          </p>
                          <p className="font-light text-gray-600">
                            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zipCode}
                          </p>
                          <p className="font-light text-gray-600 pt-2 border-t border-gray-300">
                            Phone: {order.shippingAddress.phone}
                          </p>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h3 className="font-light tracking-widest text-lg mb-4">
                            DELIVERY METHOD
                          </h3>
                          <p className="font-light text-gray-600 capitalize">
                            {order.deliveryOption} Delivery
                          </p>
                        </div>
                        <div>
                          <h3 className="font-light tracking-widest text-lg mb-4">
                            PAYMENT METHOD
                          </h3>
                          <p className="font-light text-gray-600 capitalize">
                            {order.paymentMethod === "card"
                              ? "Credit/Debit Card"
                              : order.paymentMethod === "paypal"
                              ? "PayPal"
                              : "Apple Pay"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
                toast.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : toast.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }
            `}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" && (
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {toast.type === "error" && (
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {toast.type === "info" && (
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
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
