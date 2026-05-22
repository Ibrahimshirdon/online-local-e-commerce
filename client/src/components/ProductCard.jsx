import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaTag, FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import ConfirmDialog from './ConfirmDialog';

const ProductCard = ({ product }) => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    if (!product) return null;

    const [isLiked, setIsLiked] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const whatsappLink = `https://wa.me/${product.shop_phone}?text=Asc, I want this product: ${product.name}`;

    useEffect(() => {
        const checkFavorite = async () => {
            if (user) {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${user.token}` }
                    };
                    const { data } = await axios.get(`/api/favorites/check/${product.id}`, config);
                    setIsLiked(data.isFavorite);
                } catch (error) {
                    console.error(error);
                }
            }
        };
        checkFavorite();
    }, [user, product.id]);

    return (
        <>
            <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/40 hover:border-primary-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none z-0"></div>
                {/* Product Image */}
                <div className="relative h-44 overflow-hidden bg-white z-10 flex items-center justify-center p-2">
                    <img
                        src={
                            product.images && product.images.length > 0
                                ? (product.images[0].image_url.startsWith('http') ? product.images[0].image_url : `${product.images[0].image_url}`)
                                : product.image_url
                                    ? (product.image_url.startsWith('http') ? product.image_url : `${product.image_url}`)
                                    : 'https://via.placeholder.com/400x300?text=No+Image'
                        }
                        alt={product.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Image Count Indicator */}
                    {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 glass-dark text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            {product.images.length}
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
                        <div className="flex gap-2">
                            {product.condition === 'new' && (
                                <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1">
                                    ✨ NEW
                                </span>
                            )}
                            {!!product.is_black_friday && (
                                <span className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-yellow-400 flex items-center gap-1">
                                    🔥 HOT DEAL
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
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
                            className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${isLiked
                                ? 'bg-red-500 text-white scale-110 shadow-red-500/50'
                                : 'bg-white/90 text-gray-600 hover:bg-white hover:scale-110'
                                }`}
                        >
                            <FaHeart className={`text-lg ${isLiked ? 'animate-pulse' : ''}`} />
                        </button>
                    </div>

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <FaEye className="text-lg" />
                                <span>Quick View</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="relative p-4 z-10 bg-white/60">
                    <div className="mb-3">
                        <h3 className="text-base font-bold text-gray-800 mb-1.5 line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {product.name}
                        </h3>

                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                            <FaTag className="text-primary-500" />
                            <span className="font-semibold">{product.brand}</span>
                            {product.model && <span className="text-gray-400">• {product.model}</span>}
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <FaMapMarkerAlt className="text-primary-500" />
                            <span>{product.shop_location || 'Galkacyo'}</span>
                        </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5 font-semibold tracking-wider uppercase">Price</p>
                                <div className="flex flex-col">
                                    {product.discount_price && Number(product.discount_price) > 0 ? (
                                        <>
                                            <span className="text-xs text-gray-400 line-through">${product.price}</span>
                                            <span className="text-2xl font-black text-red-600 flex items-center gap-1">
                                                ${product.discount_price}
                                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">SALE</span>
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-xl font-black gradient-text">
                                            ${product.price}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${product.is_out_of_stock || product.stock <= 0 ? 'bg-red-50 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {product.is_out_of_stock || product.stock <= 0 ? '✗ Out of stock' : '✓ In Stock'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2.5">
                            <Link
                                to={`/product/${product.id}`}
                                className="flex-1 px-3 py-2 bg-white/80 border border-gray-200 text-gray-700 rounded-xl hover:bg-white hover:border-gray-300 transition-all text-sm font-bold text-center hover:shadow-md"
                            >
                                Details
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    // Check if user is logged in
                                    if (!user) {
                                        setShowLoginPrompt(true);
                                        return;
                                    }

                                    addToCart(product);
                                    toast.success('Added to cart!');
                                }}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:shadow-glow-lg transition-all flex items-center justify-center gap-1.5 text-sm font-bold hover:scale-[1.02]"
                            >
                                <FaShoppingCart className="text-base" /> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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

export default ProductCard;
