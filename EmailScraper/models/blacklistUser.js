//requiring mongoose
var mongoose = require("mongoose");

//creating a schema
var blacklistUserSchema = new mongoose.Schema({
	id: {
        type: String
    }
});

//creating a model(the command we want to use to do things in this collection, blacklistCollection.create() etc, name of the schema we want this collection to have, and the name of the collection we want to create)
//this is pretty much the return value of this file to be used in the main file whenever we import this file
module.exports = mongoose.model("blacklistCollection", blacklistUserSchema, 'blacklistCollection');