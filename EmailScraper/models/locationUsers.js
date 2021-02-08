//requiring mongoose
var mongoose = require("mongoose");

//creating a schema
var locationUsersSchema = new mongoose.Schema({
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
    overallCategory: { //overall_category_name
        type: String
    },
    category_enum: { //dont know what is different from the other categories, but i va seen businesses with it (its generally along the lines of the business category)
        type: String
    },
    isVerified: {
        type: Boolean
    },
    highlight_reel_count: { //what is this?
        type: Number
    },
    is_joined_recently:{
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
    }
});

//creating a model(the command we want to use to do things in this collection, locationUsersCollection.create() etc, name of the schema we want this collection to have, and the name of the collection we want to create)
//this is pretty much the return value of this file to be used in the main file whenever we import this file
module.exports = mongoose.model("locationUsersCollection", locationUsersSchema, 'locationUsersCollection');