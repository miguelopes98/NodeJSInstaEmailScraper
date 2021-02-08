/*

/////////////////// TO RUN THIS SCRIPT USE npx ts-node app1.ts//////////////////////
//we re using two packages to run this code in typescript, one called ts-node and the other one called typescript

const mongoose = require('mongoose');
const express = require('express');
const app = express();
//requiring the file that has the command to connect to the database
const connectDB = require('./database/connection.js');
//importing the leadsUser model as leadsCollection, whenever we want to make a change in the leadsCollection, we use leadsCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const leadsCollection = require('./models/leadsUser.js');
//importing the toScrapeUser model as toScrapeCollection, whenever we want to make a change in the toScrapeCollection, we use toScrapeCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const toScrapeCollection = require('./models/toScrapeUser.js');
//importing the blacklistUser model as blacklistCollection, whenever we want to make a change in the blacklistCollection, we use blacklistCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const blacklistCollection = require('./models/blacklistUser.js');
//importing the LocationUsers model as locationUsersCollection, whenever we want to make a change in the locationUsersCollection, we use locationUsersCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const locationUsersCollection = require('./models/locationUsers.js');
//run the function inside ./database/connection that connects to the database
connectDB();

//Note for JavaScript users: As of Node v.13.5.0, there isn't support for ESModules and the 'import'-syntax. So you have to read the imports in the examples like this:
//import { A } from 'b' ➡ const { A } = require('b')
//import { IgApiClient } from './index';
const { IgApiClient } = require('./src/index.ts');
//import { sample } from 'lodash';
const {sample } = require('lodash');

//requiring this packed so we can read into the file
const fs = require("fs");



//defining functions to user cookies to login
//this is the function that saves data in a file called cookies.json, the parameter we pass called data should be the cookies data
function CookieSave(data)
{
    console.log("Running the SaveCookieFile function");

    //Creating a file called cookies.json in the folder and saving the data passed as a parameter
    fs.writeFile('cookies.json', JSON.stringify(data), function(err)
    {
        console.log("Attempting to write the cookie data into a file on the folder")
        if(err)
        {
            console.log("An error occured, the file with cookies was not saved");
            return console.log(err);
        }
            console.log("No errors writing the file. The file with cookies was saved!");
            return data
    }); 
}

//this function reads the file where we saved the cookies and returns the data inside that file
function CookieFileRead()
{
    console.log("Currently running the dataCheck function")
    return fs.readFileSync('cookies.json');
}
//this function go through the data we passed in (should be the data returned from the function above) and check if data.length is more than 0 (means that we actually have cookies inside the file)
//if this returns true it means we have usable cookies and later we can use that information to decide whether we use cookies to login or not
function CookieExist(data)
{
    //When there is no error in reading the file
    console.log("Checking the date that was read")

    //Check if the file has data written in it
    console.log("Checking if the file data is not empty")
    if (data.length > 0)
    {
        console.log("The data is not empty")
        return true;
    }
    console.log("The data is empty")
    return false;
}

//Read the cookie.json file from the folder and return the data inside it
function CookieLoad()
{
    console.log("Running the data load function");

    //Read the cookies.json file from the folder
    return JSON.parse(JSON.stringify(fs.readFileSync('cookies.json')));
}

//we re done defining all the functions we need to login with cookies

(async () => {

    // Initiate Instagram API client
    const ig = new IgApiClient();
    //generate device, comes with the api
    ig.state.generateDevice('username');
    // Optionally you can setup proxy url
    //ig.state.proxyUrl = 'proxy url';
    //inside this we serialize (add the cookie to the state/session) the cookie
    //we re not sure but we think that this makes the code serialize the cookie everytime it makes a request
    ig.request.end$.subscribe(async () => 
        {
            const serialized = await ig.state.serialize();
            delete serialized.constants;
            CookieSave(serialized);
        });
    //if there are cookies we load them and add them to ig.state and when we login it uses this automatically
    if(CookieExist(CookieFileRead()))
    {
        console.log("Going to now login using cookies");
        await ig.state.deserialize(CookieLoad());
        console.log("we used cookies to login");
    }
    //if theres is no cookies loaded we will still login but it wont use cookies because there is nothing to use
    var loggedInUser = await ig.account.login('username', 'password');
    //checking in which account we re logged in
    console.log("Logged in on " + loggedInUser.username);
    console.log("Logged in");
    sleep(randomIntFromInterval(3, 5));

*/




    
    //this code is for the scenario where we want provide the usernames manually.
    /*
    var listUsernames = ['s1btox', 'kayllaalee', 'deaavdulla', 'majakrakau', 'evameloche', 'lilyloomis'];
    console.log(listUsernames.length);
    for(var i = 0; i < listUsernames.length; i++)
    {
        var userId = await ig.user.getIdByUsername(listUsernames[i]);
        var userInToScrapeList = await toScrapeCollection.exists({ id: userId });
        //we only add them to the to scrape collection if they re not there yet, if they are, we just move on
        if(userInToScrapeList === false)
        {
            await toScrapeCollection.create({ id: userId }, function(err){
                if(err){
                    console.log(err);
                }
                else
                {
                    console.log(listUsernames[i] + " added to toScrapeCollection");
                    console.log(i);
                }
            });
        }
        sleep(randomIntFromInterval(3, 5));
    }
    */


/*
    //this code is for the scenario where we want to add the usernames that we have on the UserByLocation collection to the toScrapeCollection
    
    var listUserIds = await locationUsersCollection.find({});
    console.log(listUserIds.length);
    for(var i = 0; i < listUserIds.length; i++)
    {
        var userId = listUserIds[i].id;


        var userInToScrapeList = await toScrapeCollection.exists({ id: userId });
        //we only add them to the to scrape collection if they re not there yet, if they are, we just move on
        if(userInToScrapeList === false)
        {
            var userInLeads = await leadsCollection.exists({ id: userId });
            //we only add them to the to scrape collection if they re not in leads nor in the toScrapeCollection
            if(userInLeads === false)
            {
                var userInBlacklist = await blacklistCollection.exists({ id: userId });
                //we only add them to the to scrape collection if they re not in the blacklist, nor in leads nor in the toScrapeCollection
                if(userInBlacklist === false)
                {
                    //we re adding joao to the to scrape collection to start the testing with him
                    await toScrapeCollection.create({ id: userId }, function(err){
                        if(err){
                            console.log(listUserIds[i].username + " was not added to the toScrapeCollection " + "\n" + err);
                        }
                        else
                        {
                            console.log(listUserIds[i].username + " added to toScrapeCollection");
                        }
                    });
                }
            }
        }


        
        await locationUsersCollection.remove({ id: userId}, function(err){
            if(err)
            {
                console.log(listUserIds[i].username + " was not removed from the locationUsersCollection " + "\n" + err);
            }
        });
        sleep(randomIntFromInterval(3, 5));
        console.log(i);
        console.log("length = " + listUserIds.length);
    }
*/



/*

    console.log("Done adding users to toScrapeCollection");

})();


//sleeps for x miliseconds to seem more human
function sleep(miliseconds) {
    var currentTime = new Date().getTime();
 
    while (currentTime + miliseconds >= new Date().getTime()) {
    }
 }

 //generates a random integer number from min to max, being min and max the seconds we want and we return in the order of thousands so we can then pass the value returned by this function
 //into the sleep function that takes miliseconds as a parameter so we multiple by a thousand to be in the order of thousands (miliseconds)
function randomIntFromInterval(min, max) { // min and max included 
   return Math.floor(Math.random() * (max - min + 1) + min)*1000;
 }


//starts the server
app.listen(3000, () => console.log('Server started'));

*/