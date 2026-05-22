import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaTruck, FaHeadset, FaStore, FaUsers, FaArrowRight } from 'react-icons/fa';

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 animate-fadeIn space-y-16">
            {/* Hero Section */}
            <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                    <div className="inline-block bg-primary-100 text-primary-700 font-bold px-4 py-2 rounded-full text-sm">
                        About Suuqify
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                        Revolutionizing <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                            Digital Commerce
                        </span> in Mudug
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Suuqify is the region's premier online platform designed to bridge the gap between local sellers and buyers.
                        We empower small businesses by providing them with a digital storefront while offering customers a seamless shopping experience
                        from the comfort of their homes.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Whether you are looking for the latest electronics, fashion, or home essentials, our platform ensures quality, trust, and speed.
                    </p>
                    <div className="pt-4 flex flex-wrap gap-4">
                        <button onClick={() => navigate('/register')} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2">
                            Join Our Community <FaArrowRight />
                        </button>
                    </div>
                </div>
                <div className="flex-1 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-secondary-500/20 rounded-3xl transform rotate-3"></div>
                    <img
                        src="/community-marketplace.jpg"
                        alt="Suuqify Community"
                        className="relative rounded-3xl shadow-xl w-full object-cover h-80 md:h-[500px]"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Suuqify'; }}
                    />
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-3xl border border-primary-100">
                    <div className="bg-primary-100 w-12 h-12 rounded-xl flex items-center justify-center text-primary-600 text-2xl mb-4">
                        <FaStore />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                    <p className="text-gray-600 leading-relaxed">
                        To simplify trade in Galkacyo and the wider Mudug region by providing a robust, secure, and user-friendly platform where anyone can start a business and anyone can find what they need.
                    </p>
                </div>
                <div className="bg-gradient-to-br from-secondary-50 to-white p-8 rounded-3xl border border-secondary-100">
                    <div className="bg-secondary-100 w-12 h-12 rounded-xl flex items-center justify-center text-secondary-600 text-2xl mb-4">
                        <FaUsers />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                    <p className="text-gray-600 leading-relaxed">
                        To become the leading digital ecosystem in Somalia that fosters economic growth, community connection, and technological innovation for every citizen.
                    </p>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="text-center space-y-12">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
                    <p className="text-gray-600">We prioritize your experience with top-tier features designed for trust and convenience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-blue-50 p-8 rounded-3xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                        <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 text-3xl mb-6">
                            <FaShieldAlt />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Secure Payments</h3>
                        <p className="text-gray-600">Your transactions are 100% safe. We support Sahal, EVC Plus, and secure online processing.</p>
                    </div>
                    <div className="bg-green-50 p-8 rounded-3xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                        <div className="bg-green-100 p-4 rounded-2xl text-green-600 text-3xl mb-6">
                            <FaTruck />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Local Delivery</h3>
                        <p className="text-gray-600">Fast, reliable delivery from shops right in your neighborhood. Track your order every step.</p>
                    </div>
                    <div className="bg-purple-50 p-8 rounded-3xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                        <div className="bg-purple-100 p-4 rounded-2xl text-purple-600 text-3xl mb-6">
                            <FaHeadset />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">24/7 Support</h3>
                        <p className="text-gray-600">We are here to help you anytime, anywhere. Our dedicated support team is just a click away.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
