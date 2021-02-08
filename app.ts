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
//run the function inside ./database/connection that connects to the database
connectDB();

//requiring this packed so we can read into the file
const fs = require("fs");
// Require gender detection module
const gender = require('gender-detection');


//requiring the file that has all the functions defined
//in that file we defined each function as a method of the file per say
const functions = require('./appFunctions.js');
//setting the functions call to be their own name
//this is the function that checks if a user needs to be blacklisted or not
const botFilter = functions.botFilter;
//this is the function that checks if a user is added to the to scrape in the future collection or not
const toScrapeFilter = functions.toScrapeFilter;
//makes the code pause for x miliseconds so we space the api requests out to look more human
const sleep = functions.sleep;
//adds a given user to blacklist
const addUserToBlacklist = functions.addUserToBlacklist;
//deletes a given user from leads
const removeUserFromLeads = functions.removeUserFromLeads;
//adds a user to leads
const addUserToLeads = functions.addUserToLeads;
//removes a user from the to scrape in the future list
const removeUserFromToScrapeList = functions.removeUserFromToScrapeList;
//updates a user in leads
const updateUserInLeads = functions.updateUserInLeads;
//adds a user to scrape collection
const addUserToScrapeCollection = functions.addUserToScrapeCollection;
//calculates average likes, comments and engagement rate. returns a list of 3 elements with the order that we said previously
const engagementRateCalculator = functions.engagementRateCalculator;
//generates a random number of miliseconds between 3000 to 5000 miliseconds so we can pass into the sleep function
const randomIntFromInterval = functions.randomIntFromInterval;

//Note for JavaScript users: As of Node v.13.5.0, there isn't support for ESModules and the 'import'-syntax. So you have to read the imports in the examples like this:
//import { A } from 'b' ➡ const { A } = require('b')
//import { IgApiClient } from './index';
const { IgApiClient } = require('./src/index.ts');
//import { sample } from 'lodash';
const {sample } = require('lodash');


sleep(randomIntFromInterval(3,5));
/*
//we re removing all documents in the database so we can resume the testing from scratch
leadsCollection.remove({}, function(err){
    if(err)
    {
        console.log("wasnt able to delete leadsCollection documents");
    }
    else
    {
        console.log("leadsCollection clean");
    }
});
toScrapeCollection.remove({}, function(err){
    if(err)
    {
        console.log("wasnt able to delete toScrapeCollection documents");
    }
    else
    {
        console.log("toScrapeCollection clean");
    }
});

blacklistCollection.remove({}, function(err){
    if(err)
    {
        console.log("wasnt able to delete blacklistCollection documents");
    }
    else
    {
        console.log("blacklistCollection clean");
    }
});

//we re adding joao to the to scrape collection to start the testing with him
toScrapeCollection.create({ id: '181317144' }, function(err){
    if(err){
        console.log(err);
    }
});
*/


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
    var apiCalls = 0;

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


    //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
    apiCalls = apiCalls + 3;
    console.log("API CALLS = " + apiCalls);

    //we re calling the to scrape collection and saving the list of id's we have there into a variable
    var toScrapeIds = await toScrapeCollection.find({});
    console.log("to scrape list length = " + toScrapeIds.length);
    
    //while there still are id's in the toScrapeCollection we want to keep running the code
    while(toScrapeIds.length !== 0)
    {
        console.log("getting next user to scrape...")

        //getting first user to scrape, we had to deal with an error in case the api response comes back broken
        //I CANT PUT THIS INTO A FUNCTION, DONT ASK ME WHY IT GIVES ME AN ERROR WHERE THERE SHOULDNT BE ONE
        // we used to use the getFirstUserToScrape function here
    
        while(userToScrape === undefined)
        {
            //asking for the information of an account with the id of the first element of the toScrapeIds list
            try { 
                var userToScrape = await ig.user.info(toScrapeIds[0].id);
                //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                apiCalls = apiCalls + 1;
                console.log("API CALLS = " + apiCalls);
                //console.log(userToScrape);
                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                sleep(randomIntFromInterval(3,5));
            }
            //if we catch an error we handle it here
            catch(err){
                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                sleep(randomIntFromInterval(3,5));
                console.log("we got an error while grabbing " + toScrapeIds[0].id + " to scrape");
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
                        var userToScrape = await ig.user.info(toScrapeIds[0].id);
                        //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                        apiCalls = apiCalls + 1;
                        console.log("API CALLS = " + apiCalls);
                        //if no error is given by the line above, change the boolean to false, saying there s no error and this will exit the while loop
                        error = false;
                        //sleeps for 3 to 5 seconds so we instagram doesnt block us
                        sleep(randomIntFromInterval(3,5));
                    }
                    //if the try doesnt work, we just console.log the error and let the while loop take place again
                    catch(err)
                    {
                        //we need this sleep here because if the first line of code in the try block gives an error, the sleep at the end of the try block wont run, so we have to run here to replace that
                        //sleeps for 3 to 5 seconds so we instagram doesnt block us
                        sleep(randomIntFromInterval(3,5));
                        console.log("caught an error still while grabbing " + toScrapeIds[0].id + " to scrape");
                        console.log(err);
                        errorCounter = errorCounter + 1;
                        console.log(errorCounter);
                    }
                }
                //this code still runs regardless if the error disappeared
                //so what we want to do is, if the counter is 5, means that we want to move on to the next username
                //so we do an if statement, removing the user from whichever list he's in, because the username probably doesnt exist anymore and move on
                if(errorCounter == 5)
                {
                    //we remove the username from the to scrape collection
                    await toScrapeCollection.remove({id: toScrapeIds[0].id}, function(err){
                        if(err)
                        {
                            console.log(toScrapeIds[0].id + " WAS NOT REMOVED FROM TO SCRAPE COLLECTION");
                        }
                        else
                        {
                            console.log("we couldnt request the info from " + toScrapeIds[0].id + " so we removed him from to scrape collection");
                        }
                    });
                        
                    //and we remove the first element from the array and shift all the other elements one index down
                    toScrapeIds.shift();
                }
                //if the counter isnt 5, means we got the username we wanted, in that case, we just move on
            }
        }
        //As soon as we get a user to scrape we remove him from the to scrape collection, once we re done going through the user we scrapped from him, we add him to leads
        await removeUserFromToScrapeList(userToScrape);
        //it stops here the part that was part of the getfirstUserToScrape function


        console.log("next user to scrape " + userToScrape.username);

        //sleeps for 3 to 5 seconds so we instagram doesnt block us
        sleep(randomIntFromInterval(3,5));

        //we have to check if the user is already in blacklistCollection
        //there is no need to create a function here cuz its literally the same number of lines of code
        //returns true if user in blacklistCollection, false otherwise
        var userInBlacklist = await blacklistCollection.exists({ id: userToScrape.pk });

        //if the user isnt in the blacklist, we move on with what we re doing
        if(userInBlacklist === false)
        {

            //checking if the user we grabbed to scrape is private
            //even if he came from the toScrapeList (means we already checked if he s public), until we grabbed the user from scrape list to scrape him, he might have put the account private, we dont need to check if hes a bot, because being a bot since we added him to the scrape list would be too big of a stretch
            //if the user is public we grab the followings and suggested
            if(userToScrape.is_private === false)
            {
                //WE CANT PUT THIS INTO A FUNCTION BECAUSE THE API RESPONSE WOULD COME BACK WITH ZERO FOLLOWINGS EVERYTIME, DONT ASK ME WHY
                //creating an array where the usernames of the followings will be in
                var followings = [];
                console.log("grabbing followings from " + userToScrape.username + "...")
                //the api has pagination, which means that it doesnt send us the whole lsit of followings but instead 100 by 100

                //asking for the followings of the userTocrape
                try { 
                    var followingsFeed = ig.feed.accountFollowing(userToScrape.pk);
                    //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                    apiCalls = apiCalls + 1;
                    console.log("API CALLS = " + apiCalls);
                    
                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                    sleep(randomIntFromInterval(3,5));
                    var items = await followingsFeed.items();
                    //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                    apiCalls = apiCalls + 1;
                    console.log("API CALLS = " + apiCalls);
                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                    sleep(randomIntFromInterval(3,5));
                }
                //if we catch an error we handle it here
                catch(err){
                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                    sleep(randomIntFromInterval(3,5));
                    console.log("we got an error while grabbing the first batch of followings, pre endcursor part");
                    console.log(err);
                    //use this boolean to track if an error exists
                    var error = true;
                    //while we have an error
                    while(error === true)
                    {
                        //try this code
                        try
                        {
                            var followingsFeed = ig.feed.accountFollowing(userToScrape.pk);
                            //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                            apiCalls = apiCalls + 1;
                            console.log("API CALLS = " + apiCalls);

                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                            sleep(randomIntFromInterval(3,5));
                            var items = await followingsFeed.items();
                            //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                            apiCalls = apiCalls + 1;
                            console.log("API CALLS = " + apiCalls);
                            //if no error is given by the line above, change the boolean to false, saying there s no error and this will exit the while loop
                            error = false;
                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                            sleep(randomIntFromInterval(3,5));
                        }
                        //if the try doesnt work, we just console.log the error and let the while loop take place again
                        catch(err)
                        {
                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                            sleep(randomIntFromInterval(3,5));
                            console.log("caught an error still while grabbing the first batch of followings, pre endcursor part");
                            console.log(err);
                        }
                    }
                }
                

                for(var i = 0; i < items.length; i++)
                {
                    followings.push(items[i].pk);
                }
            
                //console.log(followingsFeed.isMoreAvailable());

                //checking if there are any more pages, if not, we reached the end of the followings list
                while(followingsFeed.isMoreAvailable() === true)
                {
                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                    sleep(randomIntFromInterval(3,5));

                    //asking for the followings of the userTocrape
                    try { 
                        //everytime we ask this is asks for the next page of followings, api pagination is automatic
                        var items = await followingsFeed.items();
                        //sleeps for 3 to 5 seconds so we instagram doesnt block us
                        sleep(randomIntFromInterval(3,5));
                    }
                    //if we catch an error we handle it here
                    catch(err){
                        //sleeps for 3 to 5 seconds so we instagram doesnt block us
                        sleep(randomIntFromInterval(3,5));
                        console.log("we got an error while grabbing the followings on the endcursor part");
                        console.log(err);
                        //use this boolean to track if an error exists
                        var error = true;
                        //while we have an error, we shouldnt need to do limit the while loop to 5 iterations because in this case if the user for some reason doenst have any followings since the time 
                        //we added him to the to scrape list, it just loops through an empty array and doesnt give an error. so the only possible error we get should be a broken api response
                        //for some reason, due to internet connection or something like that, so we just keep asking for the same information until the api response doesnt come back broken, because it shouldnt
                        while(error === true)
                        {
                            //try this code
                            try
                            {
                                var items = await followingsFeed.items();
                                //if no error is given by the line above, change the boolean to false, saying there s no error and this will exit the while loop
                                error = false;
                                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                sleep(randomIntFromInterval(3,5));
                            }
                            //if the try doesnt work, we just console.log the error and let the while loop take place again
                            catch(err)
                            {
                                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                sleep(randomIntFromInterval(3,5));
                                console.log("caught an error still while grabbing the followings on the endcursor part");
                                console.log(err);
                            }
                        }
                    }

                    for(var i = 0; i < items.length; i++)
                    {
                        followings.push(items[i].pk);
                    }
                    console.log(followings.length);
                }
                console.log("THIS IS THE FOLLOWINGS LENGTH WE GOT " + followings.length);

                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                sleep(randomIntFromInterval(3,5));

                //only do this if the account has chaining. (the account we re using to scrape might not be able to see the suggested even if the userToScrape account has suggested)
                if(userToScrape.has_chaining === true)
                {
                    //just like in the followings part: WE CANT PUT THIS INTO A FUNCTION BECAUSE THE API RESPONSE WOULD COME BACK WITH ZERO SUGGESTED USERS EVERYTIME, DONT ASK ME WHY
                    //so theoretically, if we get an error, it should be because the api response came back broken and we just have to ask for it until it comes back no longer broken
                    //if the user is public, we got the followings, we re going to get the suggested as well
                    //the suggested functionality has no pagination, it grabs all 80 users
                    try { 
                        console.log("grabbing suggested users from " + userToScrape.username + "...");
                        var suggestedList = await ig.discover.chaining(userToScrape.pk);
                        //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                        apiCalls = apiCalls + 1;
                        console.log("API CALLS = " + apiCalls);
                        //sleeps for 3 to 5 seconds so we instagram doesnt block us
                        sleep(randomIntFromInterval(3,5));
                    }
                    //if we catch an error we handle it here
                    catch(err){
                        //sleeps for 3 to 5 seconds so we instagram doesnt block us
                        sleep(randomIntFromInterval(3,5));
                        console.log("we got an error on suggested users");
                        console.log(err);
                        //use this boolean to track if an error exists
                        var error = true;
                        //while we have an error
                        while(error === true)
                        {
                            //try this code
                            try
                            {
                                var suggestedList = await ig.discover.chaining(userToScrape.pk);
                                //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                apiCalls = apiCalls + 1;
                                console.log("API CALLS = " + apiCalls);
                                //if no error is given by the line above, change the boolean to false, saying there s no error and this will exit the while loop
                                error = false;
                                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                sleep(randomIntFromInterval(3,5));
                            }
                            //if the try doesnt work, we just console.log the error and let the while loop take place again
                            catch(err)
                            {
                                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                sleep(randomIntFromInterval(3,5));
                                console.log("caught an error still on suggested users");
                                console.log(err);
                            }
                        }
                    }
                    //creating a list where we re going to push the suggested usernames to
                    var suggested = [];
                    //loop through the suggested and push them to the suggested usernames list
                    for(var i = 0; i < suggestedList.users.length; i++)
                    {
                        suggested.push(suggestedList.users[i].pk);
                    }
                    console.log("Suggested users grabbed: " + suggested);

                    //we re merging the suggested list of username to the followings list of usernames and calling it a third list called usersToFilter, this way we only have to loop through one list and have half the code
                    //instead of having to loop through the followings list and do all the logic and then loop through the suggested list and do all the logic again
                    var usersToFilter = followings.concat(suggested);
                }
                //if we cant check for suggested/ user we re looking at doesnt have any suggested, we just stick with the followings
                else
                {
                    var usersToFilter = followings;
                }
                    
                //now we have to loop through the followings and suggested we got and apply the filters to see if we add them to the blacklist, if we add them to leads or if we add them to the to scrape in the future list
                //lets loop through the suggested first
                for( var i = 0; i < usersToFilter.length; i++)
                {
                    console.log("we re still filtering users scrapped from " + userToScrape.username);
                    console.log("usersToFilter Length = " + usersToFilter.length);
                    console.log(i);
                    //we reset the value of checkingUser in each iteration so we can enter the while loop
                    var checkingUser = undefined;
                    //we run this until we get a valid user to check
                    while(checkingUser === undefined)
                    {
                        //WE CANT PUT THIS INSIDE A FUNCTION, DONT ASK ME WHY
                        //this used to be inside the getUserTOCheck function, but for some reason the api gives us broken responses if we make an api call inside a function, so I took it out
                        console.log("getting user to apply filters");
                        var index = i;
                        //asking for the information of an account with the username userProfileInformation.username
                        try { 
                            var checkingUser = await ig.user.info(usersToFilter[i]);
                            //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                            apiCalls = apiCalls + 1;
                            console.log("API CALLS = " + apiCalls);
                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                            sleep(randomIntFromInterval(3,5));
                        }
                        //if we catch an error we handle it here
                        catch(err){
                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                            sleep(randomIntFromInterval(3,5));
                            console.log("we got an error while grabbing " + usersToFilter[i] + " to filter");
                            console.log(err);
                            //use this boolean to track if an error exists
                            var error = true;
                            //we re going to try to get the same info 5 times before we give up and move on with the next username because theres probably no account with username anymore
                            var errorCounter = 0;
                            //while we have an error and while we tried to do this less than 5 times
                            while(error === true && errorCounter < 5)
                            {
                                //try this code
                                try
                                {
                                    var checkingUser = await ig.user.info(usersToFilter[i]);
                                    //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                    apiCalls = apiCalls + 1;
                                    console.log("API CALLS = " + apiCalls);
                                    //if no error is given by the line above, change the boolean to false, saying there s no error and this will exit the while loop
                                    error = false;
                                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                    sleep(randomIntFromInterval(3,5));
                                }
                                //if the try doesnt work, we just console.log the error and let the while loop take place again
                                catch(err)
                                {
                                    //we need this sleep here because if the first line of code in the try block gives an error, the sleep at the end of the try block wont run, so we have to run here to replace that
                                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                    sleep(randomIntFromInterval(3,5));
                                    console.log("caught an error still while grabbing " + usersToFilter[i] + " to filter");
                                    console.log(err);
                                    errorCounter = errorCounter + 1;
                                    console.log(errorCounter);
                                }
                            }
                            //this code still runs regardless if the error disappeared
                            //so what we want to do is, if the counter is 5, means that we want to move on to the next username
                            //so we add one to the index we received so we can then send it to the main script and update the index of the foor loop of the main script to skip one iteration and move on to the next user
                            if(errorCounter == 5)
                            {
                                //add one to the index value
                                index = index + 1;
                            }
                            //if the counter isnt 5, means we got the username we wanted, in that case, we just move on
                        }
                        //this is where the part of the code that was inside the getUserToCheck function ends
                        //update index, we can do this everytime, because the code above already decided if we have to move on to the next user or not. if we have to move on to the next user, then 
                        //the code above already added one to index (and now we re updating i to the new value so we can skip one iteration).
                        //if we dont have to move on to the next user, the code above didnt do anything to the index and still has the same value as i
                        //we can even update the index everytime
                        i = index;
                        console.log("checkingUser = " + checkingUser);
                    }

                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                    sleep(randomIntFromInterval(3,5));

                    //we have to check if the user is already in blacklistCollection
                    //there is no need to create a function here cuz its literally the same number of lines of code
                    //returns true if user in blacklistCollection, false otherwise
                    var userInBlacklist = await blacklistCollection.exists({ id: checkingUser.pk });
                    //if user not in blacklist, we keep doing our thing
                    if(userInBlacklist === false){
                        console.log(checkingUser.username + ' not in blacklist');
                        //checking if the user is in leadsCollection, if he is, means that we already scrapped him
                        var userInLeads = await leadsCollection.exists({id: checkingUser.pk});
                        //if the user isnt in leads yet
                        if(userInLeads === false)
                        {
                            //making he's public before trying to get posts, otherwise we re going to get an error
                            if(checkingUser.is_private === false)
                            {
                                //WE CANT PUT THIS INSIDE A FUNCTION, DONT ASK ME WHY
                                //this used to be inside the checkBlacklistedWords function, but for some reason the api gives us broken responses if we ask for information inside a function, so I took it out,
                                //we ask for the posts information before applying the functions and then we pass that information to the function so we can use handle the data inside the functions
                                //this shouldnt happen because we already checked it previously, but if the user has no posts we just get a length of posts that is zero, in that case we just loop through an empty list and dont receive an error
                                //so we can just ask regardless and loop through it and do what we have to do, if they dont have any posts, we just loop through zero items. which shouldnt happen because first we check the number of posts they have and they have to have more than 20 posts for this code to run
                                //so theoretically, if we get an error, it should be because the api response came back broken and we just have to ask for it until it comes back no longer broken
                                //the posts response has pagination but we only need the first page of posts to do what we wanna do
                                try { 
                                    console.log("grabbing posts from " + checkingUser.username +  "...");
                                    var userFeed = ig.feed.user(checkingUser.pk);
                                    //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                    apiCalls = apiCalls + 1;
                                    console.log("API CALLS = " + apiCalls);
                                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                    sleep(randomIntFromInterval(3,5));
                                    var postsList = await userFeed.items();
                                    //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                    apiCalls = apiCalls + 1;
                                    console.log("API CALLS = " + apiCalls);
                                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                    sleep(randomIntFromInterval(3,5));
                                }
                                //if we catch an error we handle it here
                                catch(err){
                                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                    sleep(randomIntFromInterval(3,5));
                                    console.log("we got an error on grabbing posts from " + checkingUser.username);
                                    console.log(err);
                                    //use this boolean to track if an error exists
                                    var error = true;
                                    //while we have an error
                                    while(error === true)
                                    {
                                        //try this code
                                        try
                                        {
                                            var userFeed = ig.feed.user(checkingUser.pk);
                                            //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                            apiCalls = apiCalls + 1;
                                            console.log("API CALLS = " + apiCalls);
                                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                            sleep(randomIntFromInterval(3,5));
                                            var postsList = await userFeed.items();
                                            //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                            apiCalls = apiCalls + 1;
                                            console.log("API CALLS = " + apiCalls);
                                            //if no error is given by the line above, change the boolean to false, saying there s no error and this will exit the while loop
                                            error = false;
                                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                            sleep(randomIntFromInterval(3,5));
                                        }
                                        //if the try doesnt work, we just console.log the error and let the while loop take place again
                                        catch(err)
                                        {
                                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                            sleep(randomIntFromInterval(3,5));
                                            console.log("caught an error still on grabbing posts from " + checkingUser.username);
                                            console.log(err);
                                        }
                                    }
                                }
                                //it stops here the part that used to be inside the checkBlackListedWords function

                                //we check if they are a bot
                                //returns true if they are a bot, returns a false if the user isnt a bot
                                var isUserBot = await botFilter(checkingUser, postsList);

                                //if the user is a bot and isnt in leads
                                if(isUserBot === true)
                                {
                                    //we add him to blacklist
                                    await addUserToBlacklist(checkingUser);
                                }

                                //if the user isnt a bot and isnt in leads
                                else
                                {
                                    //we apply the filter to see if we add them to the scrape collection. returns true if we should add, returns false if we shouldnt
                                    var isUserScrapable = await toScrapeFilter(checkingUser);

                                    //if user fits the criteria to be added to the scrape collection
                                    if(isUserScrapable === true)
                                    {
                                        //we have to check if the user is already in toscrapecollection
                                        //there is no need to create a function here cuz its literally the same number of lines of code
                                        //returns true if user in toscrapecollection, false otherwise
                                        var userInToScrapeList = await toScrapeCollection.exists({ id: checkingUser.pk });
                                        //we only add them to the to scrape collection if they re not there yet, if they are, we just move on
                                        if(userInToScrapeList === false)
                                        {
                                            //we add him to the scrape collection to scrape him in the future
                                            await addUserToScrapeCollection(checkingUser);
                                        }
                                            
                                    }

                                    //if user doesnt fit the criteria to be added to the scrape collection
                                    else
                                    {
                                        //calculating average comments, likes and engagement rate
                                        var values  = await engagementRateCalculator(postsList, checkingUser);
                                        var averageLikes = values[0];
                                        var averageComments = values[1];
                                        var engagementRate = values[2];
                                        //adding those values to the checkingUser
                                        checkingUser.averageLikes = averageLikes;
                                        checkingUser.averageComments = averageComments;
                                        checkingUser.engagementRate = engagementRate;
                                        //since he isnt a bot and isnt in leads yet, we add the user to leads
                                        await addUserToLeads(checkingUser);
                                    }
                                }
                            }

                            //if the user is private, we cant even check his posts, so we add him to blacklist and move on
                            else
                            {
                                //if the user isnt public we cant grab posts or check anything so we just add him to blacklist and move on
                                await addUserToBlacklist(checkingUser);
                                console.log(checkingUser.username + " is private, we cant even grab posts from him, just add him to blacklist");
                            }
                                
                        }

                        //if the user is in leads already
                        else
                        {
                            //making he's public before trying to get posts, otherwise we re going to get an error
                            if(checkingUser.is_private === false)
                            {
                                //this used to be inside the checkBlacklistedWords function, but for some reason the api gives us broken responses if we ask for information inside a function, so I took it out,
                                //we ask for the posts information before applying the functions and then we pass that information to the function so we can use handle the data inside the functions
                                //this shouldnt happen because we already checked it previously, but if the user has no posts we just get a length of posts that is zero, in that case we just loop through an empty list and dont receive an error
                                //so we can just ask regardless and loop through it and do what we have to do, if they dont have any posts, we just loop through zero items. which shouldnt happen because first we check the number of posts they have and they have to have more than 20 posts for this code to run
                                //so theoretically, if we get an error, it should be because the api response came back broken and we just have to ask for it until it comes back no longer broken
                                //the posts response has pagination but we only need the first page of posts to do what we wanna do
                                try { 
                                    console.log("grabbing posts from " + checkingUser.username +  "...");
                                    var userFeed = ig.feed.user(checkingUser.pk);
                                    //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                    apiCalls = apiCalls + 1;
                                    console.log("API CALLS = " + apiCalls);
                                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                    sleep(randomIntFromInterval(3,5));
                                    var postsList = await userFeed.items();
                                    //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                    apiCalls = apiCalls + 1;
                                    console.log("API CALLS = " + apiCalls);
                                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                    sleep(randomIntFromInterval(3,5));
                                }
                                //if we catch an error we handle it here
                                catch(err){
                                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                    sleep(randomIntFromInterval(3,5));
                                    console.log("we got an error on grabbing posts from " + checkingUser.username);
                                    console.log(err);
                                    //use this boolean to track if an error exists
                                    var error = true;
                                    //while we have an error
                                    while(error === true)
                                    {
                                        //try this code
                                        try
                                        {
                                            var userFeed = ig.feed.user(checkingUser.pk);
                                            //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                            apiCalls = apiCalls + 1;
                                            console.log("API CALLS = " + apiCalls);
                                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                            sleep(randomIntFromInterval(3,5));
                                            var postsList = await userFeed.items();
                                            //we re counting the number of api requests we re making until we get blocked so we can know the limit we have
                                            apiCalls = apiCalls + 1;
                                            console.log("API CALLS = " + apiCalls);
                                            //if no error is given by the line above, change the boolean to false, saying there s no error and this will exit the while loop
                                            error = false;
                                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                            sleep(randomIntFromInterval(3,5));
                                        }
                                        //if the try doesnt work, we just console.log the error and let the while loop take place again
                                        catch(err)
                                        {
                                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                            sleep(randomIntFromInterval(3,5));
                                            console.log("caught an error still on grabbing posts from " + checkingUser.username);
                                            console.log(err);
                                        }
                                    }
                                }


                                //we check if they are a bot
                                //returns true if they are a bot, returns a false if the user isnt a bot
                                var isUserBot = await botFilter(checkingUser, postsList);

                                //if the user is a bot and is in leads
                                if(isUserBot === true)
                                {
                                    //we add him to blacklist
                                    await addUserToBlacklist(checkingUser);
                                    //we remove him from leads
                                    await removeUserFromLeads(checkingUser);

                                }

                                //if the user isnt a bot and is in leads
                                else
                                {
                                    //we want to update him in leads
                                    //calculating average comments, likes and engagement rate
                                    var values  = await engagementRateCalculator(postsList, checkingUser);
                                    var averageLikes = values[0];
                                    var averageComments = values[1];
                                    var engagementRate = values[2];
                                    //adding those values to the checkingUser
                                    checkingUser.averageLikes = averageLikes;
                                    checkingUser.averageComments = averageComments;
                                    checkingUser.engagementRate = engagementRate;
                                    //we update him in leads
                                    await updateUserInLeads(checkingUser);
                                    //and then we want to move on to the next username to filter
                                    
                                }
                            }

                            //if the user is private, we cant even check his posts, so we add him to blacklist and move on
                            else
                            {
                                //if the user isnt public we cant grab posts or check anything so we just add him to blacklist and move on
                                await addUserToBlacklist(checkingUser);
                                console.log(checkingUser.username + " is private, we cant even grab posts from him, just add him to blacklist");
                            }

                        }
                    }
                    //if user is in blacklist, we just want to move to the next user in the suggested list of usernames
                    else{
                        console.log(checkingUser.username + ' already in Blacklist, checking next username');
                    }
                    //sleeps for 3 to 5 seconds so we instagram doesnt block us
                    sleep(randomIntFromInterval(3,5));
                }


                //once we re done with looping through every user we got from userToScrape and filtering them, we add the user to scrape in leads to say that we already scrapped him and remove him from the to scrape in the future list
                //calculating average comments, likes and engagement rate
                var values  = await engagementRateCalculator(postsList, userToScrape);
                var averageLikes = values[0];
                var averageComments = values[1];
                var engagementRate = values[2];
                //adding those values to the checkingUser
                userToScrape.averageLikes = averageLikes;
                userToScrape.averageComments = averageComments;
                userToScrape.engagementRate = engagementRate;
                //adding scrapped user to leads
                await addUserToLeads(userToScrape);
                //sleeps 10 seconds to make sure we update the list of to scrape ids before moving on, otherwise we ll keep going through the same users
                //sleep(10000);
                //once we scrapped the user, we want to remove him from the to scrape list and add him to leads
                //once we re done with what we have to do, we want to update the toScrapeUsernames list, because since then the toScrapeCollection was updated
                //we re calling the to scrape collection and saving the list of users we have there into a variable
                toScrapeIds = await toScrapeCollection.find({});
                console.log("We should have updated the fucking list of ids to scrape toScrapeIds: " + toScrapeIds.length);
                //we have to define user to scrape here so it is undefined, otherwise it wont run the while loop to get the next user to scrape because if not then we have userToScrape !== undefined
                //and we'll just keep scraping the same user
                userToScrape = undefined;
            }

            //if hes not public, if hes private, we cant grab anything, so we had him to the blacklist
            else
            {
                //we re adding the user we grabbed from the to scrape list to the blacklist and removing it from the to scrape list because he s private now
                await addUserToBlacklist(userToScrape);
                /*//we re removing the user from the to scrape collection
                await removeUserFromToScrapeList(userToScrape);*/
            }

        }

        //this is where this code originally was, but it wasn't reading this code on time, so we moved it to the line 857 to see if it works
        /*
        //once we scrapped the user, we want to remove him from the to scrape list and add him to leads
        //once we re done with what we have to do, we want to update the toScrapeUsernames list, because since then the toScrapeCollection was updated
        //we re calling the to scrape collection and saving the list of users we have there into a variable
        var toScrapeIds = await toScrapeCollection.find({});
        console.log("toScrapeIds: " + toScrapeIds.length);
        */
    }

    
    //sleeps for 3 to 5 seconds so we instagram doesnt block us
    sleep(randomIntFromInterval(3,5));
    
    
    
})();

//starts the server
app.listen(3000, () => console.log('Server started'));