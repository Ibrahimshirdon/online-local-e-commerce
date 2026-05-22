import { FaFacebook, FaWhatsapp, FaInstagram, FaTwitter, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Footer = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleJoin = () => {
        if (email) {
            navigate('/login', { state: { email } });
        } else {
            navigate('/login');
        }
    };

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
                            Suuqify
                        </Link>
                        <p className="text-gray-400 leading-relaxed">
                            Connecting buyers and sellers in Mudug using digital speed. The most trusted marketplace for locals.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="https://www.facebook.com/ibra.shirdon" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                                <FaFacebook />
                            </a>
                            <a href="https://wa.me/252666251592" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 transition-colors">
                                <FaWhatsapp />
                            </a>
                            <a href="https://www.instagram.com/ibrahim_shirdon/" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                                <FaInstagram />
                            </a>
                            <a href="https://twitter.com/ibrahim_shirdon" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                                <FaTwitter />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-primary-400 transition-colors">Home</Link></li>
                            <li><Link to="/seller/dashboard" className="text-gray-400 hover:text-primary-400 transition-colors">Sell on Market</Link></li>
                            <li><Link to="/favorites" className="text-gray-400 hover:text-primary-400 transition-colors">My Favorites</Link></li>

                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-400">
                                <FaMapMarkerAlt className="mt-1 text-primary-500" />
                                <span>Galkacyo, Mudug, Somalia</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <FaPhone className="text-primary-500" />
                                <span>+252 66 625 1592</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <FaEnvelope className="text-primary-500" />
                                <span>ibra090shirdon@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter (Simplified) */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-white">Stay Updated</h3>
                        <p className="text-gray-400 mb-4">Get the latest deals and updates.</p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-800 text-white px-4 py-3 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
                            />
                            <button onClick={handleJoin} className="bg-primary-600 hover:bg-primary-500 px-4 py-3 rounded-r-lg font-bold transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Suuqify. All rights reserved.</p>
                    <p className="flex items-center gap-1 mt-4 md:mt-0">
                        Developed with <FaHeart className="text-red-500 animate-pulse" /> by <span className="text-white font-semibold">Shirdon Tech</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
