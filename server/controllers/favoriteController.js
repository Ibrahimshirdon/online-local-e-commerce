const Favorite = require('../models/Favorite');

exports.toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const exists = await Favorite.findOne({ user_id: userId, product_id: productId });

        if (exists) {
            await Favorite.findByIdAndDelete(exists._id);
            res.json({ message: 'Removed from favorites', isFavorite: false });
        } else {
            await Favorite.create({ user_id: userId, product_id: productId });
            res.json({ message: 'Added to favorites', isFavorite: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user_id: req.user.id });

        // Filter out null products (in case product was deleted)
        const validFavorites = favorites.filter(f => f.product_id);

        // Transform to look like products list
        const products = validFavorites.map(f => f.product_id);

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.checkFavorite = async (req, res) => {
    try {
        const exists = await Favorite.findOne({ user_id: req.user.id, product_id: req.params.productId });
        res.json({ isFavorite: !!exists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
