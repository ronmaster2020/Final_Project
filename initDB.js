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
    {"name": "Ocean Breeze", "price": 5, "gender": 3, "size": 15, "DESC": "Unisex perfume with a fresh ocean scent.", "stock": 500, "images": ["products_files/1722246205493.perfume_22_cheap.jpg"]},
    {"name": "Mountain Dew", "price": 10, "gender": 1, "size": 15, "DESC": "Male perfume inspired by the mountains.", "stock": 750, "images": ["products_files/1722246205495.perfume_31_cheap.jpg"]},
    {"name": "Floral Whisper", "price": 10, "gender": 2, "size": 15, "DESC": "Female perfume with a soft floral scent.", "stock": 0, "images": ["products_files/1722246205496.perfume_33_cheap.jpg"]},
    {"name": "Citrus Spark", "price": 15, "gender": 3, "size": 30, "DESC": "Unisex perfume with a vibrant citrus aroma.", "stock": 1000, "images": ["products_files/1722246205502.perfume_38_cheap.jpg"]},
    {"name": "Woodland", "price": 15, "gender": 1, "size": 30, "DESC": "Male perfume with a deep, woody scent.", "stock": 800, "images": ["products_files/1722246205502.perfume_39_cheap.jpg"]},
    {"name": "Vanilla Dream", "price": 20, "gender": 2, "size": 30, "DESC": "Female perfume with a sweet vanilla essence.", "stock": 600, "images": ["products_files/1722246205487.perfume_01.jpg"]},
    {"name": "Mystic Night", "price": 25, "gender": 3, "size": 50, "DESC": "Unisex perfume for evening wear.", "stock": 400, "images": ["products_files/1722246205487.perfume_02.jpg"]},
    {"name": "Arctic Fresh", "price": 30, "gender": 1, "size": 50, "DESC": "Male perfume with a cool, refreshing scent.", "stock": 900, "images": ["products_files/1722246205487.perfume_03.jpg"]},
    {"name": "Rose Petals", "price": 30, "gender": 2, "size": 50, "DESC": "Female perfume with a pure rose fragrance.", "stock": 300, "images": ["products_files/1722246205488.perfume_04.jpg"]},
    {"name": "Sunset Glow", "price": 35, "gender": 3, "size": 50, "DESC": "Unisex perfume with a warm, inviting aroma.", "stock": 700, "images": ["products_files/1722246205488.perfume_05.jpg"]},
    {"name": "Spice Route", "price": 40, "gender": 1, "size": 50, "DESC": "Male perfume with exotic spices.", "stock": 100, "images": ["products_files/1722246205488.perfume_06.jpg"]},
    {"name": "Lavender Fields", "price": 40, "gender": 2, "size": 50, "DESC": "Female perfume with a calming lavender scent.", "stock": 950, "images": ["products_files/1722246205489.perfume_07.jpg"]},
    {"name": "Tropical Escape", "price": 40, "gender": 3, "size": 75, "DESC": "Unisex summer perfume.", "stock": 550, "images": ["products_files/1722246205489.perfume_08.jpg"]},
    {"name": "Urban Edge", "price": 50, "gender": 1, "size": 75, "DESC": "Male perfume with a modern, bold scent.", "stock": 350, "images": ["products_files/1722246205489.perfume_09.jpg"]},
    {"name": "Peony Bloom", "price": 55, "gender": 2, "size": 75, "DESC": "Female perfume with a fresh peony fragrance.", "stock": 150, "images": ["products_files/1722246205489.perfume_10.jpg"]},
    {"name": "Desert Mirage", "price": 55, "gender": 3, "size": 75, "DESC": "Unisex perfume with a mysterious allure.", "stock": 450, "images": ["products_files/1722246205490.perfume_11.jpg"]},
    {"name": "Oceanic", "price": 55, "gender": 1, "size": 75, "DESC": "Male perfume with deep sea notes.", "stock": 850, "images": ["products_files/1722246205491.perfume_12.jpg"]},
    {"name": "Gardenia Grace", "price": 70, "gender": 2, "size": 75, "DESC": "Female perfume with a rich gardenia scent.", "stock": 650, "images": ["products_files/1722246205491.perfume_13.jpg"]},
    {"name": "Zen Retreat", "price": 70, "gender": 3, "size": 75, "DESC": "Unisex perfume inspired by tranquility.", "stock": 0, "images": ["products_files/1722246205492.perfume_14.jpg"]},
    {"name": "Bold Leather", "price": 70, "gender": 1, "size": 75, "DESC": "Male perfume with a strong leather note.", "stock": 250, "images": ["products_files/1722246205492.perfume_15.jpg"]},
    {"name": "Jasmine Night", "price": 70, "gender": 2, "size": 75, "DESC": "Female perfume with an intoxicating jasmine scent.", "stock": 750, "images": ["products_files/1722246205492.perfume_16.jpg"]},
    {"name": "Crystal Clear", "price": 70, "gender": 3, "size": 75, "DESC": "Unisex perfume with a clear, crisp scent.", "stock": 550, "images": ["products_files/1722246205492.perfume_17.jpg"]},
    {"name": "Amber Woods", "price": 70, "gender": 1, "size": 100, "DESC": "Male perfume with warm amber and wood.", "stock": 850, "images": ["products_files/1722246205492.perfume_18.jpg"]},
    {"name": "Orchid Oasis", "price": 70, "gender": 2, "size": 100, "DESC": "Female perfume with an exotic orchid scent.", "stock": 650, "images": ["products_files/1722246205493.perfume_19.jpg"]},
    {"name": "Silver Mist", "price": 70, "gender": 3, "size": 100, "DESC": "Unisex perfume with a fresh, clean aroma.", "stock": 450, "images": ["products_files/1722246205493.perfume_20.jpg"]},
    {"name": "Rustic Pine", "price": 70, "gender": 1, "size": 100, "DESC": "Male perfume with a pine forest scent.", "stock": 750, "images": ["products_files/1722246205493.perfume_21.jpg"]},
    {"name": "Cherry Blossom", "price": 80, "gender": 2, "size": 100, "DESC": "Female perfume with a delicate cherry blossom fragrance.", "stock": 550, "images": ["products_files/1722246205494.perfume_23.jpg"]},
    {"name": "Midnight Velvet", "price": 80, "gender": 3, "size": 100, "DESC": "Unisex perfume for a sophisticated evening.", "stock": 350, "images": ["products_files/1722246205494.perfume_24.jpg"]},
    {"name": "Saffron Zest", "price": 80, "gender": 1, "size": 100, "DESC": "Male perfume with a unique saffron note.", "stock": 950, "images": ["products_files/1722246205494.perfume_25.jpg"]},
    {"name": "Magnolia Dew", "price": 90, "gender": 2, "size": 100, "DESC": "Female perfume with a soft magnolia essence.", "stock": 650, "images": ["products_files/1722246205494.perfume_26.jpg"]},
    {"name": "Emerald Essence", "price": 90, "gender": 2, "size": 100, "DESC": "Female perfume with a vibrant emerald essence.", "stock": 500, "images": ["products_files/1722246205495.perfume_27.jpg"]},
    {"name": "Golden Sunrise", "price": 90, "gender": 3, "size": 200, "DESC": "Unisex perfume with a warm, golden sunrise aroma.", "stock": 600, "images": ["products_files/1722246205495.perfume_28.jpg"]},
    {"name": "Frosty Mint", "price": 100, "gender": 1, "size": 200, "DESC": "Male perfume with a cool, frosty mint scent.", "stock": 700, "images": ["products_files/1722246205495.perfume_29.jpg"]},
    {"name": "Blossom Breeze", "price": 110, "gender": 2, "size": 200, "DESC": "Female perfume with a light, blossom-filled breeze.", "stock": 800, "images": ["products_files/1722246205495.perfume_30.jpg"]},
    {"name": "Moonlight Shadow", "price": 140, "gender": 3, "size": 250, "DESC": "Unisex perfume with a mysterious moonlight shadow scent.", "stock": 900, "images": ["products_files/1722246205496.perfume_32.jpg"]},
    {"name": "Spiced Bergamot", "price": 160, "gender": 1, "size": 250, "DESC": "Male perfume with a spicy bergamot twist.", "stock": 0, "images": ["products_files/1722246205496.perfume_34.jpg"]},
    {"name": "Whispering Willow", "price": 190, "gender": 2, "size": 250, "DESC": "Female perfume with a gentle whispering willow note.", "stock": 1100, "images": ["products_files/1722246205497.perfume_35.jpg"]},
    {"name": "Crimson Night", "price": 220, "gender": 3, "size": 350, "DESC": "Unisex perfume with a deep, crimson night aroma.", "stock": 1200, "images": ["products_files/1722246205497.perfume_36.jpg"]},
    {"name": "Azure Dream", "price": 220, "gender": 1, "size": 350, "DESC": "Male perfume with an inspiring azure dream scent.", "stock": 1300, "images": ["products_files/1722246205502.perfume_37.jpg"]},
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

async function initializeOrdersData(users, numOfOrdersRange = { min: 1, max: 3}) {
    try {
        if (!users) {
            users = await User.find({});
        }

        const products = await Product.find({});

        // Function to get a weighted random status
        function getRandomStatus() {
            const random = Math.random();
            if (random < 0.1) return 1; // 10% chance
            if (random < 0.3) return 2; // 20% chance
            return 3; // 70% chance
        }

        const orders = users.map(user => {
            // Create a random number of orders for each user (between 1 and 3), for the bot users create between 30 and 100 orders
            const numberOfOrders = Math.floor(Math.random() * (numOfOrdersRange.max - numOfOrdersRange.min + 1)) + numOfOrdersRange.min;
            return Array.from({ length: numberOfOrders }, () => {
                // Get a random number of products between 1 and 5
                const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 1);
                const order_items = selectedProducts.map((product) => {
                    const maxBudget = 500;
                    const maxQuantity = Math.floor(maxBudget / product.price);
                    const quantity = Math.floor(Math.random() * maxQuantity) + 1;
                    return {
                        productId: product._id,
                        quantity: quantity,
                        price: product.price,
                    };
                });
                const total_price = order_items.reduce((total, item) => total + (item.price * item.quantity), 0);
                return {
                    userId: user._id,
                    order_items: order_items,
                    status: getRandomStatus(), // Assign a random status
                    order_date: new Date(Date.now() - Math.floor(Math.random() * 2 * 365 * 24 * 60 * 60 * 1000)), // Maximum 2 years ago
                    total_price: total_price
                };
            });
        }).reduce((acc, val) => acc.concat(val), []);

        await Order.deleteMany({});
        await Order.insertMany(orders);
        console.log('Order data initialized.');
        return Order.find({});
    } catch (error) {
        console.error('Error initializing order data:', error);
    }
}

const bcrypt = require('bcrypt');

async function initializeData() {
    try {
        await initializeProductsData();
        await initializeCartsData();
        await initializeUsersData();

        // // Delete all bot users
        // await User.deleteMany({ email: { $regex: /@example.com$/ } });

        // // Create 40 new bot users
        // const botUsers = [];
        // const hashedPassword = await bcrypt.hash('123', 10); // Encrypt the password '123'

        // for (let i = 0; i < 40; i++) {
        //     botUsers.push({
        //         firstName: `BotFirstName${i}`,
        //         lastName: `BotLastName${i}`,
        //         address: `123 Bot Street, Bot City, Bot Country`,
        //         access: 'user',
        //         email: `bot${i}@example.com`,
        //         password: hashedPassword,
        //     });
        // }

        // await User.insertMany(botUsers);
        // console.log('40 bot users created.');

        // const notBotUsers = await User.find({ email: { $not: /@example.com$/ } });
        await initializeOrdersData();
        const bots = await User.find({ email: { $regex: /@example.com$/ } });
        await initializeOrdersData(bots, { min: 30, max: 100 });
    } catch (error) {
        console.error('Error initializing data:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

initializeData()