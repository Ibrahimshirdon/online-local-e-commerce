import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import { FaFlag } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

const ShopProfile = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.post('/api/reports', {
                shopId: shop.id,
                reason: reportReason,
                description: reportDescription
            }, config);

            setShowReportModal(false);
            setReportReason('');
            setReportDescription('');
            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            toast.error('Error submitting report.');
        }
    };

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                // Fetch specific shop by ID
                const { data: shopData } = await axios.get(`/api/shops/${id}`);
                setShop(shopData);

                // Fetch all products and filter
                const { data: prodData } = await axios.get('/api/products');

                // Filter products belonging to this shop. 
                // Handle both straight ID checks and populated object checks if backend changes.
                // Assuming backend getProducts populates shop_id usually.
                const shopProducts = prodData.filter(p => {
                    const pShopId = typeof p.shop_id === 'object' ? (p.shop_id.id || p.shop_id._id) : p.shop_id;
                    return String(pShopId) === String(id);
                });

                setProducts(shopProducts);

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchShopData();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    if (!shop) return <div className="text-center mt-10 text-xl text-gray-600">Shop not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Cover Banner */}
            <div className="h-48 md:h-72 w-full bg-gradient-to-r from-primary-600 via-teal-500 to-secondary-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-20"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>

            {/* Profile Header Card */}
            <div className="container mx-auto px-4 relative z-10 -mt-24 mb-8">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-10 border border-white flex flex-col md:flex-row items-center md:items-end gap-6 relative">
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-gray-100 flex-shrink-0 absolute -top-16 md:-top-24 left-1/2 md:left-10 transform -translate-x-1/2 md:-translate-x-0">
                        <img
                            src={shop.logo_url ? (shop.logo_url.startsWith('http') ? shop.logo_url : `${shop.logo_url}`) : 'https://via.placeholder.com/150?text=Shop+Logo'}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="w-full h-16 md:h-0 hidden md:block"></div> {/* Spacer for absolute logo */}
                    <div className="text-center md:text-left flex-1 pt-16 md:pt-0 md:ml-[180px]">
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 drop-shadow-sm">{shop.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-bold text-gray-600">
                            <span className="flex items-center gap-1.5 bg-gray-100 px-4 py-2 rounded-full shadow-inner">
                                📍 {shop.location}
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-100 px-4 py-2 rounded-full shadow-inner">
                                📞 {shop.phone}
                            </span>
                            {shop.license && (
                                <span className="flex items-center gap-1.5 bg-gray-100 px-4 py-2 rounded-full shadow-inner">
                                    📜 Lic: {shop.license}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-2 mt-4 md:mt-0">
                        {user && user.id !== shop.owner_id && (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-bold border border-red-100 hover:shadow-md"
                            >
                                <FaFlag /> Report Shop
                            </button>
                        )}
                    </div>
                </div>
            </div>



            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Received</h3>
                        <p className="text-gray-600 mb-6">
                            Don't worry, your report will be reviewed shortly. If you need immediate assistance or updates, please contact us directly on our support channels:
                        </p>

                        <div className="space-y-3 mb-8">
                            <a href="https://wa.me/252666251592" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition-colors shadow-sm cursor-pointer">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.631 4.229 1.685 5.922l-1.357 4.967 4.162-1.092zm8.016-5.736c.106-.289.414-.403.626-.169.212.234.341.674.391.868.049.194.015.632-.191 1.055-.206.423-.836 1.408-2.618 1.944-1.782.536-3.791.246-5.251-1.213-1.46-1.46-2.075-3.844-1.125-5.831.396-.828 1.107-1.396 1.492-1.386.385.01.693 0 1.098.243.405.243 1.144 1.761 1.198 2.054.053.292-.058.463-.162.585-.104.122-.9 1.114-1.042 1.258-.142.144-.067.436.077.727.144.291.879 1.334 2.115 2.112.56.347 1.117.348 1.117.348z" /></svg>
                                Chat on WhatsApp
                            </a>
                            <a href="https://www.facebook.com/ibra.shirdon" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-3 bg-[#1877F2] text-white rounded-xl font-bold hover:bg-[#165EAB] transition-colors shadow-sm cursor-pointer">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                Message on Facebook
                            </a>
                        </div>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
                        >
                            Close Window
                        </button>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {
                showReportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Report {shop.name}</h3>
                            <form onSubmit={handleReportSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                    <select
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="Scam/Fraud">Scam / Fraud</option>
                                        <option value="Inappropriate Content">Inappropriate Content</option>
                                        <option value="Fake Products">Fake Products</option>
                                        <option value="Harassment">Harassment</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={reportDescription}
                                        onChange={(e) => setReportDescription(e.target.value)}
                                        required
                                        rows="4"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder="Please provide more details..."
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowReportModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                                    >
                                        Submit Report
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Shop Content (About & Products) */}
            <div className="container mx-auto px-4 pb-16">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* About Section - Left Column */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-3xl shadow-soft p-8 border border-gray-100 sticky top-24">
                            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                                <span className="w-8 h-1.5 bg-primary-500 rounded-full"></span> About Shop
                            </h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                {shop.description || "Welcome to our shop! We are excited to offer you the best products and deals. Browse around and feel free to reach out."}
                            </p>
                        </div>
                    </div>

                    {/* Products Section - Right Column */}
                    <div className="lg:w-2/3">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-gray-800">Products</h2>
                            <span className="bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-800 font-bold px-5 py-2 rounded-full text-sm shadow-sm">{products.length} Items</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {products.map((product, index) => (
                                <div key={product.id} className="animate-fadeInScale" style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'both' }}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
                                <div className="text-6xl mb-4 animate-bounce">🛍️</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Yet</h3>
                                <p className="text-gray-500 text-lg">Check back later for exciting items from {shop.name}!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopProfile;
