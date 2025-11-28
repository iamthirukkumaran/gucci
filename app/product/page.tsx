"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

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

export default function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  // Mock product images (in real app, these would come from the product data)
  const productImages = [
    "/mens-bag-gu.avif",
    "/gu.avif",
    "/men.avif",
    "/mens-bag-gu.avif"
  ];

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
    loadCart();
    checkAuthStatus();
  }, [productId]);

  useEffect(() => {
    if (product) {
      loadRelatedProducts();
    }
  }, [product]);

  const loadProduct = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        const foundProduct = data.products.find((p: Product) => p._id === productId);
        setProduct(foundProduct);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success && product) {
        const related = data.products
          .filter((p: Product) => p._id !== product._id && p.category === product.category)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

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
      setIsAdmin(userData.role === 'admin');
    }
  };

  const addToCart = () => {
    if (!product) return;

    const existingItem = cart.find(item => item.id === product._id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product._id ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      newCart = [...cart, {
        id: product._id,
        name: product.name,
        price: product.price,
        image: productImages[0],
        quantity: quantity
      }];
    }
    
    setCart(newCart);
    localStorage.setItem('gucci-cart', JSON.stringify(newCart));
    alert('Product added to cart!');
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-500 mb-4">Product not found</h2>
          <button
            onClick={() => router.push('/products')}
            className="luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-sm hover:bg-gray-800 transition-all duration-500 cursor-pointer"
          >
            BROWSE PRODUCTS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="font-light hover:underline tracking-wider text-sm cursor-pointer"
          >
            ← BACK
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

      {/* Product Detail Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Images */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={productImages[selectedImage]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 cursor-pointer ${
                      selectedImage === index ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <span className={`inline-block px-3 py-1 text-xs tracking-widest rounded mb-4 ${
                  product.category === 'women' 
                    ? 'bg-pink-100 text-pink-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {product.category.toUpperCase()} COLLECTION
                </span>
                <h1 className="text-4xl font-light tracking-wide text-black mb-4">
                  {product.name}
                </h1>
                <p className="text-3xl font-light text-gray-900 mb-6">
                  ${product.price}
                </p>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <label className="block text-sm font-light tracking-widest">QUANTITY</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-4 py-2 hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-l border-r border-gray-300 min-w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-4 py-2 hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">Max 10 items</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                className="w-full luxury-button bg-black text-white px-8 py-4 font-light tracking-widest text-lg hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1 cursor-pointer"
              >
                ADD TO CART - ${(product.price * quantity).toFixed(2)}
              </button>

              {/* Product Features */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-light tracking-widest mb-4">PRODUCT FEATURES</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Premium quality materials
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Authentic Gucci craftsmanship
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Free shipping worldwide
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    30-day return policy
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-light tracking-widest text-center mb-12">
              YOU MIGHT ALSO LIKE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <div 
                  key={relatedProduct._id}
                  className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                  onClick={() => router.push(`/product/${relatedProduct._id}`)}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={productImages[0]}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-light text-black tracking-wide mb-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-gray-600 text-lg">${relatedProduct.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}