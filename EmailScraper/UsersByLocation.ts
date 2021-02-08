/////////////////// TO RUN THIS SCRIPT USE npx ts-node app1.ts//////////////////////
//we re using two packages to run this code in typescript, one called ts-node and the other one called typescript



/*
const mongoose = require('mongoose');
const express = require('express');
const app = express();
//requiring the file that has the command to connect to the database
const connectDB = require('./database/connection.js');
//importing the LocationUsers model as locationUsersCollection, whenever we want to make a change in the locationUsersCollection, we use locationUsersCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const locationUsersCollection = require('./models/locationUsers.js');
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

    //sleeps for 3 to 5 seconds so we instagram doesnt block us
    sleep(randomIntFromInterval(3,5));

    ////////// SCRIPT TO GET USERNAMES BASED ON LOCATION /////////////////////


    //the number of users we want to get from each location
    var numberUsersOneLocation = 20;
    //the number of usernames we want the list we re grabbing to have
    var numberOfTotalUsernames = 1000;
    //this is the list of usernames we want to provide the website
    var usernamesList = [];
    //we have to define a list of Ids of locations, for now lets just leave one location
    //we want 1000 users, 50 locations and 20 users per location or the other way around
    //malibu, santa monica beach, laguna beach, newport beach, huntington beach, venice beach, manhattan beach, pismo beach, berkeley university, ucla, university of tennessee, santa barbara, university of florida
    //university of miami, university of south florida, university of south carolina, university of north carolina charlotte, university of columbia, university of new york, university of san diego, university of houston, university of chicago
    //university of central florida, university of toronto, university of waterloo, copenhagen university, university of memphis, stockholm university, stockholm school of economics, oslo metropolitan university
    //university of helsinki, university of melbourne, university of auckland, university of milan, politecnico of milan, universidade catolica de lisboa, barcelona beach, hogeschool amsterdam, Ludwig Maximilian University of Munich, Humboldt University of Berlin, Freie Universität Berlin, heidelberg university, uppsala university, national university of singapore, ohio state university, florida international university, university of minnesota twin cities, university of texas at austin, arizona state university, georgia state university, michigan state university 50
    var locationList = [213873866, 1152951608161154, 213445472, 213413990, 213321244, 302488360, 213469393, 213346916, 212941532, 476317, 89769773068, 213047202, 44496359631, 212900043, 213230486, 191085, 102471088936, 6768, 187846, 212935169, 1558, 862337, 55855, 192380, 2933199, 163464558272, 33727737, 97976895, 4662251, 226321442, 102428, 216621735, 241177, 459430, 342519554742, 396032168, 235050158, 63110, 497969, 218069950, 52034837854, 229652168, 24228751, 214700938, 213218453, 215233990, 157535, 103406071202371, 1193792440644613, 213964329];
    console.log("location list length = " + locationList.length);
    //defining a variable, read comment above the next while loop
    var i = 0;
    //since we want to grab users from multiple locations and not only one, we will iterate through the each location only if we dont already have the total number of usernames we want
    //then iterate through the posts of a location only if we dont already have the total number of usernames we want and if we dont already have the number of usernames we want from that location
    //after that, we switch to the next location in the list
    //we didnt do a for loop, because if had used a for loop, even if we had the total number of usernames we wanted, the code would just keep running until we had gone through all the locations
    while(i < locationList.length && usernamesList.length < numberOfTotalUsernames)
    {
        console.log("we want " + numberOfTotalUsernames + " total usernames, and we already have " + usernamesList.length);
        console.log("scouting location " + i + " out of " + locationList.length);
        //we set the location id to be the item of the locationList
        var locationId = locationList[i];
        //counts the number of users we want to add to the 1k list from one location
        var usernamesOneLocation = 0;
        //gets the feed of the location that has the id we provide, that was the id retrieved from the lines above
        var locationFeed = await ig.feed.location(locationId);
        //sleeps for 3 to 5 seconds so we instagram doesnt block us
        sleep(randomIntFromInterval(3,5));
        //prints the items, the posts of the feed we chose above, the items come with the details of the owner of each post, that means we can grab an id from each post and check if we want to scrape them or not
        var items = await locationFeed.items();

        //we re going to loop through the first page of posts, we have to do this so the value locationFeed.isMoreAvailable() becomes true, because we have to ask for the command .items() for locationFeed.isMoreAvailable() to  become true
        //and then we ll loop through all the next pages
        //defining a variable, read comment above the next while loop
        var k =0;
        //we want to loop through the list of items, but we also only want to go to the next item if the number of usernames of one location wasnt reached yet, so we did it like that
        //I know that the condition of usernamesOneLocation.length < numberUsersOneLocation is already in the while loop above, the problem is that, if we had used a for loop to loop through the items
        //if we had already 4 users before entering that for loop, we might have left that for loop with more than 5 users from one location, if we didn't want that to happen, then we would have
        //to insert an if statement inside the for loop checking the we hit the number of users for one location. if that was the case, whenever we hit the number, it would just keep looping through the rest of the list
        //which obviously is a waste of time, so I just did it like this
        //if we reach the number of total usernames, fuck the number of users we want from one location, we re done
        //we grabbed the items of the first page, now we want to loop through them, search the details of the owner of the post, if it fits the criteria, we add that user to the list of the 1k users
        while(k < items.length && usernamesOneLocation < numberUsersOneLocation && usernamesList.length < numberOfTotalUsernames)
        {
            console.log("we want " + numberOfTotalUsernames + " total usernames, and we already have " + usernamesList.length);
            console.log("we only have " + usernamesOneLocation + " usernames on this location, out of " + numberUsersOneLocation + " we keep scouting this location");
            //sleeps for 3 to 5 seconds so we instagram doesnt block us
            sleep(randomIntFromInterval(3,5));
            //grabbing the information of the current user
            var userToCheck = await ig.user.info(items[k].user.pk);
            console.log("checking... " + userToCheck.username);
            //sleeps for 3 to 5 seconds so we instagram doesnt block us
            sleep(randomIntFromInterval(3,5));
            //checking if the user has the conditions to be added to the database
            var values = await filterUser(userToCheck);
            //is true if we should add the user to the database
            var doWeAddUserToList = values[0];
            var averageLikes = values[1];
            var averageComments = values[2];
            var engagementRate = values[3];
            //if the user had the conditions to be added to the list of usernames, then
            if(doWeAddUserToList === true)
            {
                //this value will be true if the user already exists in the database, we only want to add this user if he isnt in the database yet
                var userInDatabase = await locationUsersCollection.exists({id: userToCheck.pk});
                //we check if the user is already in the usernames list, if it isnt, then we add him
                if(userInDatabase === false)
                {
                    //we add him to the list
                    usernamesList.push(userToCheck.username);
                    //we update the index of the number of usernames in one location
                    usernamesOneLocation = usernamesOneLocation + 1;
                    //if we added the user to list it means we want to add them to the database as well
                    var userData = {
                        id: userToCheck.pk,
                        username: userToCheck.username,
                        fullName: userToCheck.full_name,
                        followersCount: userToCheck.follower_count,
                        followingsCount: userToCheck.following_count,
                        bio: userToCheck.biography,
                        businessEmail: userToCheck.public_email,
                        externalUrl: userToCheck.external_url,
                        isVerified: userToCheck.is_verified,
                        averageLikes: averageLikes,
                        averageComments: averageComments,
                        engagementRate: engagementRate,
                        mediaCount: userToCheck.media_count,
                        following_tag_count: userToCheck.following_tag_count,
                        usertagsCount: userToCheck.usertags_count,
                        isInterestAccount: userToCheck.is_interest_account,
                        has_chaining: userToCheck.has_chaining,
                        show_shoppable_feed: userToCheck.show_shoppable_feed,
                        category: userToCheck.category,
                        address_street: userToCheck.address_street,
                        city_name: userToCheck.city_name,
                        latitude: userToCheck.latitude,
                        longitude: userToCheck.longitude,
                        public_phone_country_code: userToCheck.public_phone_country_code,
                        public_phone_number: userToCheck.public_phone_number,
                        zip: userToCheck.zip,
                        is_potential_business: userToCheck.is_potential_business,
                        is_business: userToCheck.is_business
                    }
                    await locationUsersCollection.create(userData, function(err){
                        if(err)
                        {
                            console.log(err);
                            console.log(userToCheck.username + " not added to the database");
                        }
                        else
                        {
                            console.log(userToCheck.username + " added to database");
                        }
                    });
                }
            }
            //update the counter so we go to the next item of the list
            k = k + 1;
        }


        // we want to keep searching for users in this location feed until theres no more posts or until we have the number of users we want from each location
        //if we reach the number of total usernames, fuck the number of users we want from one location, we re done
        while(usernamesOneLocation < numberUsersOneLocation && locationFeed.isMoreAvailable() === true && usernamesList.length < numberOfTotalUsernames)
        {
            //defining a variable, read comment above the next while loop
            var j =0;
            //sleeps for 3 to 5 seconds so we instagram doesnt block us
            sleep(randomIntFromInterval(3,5));
            //asking for the next page of items
            //prints the items, the posts of the feed we chose above, the items come with the details of the owner of each post, that means we can grab an id from each post and check if we want to scrape them or not
            var items = await locationFeed.items();
            //sleeps for 3 to 5 seconds so we instagram doesnt block us
            sleep(randomIntFromInterval(3,5));
            //we want to loop through the list of items, but we also only want to go to the next item if the number of usernames of one location wasnt reached yet, so we did it like that
            //I know that the condition of usernamesOneLocation.length < numberUsersOneLocation is already in the while loop above, the problem is that, if we had used a for loop to loop through the items
            //if we had already 4 users before entering that for loop, we might have left that for loop with more than 5 users from one location, if we didn't want that to happen, then we would have
            //to insert an if statement inside the for loop checking the we hit the number of users for one location. if that was the case, whenever we hit the number, it would just keep looping through the rest of the list
            //which obviously is a waste of time, so I just did it like this
            //if we reach the number of total usernames, fuck the number of users we want from one location, we re done
            //we grabbed the items of the first page, now we want to loop through them, search the details of the owner of the post, if it fits the criteria, we add that user to the list of the 1k users
            while(j < items.length && usernamesOneLocation < numberUsersOneLocation && usernamesList.length < numberOfTotalUsernames)
            {
                console.log("we want " + numberOfTotalUsernames + " total usernames, and we already have " + usernamesList.length);
                console.log("we only have " + usernamesOneLocation + " usernames on this location, out of " + numberUsersOneLocation + " we keep scouting this location");
                console.log("still scouting location " + i + " out of " + locationList.length);
                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                sleep(randomIntFromInterval(3,5));
                //grabbing the information of the current user
                var userToCheck = await ig.user.info(items[j].user.pk);
                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                sleep(randomIntFromInterval(3,5));
                console.log("checking... " + userToCheck.username);
                //checking if the user has the conditions to be added to the list of usernames
                var values = await filterUser(userToCheck);
                var doWeAddUserToList = values[0];
                var averageLikes = values[1];
                var averageComments = values[2];
                var engagementRate = values[3];
                //if the user had the conditions to be added to the list of usernames, then
                if(doWeAddUserToList === true)
                {
                    //this value will be true if the user already exists in the database, we only want to add this user if he isnt in the database yet
                    var userInDatabase = await locationUsersCollection.exists({id: userToCheck.pk});
                    //we check if the user is already in the usernames list, if it isnt, then we add him
                    if(userInDatabase === false)
                    {
                        //we add him to the list
                        usernamesList.push(userToCheck.username);
                        //we update the index of the number of usernames in one location
                        usernamesOneLocation = usernamesOneLocation + 1;
                        //if we added the user to list it means we want to add them to the database as well
                        var userData = {
                            id: userToCheck.pk,
                            username: userToCheck.username,
                            fullName: userToCheck.full_name,
                            followersCount: userToCheck.follower_count,
                            followingsCount: userToCheck.following_count,
                            bio: userToCheck.biography,
                            businessEmail: userToCheck.public_email,
                            externalUrl: userToCheck.external_url,
                            isVerified: userToCheck.is_verified,
                            averageLikes: averageLikes,
                            averageComments: averageComments,
                            engagementRate: engagementRate,
                            mediaCount: userToCheck.media_count,
                            following_tag_count: userToCheck.following_tag_count,
                            usertagsCount: userToCheck.usertags_count,
                            isInterestAccount: userToCheck.is_interest_account,
                            has_chaining: userToCheck.has_chaining,
                            show_shoppable_feed: userToCheck.show_shoppable_feed,
                            category: userToCheck.category,
                            address_street: userToCheck.address_street,
                            city_name: userToCheck.city_name,
                            latitude: userToCheck.latitude,
                            longitude: userToCheck.longitude,
                            public_phone_country_code: userToCheck.public_phone_country_code,
                            public_phone_number: userToCheck.public_phone_number,
                            zip: userToCheck.zip,
                            is_potential_business: userToCheck.is_potential_business,
                            is_business: userToCheck.is_business
                        }
                        await locationUsersCollection.create(userData, function(err){
                            if(err)
                            {
                                console.log(err);
                                console.log(userToCheck.username + " not added to the database");
                            }
                            else
                            {
                                console.log(userToCheck.username + " added to database");
                            }
                        });
                    }
                }
                //update the counter so we go to the next item of the list
                j = j + 1;
            }
        }
        i = i + 1 ;
    }
    
    //once we got all the users we need 

    //when we re done scrapping this, we logout
    await ig.user.logout();
    console.log("logged out");


    //this functions checks if a user has the conditions to be added to the list of the 1k users, returns true if we should add the user to the list, returns false otherwise
    async function filterUser(userProfileInformation){
        //is public
        if(userProfileInformation.is_private === false)
        {
            //minimum 50 posts
            if(userProfileInformation.media_count > 50)
            {
                //following between 300 and 2500
                if(userProfileInformation.following_count > 300 && userProfileInformation.following_count < 2500)
                {
                    //followers between 5k and 30k
                    if(userProfileInformation.follower_count > 5000 && userProfileInformation.follower_count < 30000)
                    {
                        
                        //checking the gender of the user
                        var userGender = await gender.detect(userProfileInformation.full_name);
                        //female
                        //the gender can be unknown, male or female, but i noticed that this package doesnt have that good of accuracy, it might be because of people not putting the full name correctly on instagram, but
                        //we just leave male out and gather the unknowns and females, otherwise we re going to be stuck here forever and we still someone that checks all the filters
                        if(userGender !== "male")
                        {
        
                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                            sleep(randomIntFromInterval(3,5));
                            var userFeed = ig.feed.user(userProfileInformation.pk);
                            //sleeps for 3 to 5 seconds so we instagram doesnt block us
                            sleep(randomIntFromInterval(3,5));
                            var postsList = await userFeed.items();
                            var values = await engagementRateCalculator(postsList, userProfileInformation);
                            var averageLikes = values[0];
                            var averageComments = values[1];
                            var engagementRate = values[2];
                            //engagement rate above 3%
                            if(engagementRate > 3.0)
                            {
                                console.log("we should add " + userProfileInformation.username + " to the list");
                                //return true as in, true, add the user to the list
                                return [true, averageLikes, averageComments, engagementRate];
                            }
                            else
                            {
                                console.log(userProfileInformation.username + " has an engagement rate lower than 3%: " + engagementRate);
                            }
                        }
                        else
                        {
                            console.log(userProfileInformation.username + " isnt a girl");
                        }
                    }
                    else
                    {
                        console.log(userProfileInformation.username + " has less than 5k followers or more than 30k followers");
                    }
                }
                else
                {
                    console.log(userProfileInformation.username + " follows less than 300 people or more than 2500 people");
                }
            }
            else
            {
                console.log(userProfileInformation.username + " has less than 50 posts");
            }
        }
        else
        {
            console.log(userProfileInformation.username + " has a private profile");
        }
        //if nothing previous was returned, it means the user didnt pass one of the filters, and because of that we do not want to add him to the list, and so we return false
        return false;
    }

})();

//starts the server
app.listen(3000, () => console.log('Server started'));


////////////// Examples on how to user location features on this api ///////////////
/*

    //gets a list of location that are in the area of these coordinates
    var locationSearch  = await ig.locationSearch.index(29.643863809029, -82.353944778442);
    //console.log("locationSearch = " + locationSearch);

    //sleeps for 3 to 5 seconds so we instagram doesnt block us
    sleep(randomIntFromInterval(3,5));

    //we choose the location we want from the list above and use the id of the location we want here to get a few details if we want, not really necessary
    var location = await ig.location.info(44496359631);
    //console.log("location = " + location.pk);

    //sleeps for 3 to 5 seconds so we instagram doesnt block us
    sleep(randomIntFromInterval(3,5));

    //we do this so we can see the actual object instead of [object object]
    var str = JSON.stringify(locationSearch, null, 4);
    console.log(str);

    //we do this so we can see the actual object instead of [object object]
    var str = JSON.stringify(location, null, 4);
    console.log(str);
    
    //gets the feed of the location that has the id we provide, that was the id retrieved from the lines above
    var locationFeed = await ig.feed.location(44496359631);

    //sleeps for 3 to 5 seconds so we instagram doesnt block us
    sleep(randomIntFromInterval(3,5));

    //prints the items, the posts of the feed we chose above, the items come with the details of the owner of each post, that means we can grab an id from each post and check if we want to scrape them or not
    var items = await locationFeed.items();
    console.log("items = " + items.length);
*/
//////////////////////////////////////////////

/*
async function engagementRateCalculator(postsList, userProfileInformation){
    //defining variables we need
    var totalLikes = 0;
    var totalComments = 0;
    var averageLikes = 0;
    var averageComments = 0;
    var engagementRate = 0;
    //looping through the posts and adding the comments and likes of each post to the total comments and likes variables
    for(var i = 0; i < postsList.length; i++)
    {
        totalComments = totalComments + postsList[i].comment_count;
        totalLikes = totalLikes + postsList[i].like_count;
    }
    //calculating average likes and comments
    averageLikes = totalLikes/postsList.length;
    averageComments = totalComments/postsList.length;
    //calculating the engagement rate
    //add up all the likes, all the comments, add them together, get the average by post (dividing by the number of posts the api got us) and then divide everything by the number of followers
    engagementRate = ( ((totalLikes + totalComments)/postsList.length) / userProfileInformation.follower_count)*100;
    //returns a list where the first element is average likes, the second is average comments and the third one is engagement rate
    return [averageLikes, averageComments, engagementRate];
}



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

 */