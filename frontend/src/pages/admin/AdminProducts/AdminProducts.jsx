import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import useApi from '../../../hooks/useApi'
import { useNavigate } from 'react-router-dom'
import ProductStats from './ProductStats'
import ProductList from './ProductList'
import ProductForm from './ProductForm'

const AdminProducts = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Temp states for form inputs
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempSpecKey, setTempSpecKey] = useState('');
  const [tempSpecValue, setTempSpecValue] = useState('');
  const [tempVariantKey, setTempVariantKey] = useState('');
  const [tempVariantValue, setTempVariantValue] = useState('');

  const { 
    data: products = [], 
    loading, 
    error, 
    refetch,
    createData,
    patchData,
    deleteData 
  } = useApi("products");

  const initialAddForm = {
    name: '', category: 'Smartphone', brand: '', price: 0, currency: 'INR',
    stock: 0, images: [], shortDescription: '', features: [], specs: {}, variants: {}, status: 'new'
  };

  const [addForm, setAddForm] = useState(initialAddForm);
  const [editForm, setEditForm] = useState(initialAddForm);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({ ...initialAddForm, ...product });
    setShowEditModal(true);
    toast.info(`Editing product: ${product.name}`);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    try {
      const formattedData = {
        ...editForm,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        id: editingProduct.id
      };
      await patchData(editingProduct.id, formattedData);
      toast.success('Product updated successfully!');
      setShowEditModal(false);
      setEditingProduct(null);
      setEditForm(initialAddForm);
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await deleteData(product.id);
      toast.success(`Product "${product.name}" deleted successfully!`);
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const handleAddProduct = () => {
    setShowAddModal(true);
    setAddForm(initialAddForm);
  };

  const handleSaveNewProduct = async () => {
    try {
      const productId = `${addForm.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const newProduct = {
        ...addForm,
        id: productId,
        price: Number(addForm.price),
        stock: Number(addForm.stock),
        images: addForm.images.length > 0 ? addForm.images : ['https://via.placeholder.com/300x300?text=No+Image']
      };
      await createData(newProduct);
      toast.success('Product added successfully!');
      setShowAddModal(false);
      setAddForm(initialAddForm);
      refetch();
    } catch (error) {
      toast.error('Failed to add product');
      console.error('Error adding product:', error);
    }
  };

  // Helper functions adapted to work with specific forms
  const handleAddFeature = (formType, feature) => {
    const form = formType === 'edit' ? editForm : addForm;
    const setForm = formType === 'edit' ? setEditForm : setAddForm;
    if (feature.trim()) setForm({ ...form, features: [...form.features, feature.trim()] });
  };

  const handleRemoveFeature = (formType, index) => {
    const form = formType === 'edit' ? editForm : addForm;
    const setForm = formType === 'edit' ? setEditForm : setAddForm;
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  };

  const handleAddImage = (formType) => {
    const form = formType === 'edit' ? editForm : addForm;
    const setForm = formType === 'edit' ? setEditForm : setAddForm;
    if (tempImageUrl.trim()) {
      setForm({ ...form, images: [...form.images, tempImageUrl.trim()] });
      setTempImageUrl('');
    }
  };

  const handleRemoveImage = (formType, index) => {
    const form = formType === 'edit' ? editForm : addForm;
    const setForm = formType === 'edit' ? setEditForm : setAddForm;
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const handleAddSpec = (formType) => {
    const form = formType === 'edit' ? editForm : addForm;
    const setForm = formType === 'edit' ? setEditForm : setAddForm;
    if (tempSpecKey.trim() && tempSpecValue.trim()) {
      setForm({ ...form, specs: { ...form.specs, [tempSpecKey.trim()]: tempSpecValue.trim() } });
      setTempSpecKey('');
      setTempSpecValue('');
    }
  };

  const handleRemoveSpec = (formType, key) => {
    const form = formType === 'edit' ? editForm : addForm;
    const setForm = formType === 'edit' ? setEditForm : setAddForm;
    const newSpecs = { ...form.specs };
    delete newSpecs[key];
    setForm({ ...form, specs: newSpecs });
  };

  const handleAddVariant = (formType, variantType) => {
    const form = formType === 'edit' ? editForm : addForm;
    const setForm = formType === 'edit' ? setEditForm : setAddForm;
    if (tempVariantKey.trim() && tempVariantValue.trim()) {
      const currentVariants = { ...form.variants };
      if (!currentVariants[variantType]) currentVariants[variantType] = [];
      setForm({
        ...form,
        variants: { ...currentVariants, [variantType]: [...currentVariants[variantType], tempVariantValue.trim()] }
      });
      setTempVariantValue('');
    }
  };

  const handleRemoveVariant = (formType, variantType, index) => {
    const form = formType === 'edit' ? editForm : addForm;
    const setForm = formType === 'edit' ? setEditForm : setAddForm;
    const currentVariants = { ...form.variants };
    if (currentVariants[variantType]) {
      currentVariants[variantType] = currentVariants[variantType].filter((_, i) => i !== index);
      setForm({ ...form, variants: currentVariants });
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: currency || 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(price);
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const statuses = ['all', 'new', 'active', 'out-of-stock', 'inactive', 'coming-soon'];

  // Prop generators for the Form Component
  const getFormProps = (type) => ({
    form: type === 'edit' ? editForm : addForm,
    setForm: type === 'edit' ? setEditForm : setAddForm,
    tempState: {
      imageUrl: tempImageUrl, specKey: tempSpecKey, specValue: tempSpecValue, 
      variantKey: tempVariantKey, variantValue: tempVariantValue
    },
    setTempState: {
      setImageUrl: setTempImageUrl, setSpecKey: setTempSpecKey, setSpecValue: setTempSpecValue, 
      setVariantKey: setTempVariantKey, setVariantValue: setTempVariantValue
    },
    handlers: {
      onAddFeature: (feat) => handleAddFeature(type, feat),
      onRemoveFeature: (idx) => handleRemoveFeature(type, idx),
      onAddImage: () => handleAddImage(type),
      onRemoveImage: (idx) => handleRemoveImage(type, idx),
      onAddSpec: () => handleAddSpec(type),
      onRemoveSpec: (key) => handleRemoveSpec(type, key),
      onAddVariant: (vType) => handleAddVariant(type, vType),
      onRemoveVariant: (vType, idx) => handleRemoveVariant(type, vType, idx)
    }
  });

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-gray-600">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error loading products</div>
        <div className="text-red-600 text-sm mt-1">{error.message || error}</div>
        <button onClick={refetch} className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <p className="text-gray-600">Manage your product catalog ({products.length} products)</p>
      </div>

      <ProductStats products={products} formatPrice={formatPrice} />

      <ProductList 
        filteredProducts={filteredProducts}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
        categories={categories} statuses={statuses}
        formatPrice={formatPrice}
        handleEdit={handleEdit} handleDelete={handleDelete} handleAddProduct={handleAddProduct}
      />

      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Edit Product: {editingProduct.name}</h3>
                <button onClick={() => { setShowEditModal(false); setEditingProduct(null); setEditForm(initialAddForm); }} className="text-gray-400 hover:text-gray-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ProductForm {...getFormProps('edit')} />

              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button onClick={() => { setShowEditModal(false); setEditingProduct(null); setEditForm(initialAddForm); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
                <button onClick={() => { setShowAddModal(false); setAddForm(initialAddForm); }} className="text-gray-400 hover:text-gray-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <ProductForm {...getFormProps('add')} />

              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button onClick={() => { setShowAddModal(false); setAddForm(initialAddForm); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleSaveNewProduct} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">Add Product</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts