import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FaWhatsapp, FaMapMarkerAlt, FaStore, FaHeart } from 'react-icons/fa';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import ConfirmDialog from '../components/ConfirmDialog';

const ProductDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`/api/products/${id}`);
                setProduct(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        const checkFavorite = async () => {
            if (user) {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${user.token}` }
                    };
                    const { data } = await axios.get(`/api/favorites/check/${id}`, config);
                    setIsLiked(data.isFavorite);
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchProduct();
        if (user) checkFavorite();
    }, [id, user]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!product) return <div className="text-center mt-10">Product not found</div>;

    const whatsappLink = `https://wa.me/${product.shop_id?.phone}?text=Asc, I want this product: ${product.name} from Galkacyo Market`;

    // Get all images (from images array or fallback to image_url)
    const allImages = product.images && product.images.length > 0
        ? product.images
        : product.image_url
            ? [{ id: 0, image_url: product.image_url, display_order: 0 }]
            : [];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2">
                        {/* Main Image with Carousel */}
                        <div className="relative bg-gray-100">
                            <img
                                src={
                                    allImages[currentImageIndex]?.image_url.startsWith('http')
                                        ? allImages[currentImageIndex].image_url
                                        : `${allImages[currentImageIndex]?.image_url}`
                                }
                                alt={product.name}
                                className="w-full h-96 object-contain hover:scale-105 transition-transform duration-300"
                            />

                            {/* Navigation Arrows */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* Image Counter */}
                                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {currentImageIndex + 1} / {allImages.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Navigation */}
                        {allImages.length > 1 && (
                            <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                                {allImages.map((img, index) => (
                                    <button
                                        key={img.id || index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                                            ? 'border-primary-500 ring-2 ring-primary-200'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        <img
                                            src={img.image_url.startsWith('http') ? img.image_url : `${img.image_url}`}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-8 md:w-1/2">
                        <div className="flex gap-2 mb-2">
                            {product.is_black_friday && (
                                <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                                    Black Friday Deal
                                </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${product.is_out_of_stock || product.stock <= 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {product.is_out_of_stock || product.stock <= 0 ? 'Out of Stock' : 'In Stock'}
                            </span>
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                            <button
                                onClick={async () => {
                                    if (!user) {
                                        toast.error('Please login to add favorites');
                                        return;
                                    }
                                    try {
                                        const config = {
                                            headers: { Authorization: `Bearer ${user.token}` }
                                        };
                                        const { data } = await axios.post('/api/favorites/toggle', { productId: product.id }, config);
                                        setIsLiked(data.isFavorite);
                                    } catch (error) {
                                        console.error(error);
                                        toast.error('Error updating favorite. Please try again.');
                                    }
                                }}
                                className={`p-3 rounded-full transition-all ${isLiked
                                    ? 'bg-red-50 text-red-500'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                <FaHeart className={`text-xl ${isLiked ? 'animate-pulse' : ''}`} />
                            </button>
                        </div>

                        <div className="mb-6">
                            {product.discount_price && Number(product.discount_price) > 0 ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl text-red-600 font-bold">${product.discount_price}</span>
                                    <span className="text-xl text-gray-400 line-through">${product.price}</span>
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">
                                        {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                                    </span>
                                </div>
                            ) : (
                                <div className="text-3xl text-primary-600 font-bold">${product.price}</div>
                            )}
                        </div>

                        <div className="mb-6 space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                            <p className="text-gray-700"><span className="font-medium">Brand:</span> {product.brand}</p>
                            <p className="text-gray-700"><span className="font-medium">Model:</span> {product.model}</p>
                            <p className="text-gray-700"><span className="font-medium">Condition:</span> <span className="capitalize">{product.condition}</span></p>
                            {product.delivery_info && (
                                <p className="text-gray-700"><span className="font-medium">Delivery:</span> {product.delivery_info}</p>
                            )}
                            {product.delivery_fee && Number(product.delivery_fee) > 0 && (
                                <p className="text-gray-700"><span className="font-medium">Delivery Fee:</span> ${product.delivery_fee}</p>
                            )}
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-lg font-bold text-gray-900 flex justify-between items-center">
                                    <span>Total Price (inc. delivery):</span>
                                    <span className="text-2xl text-primary-700">
                                        ${(Number(product.discount_price > 0 ? product.discount_price : product.price) + Number(product.delivery_fee || 0)).toFixed(2)}
                                    </span>
                                </p>
                            </div>
                            <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>
                        </div>

                        <div className="mb-6 border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2">Seller Info</h3>
                            {product.shop_id ? (
                                <>
                                    <div className="flex items-center mb-2">
                                        <FaStore className="mr-2 text-gray-500" />
                                        {product.shop_id.logo_url && (
                                            <img
                                                src={product.shop_id.logo_url.startsWith('http') ? product.shop_id.logo_url : `${product.shop_id.logo_url}`}
                                                alt={product.shop_id.name}
                                                className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200"
                                            />
                                        )}
                                        <Link to={`/shop/${product.shop_id._id || product.shop_id.id}`} className="text-blue-500 hover:underline font-medium">
                                            {product.shop_id.name}
                                        </Link>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <FaMapMarkerAlt className="mr-2 text-gray-500" />
                                        <span>{product.shop_id.location}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500">Seller information unavailable</p>
                            )}
                        </div>

                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => {
                                    // Check if user is logged in
                                    if (!user) {
                                        setShowLoginPrompt(true);
                                        return;
                                    }

                                    addToCart(product);
                                    toast.success('Added to cart!');
                                }}
                                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors flex items-center justify-center"
                            >
                                <FaStore className="mr-2" /> Add to Cart
                            </button>
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center justify-center"
                            >
                                <FaWhatsapp className="mr-2 text-2xl" /> WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Prompt Dialog */}
            <ConfirmDialog
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                onConfirm={() => {
                    setShowLoginPrompt(false);
                    navigate('/register');
                }}
                title="Create an Account"
                message="You need to create an account to add items to your cart. Join us today and start shopping!"
                type="info"
                confirmText="Create Account"
                cancelText="Maybe Later"
            />
        </>
    );
};

export default ProductDetails;
