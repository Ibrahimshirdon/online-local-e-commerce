import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaStore, FaShoppingBag, FaSignOutAlt, FaCog, FaHeart, FaBell, FaHome, FaInfoCircle, FaQuestionCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { getCartCount } = useContext(CartContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/notifications/unread', config);
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/notifications', config);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications', error);
        }
    };

    const handleNotificationClick = () => {
        if (!showNotifications) {
            fetchNotifications();
        }
        setShowNotifications(!showNotifications);
        setShowDropdown(false);
    };

    const markAsRead = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/notifications/${id}/read`, {}, config);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        setShowMobileMenu(false);
        navigate('/');
    };

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
            ? 'glass shadow-xl border-b border-white/20'
            : 'bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 shadow-2xl'
            }`}>
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link
                        to="/"
                        className={`text-2xl font-extrabold transition-all duration-300 flex items-center gap-3 hover:scale-105 ${scrolled ? 'text-primary-600' : 'text-white drop-shadow-lg'
                            }`}
                    >
                        <img src="/logo.png" alt="Galkacyo Market" className="h-12 w-auto drop-shadow-md" />
                        <span className="hidden sm:inline font-black tracking-tight">Galkacyo Market</span>
                        <span className="sm:hidden font-black">GM</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-2 md:space-x-4 lg:space-x-6">

                        {/* DESKTOP ONLY LINKS */}
                        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                            {/* Home Link */}
                            <Link
                                to="/"
                                className={`flex items-center gap-2 px-3 lg:px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 font-medium ${scrolled
                                    ? 'text-primary-600 hover:bg-primary-50 hover:shadow-soft'
                                    : 'text-white hover:bg-white/20 backdrop-blur-sm'
                                    }`}
                            >
                                <FaHome className="text-lg" />
                                <span>Home</span>
                            </Link>

                            <Link
                                to="/about"
                                className={`flex items-center gap-2 px-3 lg:px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 font-medium ${scrolled
                                    ? 'text-primary-600 hover:bg-primary-50 hover:shadow-soft'
                                    : 'text-white hover:bg-white/20 backdrop-blur-sm'
                                    }`}
                            >
                                <FaInfoCircle className="text-lg" />
                                <span>About</span>
                            </Link>

                            {user && (
                                <>
                                    {/* Favorites Link */}
                                    <Link
                                        to="/favorites"
                                        className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all hover:scale-105 ${scrolled
                                            ? 'text-primary-600 hover:bg-primary-50'
                                            : 'text-white hover:bg-white/10'
                                            }`}
                                    >
                                        <FaHeart />
                                        <span>Favorites</span>
                                    </Link>

                                    {/* Seller Dashboard Link */}
                                    {(user.role === 'seller' || user.role === 'shop_owner' || user.role === 'admin') && (
                                        <Link
                                            to="/seller/dashboard"
                                            className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all hover:scale-105 ${scrolled
                                                ? 'text-primary-600 hover:bg-primary-50'
                                                : 'text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <FaStore />
                                            <span>My Shop</span>
                                        </Link>
                                    )}

                                    {/* Admin Dashboard Link */}
                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin/dashboard"
                                            className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all hover:scale-105 ${scrolled
                                                ? 'text-primary-600 hover:bg-primary-50'
                                                : 'text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <FaCog />
                                            <span>Admin</span>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        {/* ALWAYS VISIBLE LINKS (Mobile & Desktop) */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            {user ? (
                                <>

                                {/* Cart Link */}
                                <Link
                                    to="/cart"
                                    className={`relative p-2 rounded-lg transition-all hover:scale-105 ${scrolled
                                        ? 'text-primary-600 hover:bg-primary-50'
                                        : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    <FaShoppingBag className="text-xl" />
                                    {getCartCount() > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                            {getCartCount()}
                                        </span>
                                    )}
                                </Link>

                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={handleNotificationClick}
                                        className={`relative p-2 rounded-lg transition-all hover:scale-105 ${scrolled
                                            ? 'text-primary-600 hover:bg-primary-50'
                                            : 'text-white hover:bg-white/10'
                                            }`}
                                    >
                                        <FaBell className="text-xl" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl py-2 animate-scale-in z-50 max-h-96 overflow-y-auto border border-gray-100">
                                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-primary-50 to-secondary-50">
                                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                                    <FaBell className="text-primary-600" />
                                                    Notifications
                                                </h3>
                                                <button onClick={fetchUnreadCount} className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors">Refresh</button>
                                            </div>
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500 text-sm">
                                                    <FaBell className="text-4xl text-gray-300 mx-auto mb-2" />
                                                    <p>No notifications yet</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {notifications.map(notification => (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-4 hover:bg-gray-50 transition-all cursor-pointer ${!notification.is_read ? 'bg-blue-50 border-l-4 border-primary-500' : ''}`}
                                                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                                                        >
                                                            <p className="text-sm text-gray-800 mb-1 font-medium">{notification.message}</p>
                                                            <p className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* User Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 ${scrolled
                                            ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden border border-white/20">
                                            {user.profile_image ? (
                                                <img
                                                    src={`${user.profile_image}`}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="hidden lg:inline font-medium">{user.name}</span>
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-2 animate-scale-in border border-gray-100 overflow-hidden">
                                            <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden shadow-md ring-2 ring-white">
                                                    {user.profile_image ? (
                                                        <img
                                                            src={`${user.profile_image}`}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-lg">{user.name.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-800 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] uppercase font-bold rounded-full">{user.role}</span>
                                                </div>
                                            </div>

                                            <Link
                                                to="/profile"
                                                onClick={() => setShowDropdown(false)}
                                                className="w-full text-left px-4 py-3 hover:bg-primary-50 flex items-center gap-3 text-gray-700 font-medium transition-all group"
                                            >
                                                <FaUser className="text-primary-600 group-hover:scale-110 transition-transform" />
                                                <span>My Profile</span>
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 font-medium transition-all group"
                                            >
                                                <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="hidden md:flex items-center gap-4">
                                    <Link
                                        to="/register"
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 ${scrolled
                                            ? 'text-primary-600 hover:bg-primary-50'
                                            : 'text-white hover:bg-white/10'
                                            }`}
                                    >
                                        <FaStore />
                                        <span>Sell</span>
                                    </Link>
                                    <Link
                                        to="/login"
                                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 shadow-soft ${scrolled
                                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-glow'
                                            : 'bg-white text-primary-600 hover:shadow-medium'
                                            }`}
                                    >
                                        Login
                                    </Link>
                                </div>
                            </>
                        )}

                        {/* Hamburger Icon (Mobile Only) */}
                        <button
                            onClick={() => setShowMobileMenu(true)}
                            className={`md:hidden p-2 rounded-xl transition-all ${scrolled ? 'text-primary-600 hover:bg-primary-50' : 'text-white hover:bg-white/20'}`}
                        >
                            <FaBars className="text-xl" />
                        </button>

                        </div> {/* End of Always Visible Links */}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}></div>
                    <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl animate-slide-in-right overflow-y-auto flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-primary-50 to-white">
                            <h2 className="text-xl font-black text-gray-800">Menu</h2>
                            <button onClick={() => setShowMobileMenu(false)} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        
                        <div className="flex-1 py-4 px-2 space-y-1">
                            <Link to="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium">
                                <FaHome className="text-lg" /> Home
                            </Link>
                            <Link to="/about" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium">
                                <FaInfoCircle className="text-lg" /> About
                            </Link>

                            {user ? (
                                <>
                                    <Link to="/favorites" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium">
                                        <FaHeart className="text-lg" /> Favorites
                                    </Link>
                                    {(user.role === 'seller' || user.role === 'shop_owner' || user.role === 'admin') && (
                                        <Link to="/seller/dashboard" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium">
                                            <FaStore className="text-lg" /> My Shop
                                        </Link>
                                    )}
                                    {user.role === 'admin' && (
                                        <Link to="/admin/dashboard" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium">
                                            <FaCog className="text-lg" /> Admin Dashboard
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="h-px bg-gray-100 my-4 mx-2"></div>
                                    <Link to="/login" onClick={() => setShowMobileMenu(false)} className="flex justify-center items-center gap-2 px-4 py-3 mx-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:shadow-glow mb-2">
                                        Login
                                    </Link>
                                    <Link to="/register" onClick={() => setShowMobileMenu(false)} className="flex justify-center items-center gap-2 px-4 py-3 mx-2 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100">
                                        <FaStore /> Sell on Galkacyo
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav >
    );
};

export default Navbar;
