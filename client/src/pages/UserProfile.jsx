import { useState, useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaSpinner, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
    const { user, login } = useContext(AuthContext); // Re-using login to update context user? Ideally need update function
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

    // Profile State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
            if (user.profile_image) {
                setPreview(`${user.profile_image}`);
            }
        }
    }, [user]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === 'orders' && user) {
            fetchOrders();
        }
    }, [activeTab, user]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get('/api/orders/myorders', config);
            setOrders(data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        if (image) {
            formData.append('profile_image', image);
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.put('/api/users/profile', formData, config);

            // Update local storage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            userInfo.name = data.name;
            userInfo.phone = data.phone;
            userInfo.profile_image = data.profile_image;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            // Force reload to update context (or better: add update function to context)
            window.location.reload();

            setMessage('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoadingPassword(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                }
            };

            await axios.put('/api/auth/change-password',
                { currentPassword, newPassword },
                config
            );

            toast.success('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fadeIn">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                <button
                    onClick={() => handleTabChange('profile')}
                    className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'profile' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Profile Settings
                </button>
                <button
                    onClick={() => handleTabChange('orders')}
                    className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === 'orders' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    My Orders
                </button>
            </div>

            {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-hard p-8 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>

                    {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{message}</div>}
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-32 h-32 mb-4">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                                    {preview ? (
                                        <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-4xl font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <label htmlFor="profile-image" className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-primary-600 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <FaCamera />
                                </label>
                                <input
                                    type="file"
                                    id="profile-image"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <p className="text-sm text-gray-500">Click camera icon to change photo</p>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                                <div className="relative">
                                    <FaUser className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Email (Cannot be changed)</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold shadow-soft hover:shadow-glow transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {loading && <FaSpinner className="animate-spin" />}
                                {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>

                    {/* Change Password Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Change Password</h3>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Current Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">New Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loadingPassword}
                                    className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold shadow-soft hover:shadow-glow transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {loadingPassword && <FaSpinner className="animate-spin" />}
                                    {loadingPassword ? 'Updating...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Order History</h2>
                    {loadingOrders ? (
                        <div className="text-center py-12"><FaSpinner className="animate-spin text-4xl text-primary-500 mx-auto" /></div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">No orders found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold">Order #{order.id}</p>
                                            <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.shop_name}</p>
                                                <p className="text-sm text-gray-500">Total: <span className="text-primary-600 font-bold">${order.total_amount}</span></p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Order Items:</p>
                                            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                                        <tr>
                                                            <th className="px-4 py-2 font-medium">Item</th>
                                                            <th className="px-4 py-2 text-center font-medium">Qty</th>
                                                            <th className="px-4 py-2 text-right font-medium">Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {order.items && order.items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="px-4 py-3 flex items-center gap-3">
                                                                    <img
                                                                        src={item.image_url?.startsWith('http') ? item.image_url : `${item.image_url}`}
                                                                        className="w-10 h-10 rounded object-cover bg-gray-100"
                                                                        alt={item.name}
                                                                        onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                                                                    />
                                                                    <span className="font-medium text-gray-800">{item.name}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-gray-600">x{item.quantity}</td>
                                                                <td className="px-4 py-3 text-right font-medium text-gray-800">${item.price}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserProfile;
