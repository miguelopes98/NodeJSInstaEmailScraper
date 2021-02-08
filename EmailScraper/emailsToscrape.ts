const mongoose = require('mongoose');
const express = require('express');
const app = express();
//requiring the file that has the command to connect to the database
const connectDB = require('./database/connection.js');
//importing the toScrapeUser model as toScrapeCollection, whenever we want to make a change in the toScrapeCollection, we use toScrapeCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const tempCollection = require('./models/tempEmails.js');
//importing the toScrapeUser model as toScrapeCollection, whenever we want to make a change in the toScrapeCollection, we use toScrapeCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const toScrapeCollection = require('./models/toScrapeUser.js');
//run the function inside ./database/connection that connects to the database
connectDB();

//requiring this packed so we can read into the file
const fs = require("fs");
// Require gender detection module
const gender = require('gender-detection');
//Note for JavaScript users: As of Node v.13.5.0, there isn't support for ESModules and the 'import'-syntax. So you have to read the imports in the examples like this:
//import { A } from 'b' ➡ const { A } = require('b')
//import { IgApiClient } from './index';
const { IgApiClient } = require('./src/index.ts');
//import { sample } from 'lodash';
const {sample } = require('lodash');


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

    //we re calling the to scrape collection and saving the list of id's we have there into a variable
    var toScrapeIds = await toScrapeCollection.find({});
    console.log("to scrape list length = " + toScrapeIds.length);

    var apiCalls = 0;
    for(var i = 0; i < toScrapeIds.length; i++){
        while(userToScrape === undefined)
            {
            //asking for the information of an account with the id of the first element of the toScrapeIds list
            try { 
                var userToScrape = await ig.user.info(toScrapeIds[i].id);
                //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                apiCalls = apiCalls + 1;
                console.log("API CALLS = " + apiCalls);
                //console.log(userToScrape);
                addUserToTempCollection(userToScrape);
                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                sleep(randomIntFromInterval(3,5));
            }
            //if we catch an error we handle it here
            catch(err){
                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                sleep(randomIntFromInterval(3,5));
                console.log("we got an error while grabbing " + toScrapeIds[i].id + " to scrape");
                console.log(err);
                //use this boolean to track if an error exists
                var error = true;
                //we re going to try to get the same info 5 times before we give up and move on with the next username
                var errorCounter = 0;
                //while we have an error and while we tried to do this less than 5 times
                while(error === true && errorCounter < 5)
                {
                    //try this code
                    try
                    {
                        var userToScrape = await ig.user.info(toScrapeIds[i].id);
                        //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                        apiCalls = apiCalls + 1;
                        console.log("API CALLS = " + apiCalls);
                        //if no error is given by the line above, change the boolean to false, saying there s no error and this will exit the while loop
                        error = false;
                        addUserToTempCollection(userToScrape);
                        //sleeps for 3 to 5 seconds so we instagram doesnt block us
                        sleep(randomIntFromInterval(3,5));
                    }
                    //if the try doesnt work, we just console.log the error and let the while loop take place again
                    catch(err)
                    {
                        //we need this sleep here because if the first line of code in the try block gives an error, the sleep at the end of the try block wont run, so we have to run here to replace that
                        //sleeps for 3 to 5 seconds so we instagram doesnt block us
                        sleep(randomIntFromInterval(3,5));
                        console.log("caught an error still while grabbing " + toScrapeIds[i].id + " to scrape");
                        console.log(err);
                        errorCounter = errorCounter + 1;
                        console.log(errorCounter);
                    }
                }
                //this code still runs regardless if the error disappeared
                //so what we want to do is, if the counter is 5, means that we want to move on to the next username
                //so we do an if statement, removing the user from whichever list he's in, because the username probably doesnt exist anymore and move on
                if(errorCounter === 5)
                {
                    i = i + 1;
                }
                //if the counter isnt 5, means we got the username we wanted, in that case, we just move on
            }
        }
        userToScrape = undefined;
    }
        



})();

//starts the server
app.listen(3000, () => console.log('Server started'));



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


 //adds a given user to the leads collection
 async function addUserToTempCollection(userProfileInformation){
    //creating the object we want to push to leads
    var userData = {
        id: userProfileInformation.pk,
        username: userProfileInformation.username,
        fullName: userProfileInformation.full_name,
        followersCount: userProfileInformation.follower_count,
        followingsCount: userProfileInformation.following_count,
        bio: userProfileInformation.biography,
        businessEmail: userProfileInformation.public_email,
        externalUrl: userProfileInformation.external_url,
        isVerified: userProfileInformation.is_verified,
        averageLikes: userProfileInformation.averageLikes,
        averageComments: userProfileInformation.averageComments,
        engagementRate: userProfileInformation.engagementRate,
        mediaCount: userProfileInformation.media_count,
        following_tag_count: userProfileInformation.following_tag_count,
        usertagsCount: userProfileInformation.usertags_count,
        isInterestAccount: userProfileInformation.is_interest_account,
        has_chaining: userProfileInformation.has_chaining,
        show_shoppable_feed: userProfileInformation.show_shoppable_feed,
        category: userProfileInformation.category,
        address_street: userProfileInformation.address_street,
        city_name: userProfileInformation.city_name,
        latitude: userProfileInformation.latitude,
        longitude: userProfileInformation.longitude,
        public_phone_country_code: userProfileInformation.public_phone_country_code,
        public_phone_number: userProfileInformation.public_phone_number,
        zip: userProfileInformation.zip,
        is_potential_business: userProfileInformation.is_potential_business,
        is_business: userProfileInformation.is_business
    }; 

    //we add him to leads
    await tempCollection.create(userData, function(err, savedId)
    {
       if(err)
       {
           console.log(userProfileInformation.username + " WAS NOT ADDED TO TEMP COLLECTION" + "/n" + err);
       }
       else
       {
           console.log(userProfileInformation.username + " user added to tempcollection");
       }
    });
}