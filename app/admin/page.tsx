"use client";

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
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isViewProductsOpen, setIsViewProductsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "women" as "women" | "men",
    image: ""
  });
  const [newProductErrors, setNewProductErrors] = useState<FormErrors>({});
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "women" as "women" | "men",
    image: ""
  });
  const [editFormErrors, setEditFormErrors] = useState<FormErrors>({});
  const [authLoading, setAuthLoading] = useState(false);

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

  // Form validation functions
  const validateNewProduct = (): boolean => {
    const errors: FormErrors = {};
    if (!newProduct.name.trim()) errors.name = "Product name is required";
    if (!newProduct.description.trim()) errors.description = "Description is required";
    if (!newProduct.price.trim()) errors.price = "Price is required";
    else if (isNaN(parseFloat(newProduct.price)) || parseFloat(newProduct.price) <= 0) errors.price = "Price must be a positive number";
    if (!newProduct.category) errors.category = "Category is required";
    
    setNewProductErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditProduct = (): boolean => {
    const errors: FormErrors = {};
    if (!editFormData.name.trim()) errors.name = "Product name is required";
    if (!editFormData.description.trim()) errors.description = "Description is required";
    if (!editFormData.price.trim()) errors.price = "Price is required";
    else if (isNaN(parseFloat(editFormData.price)) || parseFloat(editFormData.price) <= 0) errors.price = "Price must be a positive number";
    if (!editFormData.category) errors.category = "Category is required";
    
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const savedUser = localStorage.getItem('gucci-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.role === 'admin' || userData.role === 'superadmin') {
        setUser(userData);
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
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

  useEffect(() => {
    if (isViewProductsOpen) {
      loadProducts();
    }
  }, [isViewProductsOpen]);

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateNewProduct()) return;

    setAuthLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image: newProduct.image || '/gu.avif'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewProduct({
          name: "",
          description: "",
          price: "",
          category: "women",
          image: ""
        });
        setNewProductErrors({});
        setIsAddProductOpen(false);
        showToast("Product added successfully", "success");
        // Reload products if view is open
        if (isViewProductsOpen) {
          loadProducts();
        }
      } else {
        showToast(data.message || "Error adding product", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Error adding product", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSideNavOpen(!isSideNavOpen)}
            className="lg:hidden text-2xl cursor-pointer"
          >
            ☰
          </button>
          <h1 className="text-2xl font-serif tracking-widest">ADMIN DASHBOARD</h1>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('gucci-user');
            router.push('/');
          }}
          className="text-red-600 font-light tracking-wide hover:opacity-70 cursor-pointer"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${
            isSideNavOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:relative top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 transition-transform duration-300 z-40 lg:z-0 overflow-y-auto`}
        >
          <div className="p-6 space-y-6">
            <button
              onClick={() => {
                setIsAddProductOpen(true);
                setIsSideNavOpen(false);
              }}
              className="block w-full text-left text-lg font-light tracking-wide text-green-600 hover:opacity-70 transition-opacity cursor-pointer"
            >
              + Add Products
            </button>

            <button
              onClick={() => {
                setIsViewProductsOpen(true);
                setIsSideNavOpen(false);
                loadProducts();
              }}
              className="block w-full text-left text-lg font-light tracking-wide text-green-600 hover:opacity-70 transition-opacity cursor-pointer"
            >
              View All Products
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-light tracking-wide mb-6">Welcome, {user.name}</h2>
            <p className="text-gray-600 mb-4">Click on the sidebar buttons to manage products.</p>
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h1 className="text-2xl font-serif tracking-widest">ADD PRODUCTS</h1>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                ✗
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  PRODUCT NAME <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => {
                    setNewProduct({...newProduct, name: e.target.value});
                    if (newProductErrors.name) {
                      const newErrors = {...newProductErrors};
                      delete newErrors.name;
                      setNewProductErrors(newErrors);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                    newProductErrors.name
                      ? 'border-red-500 focus:border-red-600 bg-red-50'
                      : 'border-gray-300 focus:border-black'
                  }`}
                />
                {newProductErrors.name && (
                  <p className="text-red-600 text-sm mt-1">{newProductErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  DESCRIPTION <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => {
                    setNewProduct({...newProduct, description: e.target.value});
                    if (newProductErrors.description) {
                      const newErrors = {...newProductErrors};
                      delete newErrors.description;
                      setNewProductErrors(newErrors);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                    newProductErrors.description
                      ? 'border-red-500 focus:border-red-600 bg-red-50'
                      : 'border-gray-300 focus:border-black'
                  }`}
                  rows={4}
                />
                {newProductErrors.description && (
                  <p className="text-red-600 text-sm mt-1">{newProductErrors.description}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  PRICE <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => {
                    setNewProduct({...newProduct, price: e.target.value});
                    if (newProductErrors.price) {
                      const newErrors = {...newProductErrors};
                      delete newErrors.price;
                      setNewProductErrors(newErrors);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                    newProductErrors.price
                      ? 'border-red-500 focus:border-red-600 bg-red-50'
                      : 'border-gray-300 focus:border-black'
                  }`}
                />
                {newProductErrors.price && (
                  <p className="text-red-600 text-sm mt-1">{newProductErrors.price}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  CATEGORY <span className="text-red-600">*</span>
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => {
                    setNewProduct({...newProduct, category: e.target.value as "women" | "men"});
                    if (newProductErrors.category) {
                      const newErrors = {...newProductErrors};
                      delete newErrors.category;
                      setNewProductErrors(newErrors);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                    newProductErrors.category
                      ? 'border-red-500 focus:border-red-600 bg-red-50'
                      : 'border-gray-300 focus:border-black'
                  }`}
                >
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                </select>
                {newProductErrors.category && (
                  <p className="text-red-600 text-sm mt-1">{newProductErrors.category}</p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  IMAGE URL (Optional)
                </label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-300"
                  placeholder="Enter image URL (e.g., /gu.avif)"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="flex-1 bg-black text-white px-8 py-3 font-light tracking-widest text-sm hover:bg-gray-800 transition-colors duration-300 rounded-lg disabled:bg-gray-400 cursor-pointer"
                >
                  {authLoading ? "ADDING..." : "ADD PRODUCT"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-1 border border-gray-300 text-black px-8 py-3 font-light tracking-widest text-sm hover:bg-gray-50 transition-colors duration-300 rounded-lg cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View All Products Modal */}
      {isViewProductsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h1 className="text-2xl font-serif tracking-widest">ALL PRODUCTS</h1>
              <button
                onClick={() => setIsViewProductsOpen(false)}
                className="text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                ✗
              </button>
            </div>

            <div className="p-6">
              {products.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No products found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-light text-lg tracking-wide mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-light">₹{product.price}</span>
                          <span className="text-xs uppercase tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded">
                            {product.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setEditFormData({
                              name: product.name,
                              description: product.description,
                              price: product.price.toString(),
                              category: product.category,
                              image: product.image
                            });
                          }}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm font-light tracking-widest hover:bg-blue-700 transition-colors rounded-lg cursor-pointer"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this product?")) {
                              try {
                                const response = await fetch(`/api/products`, {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ productId: product._id })
                                });
                                if (response.ok) {
                                  setProducts(products.filter(p => p._id !== product._id));
                                  showToast("Product deleted successfully", "success");
                                }
                              } catch (error) {
                                console.error("Delete error:", error);
                                showToast("Error deleting product", "error");
                              }
                            }
                          }}
                          className="flex-1 bg-red-600 text-white px-4 py-2 text-sm font-light tracking-widest hover:bg-red-700 transition-colors rounded-lg cursor-pointer"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0">
              <button
                onClick={() => setIsViewProductsOpen(false)}
                className="w-full border border-gray-300 text-black px-8 py-3 font-light tracking-widest text-sm hover:bg-gray-100 transition-colors duration-300 rounded-lg cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 bg-white">
              <h1 className="text-2xl font-serif tracking-widest">EDIT PRODUCT</h1>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-500 hover:text-black transition-colors text-2xl cursor-pointer"
              >
                ✗
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (!validateEditProduct()) return;

                try {
                  const response = await fetch(`/api/products`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      productId: editingProduct._id,
                      name: editFormData.name,
                      description: editFormData.description,
                      price: parseFloat(editFormData.price),
                      category: editFormData.category,
                      image: editFormData.image
                    })
                  });
                  if (response.ok) {
                    const updatedProduct = await response.json();
                    setProducts(products.map(p => p._id === editingProduct._id ? updatedProduct.product || updatedProduct : p));
                    setEditingProduct(null);
                    setEditFormErrors({});
                    showToast("Product updated successfully", "success");
                  } else {
                    showToast("Error updating product", "error");
                  }
                } catch (error) {
                  console.error("Update error:", error);
                  showToast("Error updating product", "error");
                }
              }}
              className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]"
            >
              {/* Product Name */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  PRODUCT NAME <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => {
                    setEditFormData({...editFormData, name: e.target.value});
                    if (editFormErrors.name) {
                      const newErrors = {...editFormErrors};
                      delete newErrors.name;
                      setEditFormErrors(newErrors);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                    editFormErrors.name
                      ? 'border-red-500 focus:border-red-600 bg-red-50'
                      : 'border-gray-300 focus:border-black'
                  }`}
                />
                {editFormErrors.name && (
                  <p className="text-red-600 text-sm mt-1">{editFormErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  DESCRIPTION <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => {
                    setEditFormData({...editFormData, description: e.target.value});
                    if (editFormErrors.description) {
                      const newErrors = {...editFormErrors};
                      delete newErrors.description;
                      setEditFormErrors(newErrors);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                    editFormErrors.description
                      ? 'border-red-500 focus:border-red-600 bg-red-50'
                      : 'border-gray-300 focus:border-black'
                  }`}
                  rows={4}
                />
                {editFormErrors.description && (
                  <p className="text-red-600 text-sm mt-1">{editFormErrors.description}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  PRICE <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => {
                    setEditFormData({...editFormData, price: e.target.value});
                    if (editFormErrors.price) {
                      const newErrors = {...editFormErrors};
                      delete newErrors.price;
                      setEditFormErrors(newErrors);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors duration-300 ${
                    editFormErrors.price
                      ? 'border-red-500 focus:border-red-600 bg-red-50'
                      : 'border-gray-300 focus:border-black'
                  }`}
                />
                {editFormErrors.price && (
                  <p className="text-red-600 text-sm mt-1">{editFormErrors.price}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  CATEGORY
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value as "women" | "men"})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-300"
                >
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-light tracking-widest text-gray-700 mb-2">
                  IMAGE URL
                </label>
                <input
                  type="text"
                  value={editFormData.image}
                  onChange={(e) => setEditFormData({...editFormData, image: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-300"
                />
                {editFormData.image && (
                  <img 
                    src={editFormData.image} 
                    alt="Preview" 
                    className="mt-4 h-40 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-8 py-3 font-light tracking-widest text-sm hover:bg-blue-700 transition-colors duration-300 rounded-lg cursor-pointer"
                >
                  SAVE CHANGES
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 border border-gray-300 text-black px-8 py-3 font-light tracking-widest text-sm hover:bg-gray-50 transition-colors duration-300 rounded-lg cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
