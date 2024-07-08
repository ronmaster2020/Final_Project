// Description: This file is used to initialize the database.

const mongoose = require('mongoose');
// load the Product model //
const Product = require('./models/product');
// load the Order model //
const Order = require('./models/order');
// load the Cart model //
const Cart = require('./models/cart');
// load the User model //
const User = require('./models/user');

// MongoDB connection
async function connect() {
    await mongoose.connect('mongodb+srv://mike:cIBBf4X6JasSW8oK@cluster0.emzh3yv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
}

connect();

const products = [
    {"name": "Ocean Breeze", "price": 5, "gender": 3, "size": 15, "DESC": "Unisex perfume with a fresh ocean scent.", "stock": 500, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Mountain Dew", "price": 10, "gender": 1, "size": 15, "DESC": "Male perfume inspired by the mountains.", "stock": 750, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Floral Whisper", "price": 10, "gender": 2, "size": 15, "DESC": "Female perfume with a soft floral scent.", "stock": 0, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Citrus Spark", "price": 15, "gender": 3, "size": 30, "DESC": "Unisex perfume with a vibrant citrus aroma.", "stock": 1000, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Woodland", "price": 15, "gender": 1, "size": 30, "DESC": "Male perfume with a deep, woody scent.", "stock": 800, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Vanilla Dream", "price": 20, "gender": 2, "size": 30, "DESC": "Female perfume with a sweet vanilla essence.", "stock": 600, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Mystic Night", "price": 25, "gender": 3, "size": 50, "DESC": "Unisex perfume for evening wear.", "stock": 400, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Arctic Fresh", "price": 30, "gender": 1, "size": 50, "DESC": "Male perfume with a cool, refreshing scent.", "stock": 900, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Rose Petals", "price": 30, "gender": 2, "size": 50, "DESC": "Female perfume with a pure rose fragrance.", "stock": 300, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Sunset Glow", "price": 35, "gender": 3, "size": 50, "DESC": "Unisex perfume with a warm, inviting aroma.", "stock": 700, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Spice Route", "price": 40, "gender": 1, "size": 50, "DESC": "Male perfume with exotic spices.", "stock": 100, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Lavender Fields", "price": 40, "gender": 2, "size": 50, "DESC": "Female perfume with a calming lavender scent.", "stock": 950, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Tropical Escape", "price": 40, "gender": 3, "size": 75, "DESC": "Unisex summer perfume.", "stock": 550, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Urban Edge", "price": 50, "gender": 1, "size": 75, "DESC": "Male perfume with a modern, bold scent.", "stock": 350, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Peony Bloom", "price": 55, "gender": 2, "size": 75, "DESC": "Female perfume with a fresh peony fragrance.", "stock": 150, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Desert Mirage", "price": 55, "gender": 3, "size": 75, "DESC": "Unisex perfume with a mysterious allure.", "stock": 450, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Oceanic", "price": 55, "gender": 1, "size": 75, "DESC": "Male perfume with deep sea notes.", "stock": 850, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Gardenia Grace", "price": 70, "gender": 2, "size": 75, "DESC": "Female perfume with a rich gardenia scent.", "stock": 650, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Zen Retreat", "price": 70, "gender": 3, "size": 75, "DESC": "Unisex perfume inspired by tranquility.", "stock": 0, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Bold Leather", "price": 70, "gender": 1, "size": 75, "DESC": "Male perfume with a strong leather note.", "stock": 250, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Jasmine Night", "price": 70, "gender": 2, "size": 75, "DESC": "Female perfume with an intoxicating jasmine scent.", "stock": 750, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Crystal Clear", "price": 70, "gender": 3, "size": 75, "DESC": "Unisex perfume with a clear, crisp scent.", "stock": 550, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Amber Woods", "price": 70, "gender": 1, "size": 100, "DESC": "Male perfume with warm amber and wood.", "stock": 850, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Orchid Oasis", "price": 70, "gender": 2, "size": 100, "DESC": "Female perfume with an exotic orchid scent.", "stock": 650, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Silver Mist", "price": 70, "gender": 3, "size": 100, "DESC": "Unisex perfume with a fresh, clean aroma.", "stock": 450, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Rustic Pine", "price": 70, "gender": 1, "size": 100, "DESC": "Male perfume with a pine forest scent.", "stock": 750, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Cherry Blossom", "price": 80, "gender": 2, "size": 100, "DESC": "Female perfume with a delicate cherry blossom fragrance.", "stock": 550, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Midnight Velvet", "price": 80, "gender": 3, "size": 100, "DESC": "Unisex perfume for a sophisticated evening.", "stock": 350, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Saffron Zest", "price": 80, "gender": 1, "size": 100, "DESC": "Male perfume with a unique saffron note.", "stock": 950, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Magnolia Dew", "price": 90, "gender": 2, "size": 100, "DESC": "Female perfume with a soft magnolia essence.", "stock": 650, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Emerald Essence", "price": 90, "gender": 2, "size": 100, "DESC": "Female perfume with a vibrant emerald essence.", "stock": 500, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Golden Sunrise", "price": 90, "gender": 3, "size": 200, "DESC": "Unisex perfume with a warm, golden sunrise aroma.", "stock": 600, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Frosty Mint", "price": 100, "gender": 1, "size": 200, "DESC": "Male perfume with a cool, frosty mint scent.", "stock": 700, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Blossom Breeze", "price": 110, "gender": 2, "size": 200, "DESC": "Female perfume with a light, blossom-filled breeze.", "stock": 800, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Moonlight Shadow", "price": 140, "gender": 3, "size": 250, "DESC": "Unisex perfume with a mysterious moonlight shadow scent.", "stock": 900, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Spiced Bergamot", "price": 160, "gender": 1, "size": 250, "DESC": "Male perfume with a spicy bergamot twist.", "stock": 0, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Whispering Willow", "price": 190, "gender": 2, "size": 250, "DESC": "Female perfume with a gentle whispering willow note.", "stock": 1100, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Crimson Night", "price": 220, "gender": 3, "size": 350, "DESC": "Unisex perfume with a deep, crimson night aroma.", "stock": 1200, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Azure Dream", "price": 220, "gender": 1, "size": 350, "DESC": "Male perfume with an inspiring azure dream scent.", "stock": 1300, "images": ["products_files/1720188071144.perfume_0.png"]},
    {"name": "Velvet Rose", "price": 230, "gender": 2, "size": 350, "DESC": "Female perfume with a luxurious velvet rose fragrance.", "stock": 150, "images": ["products_files/1720188071144.perfume_0.png"]}
];

async function initializeProductsData() {
    try {
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log('Product data initialized.');
        return Product.find({});
    } catch (error) {
        console.error('Error initializing product data:', error);
    }
}

async function initializeCartsData() {
    try {
        const products = await Product.find({});
        const numOfUsers = await User.countDocuments();

        const carts = Array.from({ length: numOfUsers }, () => {
            // Shuffle products array
            const shuffledProducts = products.sort(() => 0.5 - Math.random());
            // Get a random number of products between 1 and 6
            const selectedProducts = shuffledProducts.slice(0, Math.floor(Math.random() * 6) + 1);
            return {
                products: selectedProducts.map((product) => ({
                    productId: product._id,
                    quantity: Math.floor(Math.random() * 10) + 1,
                })),
            };
        });
        await Cart.deleteMany({});
        await Cart.insertMany(carts);
        console.log('Cart data initialized.');
        return Cart.find({});
    } catch (error) {
        console.error('Error initializing cart data:', error);
    }
}

async function initializeUsersData() {
    try {
        const users = await User.find({});
        let carts = await Cart.find({});

        // Assign a random cartId to each user
        users.forEach(async (user) => {
            if (!user.password) {
                user.password = 'defaultPassword'; // Assign a default password if missing
            }
            const randomIndex = Math.floor(Math.random() * carts.length);
            user.cartId = carts[randomIndex]._id;
            // remove the added cart from carts (locally) to prevent duplicate cartId
            carts = carts.filter((cart) => cart._id !== user.cartId);
            await user.save();
        });
        console.log('User data initialized.');
        return User.find({});
    } catch (error) {
        console.error('Error initializing user data:', error);
    }
}

async function initializeOrdersData() {
    try {
        const users = await User.find({});
        const products = await Product.find({});

        // Function to get a weighted random status
        function getRandomStatus() {
            const random = Math.random();
            if (random < 0.1) return 1; // 10% chance
            if (random < 0.3) return 2; // 20% chance
            return 3; // 70% chance
        }

        const orders = users.flatMap(user => {
            // Create a random number of orders for each user (between 0 and 3)
            const numberOfOrders = Math.floor(Math.random() * 4);
            return Array.from({ length: numberOfOrders }, () => {
                // Get a random number of products between 1 and 5
                const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 1);
                return {
                    userId: user._id,
                    order_items: selectedProducts.map((product) => {
                        const maxBudget = 500;
                        const maxQuantity = Math.floor(maxBudget / product.price);
                        const quantity = Math.floor(Math.random() * maxQuantity) + 1;
                        return {
                            productId: product._id,
                            quantity: quantity,
                            price: product.price,
                        };
                    }),
                    status: getRandomStatus(), // Assign a random status
                    order_date: new Date(Date.now() - Math.floor(Math.random() * 2 * 365 * 24 * 60 * 60 * 1000)), // Maximum 2 years ago
                };
            });
        });

        await Order.deleteMany({});
        await Order.insertMany(orders);
        console.log('Order data initialized.');
        return Order.find({});
    } catch (error) {
        console.error('Error initializing order data:', error);
    }
}


async function initializeData() {
    await initializeProductsData();
    await initializeUsersData();
    await initializeCartsData();
    await initializeOrdersData();
}

initializeData()
.finally (() => {
    mongoose.connection.close();
});