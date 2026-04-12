require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');

const categories = [
    { name: 'School Uniform' },
    { name: 'Professional Uniform' },
];

const seedCategories = async () => {
    try {
        await connectDB();
        await Category.deleteMany();
        await Category.insertMany(categories);
        console.log('Categories seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
};

seedCategories();