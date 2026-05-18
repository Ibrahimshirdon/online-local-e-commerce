const Report = require('../models/Report');
const Fine = require('../models/Fine');
const Shop = require('../models/Shop');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

exports.createReport = async (req, res) => {
    try {
        const { shopId, reason, description } = req.body;
        const reporterId = req.user.id;

        await Report.create({
            reporter_id: reporterId,
            shop_id: shopId,
            reason,
            description
        });

        res.status(201).json({ message: 'Report submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find();
        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const reportId = req.params.id;

        const report = await Report.findByIdAndUpdate(reportId, { status }, { new: true });

        if (status === 'resolved' && report) {
            // Use new Strikes Logic
            const shop = await Shop.findByIdAndUpdate(report.shop_id, { $inc: { strikes: 1 } }, { new: true });
            const newStrikes = shop.strikes;
            console.log(`Shop ${report.shop_id} Now Has ${newStrikes} Strikes.`);

            // Check Rule: 3 Strikes = $10 Fine + Deactivation
            if (newStrikes % 3 === 0) {
                const fineAmount = 10.00;

                // 1. Deduct Balance
                await Shop.findByIdAndUpdate(report.shop_id, {
                    $inc: { balance: -fineAmount },
                    status: 'deactivated'
                });

                // 2. Log into Transactions (Ledger)
                await Transaction.create({
                    shop_id: report.shop_id,
                    amount: fineAmount,
                    type: 'FINE',
                    description: `Penalty for ${newStrikes} strikes. Shop Deactivated.`
                });

                // 3. Notify Seller
                if (shop) {
                    const message = `URGENT: Your shop "${shop.name}" has been deactivated due to receiving 3 consecutive reports. A penalty fee of $10 has been charged to your account. Please pay this fee to reactivate your services.`;
                    await Notification.create({
                        user_id: shop.owner_id,
                        message: message
                    });
                }

                // Log Activity
                await ActivityLog.create({
                    user_id: req.user.id,
                    action: 'PENALTY',
                    details: `Applied $10 fine and Deactivated Shop ${report.shop_id} for 3rd Strike`
                });
            }
        }

        res.json({ message: 'Report status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
