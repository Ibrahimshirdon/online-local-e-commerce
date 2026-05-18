import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaUsers, FaClipboardList, FaChartLine, FaHistory, FaExternalLinkAlt, FaCheck, FaTimes, FaTrash, FaBan, FaUnlock, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');

    // Data States
    const [users, setUsers] = useState([]);
    const [pendingShops, setPendingShops] = useState([]);
    const [allShops, setAllShops] = useState([]);
    const [reports, setReports] = useState([]);
    const [logs, setLogs] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLogUser, setSelectedLogUser] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };

                const [analyticsRes, usersRes, pendingShopsRes, allShopsRes, reportsRes, logsRes, transactionsRes] = await Promise.all([
                    axios.get('/api/admin/analytics', config),
                    axios.get('/api/admin/users', config),
                    axios.get('/api/shops?status=pending', config),
                    axios.get('/api/shops', config),
                    axios.get('/api/reports', config),
                    axios.get('/api/admin/logs', config),
                    axios.get('/api/admin/transactions', config)
                ]);

                setAnalytics(analyticsRes.data);
                setUsers(usersRes.data);
                setPendingShops(pendingShopsRes.data);
                setAllShops(allShopsRes.data);
                setReports(reportsRes.data);
                setLogs(logsRes.data);
                setTransactions(transactionsRes.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        if (user && user.role === 'admin') fetchData();
    }, [user, authLoading, navigate]);

    // --- Action Handlers ---

    const handleApproveShop = async (shopId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/shops/${shopId}/status`, { status: 'approved' }, config);
            setPendingShops(pendingShops.filter(s => s.id !== shopId));
            setAllShops(allShops.map(s => s.id === shopId ? { ...s, status: 'approved' } : s));
            toast.success('Shop approved successfully');
        } catch (error) {
            toast.error('Error approving shop');
        }
    };

    const handleRejectShop = async (shopId) => {
        if (!window.confirm('Are you sure you want to reject this shop?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/shops/${shopId}/status`, { status: 'rejected' }, config);
            setPendingShops(pendingShops.filter(s => s.id !== shopId));
            setAllShops(allShops.map(s => s.id === shopId ? { ...s, status: 'rejected' } : s));
            toast.success('Shop rejected');
        } catch (error) {
            toast.error('Error rejecting shop');
        }
    };

    const handleDeactivateShop = async (shopId) => {
        if (!window.confirm('Are you sure you want to deactivate this shop?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/admin/shops/${shopId}/deactivate`, {}, config);
            setAllShops(allShops.map(s => s.id === shopId ? { ...s, status: 'deactivated' } : s));
            toast.success('Shop deactivated successfully');
        } catch (error) {
            toast.error('Error deactivating shop');
        }
    };

    const handleActivateShop = async (shopId) => {
        if (!window.confirm('Are you sure you want to activate this shop?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/admin/shops/${shopId}/activate`, {}, config);
            setAllShops(allShops.map(s => s.id === shopId ? { ...s, status: 'approved' } : s));
            toast.success('Shop activated successfully');
        } catch (error) {
            toast.error('Error activating shop');
        }
    };

    const handleDeleteShop = async (shopId) => {
        if (!window.confirm('Are you sure you want to delete this shop? This action cannot be undone.')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Use the new admin delete route
            await axios.delete(`/api/shops/${shopId}`, config);

            // Immediately update the UI
            setAllShops(allShops.filter(s => s.id !== shopId));
            toast.success('Shop deleted successfully');
        } catch (error) {
            console.error(error);
            toast.error('Error deleting shop');
        }
    };

    const handleReportStatus = async (reportId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/reports/${reportId}/status`, { status }, config);
            setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
            toast.success(`Report marked as ${status}`);
        } catch (error) {
            toast.error('Error updating report status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/admin/users/${userId}`, config);
            setUsers(users.filter(u => u.id !== userId));
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error('Error deleting user');
        }
    };

    const handleAddFunds = async (shopId) => {
        const amount = prompt("Enter amount to add (e.g., 10 for $10 deposit, -10 for withdrawal):");
        if (amount) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                await axios.post(`/api/admin/shops/${shopId}/balance`, { amount }, config);
                toast.success('Balance updated successfully');
                // Refresh Data
                const shopsRes = await axios.get('/api/shops', config);
                const transRes = await axios.get('/api/admin/transactions', config);
                setAllShops(shopsRes.data);
                setTransactions(transRes.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to update balance');
            }
        }
    };

    // --- Render Helpers ---

    if (loading || authLoading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredShops = allShops.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const NavItem = ({ id, icon: Icon, label, badge }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 translate-x-1'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`text-lg ${activeTab === id ? 'text-indigo-200' : 'text-gray-500 group-hover:text-indigo-400'}`} />
                <span className="font-medium">{label}</span>
            </div>
            {badge > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === id ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                    {badge}
                </span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Sidebar / Navigation */}
            <aside className="w-72 bg-gray-900 text-white hidden md:flex flex-col fixed h-full shadow-2xl z-20 transition-all duration-300">
                <div className="p-8 border-b border-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
                        <FaChartLine className="text-xl" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin<span className="text-indigo-400">Panel</span></h1>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main Menu</p>
                    <NavItem id="overview" icon={FaChartLine} label="Overview" />
                    <NavItem id="shops" icon={FaStore} label="Shops Management" badge={pendingShops.length > 0 ? pendingShops.length : 0} />
                    <NavItem id="finance" icon={FaMoneyBillWave} label="Finances" />

                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Support & Logs</p>
                    <NavItem id="reports" icon={FaClipboardList} label="Reports Center" badge={reports.filter(r => r.status === 'pending').length} />
                    <NavItem id="users" icon={FaUsers} label="User Directory" />
                    <NavItem id="logs" icon={FaHistory} label="Activity Logs" />
                </nav>

                <div className="p-6 border-t border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold shadow-lg">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 p-8 lg:p-12 transition-all duration-300">
                {/* Header for Mobile */}
                <div className="md:hidden mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <FaChartLine />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">AdminPanel</h1>
                    </div>
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-medium"
                    >
                        <option value="overview">Overview</option>
                        <option value="shops">Shops</option>
                        <option value="finance">Finances</option>
                        <option value="reports">Reports</option>
                        <option value="users">Users</option>
                        <option value="logs">Logs</option>
                    </select>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
                            <p className="text-gray-500 mt-1">Welcome back, {user.name}. Here's what's happening today.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Users Card */}
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 scale-110 group-hover:scale-125">
                                    <FaUsers className="text-8xl" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                                        <FaUsers className="text-2xl" />
                                    </div>
                                    <h3 className="text-blue-100 font-medium text-sm uppercase tracking-wider">Total Users</h3>
                                    <div className="flex items-end gap-2 mt-1">
                                        <p className="text-4xl font-bold">{analytics?.totalUsers || 0}</p>
                                        <span className="text-sm bg-white/20 px-2 py-0.5 rounded text-blue-50 mb-1 backdrop-blur-sm">+12%</span>
                                    </div>
                                    <p className="text-blue-100/70 text-sm mt-4">Active community members</p>
                                </div>
                            </div>

                            {/* Shops Card */}
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 scale-110 group-hover:scale-125">
                                    <FaStore className="text-8xl" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                                        <FaStore className="text-2xl" />
                                    </div>
                                    <h3 className="text-purple-100 font-medium text-sm uppercase tracking-wider">Total Shops</h3>
                                    <div className="flex items-end gap-2 mt-1">
                                        <p className="text-4xl font-bold">{analytics?.totalShops || 0}</p>
                                        <span className="text-sm bg-white/20 px-2 py-0.5 rounded text-purple-50 mb-1 backdrop-blur-sm">+5%</span>
                                    </div>
                                    <p className="text-purple-100/70 text-sm mt-4">Registered vendors</p>
                                </div>
                            </div>

                            {/* Products Card */}
                            <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 scale-110 group-hover:scale-125">
                                    <FaClipboardList className="text-8xl" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                                        <FaClipboardList className="text-2xl" />
                                    </div>
                                    <h3 className="text-orange-100 font-medium text-sm uppercase tracking-wider">Total Products</h3>
                                    <div className="flex items-end gap-2 mt-1">
                                        <p className="text-4xl font-bold">{analytics?.totalProducts || 0}</p>
                                        <span className="text-sm bg-white/20 px-2 py-0.5 rounded text-orange-50 mb-1 backdrop-blur-sm">+8%</span>
                                    </div>
                                    <p className="text-orange-100/70 text-sm mt-4">Items in catalog</p>
                                </div>
                            </div>

                            {/* Clicks Card */}
                            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-teal-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 scale-110 group-hover:scale-125">
                                    <FaExternalLinkAlt className="text-8xl" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
                                        <FaExternalLinkAlt className="text-2xl" />
                                    </div>
                                    <h3 className="text-teal-100 font-medium text-sm uppercase tracking-wider">Engagement</h3>
                                    <div className="flex items-end gap-2 mt-1">
                                        <p className="text-4xl font-bold">{analytics?.totalClicks || 0}</p>
                                        <span className="text-sm bg-white/20 px-2 py-0.5 rounded text-teal-50 mb-1 backdrop-blur-sm">Clicks</span>
                                    </div>
                                    <p className="text-teal-100/70 text-sm mt-4">Total product views</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-gray-800">Pending Shop Approvals</h3>
                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">{pendingShops.length} Pending</span>
                                </div>
                                <div className="p-6">
                                    {pendingShops.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No pending approvals.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {pendingShops.slice(0, 3).map(shop => (
                                                <div key={shop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        {shop.logo_url ? <img src={shop.logo_url} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-gray-200 rounded-full"></div>}
                                                        <div>
                                                            <p className="font-bold text-gray-800">{shop.name}</p>
                                                            <p className="text-xs text-gray-500">{shop.owner_name} • {shop.location}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleApproveShop(shop.id)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"><FaCheck /></button>
                                                        <button onClick={() => handleRejectShop(shop.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><FaTimes /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {pendingShops.length > 3 && (
                                                <button onClick={() => setActiveTab('shops')} className="w-full py-2 text-center text-primary-600 text-sm font-medium hover:bg-gray-50 rounded-lg">View All Pending</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-gray-800">Recent Reports</h3>
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">{reports.filter(r => r.status === 'pending').length} New</span>
                                </div>
                                <div className="p-6">
                                    {reports.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No reports.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {reports.slice(0, 3).map(report => (
                                                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{report.shop_name}</p>
                                                        <p className="text-xs text-red-500 font-medium">{report.reason}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-200'
                                                        }`}>{report.status}</span>
                                                </div>
                                            ))}
                                            <button onClick={() => setActiveTab('reports')} className="w-full py-2 text-center text-primary-600 text-sm font-medium hover:bg-gray-50 rounded-lg">View All Reports</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'shops' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Shops Management</h2>
                                <p className="text-gray-500 text-sm">Monitor and manage vendor stores</p>
                            </div>
                            <div className="relative w-full md:w-72">
                                <input
                                    type="text"
                                    placeholder="Search shops..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <FaStore className="absolute left-3 top-3.5 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Shop Detail</th>
                                            <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Balance</th>
                                            <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Strikes</th>
                                            <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Link</th>
                                            <th className="px-6 py-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredShops.map(shop => (
                                            <tr key={shop.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <img src={shop.logo_url?.startsWith('http') ? shop.logo_url : `${shop.logo_url}` || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm transition-transform group-hover:scale-105" onError={(e) => e.target.src = 'https://via.placeholder.com/50'} />
                                                            {shop.status === 'approved' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{shop.name}</div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-1"><FaUsers className="text-gray-300" /> {shop.owner_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5 ${shop.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                        shop.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                            shop.status === 'deactivated' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                                                'bg-red-100 text-red-700 border border-red-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${shop.status === 'approved' ? 'bg-green-500' :
                                                            shop.status === 'pending' ? 'bg-yellow-500' :
                                                                shop.status === 'deactivated' ? 'bg-gray-500' : 'bg-red-500'
                                                            }`}></span>
                                                        {shop.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-gray-700 font-semibold tracking-tight">
                                                    ${Number(shop.balance || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {shop.strikes > 0 ? (
                                                        <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 w-max">
                                                            <span className="font-bold">{shop.strikes}</span> ⚠️
                                                        </div>
                                                    ) : <span className="text-gray-300">-</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {shop.status === 'approved' ? (
                                                        <a href={`/shop/${shop.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline">
                                                            Visit <FaExternalLinkAlt className="text-xs" />
                                                        </a>
                                                    ) : <span className="text-gray-400 text-sm">-</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        {shop.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleApproveShop(shop.id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:scale-105 transition-all shadow-sm" title="Approve"><FaCheck /></button>
                                                                <button onClick={() => handleRejectShop(shop.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:scale-105 transition-all shadow-sm" title="Reject"><FaTimes /></button>
                                                            </>
                                                        )}
                                                        {shop.status === 'approved' && (
                                                            <>
                                                                <button onClick={() => handleAddFunds(shop.id)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm" title="Add Funds"><FaMoneyBillWave /></button>
                                                                <button onClick={() => handleDeactivateShop(shop.id)} className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 hover:scale-105 transition-all shadow-sm" title="Deactivate"><FaBan /></button>
                                                            </>
                                                        )}
                                                        {shop.status === 'deactivated' && (
                                                            <>
                                                                <button onClick={() => handleAddFunds(shop.id)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 hover:scale-105 transition-all shadow-sm" title="Add Funds"><FaMoneyBillWave /></button>
                                                                <button onClick={() => handleActivateShop(shop.id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:scale-105 transition-all shadow-sm" title="Activate"><FaUnlock /></button>
                                                            </>
                                                        )}
                                                        <button onClick={() => handleDeleteShop(shop.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:scale-105 transition-all shadow-sm" title="Delete"><FaTrash /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-800">Financial Ledger</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Amount</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Shop</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Description</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.length > 0 ? transactions.map(t => (
                                        <tr key={t.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-500">#{t.id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold
                                                    ${t.type === 'RENT' ? 'bg-blue-100 text-blue-700' :
                                                        t.type === 'FINE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-medium text-gray-800">
                                                ${Number(t.amount).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{t.shop_name}</td>
                                            <td className="px-6 py-4 text-gray-600">{t.description}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{new Date(t.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No transactions recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold text-gray-800">Reports Center</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Report Details</th>
                                        <th className="px-6 py-4 font-semibold">Reason</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reports.map(report => (
                                        <tr key={report.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{report.shop_name}</p>
                                                <p className="text-sm text-gray-500">Reported by: {report.reporter_name}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(report.created_at).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-red-600 block mb-1">{report.reason}</span>
                                                <p className="text-sm text-gray-600 italic">"{report.description}"</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-200'
                                                    }`}>{report.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {report.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleReportStatus(report.id, 'resolved')} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">Resolve</button>
                                                        <button onClick={() => handleReportStatus(report.id, 'dismissed')} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Dismiss</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {reports.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500">No reports found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">User Directory</h2>
                            <div className="relative w-64">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <FaUsers className="absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">User Profile</th>
                                        <th className="px-6 py-4 font-semibold">Name</th>
                                        <th className="px-6 py-4 font-semibold">Email</th>
                                        <th className="px-6 py-4 font-semibold">Role</th>
                                        <th className="px-6 py-4 font-semibold">Joined</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold overflow-hidden border border-gray-200 shadow-sm">
                                                    {user.profile_image ? (
                                                        <img
                                                            src={`${user.profile_image}`}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentNode.innerText = user.name.charAt(0).toUpperCase(); }}
                                                        />
                                                    ) : (
                                                        user.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'seller' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>{user.role}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {selectedLogUser ? `Activity Log: ${selectedLogUser}` : 'User Activity Summary'}
                            </h2>
                            {selectedLogUser && (
                                <button
                                    onClick={() => setSelectedLogUser(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                                >
                                    Back to User List
                                </button>
                            )}
                        </div>

                        {!selectedLogUser ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">User Name</th>
                                            <th className="px-6 py-4 font-semibold">Total Actions</th>
                                            <th className="px-6 py-4 font-semibold">Last Active</th>
                                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {Array.from(new Set(logs.map(l => l.user_name || 'System'))).map((userName, index) => {
                                            const userLogs = logs.filter(l => (l.user_name || 'System') === userName);
                                            const lastActive = new Date(Math.max(...userLogs.map(l => new Date(l.created_at))));
                                            return (
                                                <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLogUser(userName)}>
                                                    <td className="px-6 py-4 font-bold text-gray-900">{userName}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                                                            {userLogs.length} Activities
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">{lastActive.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-primary-600 hover:text-primary-800 font-medium text-sm">View History &rarr;</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Time</th>
                                            <th className="px-6 py-4 font-semibold">Action</th>
                                            <th className="px-6 py-4 font-semibold">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {logs.filter(l => (l.user_name || 'System') === selectedLogUser).map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-gray-500 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold uppercase">{log.action}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{log.details}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
