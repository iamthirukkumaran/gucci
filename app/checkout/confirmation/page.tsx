"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrderDetails {
  orderId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryOption: string;
  paymentMethod: string;
  total: number;
  timestamp: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function OrderConfirmation() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const savedOrderDetails = localStorage.getItem("lastOrderDetails");
    const savedUser = localStorage.getItem("gucci-user");

    if (savedOrderDetails && savedUser) {
      const orderDetails = JSON.parse(savedOrderDetails);
      const userData = JSON.parse(savedUser);

      setOrderDetails(orderDetails);
      
      // Save order to database
      saveOrderToDatabase(orderDetails, userData);
      showToast("Order placed successfully!", "success");
    } else {
      showToast("No order found. Redirecting to home...", "error");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, []);

  const saveOrderToDatabase = async (orderDetails: OrderDetails, userData: any) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData._id || userData.email,
          orderId: orderDetails.orderId,
          items: orderDetails.items,
          shippingAddress: orderDetails.shippingAddress,
          deliveryOption: orderDetails.deliveryOption,
          paymentMethod: orderDetails.paymentMethod,
          total: orderDetails.total,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error("Error saving order to database:", data.message);
      }
    } catch (error) {
      console.error("Error saving order:", error);
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

  const getDeliveryDate = () => {
    const date = new Date();
    if (orderDetails?.deliveryOption === "standard") {
      date.setDate(date.getDate() + 7);
    } else if (orderDetails?.deliveryOption === "express") {
      date.setDate(date.getDate() + 3);
    } else if (orderDetails?.deliveryOption === "overnight") {
      date.setDate(date.getDate() + 1);
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isMounted || !orderDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="font-light tracking-wider">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div></div>
          <button onClick={() => router.push("/")} className="cursor-pointer">
            <h1 className="text-4xl font-serif tracking-[0.3em] text-black">GUCCI</h1>
          </button>
          <div></div>
        </div>
      </header>

      {/* Success Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-green-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-light tracking-widest mb-4 text-black">
            ORDER CONFIRMED
          </h1>
          <p className="text-xl font-light text-gray-600 mb-12">
            Thank you for your purchase! Your order has been successfully placed.
          </p>

          {/* Order Number */}
          <div className="bg-gray-50 rounded-lg p-8 mb-12 border border-gray-200">
            <p className="text-sm text-gray-600 font-light tracking-wider mb-2">ORDER NUMBER</p>
            <p className="text-3xl font-light text-black tracking-widest">{orderDetails.orderId}</p>
            <p className="text-sm text-gray-600 font-light mt-4">
              A confirmation email has been sent to <strong>{orderDetails.shippingAddress.email}</strong>
            </p>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Delivery Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-left">
              <h2 className="text-lg font-light tracking-widest mb-6 text-black">ESTIMATED DELIVERY</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-light tracking-wider mb-2">DELIVERY DATE</p>
                  <p className="text-xl font-light text-black">{getDeliveryDate()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light tracking-wider mb-2">DELIVERY METHOD</p>
                  <p className="text-lg font-light text-black capitalize">
                    {orderDetails.deliveryOption} Delivery
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light tracking-wider mb-2">SHIPPING TO</p>
                  <p className="font-light text-black">
                    {orderDetails.shippingAddress.street}
                    <br />
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}{" "}
                    {orderDetails.shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-left">
              <h2 className="text-lg font-light tracking-widest mb-6 text-black">PAYMENT DETAILS</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-light tracking-wider mb-2">PAYMENT METHOD</p>
                  <p className="text-lg font-light text-black capitalize">
                    {orderDetails.paymentMethod === "card"
                      ? "Credit/Debit Card"
                      : orderDetails.paymentMethod === "paypal"
                      ? "PayPal"
                      : "Apple Pay"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light tracking-wider mb-2">ORDER TOTAL</p>
                  <p className="text-2xl font-light text-black">${orderDetails.total.toFixed(2)}</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 font-light">
                    Order placed on{" "}
                    {new Date(orderDetails.timestamp).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-12">
            <h2 className="text-lg font-light tracking-widest mb-6 text-black text-left">ORDER ITEMS</h2>
            <div className="space-y-4">
              {orderDetails.items.map((item) => (
                <div key={item.id} className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                  <div className="shrink-0 w-20 h-20 bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={item.image || "/mens-bag-gu.avif"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grow text-left">
                    <h3 className="text-lg font-light text-black tracking-wide mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm font-light">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-light text-black">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/products")}
              className="luxury-button border-2 border-black text-black px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-50 transition-all duration-500 cursor-pointer"
            >
              CONTINUE SHOPPING
            </button>
            <button
              onClick={() => router.push("/")}
              className="luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 cursor-pointer"
            >
              BACK TO HOME
            </button>
          </div>

          {/* Additional Information */}
          <div className="mt-16 p-8 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-light leading-relaxed">
              <strong>Thank you for shopping with Gucci Luxury Store!</strong> We've sent a detailed
              confirmation email with tracking information. You can monitor your order status at any
              time. If you have any questions, please contact our customer service team.
            </p>
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
