// src/pages/Admin/Product.jsx
import { useState, useEffect, useRef } from 'react';
import { FiShoppingCart, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiActivity, FiDollarSign, FiPackage, FiTag } from 'react-icons/fi';
import adminApi from '../../services/adminApi';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'general',
    stock: '',
    sku: '',
    images: [],
    isActive: true,
    features: []
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchProducts(true);
      }, 30000); // Refresh every 30 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  // Fetch products
  const fetchProducts = async (refresh = false) => {
    try {
      if (!refresh) setLoading(true);
      const data = await adminApi.getProducts();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setProducts(list);
      setLastUpdated(new Date().toISOString());
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search and category
  const productList = Array.isArray(products) ? products : [];
  const filteredProducts = productList.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(product =>
    !categoryFilter || product.category === categoryFilter
  );

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrls = Array.isArray(formData.images)
        ? formData.images.filter((url) => typeof url === 'string' && url.trim() !== '').map((url) => url.trim())
        : [];
      const tags = formData.features.filter(f => f.trim() !== '');
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        sku: formData.sku?.trim() || undefined,
        price: parseFloat(formData.price) || 0,
        stock: { quantity: parseInt(formData.stock, 10) || 0 },
        images: imageUrls.map((url) => ({ url })),
        tags,
        isActive: formData.isActive
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct._id, productData);
      } else {
        await adminApi.createProduct(productData);
      }

      await fetchProducts();
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
  };

  // Handle delete
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminApi.deleteProduct(productId);
        await fetchProducts();
      } catch (err) {
        setError(err.message || 'Failed to delete product');
      }
    }
  };

  // Modal handlers
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'uniform',
        stock: product.stock?.quantity ?? '',
        sku: product.sku || '',
        images: (Array.isArray(product.images) ? product.images : []).map((img) => img?.url).filter(Boolean),
        isActive: product.isActive !== false,
        features: product.tags || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'uniform',
        stock: '',
        sku: '',
        images: [],
        isActive: true,
        features: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError('');
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle features array
  const handleFeatureChange = (index, value) => {
    setFormData(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return { ...prev, features: newFeatures };
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const categories = ['uniform', 'books', 'stationery', 'merchandise', 'equipment', 'other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your store inventory and products</p>
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                autoRefresh 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <FiActivity className="inline mr-1" size={14} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            {autoRefresh && (
              <span className="text-gray-500 text-sm">
                Refreshes every 30 seconds
              </span>
            )}
            {lastUpdated && (
              <span className="text-gray-500 text-sm">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <FiPlus size={20} />
          Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{filteredProducts.length} of {productList.length} products</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={() => handleOpenModal(product)}
              onDelete={() => handleDelete(product._id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <FiShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter ? 'Try adjusting your search or filter criteria' : 'Get started by adding your first product'}
          </p>
          {!searchTerm && !categoryFilter && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-all"
            >
              <FiPlus size={20} />
              Add Product
            </button>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          formData={formData}
          editingProduct={editingProduct}
          categories={categories}
          onInputChange={handleInputChange}
          onFeatureChange={handleFeatureChange}
          addFeature={addFeature}
          removeFeature={removeFeature}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          error={error}
        />
      )}
    </div>
  );
};

// Product Card Component
function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800 truncate">{product.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="mb-4">
          {product.images && product.images.length > 0 ? (
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <img 
                src={product.images[0]?.url || product.images[0]} 
                alt={product.name}
                className="h-full w-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <FiPackage className="hidden text-gray-400" size={48} />
            </div>
          ) : (
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiPackage className="text-gray-400" size={48} />
            </div>
          )}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiDollarSign size={16} />
              <span className="font-semibold text-gray-800">
                {(product.currency || 'KES')} {product.price}
              </span>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${
              (product.stock?.quantity ?? 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {(product.stock?.quantity ?? 0) > 0 ? `${product.stock.quantity} in stock` : 'Out of stock'}
            </span>
          </div>
          {product.sku && (
            <div className="flex items-center gap-2">
              <FiTag size={16} />
              <span>SKU: {product.sku}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="text-xs text-gray-500 capitalize">{product.category}</span>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Edit product"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Delete product"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Modal Component
function ProductModal({ 
  formData, 
  editingProduct, 
  categories, 
  onInputChange, 
  onFeatureChange, 
  addFeature, 
  removeFeature, 
  onSubmit, 
  onClose, 
  error 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={onInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={onInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => onFeatureChange(index, e.target.value)}
                      placeholder="Enter a feature"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Feature
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={onInputChange}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Product is active
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductManagement;
