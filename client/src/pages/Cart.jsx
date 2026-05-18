import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { FaTrash, FaMinus, FaPlus, FaArrowRight } from 'react-icons/fa';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any products yet.</p>
                <Link to="/" className="px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        {cartItems.map((item) => (
                            <div key={item.product_id} className="p-6 border-b border-gray-100 flex gap-6 items-center">
                                {/* Product Image */}
                                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                                    <img
                                        src={item.product.images && item.product.images.length > 0 ? (item.product.images[0].image_url.startsWith('http') ? item.product.images[0].image_url : `${item.product.images[0].image_url}`) : 'https://via.placeholder.com/150'}
                                        alt={item.product.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        <Link to={`/product/${item.product_id}`} className="hover:text-primary-600">
                                            {item.product.name}
                                        </Link>
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">Shop: {item.product.shop_id?.name || 'Seller'}</p>
                                    <div className="text-lg font-bold text-primary-600">
                                        ${item.product.discount_price > 0 ? item.product.discount_price : item.product.price}
                                    </div>
                                </div>

                                {/* Quantity and Remove */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center border rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.product_id, Math.max(1, item.qty - 1))}
                                            className="px-3 py-1 hover:bg-gray-50 text-gray-600"
                                        >
                                            <FaMinus className="text-xs" />
                                        </button>
                                        <span className="px-3 py-1 font-medium">{item.qty}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product_id, item.qty + 1)}
                                            className="px-3 py-1 hover:bg-gray-50 text-gray-600"
                                        >
                                            <FaPlus className="text-xs" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.product_id)}
                                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                                    >
                                        <FaTrash /> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping Estimate</span>
                                <span>$0.00</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-xl">
                                <span>Total</span>
                                <span className="text-primary-600">${getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
                        >
                            Proceed to Checkout <FaArrowRight />
                        </button>

                        <button
                            onClick={clearCart}
                            className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
