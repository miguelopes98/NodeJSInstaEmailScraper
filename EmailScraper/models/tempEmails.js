//requiring mongoose
var mongoose = require("mongoose");

//creating a schema
var tempUserSchema = new mongoose.Schema({
    id: {
        type: String
    },
	username: {
        type: String
    },
    fullName: {
        type: String
    },
    gender: {
        type: String
    },
    followersCount: {
        type: Number
    },
    followingsCount: {
        type: Number
    },
    bio: {
        type: String
    },
    businessEmail: {
        type: String
    },
    externalUrl: { //the link to the website of businesses, if they put any, of even the websites of a person if they choose to put something in it
        type: String
    },
    businessCategory: { //business_category_name
        type: String
    },
    isVerified: {
        type: Boolean
    },
    averageLikes: {
        type: Number
    },
    averageComments: {
        type:Number
    },
    engagementRate: { //it will be a number, its a percentage
        type: Number
    },
    mediaCount: {
        type: Number
    },
    following_tag_count: {
        type: Number
    },
    usertagsCount: {
        type: Number
    },
    isInterestAccount: {
        type: Boolean
    },
    has_chaining: {
        type: Boolean
    },
    show_shoppable_feed: {
        type: Boolean
    },
    category: {
        type: String
    },
    address_street: {
        type: String
    },
    city_name: {
        type: String
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    public_phone_country_code: {
        type: String
    },
    public_phone_number: {
        type: String
    },
    zip: {
        type: String
    },
    is_potential_business: {
        type: Boolean
    },
    is_business: {
        type: Boolean
    }
});

//creating a model(the command we want to use to do things in this collection, leadsCollection.create() etc, name of the schema we want this collection to have, and the name of the collection we want to create)
//this is pretty much the return value of this file to be used in the main file whenever we import this file
module.exports = mongoose.model("tempCollection", tempUserSchema, 'tempCollection');