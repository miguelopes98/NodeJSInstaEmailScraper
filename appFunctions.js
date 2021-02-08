//importing express
const express = require('express');
//importing the leadsUser model as leadsCollection, whenever we want to make a change in the leadsCollection, we use leadsCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const leadsCollection = require('./models/leadsUser.js');
//importing the toScrapeUser model as toScrapeCollection, whenever we want to make a change in the toScrapeCollection, we use toScrapeCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const toScrapeCollection = require('./models/toScrapeUser.js');
//importing the blacklistUser model as blacklistCollection, whenever we want to make a change in the blacklistCollection, we use blacklistCollection.create(...) and etc
//inside the models folder will be all of the models and schemas we will need
const blacklistCollection = require('./models/blacklistUser.js');
//requiring this packed so we can read into the file
const fs = require("fs");
// Require gender detection module
const gender = require('gender-detection');


//sleeps for 3 to 5 seconds so we instagram doesnt block us
sleep(randomIntFromInterval(3,5));

//we have to use an async function because of js being asyncronous. we just use async to start defining a nameless async function, which allows us to write the 'await' command that lets us wait for a response before moving on.

    //this is the filter that we use to see if an account is suitable to be added to the 'toscrape in the future list'
    //returns true if the account is suitable to be added to the 'to scrape in the future list' and returns false otherwise
    async function toScrapeFilter(userProfileInformation)
    {
        //the user has to have more than 50 posts
        if(userProfileInformation.media_count > 50)
        {
            //if it has more then 3k followers and less than 50k followers
            if(userProfileInformation.follower_count > 5000 && userProfileInformation.follower_count < 30000)
            {
                //if it follows more than 300 people and less than 2.5k people
                if(userProfileInformation.following_count > 300 && userProfileInformation.following_count < 2500)
                {
                    console.log(userProfileInformation.username + " goes to to scrape in the future list");
                    //return true as in, true, add them to the 'to scrape in the future list'
                    return true;

                }
                //if it follows less than 300 people or more than 2k people
                else
                {
                    console.log(userProfileInformation.username + " follows less than 300 people or more than 2k people");
                    console.log(userProfileInformation.username + " goes to leads");
                }
            }
            //if it has less than 3k followers or more than 50k followers
            else
            {
                console.log(userProfileInformation.username + " has less than 3k followers or more than 50k followers");
                console.log(userProfileInformation.username + " goes to leads");
            }
        }
        //if it has less than 50 posts
        else
        {
            console.log(userProfileInformation.username + " has less than 50 posts");
            console.log(userProfileInformation.username + " goes to leads");
        }
        //if nothing prior has been returned it means the user did not pass 1 of the if statements and should not pass the filter
        //the user is not added to 'to scrape in the future list'
        //return false as in, false, dont add them to the 'to scrape in the future list'
        return false;
    }


    //checks if a user is a bot/allows us to grab his contact, if it isnt a bot and allows us to grab their contact, we return false, if the user is a bot or doesnt allow us to grab their contact, we return true
    async function botFilter(userProfileInformation, postsList)
    {
        //checking if the user is public
        if(userProfileInformation.is_private === false)
        {
            if(userProfileInformation.has_anonymous_profile_picture === false)
            {
                //checking if the user has a business account, if it doenst, we cant get their contacts
                if(userProfileInformation.is_business === true || userProfileInformation.is_potential_business === true)
                {
                    //checking if the user has a scrappable email or phone number (this api doesnt return phone numbers, only emails)
                    if(userProfileInformation.public_email !== null)
                    {
                        //checking if the user has more than 5 posts
                        if(userProfileInformation.media_count > 20)
                        {
                            //checking if the user has more than 100 followers
                            if(userProfileInformation.follower_count > 100)
                            {
                                //THIS USED TO BE INSIDE A FUNCTION CALLED checkBlackListedWords BUT eventually the code stopped recognizing the function, whether the function was defined in the same file or not
                                //checking for blacklisted words in the user's profile
                                //readFileSync returns a Buffer, so it must first be converted to a string in order for split (in the next line) to work
                                var blacklistedWordsText = fs.readFileSync("./BlacklistedWords.txt").toString('utf-8');
                                //turn the text inside the file into a string and split all the words into a list using "," as the delimeter
                                var blacklistedWordsList = blacklistedWordsText.split(",");
                                //this is where we re gonna save the posts of the user
                                var posts = [];

                                console.log("checking for blacklisted words...");
                                //sleeps for 3 to 5 seconds so we instagram doesnt block us
                                sleep(randomIntFromInterval(3,5));
                                //loop through the posts we received and push to the array
                                for( var i = 0; i < postsList.length; i++)
                                {
                                    posts.push(postsList[i]);
                                }
                                    
                                //if there is a bio, save it into a string
                                if(userProfileInformation.biography !== '')
                                {
                                    //saving the bio into a string
                                    var allTextFromUser = userProfileInformation.biography + " ";
                                }

                                //looping through all of the posts we pushed to the list, grab their caption and add it to allTextFromUser
                                for (var i = 0; i < posts.length; i++)
                                {
                                    //if a post doesnt have a caption, the ...caption.edges[0] is undefined, we get an error, so we only grab the captions of the posts that actually have a caption
                                    if(posts[i].caption !== null)
                                    {
                                        //add the caption to the alltext from user
                                        allTextFromUser = allTextFromUser + posts[i].caption.text;
                                    }
                                }
                                //remove line breaks from the string
                                allTextFromUser = allTextFromUser.replace(/\r?\n|\r/g, " ");
                                //remove all special characters from a string leaving nothing but letters and spaces
                                allTextFromUser = allTextFromUser.replace(/[^a-zA-Z ]/g, "");
                                //if we have more than one sequencial space, we remove the extra space(s) leaving only one space
                                allTextFromUser = allTextFromUser.replace(/\s+/g,' ').trim();
                                //turning everything in the string to lower case, so we dont have capital letters
                                allTextFromUser = allTextFromUser.toLowerCase();
                                //turning the allTextFromUser into an array where each element is a word, we do this by grabbing the group of letters that are separated by a space
                                allTextFromUser = allTextFromUser.split(" ");
                                //loop through all the blacklisted words in the list
                                for(var i = 0; i < blacklistedWordsList.length; i++)
                                {
                                    //if there are blacklisted words in the bio and caption of the posts of the user, we print that and return true, saying true, he is a bot
                                    if(allTextFromUser.includes(blacklistedWordsList[i]) === true)
                                    {
                                        console.log(userProfileInformation.username + " has blacklisted words in his profile");
                                        //return true as in, true the user has blacklisted words in his profile and is a bot
                                        return true
                                    }
                                }
                                //if nothing has been returned so far then
                                //return false, saying false, the user doesnt have any blacklisted words in his profile and isnt a bot
                                return false

                                //this is where the part that was inside the function called checkBlackListedWords ends
                                    
                            }
                            else
                            {
                                console.log(userProfileInformation.username + " has less than 100 followers");
                            }
                        }
                        else
                        {
                            console.log(userProfileInformation.username + " has 19 or less posts, so we dont want them");
                        }
                    }
                    else
                    {
                        console.log(userProfileInformation.username + " doesnt have an email to scrape");
                    }
                }
                else
                {
                    console.log(userProfileInformation.username + " doesnt have a business account");
                }
            }
            else
            {
                console.log(userProfileInformation.username + " doesnt have a profile picture");
            }
        }
        else
        {
            console.log(userProfileInformation.username + " is private. IsPrivate: " + String(userProfileInformation.is_private));
        }
        //If nothing prior has been returned it means the user did not pass 1 of the if statements and should not pass the filters
        //return true as in, true, the user is a bot and should be blacklisted
        return true
    }

    //adds a given user to the blacklist collection
    async function addUserToBlacklist(userProfileInformation){
        //we add him to blacklist
        await blacklistCollection.create({id: userProfileInformation.pk}, function(err, savedId)
        {
           if(err)
           {
               console.log(userProfileInformation.username + " WAS NOT ADDED TO BLACKLIST" + "/n" + err);
           }
           else
           {
               console.log(userProfileInformation.username + " is a bot, added it to blacklist");
           }
        });
    }

    async function removeUserFromLeads(userProfileInformation){
        //we remove a given user from leads
        await leadsCollection.deleteOne({id: userProfileInformation.pk}, function(err)
        {
            if(err)
            {
                console.log(userProfileInformation.username + " WAS NOT REMOVED FROM LEADS" + "/n" + err);
            }
            else
            {
                console.log(userProfileInformation.username + " is a bot, was removed from leads");
            }
        });
    }

    //adds a given user to the leads collection
    async function addUserToLeads(userProfileInformation){
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
        //checking the gender of the user
        var userGender = await gender.detect(userProfileInformation.full_name);
        //settting the gender of the user
        userData.gender = userGender;

        //we add him to leads
        await leadsCollection.create(userData, function(err, savedId)
        {
           if(err)
           {
               console.log(userProfileInformation.username + " WAS NOT ADDED TO LEADS" + "/n" + err);
           }
           else
           {
               console.log(userProfileInformation.username + " user added to leads");
           }
        });
    }
    
    //removes a user from the to scrape collection
    async function removeUserFromToScrapeList(userProfileInformation){
        //we remove a given user from leads
        await toScrapeCollection.deleteOne({id: userProfileInformation.pk}, function(err)
        {
            if(err)
            {
                console.log(userProfileInformation.username + " WAS NOT REMOVED FROM TO SCRAPE IN THE FUTURE LIST" + "/n" + err);
            }
            else
            {
                console.log(userProfileInformation.username + " scrapped, removed from to scrape list");
            }
        });
    }

    //updates a user in the leads collection
    async function updateUserInLeads(userProfileInformation){
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
        //checking the gender of the user
        var userGender = await gender.detect(userProfileInformation.full_name);
        //settting the gender of the user
        userData.gender = userGender;

        //we use replace one instead of update, because replace replaces the whole thing, which is what we want, update sometimes only changes the things that are defined and shit like that from what i understood
        //we grab the user we that id, and we replace the doc with the user we just grabbed (new one, just updated)
        leadsCollection.updateOne({id: userProfileInformation.pk}, {"$set": userData}, function(err)
        {
            if(err)
            {
                console.log(userProfileInformation.username + " NOT updated in leads" + "/n" + err);
            }
            else
            {
                console.log(userProfileInformation.username + " updated in leads");
            }
        });
    }

    //adds a user to the scrape collection
    async function addUserToScrapeCollection(userProfileInformation){
        toScrapeCollection.create({id: userProfileInformation.pk}, function(err, addedUser){
            if(err)
            {
                console.log(userProfileInformation.username + " WAS NOT ADDED TO SCRAPE COLLECTION" + "/n" + err);
            }
            else
            {
                console.log(userProfileInformation.username + " was added to the scrape collection");
            }
        });
    }

    //this function calculates the engagement rate, the average likes and comments. everything based on the last 12 posts (its what the api posts pagination gives us in one request)
    //requires a postsList so we can access likes and comments without having to make the api call here and requires a user information so we can access the number of followers without making the api call here
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

exports.botFilter = botFilter;
exports.toScrapeFilter = toScrapeFilter;
exports.sleep = sleep;
exports.addUserToBlacklist = addUserToBlacklist;
exports.removeUserFromLeads = removeUserFromLeads;
exports.addUserToLeads = addUserToLeads;
exports.removeUserFromToScrapeList = removeUserFromToScrapeList;
exports.updateUserInLeads = updateUserInLeads;
exports.addUserToScrapeCollection = addUserToScrapeCollection;
exports.engagementRateCalculator = engagementRateCalculator;
exports.randomIntFromInterval = randomIntFromInterval;