import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import ErrorMessage from '../components/ErrorMessage';
import { FaSpinner, FaShoppingBag, FaRocket, FaTags, FaFire, FaStore, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

const Home = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [featuredShops, setFeaturedShops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        condition: '',
        sort: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, products]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, shopsRes] = await Promise.all([
                axios.get('/api/products'),
                axios.get('/api/shops')
            ]);

            setProducts(productsRes.data);
            setFilteredProducts(productsRes.data);

            // Extract unique categories
            const uniqueCategories = [...new Set(productsRes.data.map(p => p.category_id?.name).filter(Boolean))];
            setCategories(uniqueCategories);

            // Get featured shops (active shops, limited to 4)
            const activeShops = shopsRes.data.filter(s => s.status === 'approved');
            setFeaturedShops(activeShops.slice(0, 4));

            setError(null);
        } catch (error) {
            console.error(error);
            setError('Failed to load marketplace data. Please check connection.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        if (filters.search) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                p.brand?.toLowerCase().includes(filters.search.toLowerCase()) ||
                p.model?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.category) {
            filtered = filtered.filter(p => p.category_id?.name === filters.category);
        }

        if (filters.condition) {
            filtered = filtered.filter(p => p.condition === filters.condition);
        }

        if (filters.sort === 'price_asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'price_desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (filters.sort === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setFilteredProducts(filtered);
    };

    const handleSearch = (searchTerm) => {
        setFilters({ ...filters, search: searchTerm });
    };

    const handleFilterChange = (filterType, value) => {
        setFilters({ ...filters, [filterType]: value });
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-16 pb-12 mt-6 mx-2 md:mx-0">
                {/* Hero Skeleton */}
                <div className="w-full h-[500px] bg-gray-200 rounded-[3rem]"></div>
                
                {/* Categories Skeleton */}
                <div className="space-y-4 px-2">
                    <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="min-w-[120px] h-32 bg-gray-200 rounded-3xl"></div>
                        ))}
                    </div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="space-y-4 px-2">
                    <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[400px]">
                                <div className="h-64 bg-gray-200"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} type="full" onRetry={fetchData} />;
    }

    return (
        <div className="animate-fadeIn space-y-16 pb-12">

            {/* HERO SECTION */}
            <section className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-secondary-800 text-white rounded-[3rem] p-8 md:p-20 shadow-2xl overflow-hidden mt-6 mx-2 md:mx-0 border border-primary-600/20">
                {/* Animated Decorative Blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-float"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-400/20 rounded-full blur-3xl -ml-24 -mb-24 animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-300/10 rounded-full blur-3xl animate-pulse"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 glass-dark px-5 py-3 rounded-full border border-white/20 animate-slide-down">
                            <FaRocket className="text-yellow-300 animate-bounce" />
                            <span className="text-sm font-bold tracking-wide">The #1 Marketplace in Galkacyo</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-tight animate-slide-up text-shadow-lg">
                            Buy & Sell in <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-green-300 to-emerald-400 animate-shimmer bg-shimmer">
                                Digital Speed
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-100 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            Join thousands of trusted sellers and happy buyers. From electronics to fashion, find everything you need locally.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <button
                                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group px-8 py-4 bg-white text-primary-800 rounded-2xl font-bold hover:bg-gray-50 transition-all hover:scale-105 shadow-2xl flex items-center gap-3 hover:shadow-white/20"
                            >
                                Start Shopping
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/seller/dashboard')}
                                className="group px-8 py-4 glass-dark border-2 border-white/30 hover:bg-white/20 text-white rounded-2xl font-bold transition-all flex items-center gap-3 hover:scale-105"
                            >
                                Open Your Shop
                                <FaStore className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                            <div className="text-center">
                                <div className="text-3xl font-black text-yellow-300">500+</div>
                                <div className="text-sm text-gray-300 mt-1">Products</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-green-300">100+</div>
                                <div className="text-sm text-gray-300 mt-1">Sellers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-blue-300">1000+</div>
                                <div className="text-sm text-gray-300 mt-1">Happy Buyers</div>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block relative">
                        {/* Product Preview Grid */}
                        <div className="glass-dark p-8 rounded-3xl backdrop-blur-xl border border-white/20 relative transform hover:rotate-0 transition-all duration-700 rotate-2 hover:scale-105">
                            <div className="grid grid-cols-2 gap-4">
                                {products.slice(0, 4).map((p, idx) => {
                                    const imgUrl = p.images?.[0]?.image_url || p.image_url;
                                    return (
                                        <div key={p.id} className={`bg-white p-4 rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105 ${idx % 2 === 0 ? 'translate-y-4 hover:translate-y-2' : '-translate-y-4 hover:-translate-y-2'}`}>
                                            {imgUrl ?
                                                <img src={imgUrl.startsWith('http') ? imgUrl : `${imgUrl}`} className="w-full h-36 object-cover rounded-xl mb-3 shadow-md" alt={p.name} />
                                                : <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3"></div>
                                            }
                                            <div className="h-3 w-24 bg-gray-200 rounded-full mb-2"></div>
                                            <div className="h-3 w-16 bg-primary-200 rounded-full"></div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORIES SECTION */}
            {categories.length > 0 && (
                <section className="animate-slide-up">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div>
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Browse Categories</h2>
                            <p className="text-gray-600">Find exactly what you're looking for</p>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 px-2 scrollbar-hide">
                        <button
                            onClick={() => handleFilterChange('category', '')}
                            className={`group flex flex-col items-center justify-center min-w-[120px] h-32 rounded-3xl transition-all duration-300 ${!filters.category ? 'bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-glow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100 hover:border-primary-200 hover:scale-105 shadow-soft'}`}
                        >
                            <FaTags className={`text-3xl mb-3 transition-transform group-hover:scale-110 ${!filters.category ? 'animate-bounce' : ''}`} />
                            <span className="font-bold">All</span>
                        </button>
                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleFilterChange('category', cat)}
                                className={`group flex flex-col items-center justify-center min-w-[120px] h-32 rounded-3xl transition-all duration-300 ${filters.category === cat ? 'bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-glow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100 hover:border-primary-200 hover:scale-105 shadow-soft'}`}
                            >
                                <FaShoppingBag className={`text-3xl mb-3 transition-transform group-hover:scale-110 ${filters.category === cat ? 'animate-bounce' : ''}`} />
                                <span className="font-bold text-sm px-3 text-center break-words w-full">{cat}</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* FEATURED SHOPS */}
            {featuredShops.length > 0 && (
                <section className="card-premium p-10 animate-slide-up">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3 mb-2">
                                <FaStore className="text-primary-500" /> Featured Shops
                            </h2>
                            <p className="text-gray-600">Top rated sellers in your area</p>
                        </div>
                        <button className="text-primary-600 font-bold hover:text-primary-700 transition-colors flex items-center gap-2 group">
                            View All
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {featuredShops.map(shop => (
                            <a href={`/shop/${shop.id}`} key={shop.id} className="group block bg-gradient-to-br from-gray-50 to-white hover:from-primary-50 hover:to-secondary-50 border-2 border-gray-100 hover:border-primary-300 rounded-3xl p-6 transition-all duration-500 hover:shadow-xl text-center transform hover:-translate-y-2">
                                <div className="w-24 h-24 mx-auto mb-4 relative">
                                    <img
                                        src={shop.logo_url ? (shop.logo_url.startsWith('http') ? shop.logo_url : `${shop.logo_url}`) : 'https://via.placeholder.com/150'}
                                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                    />
                                    <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-lg"></div>
                                </div>
                                <h3 className="font-black text-gray-800 text-lg mb-2 group-hover:text-primary-600 transition-colors">{shop.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-1 flex items-center justify-center gap-1">
                                    <FaMapMarkerAlt className="text-primary-500" />
                                    {shop.location}
                                </p>
                                <span className="inline-block bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md group-hover:shadow-glow transition-all">
                                    Visit Shop
                                </span>
                            </a>
                        ))}
                    </div>
                </section>
            )}





            {/* MAIN PRODUCTS GRID */}
            <section id="products-section" className="scroll-mt-24 animate-slide-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-gray-800 flex items-center gap-3 mb-2">
                            <FaFire className="text-orange-500 animate-pulse" /> Trending Deals
                        </h2>
                        <p className="text-gray-600 text-lg">Found <span className="font-bold text-primary-600">{filteredProducts.length}</span> amazing items for you</p>
                    </div>
                </div>

                <div className="mb-8">
                    <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, index) => (
                            <div key={product.id} className="animate-fadeInScale" style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'both' }}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <FaShoppingBag className="text-6xl text-gray-300 mb-4 mx-auto" />
                        <h3 className="text-xl font-bold text-gray-800">No products found</h3>
                        <p className="text-gray-500 mb-6">Try different keywords or filters</p>
                        <button onClick={() => setFilters({ search: '', category: '', condition: '', sort: '' })} className="text-primary-600 font-semibold hover:underline">
                            Clear all filters
                        </button>
                    </div>
                )}
            </section>

            {/* Footer CTA */}
            <section className="bg-gray-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold">Ready to scale your business?</h2>
                    <p className="text-gray-400 text-lg">Create your shop today and reach thousands of customers in Galkacyo instantly.</p>
                    <button onClick={() => navigate('/seller/dashboard')} className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-primary-600/30">
                        Start Selling for Free
                    </button>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </section>

        </div>
    );
};

export default Home;
