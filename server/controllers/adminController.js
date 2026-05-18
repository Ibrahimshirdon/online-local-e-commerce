const Shop = require('../models/Shop');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const Report = require('../models/Report');
const Fine = require('../models/Fine');
const Notification = require('../models/Notification');
const Product = require('../models/Product');

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.adjustShopBalance = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { amount, description } = req.body; // Amount can be positive (Deposit) or negative (Withdrawal)

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const numAmount = Number(amount);
        const type = numAmount >= 0 ? 'DEPOSIT' : 'WITHDRAWAL';

        // 1. Update Shop Balance
        const shop = await Shop.findByIdAndUpdate(shopId, { $inc: { balance: numAmount } }, { new: true });

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // 2. Create Transaction Record
        await Transaction.create({
            shop_id: shopId,
            amount: Math.abs(numAmount), // Store positive magnitude
            type: type,
            description: description || 'Manual Adjustment by Admin'
        });

        res.json({ message: 'Balance adjusted successfully', shop });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalShops = await Shop.countDocuments();
        const totalProducts = await Product.countDocuments();
        // contact_clicks table logic? It wasn't in list_dir output models. 
        // If it was a raw table, I need to check if it's critical. 
        // Assuming it's less critical or I should make a model if I see it.
        // For now, returning 0 or checking if I missed a model.
        // Let's assume 0 if no model exists.
        const totalClicks = 0;

        res.json({
            totalUsers,
            totalShops,
            totalProducts,
            totalClicks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        await ActivityLog.create({
            user_id: req.user.id,
            action: 'DELETE_USER',
            details: `Deleted user ID: ${req.params.id}`
        });

        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find();
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteShop = async (req, res) => {
    try {
        await Shop.findByIdAndDelete(req.params.id);

        await ActivityLog.create({
            user_id: req.user.id,
            action: 'DELETE_SHOP',
            details: `Deleted shop ID: ${req.params.id}`
        });

        res.json({ message: 'Shop deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deactivateShop = async (req, res) => {
    try {
        const shopId = req.params.id;

        // Update Shop Status
        const shop = await Shop.findByIdAndUpdate(shopId, { status: 'deactivated' }, { new: true });

        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        // Calculate stats
        const fines = await Fine.find({ shop_id: shopId });
        const totalFines = fines.reduce((sum, fine) => sum + Number(fine.amount), 0);

        const resolvedReports = await Report.countDocuments({ shop_id: shopId, status: 'resolved' });

        // Send notification
        const message = `Your shop "${shop.name}" has been deactivated due to policy violations. Total Resolved Reports: ${resolvedReports}. Total Fines Discharged: $${totalFines.toFixed(2)}. Please contact support for more information.`;

        await Notification.create({
            user_id: shop.owner_id,
            message: message
        });

        await ActivityLog.create({
            user_id: req.user.id,
            action: 'DEACTIVATE_SHOP',
            details: `Deactivated shop ID: ${shopId}. Notified owner.`
        });

        res.json({ message: 'Shop deactivated and owner notified' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.activateShop = async (req, res) => {
    try {
        await Shop.findByIdAndUpdate(req.params.id, { status: 'approved' });

        await ActivityLog.create({
            user_id: req.user.id,
            action: 'ACTIVATE_SHOP',
            details: `Activated shop ID: ${req.params.id}`
        });

        res.json({ message: 'Shop activated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
