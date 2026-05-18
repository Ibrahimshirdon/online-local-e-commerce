import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ShopPolicies from '../components/ShopPolicies';
import ConfirmDialog from '../components/ConfirmDialog';
import {
    FaWhatsapp, FaEnvelope, FaPhone, FaStore, FaClipboardList,
    FaCog, FaChartLine, FaPlus, FaSearch, FaEdit, FaTrash, FaBoxOpen
} from 'react-icons/fa';

const SellerDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    // Form state for new shop
    const [newShop, setNewShop] = useState({
        name: '', description: '', location: '', phone: '', license: '', logo: null
    });
    const [agreedToPolicies, setAgreedToPolicies] = useState(false);

    const [categories, setCategories] = useState([]);

    // Form state for new product
    const [newProduct, setNewProduct] = useState({
        name: '', brand: '', model: '', description: '', price: '', discount_price: '', stock: '', condition: 'new', category_id: 1, delivery_info: '', delivery_fee: '', is_black_friday: false, is_out_of_stock: false, images: []
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditShop, setShowEditShop] = useState(false);
    const [editShopData, setEditShopData] = useState({
        name: '', description: '', location: '', phone: '', license: '', logo: null
    });

    // Stats State
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [stats, setStats] = useState([]);

    // Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };

                // Get Shop
                try {
                    const { data: shopData } = await axios.get('/api/shops/my-shop', config);
                    setShop(shopData);

                    if (shopData && shopData.status === 'approved') {
                        // Get Products
                        const { data: prodData } = await axios.get('/api/products');
                        setProducts(prodData.filter(p => {
                            const pShopId = typeof p.shop_id === 'object' ? (p.shop_id.id || p.shop_id._id) : p.shop_id;
                            return String(pShopId) === String(shopData.id);
                        }));

                        // Get Orders
                        try {
                            const { data: orderData } = await axios.get(`/api/orders/shop/${shopData.id}`, config);
                            setOrders(orderData);
                        } catch (err) {
                            console.error("Error fetching orders:", err);
                        }

                        // Get Categories
                        const { data: catData } = await axios.get('/api/categories');
                        setCategories(catData);
                    }
                } catch (err) {
                    // No shop found
                }

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, authLoading, navigate]);

    const handleCreateShop = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const formData = new FormData();
            formData.append('name', newShop.name);
            formData.append('description', newShop.description);
            formData.append('location', newShop.location);
            formData.append('phone', newShop.phone);
            formData.append('license', newShop.license);
            if (newShop.logo) {
                formData.append('logo', newShop.logo);
            }

            const { data } = await axios.post('/api/shops', formData, config);
            setShop(data);
            // Force reload to ensure state is consistent and "Pending" screen persists
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error creating shop');
        }
    };

    const handleUpdateShop = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const formData = new FormData();
            formData.append('name', editShopData.name);
            formData.append('description', editShopData.description);
            formData.append('location', editShopData.location);
            formData.append('phone', editShopData.phone);
            formData.append('license', editShopData.license);
            if (editShopData.logo) {
                formData.append('logo', editShopData.logo);
            }

            const { data } = await axios.put('/api/shops/my-shop', formData, config);
            setShop(data);
            setShowEditShop(false);
            toast.success('Shop updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error updating shop');
        }
    };

    const openEditShop = () => {
        setEditShopData({
            name: shop.name,
            description: shop.description,
            location: shop.location,
            phone: shop.phone,
            license: shop.license || '',
            logo: null
        });
        setShowEditShop(true);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imagePreviews.length + existingImages.length > 5) {
            toast.error('Maximum 5 images allowed per product');
            return;
        }

        const newImages = [...newProduct.images, ...files];
        setNewProduct({ ...newProduct, images: newImages });

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImagePreview = (index) => {
        const newImages = newProduct.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setNewProduct({ ...newProduct, images: newImages });
        setImagePreviews(newPreviews);
    };

    const removeExistingImage = async (imageId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Image',
            message: 'Are you sure you want to delete this image? This action cannot be undone.',
            type: 'warning',
            onConfirm: async () => {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${user.token}` }
                    };
                    await axios.delete(`/api/products/${editingProduct.id}/images/${imageId}`, config);
                    setExistingImages(existingImages.filter(img => img.id !== imageId));
                    toast.success('Image deleted successfully');
                } catch (error) {
                    console.error(error);
                    toast.error('Error deleting image');
                }
            }
        });
    };



    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (Number(newProduct.discount_price) >= Number(newProduct.price)) {
            toast.error('Discount price must be less than the original price.');
            return;
        }

        if (!editingProduct && newProduct.images.length === 0) {
            toast.error('Please add at least one product image');
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const formData = new FormData();
            formData.append('shop_id', shop.id);
            formData.append('name', newProduct.name);
            formData.append('brand', newProduct.brand);
            formData.append('model', newProduct.model);
            formData.append('description', newProduct.description);
            formData.append('price', newProduct.price);
            formData.append('discount_price', newProduct.discount_price || 0);
            formData.append('stock', newProduct.stock || 0);
            formData.append('condition', newProduct.condition);
            formData.append('category_id', newProduct.category_id);
            formData.append('delivery_info', newProduct.delivery_info);
            formData.append('delivery_fee', newProduct.delivery_fee || 0);
            formData.append('is_black_friday', newProduct.is_black_friday ? 1 : 0);
            formData.append('is_out_of_stock', newProduct.is_out_of_stock ? 1 : 0);

            // Append multiple images
            newProduct.images.forEach(image => {
                formData.append('images', image);
            });

            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct.id}`, formData, config);
                toast.success('Product updated!');
            } else {
                await axios.post('/api/products', formData, config);
                toast.success('Product added!');
            }

            // Refresh products
            const { data: prodData } = await axios.get('/api/products');
            setProducts(prodData.filter(p => {
                const pShopId = typeof p.shop_id === 'object' ? (p.shop_id.id || p.shop_id._id) : p.shop_id;
                return String(pShopId) === String(shop.id);
            }));
            setNewProduct({ name: '', brand: '', model: '', description: '', price: '', discount_price: '', stock: '', condition: 'new', category_id: 1, delivery_info: '', delivery_fee: '', is_black_friday: false, is_out_of_stock: false, images: [] });
            setImagePreviews([]);
            setExistingImages([]);
            setEditingProduct(null);
            setShowAddProduct(false);
        } catch (error) {
            console.error(error);
            toast.error('Error saving product');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            brand: product.brand || '',
            model: product.model || '',
            description: product.description,
            price: product.price,
            discount_price: product.discount_price || '',
            stock: product.stock || '',
            condition: product.condition || 'new',
            category_id: product.category_id || 1,
            delivery_info: product.delivery_info || '',
            delivery_fee: product.delivery_fee || '',
            is_black_friday: product.is_black_friday,
            is_out_of_stock: product.is_out_of_stock,
            images: [] // New images to upload
        });
        setExistingImages(product.images || []);
        setImagePreviews([]);
        setShowAddProduct(true);
        window.scrollTo(0, 0);
    };

    if (authLoading || loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!shop) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Your Shop</h2>

                <ShopPolicies />

                <form onSubmit={handleCreateShop} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                        <input required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            value={newShop.name} onChange={e => setNewShop({ ...newShop, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            value={newShop.description} onChange={e => setNewShop({ ...newShop, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                value={newShop.location} onChange={e => setNewShop({ ...newShop, location: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                            <input required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                value={newShop.phone} onChange={e => setNewShop({ ...newShop, phone: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business License</label>
                        <input required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            placeholder="License Number or URL"
                            value={newShop.license} onChange={e => setNewShop({ ...newShop, license: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Logo (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            onChange={e => setNewShop({ ...newShop, logo: e.target.files[0] })}
                        />
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreedToPolicies}
                                onChange={(e) => setAgreedToPolicies(e.target.checked)}
                                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                required
                            />
                            <span className="text-sm text-gray-700">
                                I have read and agree to the <strong>platform policies</strong> and understand the <strong>$10/month subscription fee</strong>.
                            </span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={!agreedToPolicies}
                        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Create Shop
                    </button>
                </form>
            </div>
        );
    }

    if (shop.status === 'pending') {
        return (
            <div className="max-w-3xl mx-auto mt-10 space-y-6">
                <div className="p-8 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                    <div className="text-yellow-600 text-5xl mb-4">⏳</div>
                    <h2 className="text-2xl font-bold text-yellow-800 mb-2">Waiting for Approval</h2>
                    <p className="text-yellow-700">
                        Your shop <strong>{shop.name}</strong> has been created successfully and is currently under review by the admin.
                        <br />You will be able to add products once approved.
                    </p>
                </div>

                <div className="p-8 bg-blue-50 rounded-xl border-2 border-blue-300">
                    <div className="text-center mb-6">
                        <div className="text-blue-600 text-4xl mb-3">💳</div>
                        <h3 className="text-2xl font-bold text-blue-900 mb-2">Complete Your Payment</h3>
                        <p className="text-blue-700 mb-4">Monthly subscription fee: <span className="text-3xl font-bold">$10</span></p>
                    </div>

                    <div className="bg-white rounded-lg p-6 space-y-4">
                        <h4 className="font-bold text-gray-800 text-lg mb-4">📞 Contact Us to Complete Payment & Activate Your Shop</h4>

                        <div className="space-y-3">
                            <a
                                href="https://wa.me/252666251592"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                            >
                                <FaWhatsapp className="text-2xl text-green-600" />
                                <div>
                                    <p className="font-semibold text-gray-800">WhatsApp</p>
                                    <p className="text-sm text-gray-600">+252 66 625 1592</p>
                                </div>
                            </a>

                            <a
                                href="tel:+252666251592"
                                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                            >
                                <FaPhone className="text-2xl text-blue-600" />
                                <div>
                                    <p className="font-semibold text-gray-800">Phone</p>
                                    <p className="text-sm text-gray-600">+252 66 625 1592</p>
                                </div>
                            </a>

                            <a
                                href="mailto:ibra090shirdon@gmail.com"
                                className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                            >
                                <FaEnvelope className="text-2xl text-purple-600" />
                                <div>
                                    <p className="font-semibold text-gray-800">Email</p>
                                    <p className="text-sm text-gray-600">ibra090shirdon@gmail.com</p>
                                </div>
                            </a>
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700">
                                <strong>Next Steps:</strong>
                            </p>
                            <ol className="list-decimal list-inside text-sm text-gray-600 mt-2 space-y-1">
                                <li>Contact us via WhatsApp, phone, or email</li>
                                <li>Complete the $10 monthly payment</li>
                                <li>We'll approve your shop within 24 hours</li>
                                <li>Start adding products and selling!</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (shop.status === 'rejected') {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-8 bg-red-50 rounded-xl border border-red-200 text-center">
                <div className="text-red-600 text-5xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-red-800 mb-2">Shop Rejected</h2>
                <p className="text-red-700">
                    Your shop application was rejected. Please contact support.
                </p>
            </div>
        );
    }


    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const NavItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 translate-x-1'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon className={`text-lg ${activeTab === id ? 'text-indigo-200' : 'text-gray-500 group-hover:text-indigo-400'}`} />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-72 bg-gray-900 text-white hidden md:flex flex-col fixed h-full shadow-2xl z-20 transition-all duration-300">
                <div className="p-8 border-b border-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
                        <FaStore className="text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Seller<span className="text-indigo-400">Portal</span></h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Dashboard</p>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Management</p>
                    <NavItem id="overview" icon={FaChartLine} label="Overview" />
                    <NavItem id="orders" icon={FaClipboardList} label="Orders" />
                    <NavItem id="products" icon={FaBoxOpen} label="My Products" />
                    <NavItem id="settings" icon={FaCog} label="Shop Settings" />
                </nav>

                <div className="p-6 border-t border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <img
                            src={shop.logo_url?.startsWith('http') ? shop.logo_url : `${shop.logo_url}` || 'https://via.placeholder.com/50'}
                            className="w-10 h-10 rounded-full object-cover border border-gray-700 bg-gray-800"
                            alt="Shop Logo"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate text-white">{shop.name}</p>
                            <p className="text-xs text-green-400 truncate flex items-center gap-1">● {shop.status}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 p-8 lg:p-12 transition-all duration-300">
                {/* Mobile Header */}
                <div className="md:hidden mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900">Seller Dashboard</h1>
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-medium"
                    >
                        <option value="overview">Overview</option>
                        <option value="products">Products</option>
                        <option value="settings">Settings</option>
                    </select>
                </div>

                {/* Content Rendering */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Shop Overview</h2>
                            <p className="text-gray-500 mt-1">Snapshot of your business performance.</p>
                        </div>

                        {/* Shop Info Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
                            <img
                                src={shop.logo_url ? (shop.logo_url.startsWith('http') ? shop.logo_url : `${shop.logo_url}`) : 'https://via.placeholder.com/150'}
                                alt={shop.name}
                                className="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-white ring-1 ring-gray-100"
                            />
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">{shop.name}</h3>
                                <p className="text-gray-600 mb-4 max-w-2xl">{shop.description}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <span className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">📍 {shop.location}</span>
                                    <span className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">📞 {shop.phone}</span>
                                </div>
                            </div>
                            <button onClick={() => setActiveTab('settings')} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
                                Edit Profile
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                                <FaBoxOpen className="absolute right-4 top-4 text-white/10 text-6xl" />
                                <h3 className="text-indigo-100 font-medium mb-1">Total Products</h3>
                                <p className="text-4xl font-bold">{products.length}</p>
                            </div>
                            <div
                                onClick={async () => {
                                    try {
                                        const { data } = await axios.get('/api/shops/my-shop/stats', {
                                            headers: { Authorization: `Bearer ${user.token}` }
                                        });
                                        setStats(data);
                                        setShowStatsModal(true);
                                    } catch (err) {
                                        console.error(err);
                                        toast.error('Failed to load stats');
                                    }
                                }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                            >
                                <FaChartLine className="absolute right-4 top-4 text-gray-100 text-6xl group-hover:text-indigo-50 transition-colors" />
                                <h3 className="text-gray-500 font-medium mb-1">Shop Views</h3>
                                <p className="text-4xl font-bold text-gray-900">{shop.views || 0}</p>
                                <p className="text-xs text-green-500 mt-2 flex items-center gap-1">Click to view history</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                                <FaClipboardList className="absolute right-4 top-4 text-gray-100 text-6xl" />
                                <h3 className="text-gray-500 font-medium mb-1">Orders</h3>
                                <p className="text-4xl font-bold text-gray-900">{orders.length}</p>
                                <p className="text-xs text-gray-400 mt-2">{orders.filter(o => o.status === 'pending').length} Pending</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Modal */}
                {showStatsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowStatsModal(false)}>
                        <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Viewer Activity</h3>
                                <button onClick={() => setShowStatsModal(false)} className="text-gray-400 hover:text-gray-600">Close</button>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-2 border-b border-gray-200 pb-2">
                                {stats.length === 0 ? (
                                    <div className="w-full text-center text-gray-400">No data available for the last 7 days</div>
                                ) : (
                                    stats.map((stat, idx) => {
                                        const max = Math.max(...stats.map(s => s.count), 1); // Avoid div by zero
                                        const height = (stat.count / max) * 100;
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative">
                                                <div
                                                    className="w-full bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-all relative"
                                                    style={{ height: `${height}%`, minHeight: '4px' }}
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {stat.count} views ({stat.fullDate})
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 mt-2 font-medium">{stat.date}</span>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                            <p className="text-center text-gray-400 text-xs mt-4">Activity for the last 7 days</p>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Your Inventory</h2>
                                <p className="text-gray-500 text-sm">Manage your product listings</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                {/* Search Bar */}
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-64 bg-white"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setNewProduct({ name: '', brand: '', model: '', description: '', price: '', discount_price: '', stock: '', condition: 'new', category_id: 1, delivery_info: '', delivery_fee: '', is_black_friday: false, images: [] });
                                        setImagePreviews([]);
                                        setExistingImages([]);
                                        setShowAddProduct(true);
                                    }}
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                                >
                                    <FaPlus /> Add Product
                                </button>
                            </div>
                        </div>

                        {/* Add/Edit Product Section (Conditionally rendered inside tab or as modal could work, keeping inline for now) */}
                        {showAddProduct ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                    <button onClick={() => setShowAddProduct(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                                </div>
                                <div className="p-6 lg:p-8">
                                    <form onSubmit={handleAddProduct} className="space-y-6">
                                        {/* Simplified Grid Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                                    <input required className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. iPhone 15 Pro" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                                        <input className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Brand" value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                                        <input className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Model" value={newProduct.model} onChange={e => setNewProduct({ ...newProduct, model: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                                        <input required type="number" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price ($)</label>
                                                        <input type="number" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={newProduct.discount_price} onChange={e => setNewProduct({ ...newProduct, discount_price: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                                                    <select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={newProduct.condition} onChange={e => setNewProduct({ ...newProduct, condition: e.target.value })}>
                                                        <option value="new">New</option>
                                                        <option value="used">Used</option>
                                                        <option value="refurbished">Refurbished</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Info</label>
                                                    <input className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Ships within 2-3 days" value={newProduct.delivery_info} onChange={e => setNewProduct({ ...newProduct, delivery_info: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee ($)</label>
                                                    <input type="number" step="0.01" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="0.00" value={newProduct.delivery_fee} onChange={e => setNewProduct({ ...newProduct, delivery_fee: e.target.value })} />
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Number</label>
                                                        <input required type="number" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Quantity in stock" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors mb-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={newProduct.is_out_of_stock}
                                                            onChange={e => setNewProduct({ ...newProduct, is_out_of_stock: e.target.checked })}
                                                            className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                                        />
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-900 block">Mark as Out of Stock</span>
                                                            <span className="text-xs text-gray-500">Force the product to show as "Out of Stock"</span>
                                                        </div>
                                                    </label>

                                                    <label className="flex items-center gap-2 cursor-pointer mb-4 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={newProduct.is_black_friday}
                                                            onChange={e => setNewProduct({ ...newProduct, is_black_friday: e.target.checked })}
                                                            className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                        />
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-900 block">Black Friday Deal</span>
                                                            <span className="text-xs text-gray-500">Mark this product as a special Black Friday offer</span>
                                                        </div>
                                                    </label>

                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                    <select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}>
                                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                    <textarea required className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-32" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                                                </div>
                                                {/* Image Upload Area Redesign */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                                                    <div className="grid grid-cols-4 gap-4">
                                                        {existingImages.map(img => (
                                                            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                                                <img src={img.image_url.startsWith('http') ? img.image_url : `${img.image_url}`} className="w-full h-full object-cover" />
                                                                <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><FaTrash /></button>
                                                            </div>
                                                        ))}
                                                        {imagePreviews.map((src, idx) => (
                                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                                                <img src={src} className="w-full h-full object-cover" />
                                                                <button type="button" onClick={() => removeImagePreview(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><FaTrash /></button>
                                                            </div>
                                                        ))}
                                                        {(existingImages.length + imagePreviews.length < 5) && (
                                                            <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors aspect-square">
                                                                <FaPlus className="text-gray-400 text-xl" />
                                                                <span className="text-xs text-gray-500 mt-2">Add</span>
                                                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                                            <button type="button" onClick={() => setShowAddProduct(false)} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                                            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex-1">{editingProduct ? 'Update Product' : 'Create Product'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map(p => (
                                    <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                            {p.images && p.images.length > 0 ? (
                                                <img
                                                    src={p.images[0].image_url.startsWith('http') ? p.images[0].image_url : `${p.images[0].image_url}`}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><FaBoxOpen className="text-4xl" /></div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditProduct(p)} className="p-2 bg-white text-gray-700 rounded-lg shadow-sm hover:text-indigo-600"><FaEdit /></button>
                                                <button onClick={() => {
                                                    if (window.confirm('Delete this product?')) {
                                                        const deleteProd = async () => {
                                                            try {
                                                                await axios.delete(`/api/products/${p.id}`, { headers: { Authorization: `Bearer ${user.token}` } });
                                                                setProducts(products.filter(item => item.id !== p.id));
                                                            } catch (err) { toast.error('Failed to delete'); }
                                                        };
                                                        deleteProd();
                                                    }
                                                }} className="p-2 bg-white text-gray-700 rounded-lg shadow-sm hover:text-red-500"><FaTrash /></button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                                            <p className="text-sm text-gray-500 mb-3 truncate">{p.category_name || 'Category'}</p>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-lg font-bold text-indigo-600">${p.price}</span>
                                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">{p.condition}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.is_out_of_stock || p.stock <= 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {p.is_out_of_stock || p.stock <= 0 ? 'Out of Stock' : 'In Stock'}
                                                </span>
                                                <span className="text-xs text-gray-500">Stock: {p.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {products.length === 0 && !showAddProduct && (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                <FaBoxOpen className="mx-auto text-4xl text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No products found</p>
                                <button onClick={() => setShowAddProduct(true)} className="text-indigo-600 font-semibold mt-2 hover:underline">Add your first product</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                            <p className="text-gray-500 text-sm">Manage new and past orders</p>
                        </div>

                        {orders.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                <FaClipboardList className="mx-auto text-4xl text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Order ID</p>
                                                <p className="font-mono text-gray-800">#{order.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Date</p>
                                                <p className="text-gray-800">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Customer</p>
                                                <p className="text-gray-800 font-medium">{order.customer_name}</p>
                                                {order.phone && (
                                                    <p className="text-sm text-indigo-600 flex items-center gap-1">
                                                        <FaPhone className="text-xs" /> {order.phone}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Delivery To</p>
                                                {order.shipping_address ? (
                                                    <div className="text-sm text-gray-600">
                                                        <p>{order.shipping_address.address}</p>
                                                        <p>{order.shipping_address.city}</p>
                                                    </div>
                                                ) : <span className="text-gray-400 text-sm">N/A</span>}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Payment</p>
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${order.payment_method === 'online'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-orange-50 text-orange-700 border-orange-200'
                                                    }`}>
                                                    {order.payment_method === 'online' ? 'PAID ONLINE' : 'CASH ON DELIVERY'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                                                <p className="text-indigo-600 font-bold">${order.total_amount}</p>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-gray-500 border-b border-gray-100">
                                                    <tr>
                                                        <th className="py-2">Item</th>
                                                        <th className="py-2 text-center">Qty</th>
                                                        <th className="py-2 text-right">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {order.items && order.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="py-3 flex items-center gap-2">
                                                                <img
                                                                    src={item.image_url?.startsWith('http') ? item.image_url : `${item.image_url}`}
                                                                    className="w-10 h-10 rounded object-cover bg-gray-100"
                                                                    alt={item.name}
                                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                                                                />
                                                                <span className="font-medium text-gray-800">{item.name}</span>
                                                            </td>
                                                            <td className="py-3 text-center text-gray-600">x{item.quantity}</td>
                                                            <td className="py-3 text-right font-medium text-gray-800">${item.price}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            setConfirmDialog({
                                                                isOpen: true,
                                                                title: 'Update Order Status',
                                                                message: 'Mark this order as Processing? The customer will be notified.',
                                                                type: 'info',
                                                                confirmText: 'Mark as Processing',
                                                                onConfirm: async () => {
                                                                    try {
                                                                        await axios.put(`/api/orders/${order.id}/status`, { status: 'processing' }, { headers: { Authorization: `Bearer ${user.token}` } });
                                                                        setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'processing' } : o));
                                                                        toast.success('Order marked as processing');
                                                                    } catch (e) { toast.error('Error updating status'); }
                                                                }
                                                            });
                                                        }}
                                                        className="px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Mark as Processing
                                                    </button>
                                                )}
                                                {order.status === 'processing' && (
                                                    <button
                                                        onClick={() => {
                                                            setConfirmDialog({
                                                                isOpen: true,
                                                                title: 'Complete Order',
                                                                message: 'Mark this order as Completed? This confirms the order has been fulfilled.',
                                                                type: 'success',
                                                                confirmText: 'Mark as Completed',
                                                                onConfirm: async () => {
                                                                    try {
                                                                        await axios.put(`/api/orders/${order.id}/status`, { status: 'completed' }, { headers: { Authorization: `Bearer ${user.token}` } });
                                                                        setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
                                                                        toast.success('Order marked as completed');
                                                                    } catch (e) { toast.error('Error updating status'); }
                                                                }
                                                            });
                                                        }}
                                                        className="px-4 py-2 bg-green-50 text-green-600 font-semibold rounded-lg hover:bg-green-100 transition-colors"
                                                    >
                                                        Mark as Completed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Shop Settings</h2>
                            <p className="text-gray-500 text-sm">Update your store information</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
                            <div className="p-8">
                                <form onSubmit={handleUpdateShop} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop Logo</label>
                                        <div className="flex items-center gap-6">
                                            <img
                                                src={editShopData.logo ? URL.createObjectURL(editShopData.logo) : (shop.logo_url?.startsWith('http') ? shop.logo_url : `${shop.logo_url}`)}
                                                className="w-20 h-20 rounded-full object-cover border border-gray-200"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                                            />
                                            <input type="file" accept="image/*" onChange={e => setEditShopData({ ...editShopData, logo: e.target.files[0] })} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                            <input type="text" value={editShopData.name} onChange={e => setEditShopData({ ...editShopData, name: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input type="text" value={editShopData.phone} onChange={e => setEditShopData({ ...editShopData, phone: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea value={editShopData.description} onChange={e => setEditShopData({ ...editShopData, description: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-24" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input type="text" value={editShopData.location} onChange={e => setEditShopData({ ...editShopData, location: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                                    </div>
                                    <div className="pt-2 flex justify-between items-center">
                                        <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">Save Changes</button>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to delete your shop? This action cannot be undone and you will lose all products.')) {
                                                    try {
                                                        const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                                        await axios.delete('/api/shops/my-shop', config);
                                                        toast.success('Shop deleted successfully.');
                                                        window.location.reload();
                                                    } catch (error) {
                                                        console.error(error);
                                                        toast.error('Failed to delete shop.');
                                                    }
                                                }
                                            }}
                                            className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-2"
                                        >
                                            <FaTrash /> Delete Shop
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
            />
        </div>
    );
};

export default SellerDashboard;
