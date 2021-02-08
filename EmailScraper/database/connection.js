const mongoose = require('mongoose');

//url that mongo atlas provided us to connect to the database
const URI = 'databaseurl';

//creating a function to be called in the main file to connect to the database
const connectDB = async () => {
    await mongoose.connect(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log('database connected');
};

module.exports = connectDB;