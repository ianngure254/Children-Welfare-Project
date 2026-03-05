import React, { useEffect, useState } from 'react';
import { IoCart, IoHeart, IoAdd, IoRemove, IoCall, IoCard, IoSearch, IoTrash } from 'react-icons/io5';
import PaystackPayment from '../components/PaystackPayment';
import { toast } from 'react-toastify';
import Cake1 from '../assets/Cake1.jpeg';
import Cake2 from '../assets/Cake2.jpeg';
import Cake3 from '../assets/Cake3.jpeg';
import mat1 from '../assets/mat1.jpeg';
import mat2 from '../assets/mat2.jpeg';
import mat3 from '../assets/mat3.jpeg';

const Shop = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userEmail, setUserEmail] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const res = await fetch(`${API}/products?isActive=true`);
        const payload = await res.json().catch(() => ({}));
        const list = Array.isArray(payload) ? payload : (payload?.data || []);
        setProducts(list);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'uniform', label: 'Uniform' },
    { value: 'books', label: 'Books' },
    { value: 'stationery', label: 'Stationery' },
    { value: 'merchandise', label: 'Merchandise' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'other', label: 'Other' }
  ];

  const productList = Array.isArray(products) ? products : [];
  const filteredProducts = productList.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getProductImage = (product) => {
    const firstImage = product.images?.[0]?.url;
    if (firstImage) return firstImage;
    switch (product.category) {
      case 'books':
        return Cake2;
      case 'stationery':
        return mat1;
      case 'merchandise':
        return Cake1;
      case 'equipment':
        return mat2;
      case 'uniform':
        return mat3;
      default:
        return Cake3;
    }
  };

  const isInStock = (product) => {
    if (product.stock?.trackInventory === false) return true;
    return (product.stock?.quantity ?? 0) > 0;
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    toast.success('Payment successful! Thank you for your purchase.');
    setCart([]); // Clear cart after successful payment
    setShowPaymentModal(false);
    // You could also redirect to a success page or show a receipt
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-purple-900 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">BOCC Shop</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Support our Mission through your purchase. All proceeds go to our community programs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Products</h2>
            {loading ? (
              <div className="text-gray-500">Loading products...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => {
                  const inStock = isInStock(product);
                  return (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {product.isFeatured && (
                    <div className="absolute top-2 right-2 z-10">
                      Featured
                    </div>
                  )}
                  
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-purple-600">
                        {(product.currency || 'KES')} {Number(product.price || 0).toLocaleString()}
                      </span>
                      {!inStock && (
                        <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={!inStock}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                        inStock
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <IoCart className="mr-2" />
                      {inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <IoCart className="mr-2" />
                Shopping Cart ({getTotalItems()})
              </h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item._id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <IoTrash />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <IoRemove className="text-sm" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <IoAdd className="text-sm" />
                          </button>
                        </div>
                        <span className="font-medium text-purple-600">
                          KSH {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      KSH {getTotalPrice().toLocaleString()}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <IoCall className="text-2xl text-green-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">M-Pesa</h3>
                <p className="text-gray-600">Pay via M-Pesa to 0720 403 647</p>
                <p className="text-sm text-green-600 font-medium">Instant confirmation</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <IoCard className="text-2xl text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold text-gray-900">Card Payment</h3>
                <p className="text-gray-600">Visa, Mastercard & other cards</p>
                <p className="text-sm text-blue-600 font-medium">Secure online payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Complete Your Purchase</h2>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Total Amount:</p>
                <p className="text-3xl font-bold text-purple-600">
                  NGN {getTotalPrice().toLocaleString()}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email for payment receipt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Payment Methods:</h3>
                <div className="space-y-3">
                  <PaystackPayment
                    email={userEmail}
                    amount={getTotalPrice()}
                    currency="NGN" // Fixed to match Paystack
                    metadata={{
                      cart_items: cart.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                      })),
                      total_amount: getTotalPrice()
                    }}
                    onSuccess={handlePaymentSuccess}
                    onClose={() => setShowPaymentModal(false)}
                    disabled={!userEmail || cart.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    Pay with Card (Paystack)
                  </PaystackPayment>

                  <div className="text-center text-gray-500 text-sm">
                    Or pay via M-Pesa: 0720 403 647
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Support Message */}
        <div className="bg-purple-100 border border-purple-200 rounded-lg p-8 mt-8 text-center">
          <h3 className="text-xl font-bold text-purple-900 mb-4">Support Our Community</h3>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Every purchase directly supports our educational programs, community outreach, and infrastructure development. 
            Thank you for being part of our mission to transform lives through faith and education.
          </p>
          <div className="flex items-center justify-center mt-4 text-purple-600">
            <IoHeart className="mr-2" />
            <span className="font-medium">Made with love by BOCC students</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Shop;
