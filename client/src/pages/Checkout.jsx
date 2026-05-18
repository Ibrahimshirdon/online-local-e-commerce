import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { FaLock, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('online');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        address: '',
        city: 'Galkacyo',
        phone: user?.phone || ''
    });

    const [orderSuccess, setOrderSuccess] = useState(false);

    if (cartItems.length === 0 && !orderSuccess) {
        navigate('/cart');
        return null; // Or render loading/redirect UI
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            const orderData = {
                orderItems: cartItems,
                paymentMethod,
                totalPrice: getCartTotal(),
                shippingAddress: formData // In real app, save address
            };

            await axios.post('/api/orders', orderData, config);

            // Simulation of payment delay
            setTimeout(() => {
                clearCart();
                setLoading(false);
                setOrderSuccess(true);
            }, 2000);

        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Error placing order. Please try again.');
        }
    };

    if (orderSuccess) {
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="p-8 bg-green-50 rounded-full mb-6">
                    <FaMoneyBillWave className="text-6xl text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-xl text-gray-600 mb-8">Thank you for your order.</p>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full mb-8">
                    <p className="text-gray-800 font-medium text-lg mb-2">We will deliver as fast as we can! 🚚💨</p>
                    <p className="text-gray-500 mb-4">Your order is being processed.</p>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Need help? Contact us:</p>
                        <p className="text-xl font-bold text-indigo-600">+252 66 625 1592</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/profile?tab=orders')}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    View Order Status
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Checkout Form */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm">1</span>
                            Shipping Information
                        </h2>
                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-400 focus:outline-none"
                                ></textarea>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm">2</span>
                            Payment Method
                        </h2>

                        <div className="space-y-4">
                            <label className={`block border p-4 rounded-lg cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'hover:border-gray-400'}`}>
                                <div className="flex items-center mb-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div className="ml-3 flex-1 flex justify-between items-center">
                                        <span className="font-medium text-gray-900 flex items-center gap-2"><FaMoneyBillWave className="text-green-600" /> Sahal / EVC Plus</span>
                                        <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">INSTANT</span>
                                    </div>
                                </div>
                                {paymentMethod === 'online' && (
                                    <div className="ml-7 p-4 bg-white border border-gray-200 rounded-lg space-y-3 animate-fadeIn">
                                        <p className="text-sm text-gray-600 mb-2">Enter your mobile number to pay via Sahal/EVC.</p>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                                            <input
                                                type="tel"
                                                placeholder="6X XXXXXX"
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">PIN (Secure)</label>
                                            <input
                                                type="password"
                                                placeholder="****"
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </label>

                            <label className={`block border p-4 rounded-lg cursor-pointer transition-all opacity-60`}>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        disabled
                                        className="h-4 w-4 text-gray-300"
                                    />
                                    <div className="ml-3 flex-1">
                                        <span className="font-medium text-gray-500 flex items-center gap-2"><FaMoneyBillWave /> Cash on Delivery (Currently Unavailable)</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Your Order</h2>
                        <div className="max-h-60 overflow-y-auto mb-4 border-b">
                            {cartItems.map((item) => (
                                <div key={item.product_id} className="flex justify-between py-2 items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded bg-gray-50 overflow-hidden text-xs">
                                            <img
                                                src={item.product.images && item.product.images.length > 0 ? (item.product.images[0].image_url.startsWith('http') ? item.product.images[0].image_url : `${item.product.images[0].image_url}`) : 'https://via.placeholder.com/150'}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">x{item.qty}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium">
                                        ${((item.product.discount_price > 0 ? item.product.discount_price : item.product.price) * item.qty).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-xl">
                                <span>Total</span>
                                <span className="text-primary-600">${getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-2 shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30'}`}
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <FaLock className="text-sm" /> Pay Now ${getCartTotal().toFixed(2)}
                                </>
                            )}
                        </button>

                        <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                            <FaLock className="text-gray-400" /> Secure Encryption. Your payment is safe.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
