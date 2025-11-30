"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CountryPhoneInput from "@/components/CountryPhoneInput";
import { type Country } from "@/lib/countriesWithFlags";
import { getMaxPhoneDigits, extractDigits, getPhoneValidationMessage } from "@/lib/phoneValidation";

interface Address {
  _id: string;
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
  isDefault: boolean;
  createdAt: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function MyAddresses() {
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem("gucci-user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      router.push("/");
    }
  };

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/addresses?userId=${user._id}`);
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      showToast("Failed to load addresses", "error");
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

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!editingAddress) return;

    // Validate required fields
    const errors: { [key: string]: string } = {};
    
    if (!editingAddress.firstName.trim()) errors.firstName = "First name is required";
    if (!editingAddress.lastName.trim()) errors.lastName = "Last name is required";
    if (!editingAddress.email.trim()) errors.email = "Email is required";
    if (!editingAddress.countryCode || !editingAddress.countryCode.trim()) errors.countryCode = "Country is required";
    if (!editingAddress.phone.trim()) errors.phone = "Phone number is required";
    if (!editingAddress.street.trim()) errors.street = "Street address is required";
    if (!editingAddress.city.trim()) errors.city = "City is required";
    if (!editingAddress.state.trim()) errors.state = "State is required";
    if (!editingAddress.zipCode.trim()) errors.zipCode = "ZIP code is required";

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      showToast("Please fill in all required fields", "error");
      return;
    }

    setEditErrors({});

    try {
      setIsSaving(true);
      const url = editingAddress._id ? `/api/addresses/${editingAddress._id}` : '/api/addresses';
      const method = editingAddress._id ? 'PUT' : 'POST';
      
      const payload = {
        ...editingAddress,
        userId: user._id,
      };

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        showToast(editingAddress._id ? "Address updated successfully" : "Address added successfully", "success");
        await loadAddresses();
        setIsEditModalOpen(false);
        setEditingAddress(null);
      } else {
        showToast(data.message || "Failed to save address", "error");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showToast("Failed to save address", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        showToast("Address deleted successfully", "success");
        loadAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast("Failed to delete address", "error");
    }
  };

  const handleSetDefault = async (id: string) => {
    const address = addresses.find((addr) => addr._id === id);
    if (!address) return;

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...address, isDefault: true }),
      });
      const data = await response.json();
      if (data.success) {
        showToast("Default address updated", "success");
        loadAddresses();
      }
    } catch (error) {
      console.error("Error updating default address:", error);
      showToast("Failed to update default address", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Back Button */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-widest mb-4">MY ADDRESSES</h1>
            <p className="text-gray-600 font-light">Manage your saved shipping addresses</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 border border-black text-black font-light tracking-wider hover:bg-black hover:text-white transition-all cursor-pointer"
          >
            BACK TO HOME
          </button>
        </div>

        {/* Toasts */}
        <div className="fixed top-20 right-6 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-6 py-3 rounded-lg text-white font-light whitespace-nowrap ${
                toast.type === "success"
                  ? "bg-green-600"
                  : toast.type === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-light">Loading addresses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Address Card */}
            <div
              onClick={() => {
                setEditingAddress({
                  _id: '',
                  firstName: '',
                  lastName: '',
                  email: user?.email || '',
                  phone: '',
                  street: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  country: '',
                  countryCode: '',
                  isDefault: false,
                  createdAt: new Date().toISOString(),
                });
                setEditErrors({});
                setIsEditModalOpen(true);
              }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-black hover:shadow-lg transition-all cursor-pointer flex items-center justify-center min-h-[300px]"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">+</div>
                <h3 className="text-lg font-light tracking-wider">ADD NEW ADDRESS</h3>
                <p className="text-sm text-gray-600 font-light mt-2">Add a new shipping address</p>
              </div>
            </div>
            {addresses.map((address) => (
              <div
                key={address._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                {/* Default Badge */}
                {address.isDefault && (
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs bg-black text-white px-3 py-1 rounded">DEFAULT</span>
                  </div>
                )}

                {/* Address Content */}
                <div className="space-y-3 mb-6">
                  <p className="font-light text-lg">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm text-gray-600 font-light">{address.street}</p>
                  <p className="text-sm text-gray-600 font-light">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-sm text-gray-600 font-light">{address.country}</p>
                  <p className="text-sm text-gray-600 font-light">{address.phone}</p>
                  <p className="text-sm text-gray-600 font-light">{address.email}</p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="w-full luxury-button border-2 border-black text-black px-4 py-2 font-light tracking-wider text-sm hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    EDIT
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="w-full luxury-button border-2 border-gray-300 text-gray-700 px-4 py-2 font-light tracking-wider text-sm hover:border-black transition-all cursor-pointer"
                    >
                      SET AS DEFAULT
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="w-full luxury-button border-2 border-red-500 text-red-600 px-4 py-2 font-light tracking-wider text-sm hover:bg-red-50 transition-all cursor-pointer"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingAddress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-3xl font-light tracking-widest mb-8">
              {editingAddress._id ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
            </h2>

            <div className="space-y-6">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light tracking-wider mb-2">
                    FIRST NAME <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={editingAddress.firstName}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, firstName: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                      editErrors.firstName
                        ? "border-red-500 focus:border-red-600"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  {editErrors.firstName && (
                    <p className="text-red-600 text-xs mt-1 font-light">{editErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-light tracking-wider mb-2">
                    LAST NAME <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={editingAddress.lastName}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, lastName: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all ${
                      editErrors.lastName
                        ? "border-red-500 focus:border-red-600"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  {editErrors.lastName && (
                    <p className="text-red-600 text-xs mt-1 font-light">{editErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-light tracking-wider mb-2">
                  EMAIL <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={editingAddress.email}
                  onChange={(e) =>
                    setEditingAddress({ ...editingAddress, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all border-gray-300 focus:border-black"
                />
              </div>

              {/* Country Code & Phone */}
              <CountryPhoneInput
                countryCode={editingAddress.countryCode || ""}
                phone={editingAddress.phone}
                onCountryChange={(country: Country) =>
                  setEditingAddress({
                    ...editingAddress,
                    country: country.name,
                    countryCode: country.code,
                  })
                }
                onPhoneChange={(phone: string) =>
                  setEditingAddress({ ...editingAddress, phone })
                }
                error={editErrors.countryCode || editErrors.phone}
              />

              {/* Country */}
              <div>
                <label className="block text-sm font-light tracking-wider mb-2">
                  COUNTRY <span className="text-red-600">*</span>
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg font-light bg-gray-50 text-gray-700">
                  {editingAddress.country || "Select a country"}
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-light tracking-wider mb-2">
                  STREET ADDRESS <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="123 Main St"
                  value={editingAddress.street}
                  onChange={(e) =>
                    setEditingAddress({ ...editingAddress, street: e.target.value })
                  }
                  className="w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all border-gray-300 focus:border-black"
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-light tracking-wider mb-2">
                    CITY <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={editingAddress.city}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all border-gray-300 focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light tracking-wider mb-2">
                    STATE <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="NY"
                    value={editingAddress.state}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, state: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all border-gray-300 focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light tracking-wider mb-2">
                    ZIP CODE <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="10001"
                    value={editingAddress.zipCode}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, zipCode: e.target.value })
                    }
                    className="w-full px-4 py-3 border rounded-lg font-light focus:outline-none transition-all border-gray-300 focus:border-black"
                  />
                </div>
              </div>

              {/* Country & Default Checkbox */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    checked={editingAddress.isDefault}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, isDefault: e.target.checked })
                    }
                    className="cursor-pointer w-4 h-4"
                  />
                  <span className="text-sm font-light tracking-wider">SET AS DEFAULT</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingAddress(null);
                }}
                className="flex-1 luxury-button border-2 border-black text-black px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-50 transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={isSaving}
                className="flex-1 luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "SAVING..." : editingAddress._id ? "UPDATE ADDRESS" : "ADD ADDRESS"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
