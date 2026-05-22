import { FaSearch, FaShoppingCart, FaCreditCard, FaStore, FaMoneyBillWave, FaQuestionCircle, FaUser, FaTruck, FaTags, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { useState } from 'react';

const Help = () => {
    const [activeTab, setActiveTab] = useState('buyer');

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 animate-fadeIn">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                    <FaQuestionCircle /> Help Center
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
                    How can we <span className="text-primary-600">help you?</span>
                </h1>
                <p className="text-lg text-gray-600">
                    Welcome to the Suuqify guide. Whether you want to buy amazing products or start your own shop, we've got you covered.
                </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex justify-center mb-12">
                <div className="bg-gray-100 p-1.5 rounded-xl inline-flex">
                    <button
                        onClick={() => setActiveTab('buyer')}
                        className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'buyer' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        For Buyers
                    </button>
                    <button
                        onClick={() => setActiveTab('seller')}
                        className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'seller' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        For Sellers
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto">
                {activeTab === 'buyer' ? (
                    <div className="space-y-8 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-center mb-8">How to Buy on Suuqify</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <StepCard
                                icon={<FaSearch />}
                                color="blue"
                                number="1"
                                title="Find Products"
                                desc="Use the search bar or browse categories to find exactly what you're looking for. You can filter by price, shop, and more."
                            />
                            <StepCard
                                icon={<FaShoppingCart />}
                                color="green"
                                number="2"
                                title="Add to Cart"
                                desc="Click the 'Add to Cart' button on any product. You can review your items and update quantities in the Cart page."
                            />
                            <StepCard
                                icon={<FaCreditCard />}
                                color="purple"
                                number="3"
                                title="Secure Checkout"
                                desc="Proceed to checkout. Enter your shipping details and choose to pay via Sahal/EVC Plus or Cash on Delivery."
                            />
                            <StepCard
                                icon={<FaTruck />}
                                color="orange"
                                number="4"
                                title="Fast Delivery"
                                desc="Sit back and relax! The seller will process your order and our delivery partners will bring it to your doorstep."
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-center mb-8">How to Sell on Suuqify</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <StepCard
                                icon={<FaUser />}
                                color="indigo"
                                number="1"
                                title="Create Account"
                                desc="Register as a user first. Then, go to your profile and click 'Become a Seller' or 'Open Shop'."
                            />
                            <StepCard
                                icon={<FaStore />}
                                color="pink"
                                number="2"
                                title="Setup Shop"
                                desc="Fill in your shop details, upload a logo, and provide verification documents tailored for trusted business."
                            />
                            <StepCard
                                icon={<FaTags />}
                                color="teal"
                                number="3"
                                title="List Products"
                                desc="Once approved, use your Seller Dashboard to add products, set prices, manage inventory, and upload photos."
                            />
                            <StepCard
                                icon={<FaMoneyBillWave />}
                                color="emerald"
                                number="4"
                                title="Start Earning"
                                desc="Receive orders instantly on your dashboard. Fulfill them, update status, and grow your business online!"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* FAQ / Support Teaser */}
            <div className="mt-20 bg-gray-50 rounded-3xl p-8 text-center border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
                <p className="text-gray-600 mb-6">Our support team is available 24/7 to assist you.</p>
                <div className="flex justify-center gap-4">
                    <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        Read FAQ
                    </button>
                    <a href="mailto:ibra090shirdon@gmail.com" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2">
                        <FaEnvelope /> Email Support
                    </a>
                    <a href="https://wa.me/252666251592" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors shadow-lg flex items-center gap-2">
                        <FaWhatsapp /> WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
};

const StepCard = ({ icon, color, number, title, desc }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        indigo: 'bg-indigo-100 text-indigo-600',
        pink: 'bg-pink-100 text-pink-600',
        teal: 'bg-teal-100 text-teal-600',
        emerald: 'bg-emerald-100 text-emerald-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${colorClasses[color]} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
            <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color]}`}>
                        {icon}
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold`}>
                        {number}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
};



export default Help;
