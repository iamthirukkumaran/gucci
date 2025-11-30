"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CountryPhoneInput from "@/components/CountryPhoneInput";
import { type Country } from "@/lib/countriesWithFlags";
import { getMaxPhoneDigits, extractDigits, getPhoneValidationMessage } from "@/lib/phoneValidation";

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
  countryCode?: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Shipping, 3: Delivery, 4: Payment
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    countryCode: "",
  });
  const [shippingErrors, setShippingErrors] = useState<FormErrors>({});
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState<FormErrors>({});

  // Address management states
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [saveAddressForLater, setSaveAddressForLater] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadCart();
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    }
  }, [user]);

  const loadSavedAddresses = async () => {
    try {
      const response = await fetch(`/api/addresses?userId=${user._id}`);
      const data = await response.json();
      if (data.success) {
        setSavedAddresses(data.addresses);
        // Don't auto-select, let user choose
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  };

  useEffect(() => {
    loadCart();
    checkAuthStatus();
  }, []);

  const loadCart = () => {
    const savedUser = localStorage.getItem("gucci-user");
    let cartKey = "gucci-cart";

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      cartKey = `gucci-cart-${userData._id || userData.email}`;
    }

    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem("gucci-user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setShippingAddress((prev) => ({
        ...prev,
        email: userData.email || "",
      }));
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

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getShippingCost = () => {
    if (deliveryOption === "express") return 25;
    if (deliveryOption === "overnight") return 50;
    return 0; // standard is free
  };

  const getTax = () => {
    return getSubtotal() * 0.08;
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost() + getTax();
  };

  const validateShippingAddress = (): boolean => {
    // If a saved address is selected and not showing form, validation passes
    if (!showAddressForm && selectedAddressId) {
      return true;
    }

    const errors: FormErrors = {};

    if (!shippingAddress.firstName.trim()) errors.firstName = "First name is required";
    if (!shippingAddress.lastName.trim()) errors.lastName = "Last name is required";
    if (!shippingAddress.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email))
      errors.email = "Invalid email format";
    if (!shippingAddress.countryCode?.trim()) errors.countryCode = "Country is required";
    if (!shippingAddress.phone.trim()) errors.phone = "Phone number is required";
    if (!shippingAddress.street.trim()) errors.street = "Street address is required";
    if (!shippingAddress.city.trim()) errors.city = "City is required";
    if (!shippingAddress.state.trim()) errors.state = "State is required";
    if (!shippingAddress.zipCode.trim()) errors.zipCode = "ZIP code is required";

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCardDetails = (): boolean => {
    const errors: FormErrors = {};

    if (!cardData.cardNumber.trim()) errors.cardNumber = "Card number is required";
    else if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, "")))
      errors.cardNumber = "Card number must be 16 digits";

    if (!cardData.cardName.trim()) errors.cardName = "Cardholder name is required";

    if (!cardData.expiry.trim()) errors.expiry = "Expiry date is required";
    else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry))
      errors.expiry = "Format should be MM/YY";

    if (!cardData.cvv.trim()) errors.cvv = "CVV is required";
    else if (!/^\d{3,4}$/.test(cardData.cvv))
      errors.cvv = "CVV must be 3 or 4 digits";

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleShippingSubmit = async () => {
    if (validateShippingAddress()) {
      // Save address if user wants to save it for later
      if (saveAddressForLater && user) {
        try {
          const response = await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user._id,
              ...shippingAddress,
              isDefault: savedAddresses.length === 0, // Make first address default
            }),
          });
          const data = await response.json();
          if (data.success) {
            showToast('Address saved successfully', 'success');
            loadSavedAddresses();
          }
        } catch (error) {
          console.error('Error saving address:', error);
        }
      }
      setCurrentStep(3);
    } else {
      showToast("Please fill in all required shipping fields", "error");
    }
  };

  const handlePaymentSubmit = async () => {
    if (currentStep === 4) {
      if (paymentMethod === "card" && !validateCardDetails()) {
        showToast("Please enter valid payment details", "error");
        return;
      }

      setIsProcessing(true);
      // Simulate payment processing
      setTimeout(() => {
        const orderId = `ORD-${Date.now()}`;
        localStorage.setItem("lastOrderId", orderId);
        localStorage.setItem(
          "lastOrderDetails",
          JSON.stringify({
            orderId,
            items: cart,
            shippingAddress,
            deliveryOption,
            paymentMethod,
            total: getTotal(),
            timestamp: new Date().toISOString(),
          })
        );

        // Clear user's cart
        if (user) {
          const cartKey = `gucci-cart-${user._id || user.email}`;
          localStorage.setItem(cartKey, JSON.stringify([]));
        }

        setIsProcessing(false);
        showToast("Payment successful! Redirecting to confirmation...", "success");

        setTimeout(() => {
          router.push("/checkout/confirmation");
        }, 1500);
      }, 2000);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <button
              onClick={() => router.push("/cart")}
              className="font-light hover:underline tracking-wider text-sm cursor-pointer"
            >
              ← BACK TO CART
            </button>
            <button onClick={() => router.push("/")} className="cursor-pointer">
              <h1 className="text-4xl font-serif tracking-[0.3em] text-black">GUCCI</h1>
            </button>
            <div className="w-24"></div>
          </div>
        </header>

        <section className="py-32 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-light tracking-widest mb-4">NO ITEMS IN CART</h2>
            <p className="text-gray-600 mb-8 text-lg">Your cart is empty. Please add items before proceeding to checkout.</p>
            <button
              onClick={() => router.push("/products")}
              className="luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 cursor-pointer"
            >
              CONTINUE SHOPPING
            </button>
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
            onClick={() => router.push("/cart")}
            className="font-light hover:underline tracking-wider text-sm cursor-pointer"
          >
            ← BACK TO CART
          </button>
          <button onClick={() => router.push("/")} className="cursor-pointer">
            <h1 className="text-4xl font-serif tracking-[0.3em] text-black">GUCCI</h1>
          </button>
          <div className="text-sm font-light tracking-wider">STEP {currentStep} OF 4</div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-light tracking-wider transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-black text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <span className="ml-3 font-light tracking-wider text-sm">
                  {step === 1 && "Review"}
                  {step === 2 && "Shipping"}
                  {step === 3 && "Delivery"}
                  {step === 4 && "Payment"}
                </span>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 ml-4 transition-all duration-300 ${
                      step < currentStep ? "bg-black" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Order Review */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-4xl font-light tracking-widest mb-8">ORDER REVIEW</h2>
                  <div className="space-y-6 mb-8">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg"
                      >
                        <div className="shrink-0 w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={item.image || "/mens-bag-gu.avif"}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="grow">
                          <h3 className="text-lg font-light text-black tracking-wide mb-2">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-lg font-light">${item.price}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-2">Qty: {item.quantity}</p>
                          <p className="text-lg font-light text-black">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-lg hover:bg-gray-800 transition-all duration-500 cursor-pointer"
                  >
                    CONTINUE TO SHIPPING
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-4xl font-light tracking-widest mb-8">SHIPPING ADDRESS</h2>
                  <div className="space-y-6">
                    {/* Saved Addresses Section */}
                    {savedAddresses.length > 0 && (
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-light tracking-wider mb-4">SAVED ADDRESSES</h3>
                        <div className="space-y-3">
                          {savedAddresses.map((addr: any) => (
                            <label key={addr._id} className="flex items-start gap-4 cursor-pointer hover:bg-white p-3 rounded transition-colors">
                              <input
                                type="radio"
                                name="address"
                                value={addr._id}
                                checked={selectedAddressId === addr._id}
                                onChange={(e) => {
                                  setSelectedAddressId(e.target.value);
                                  setShowAddressForm(false);
                                  setShippingAddress({
                                    firstName: addr.firstName,
                                    lastName: addr.lastName,
                                    email: addr.email,
                                    phone: addr.phone,
                                    street: addr.street,
                                    city: addr.city,
                                    state: addr.state,
                                    zipCode: addr.zipCode,
                                    country: addr.country || 'United States',
                                    countryCode: addr.countryCode || 'US',
                                  });
                                }}
                                className="mt-1 cursor-pointer"
                              />
                              <div className="flex-1">
                                <p className="font-light text-sm">
                                  {addr.firstName} {addr.lastName}
                                </p>
                                <p className="text-sm text-gray-600 font-light">
                                  {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>
                                {addr.isDefault && (
                                  <span className="text-xs bg-black text-white px-2 py-1 rounded mt-2 inline-block">DEFAULT</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(true);
                            setSelectedAddressId("");
                            // Reset form to clear any saved data
                            setShippingAddress({
                              firstName: "",
                              lastName: "",
                              email: user?.email || "",
                              phone: "",
                              street: "",
                              city: "",
                              state: "",
                              zipCode: "",
                              country: "",
                              countryCode: "",
                            });
                            setShippingErrors({});
                          }}
                          className="w-full mt-4 luxury-button border-2 border-black text-black px-4 py-2 font-light tracking-wider text-sm hover:bg-gray-100 transition-all cursor-pointer"
                        >
                          + ADD NEW ADDRESS
                        </button>
                      </div>
                    )}

                    {/* Address Form */}
                    {showAddressForm && (
                      <>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-light tracking-wider mb-2">
                              FIRST NAME <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={shippingAddress.firstName}
                              onChange={(e) =>
                                setShippingAddress({
                                  ...shippingAddress,
                                  firstName: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                                shippingErrors.firstName
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-black"
                              }`}
                              placeholder="John"
                            />
                            {shippingErrors.firstName && (
                              <p className="text-red-600 text-xs mt-1 font-light">
                                {shippingErrors.firstName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-light tracking-wider mb-2">
                              LAST NAME <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={shippingAddress.lastName}
                              onChange={(e) =>
                                setShippingAddress({
                                  ...shippingAddress,
                                  lastName: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                                shippingErrors.lastName
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-black"
                              }`}
                              placeholder="Doe"
                            />
                            {shippingErrors.lastName && (
                              <p className="text-red-600 text-xs mt-1 font-light">
                                {shippingErrors.lastName}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-light tracking-wider mb-2">
                            EMAIL <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="email"
                            value={shippingAddress.email}
                            onChange={(e) =>
                              setShippingAddress({ ...shippingAddress, email: e.target.value })
                            }
                            className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                              shippingErrors.email
                                ? "border-red-500 focus:border-red-600"
                                : "border-gray-300 focus:border-black"
                            }`}
                            placeholder="john@example.com"
                          />
                          {shippingErrors.email && (
                            <p className="text-red-600 text-xs mt-1 font-light">
                              {shippingErrors.email}
                            </p>
                          )}
                        </div>

                        <CountryPhoneInput
                          countryCode={shippingAddress.countryCode || ""}
                          phone={shippingAddress.phone}
                          onCountryChange={(country: Country) =>
                            setShippingAddress({
                              ...shippingAddress,
                              country: country.name,
                              countryCode: country.code,
                            })
                          }
                          onPhoneChange={(phone: string) =>
                            setShippingAddress({ ...shippingAddress, phone })
                          }
                          error={shippingErrors.countryCode || shippingErrors.phone}
                        />
                        {shippingErrors.phone && (
                          <p className="text-red-600 text-xs mt-1 font-light">
                            {shippingErrors.phone}
                          </p>
                        )}

                        <div>
                          <label className="block text-sm font-light tracking-wider mb-2">
                            COUNTRY <span className="text-red-600">*</span>
                          </label>
                          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg font-light bg-gray-50 text-gray-700">
                            {shippingAddress.country || "Select a country"}
                          </div>
                          {shippingErrors.country && (
                            <p className="text-red-600 text-xs mt-1 font-light">
                              {shippingErrors.country}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-light tracking-wider mb-2">
                            STREET ADDRESS <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.street}
                            onChange={(e) =>
                              setShippingAddress({ ...shippingAddress, street: e.target.value })
                            }
                            className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                              shippingErrors.street
                                ? "border-red-500 focus:border-red-600"
                                : "border-gray-300 focus:border-black"
                            }`}
                            placeholder="123 Main St"
                          />
                          {shippingErrors.street && (
                            <p className="text-red-600 text-xs mt-1 font-light">
                              {shippingErrors.street}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-light tracking-wider mb-2">
                              CITY <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={shippingAddress.city}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, city: e.target.value })
                              }
                              className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                                shippingErrors.city
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-black"
                              }`}
                              placeholder="New York"
                            />
                            {shippingErrors.city && (
                              <p className="text-red-600 text-xs mt-1 font-light">
                                {shippingErrors.city}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-light tracking-wider mb-2">
                              STATE <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={shippingAddress.state}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, state: e.target.value })
                              }
                              className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                                shippingErrors.state
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-black"
                              }`}
                              placeholder="NY"
                            />
                            {shippingErrors.state && (
                              <p className="text-red-600 text-xs mt-1 font-light">
                                {shippingErrors.state}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-light tracking-wider mb-2">
                              ZIP CODE <span className="text-red-600">*</span>
                            </label>
                            <input
                              type="text"
                              value={shippingAddress.zipCode}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                              }
                              className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                                shippingErrors.zipCode
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-black"
                              }`}
                              placeholder="10001"
                            />
                            {shippingErrors.zipCode && (
                              <p className="text-red-600 text-xs mt-1 font-light">
                                {shippingErrors.zipCode}
                              </p>
                            )}
                          </div>
                        </div>

                        {user && (
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveAddressForLater}
                              onChange={(e) => setSaveAddressForLater(e.target.checked)}
                              className="cursor-pointer"
                            />
                            <span className="text-sm font-light">Save this address for future orders</span>
                          </label>
                        )}
                      </>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 luxury-button border-2 border-black text-black px-8 py-4 font-light tracking-widest text-lg hover:bg-gray-50 transition-all duration-500 cursor-pointer"
                      >
                        BACK
                      </button>
                      <button
                        onClick={handleShippingSubmit}
                        className="flex-1 luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-lg hover:bg-gray-800 transition-all duration-500 cursor-pointer"
                      >
                        CONTINUE TO DELIVERY
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Delivery Options */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-4xl font-light tracking-widest mb-8">DELIVERY OPTIONS</h2>
                  <div className="space-y-4 mb-8">
                    {[
                      {
                        id: "standard",
                        name: "Standard Delivery",
                        desc: "5-7 business days",
                        price: 0,
                      },
                      {
                        id: "express",
                        name: "Express Delivery",
                        desc: "2-3 business days",
                        price: 25,
                      },
                      {
                        id: "overnight",
                        name: "Overnight Delivery",
                        desc: "Next business day",
                        price: 50,
                      },
                    ].map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
                          deliveryOption === option.id
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={option.id}
                          checked={deliveryOption === option.id}
                          onChange={(e) => setDeliveryOption(e.target.value)}
                          className="w-5 h-5 cursor-pointer"
                        />
                        <div className="ml-6 grow">
                          <p className="font-light tracking-wider text-lg">{option.name}</p>
                          <p className="text-gray-600 text-sm font-light">{option.desc}</p>
                        </div>
                        <p className="font-light tracking-wider">
                          {option.price === 0 ? "FREE" : `+$${option.price}`}
                        </p>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 luxury-button border-2 border-black text-black px-8 py-4 font-light tracking-widest text-lg hover:bg-gray-50 transition-all duration-500 cursor-pointer"
                    >
                      BACK
                    </button>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="flex-1 luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-lg hover:bg-gray-800 transition-all duration-500 cursor-pointer"
                    >
                      CONTINUE TO PAYMENT
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-4xl font-light tracking-widest mb-8">PAYMENT</h2>

                  <div className="mb-8 space-y-4">
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="ml-4 font-light tracking-wider">Credit/Debit Card</span>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "paypal"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="ml-4 font-light tracking-wider">PayPal</span>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "apple"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="apple"
                        checked={paymentMethod === "apple"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                      />
                      <span className="ml-4 font-light tracking-wider">Apple Pay</span>
                    </label>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="bg-gray-50 p-8 rounded-lg mb-8 space-y-6">
                      <div>
                        <label className="block text-sm font-light tracking-wider mb-2">
                          CARDHOLDER NAME <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardData.cardName}
                          onChange={(e) =>
                            setCardData({ ...cardData, cardName: e.target.value })
                          }
                          className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                            cardErrors.cardName
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-black"
                          }`}
                          placeholder="John Doe"
                        />
                        {cardErrors.cardName && (
                          <p className="text-red-600 text-xs mt-1 font-light">
                            {cardErrors.cardName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-light tracking-wider mb-2">
                          CARD NUMBER <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={cardData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, "");
                            if (/^\d*$/.test(value) && value.length <= 16) {
                              const formatted = value
                                .replace(/(\d{4})/g, "$1 ")
                                .trim();
                              setCardData({ ...cardData, cardNumber: formatted });
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                            cardErrors.cardNumber
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-black"
                          }`}
                          placeholder="4532 1234 5678 9010"
                          maxLength={19}
                        />
                        {cardErrors.cardNumber && (
                          <p className="text-red-600 text-xs mt-1 font-light">
                            {cardErrors.cardNumber}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-light tracking-wider mb-2">
                            EXPIRY (MM/YY) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + "/" + value.slice(2, 4);
                              }
                              setCardData({ ...cardData, expiry: value });
                            }}
                            className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                              cardErrors.expiry
                                ? "border-red-500 focus:border-red-600"
                                : "border-gray-300 focus:border-black"
                            }`}
                            placeholder="12/25"
                            maxLength={5}
                          />
                          {cardErrors.expiry && (
                            <p className="text-red-600 text-xs mt-1 font-light">
                              {cardErrors.expiry}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-light tracking-wider mb-2">
                            CVV <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={cardData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 4) {
                                setCardData({ ...cardData, cvv: value });
                              }
                            }}
                            className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                              cardErrors.cvv
                                ? "border-red-500 focus:border-red-600"
                                : "border-gray-300 focus:border-black"
                            }`}
                            placeholder="123"
                            maxLength={4}
                          />
                          {cardErrors.cvv && (
                            <p className="text-red-600 text-xs mt-1 font-light">
                              {cardErrors.cvv}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 luxury-button border-2 border-black text-black px-8 py-4 font-light tracking-widest text-lg hover:bg-gray-50 transition-all duration-500 cursor-pointer"
                    >
                      BACK
                    </button>
                    <button
                      onClick={handlePaymentSubmit}
                      disabled={isProcessing}
                      className="flex-1 luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-lg hover:bg-gray-800 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          PROCESSING...
                        </div>
                      ) : (
                        `COMPLETE PURCHASE - $${getTotal().toFixed(2)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-8 sticky top-24">
                <h2 className="text-2xl font-light tracking-widest mb-6">ORDER SUMMARY</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-light">Subtotal</span>
                    <span className="font-light">${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-light">Shipping</span>
                    <span className="font-light">
                      {getShippingCost() === 0 ? "FREE" : `$${getShippingCost().toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-light">Tax</span>
                    <span className="font-light">${getTax().toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-light mb-8">
                  <span>TOTAL</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>

                {currentStep === 1 && (
                  <div className="text-sm text-gray-600 font-light space-y-2">
                    <p>Review your items before proceeding to shipping information.</p>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="text-sm text-gray-600 font-light space-y-2">
                    <p>Enter your shipping address to continue.</p>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="text-sm text-gray-600 font-light space-y-2">
                    <p>
                      <strong>Shipping:</strong> {deliveryOption.charAt(0).toUpperCase() + deliveryOption.slice(1)}
                    </p>
                    <p>
                      <strong>Cost:</strong> {getShippingCost() === 0 ? "FREE" : `$${getShippingCost()}`}
                    </p>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="text-sm text-gray-600 font-light space-y-2">
                    <p>
                      <strong>To:</strong> {shippingAddress.firstName} {shippingAddress.lastName}
                    </p>
                    <p>{shippingAddress.street}</p>
                    <p>
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                    </p>
                  </div>
                )}
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
