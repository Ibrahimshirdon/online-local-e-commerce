const db = require('./config/db');
const Category = require('./models/Category');

const categories = [
    { name: 'Electronics', icon: '📱' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Home & Garden', icon: '🏠' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Books', icon: '📚' },
    { name: 'Toys', icon: '🧸' },
    { name: 'Automotive', icon: '🚗' },
    { name: 'Beauty', icon: '💄' }
];

const seedCategories = async () => {
    try {
        console.log('🌱 Seeding categories...');

        for (const category of categories) {
            const existing = await Category.findOne({ name: category.name });

            if (!existing) {
                await Category.create(category);
                console.log(`✅ Inserted category: ${category.name}`);
            } else {
                console.log(`⚠️  Category already exists: ${category.name}`);
            }
        }

        console.log('🎉 Categories seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();

