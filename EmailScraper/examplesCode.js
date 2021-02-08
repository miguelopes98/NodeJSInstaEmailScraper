/////////////////// TO RUN THIS SCRIPT USE npx ts-node app1.ts//////////////////////



//we re using two packages, one called ts-node and the other one called typescript


//Note for JavaScript users: As of Node v.13.5.0, there isn't support for ESModules and the 'import'-syntax. So you have to read the imports in the examples like this:
//import { A } from 'b' ➡ const { A } = require('b')
//import { IgApiClient } from './index';
const { IgApiClient } = require('./src/index.ts');
//import { sample } from 'lodash';
const {sample } = require('lodash');
const ig = new IgApiClient();
// You must generate device id's before login.
// Id's generated based on seed
// So if you pass the same value as first argument - the same id's are generated every time
ig.state.generateDevice('username');
// Optionally you can setup proxy url
//ig.state.proxyUrl = process.env.IG_PROXY;
(async () => {
    // Execute all requests prior to authorization in the real Android application
    // Not required but recommended
    await ig.simulate.preLoginFlow();

    sleep(3000);

    const loggedInUser = await ig.account.login('username', 'password');
    console.log(loggedInUser);

    sleep(3000);

    // The same as preLoginFlow()
    // Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
    process.nextTick(async () => await ig.simulate.postLoginFlow());

    sleep(3000);


    /////////////////USER POSTS////////////////////////
    const userFeed = ig.feed.user('1521222314');
    const myPostsFirstPage = await userFeed.items();
    //console.log(myPostsFirstPage);
    
    sleep(3000);

    /////////////////SUGGESTED PROFILES, NO PAGINATION NEEDED/////////////////////////////////
    var discoverFeed = await ig.discover.chaining('2023925306');
    //console.log(discoverFeed);

    sleep(3000);

    /////////////////RETURNS A USER ID OF A GIVEN USERNAME////////////////
    var userId = await ig.user.getIdByUsername('inesortigueira_');
    //console.log(userId);
    sleep(3000);

    ////////////ACCOUNT DETAILS///////////////////
    var user = await ig.user.info(userId);
    console.log(user);

    sleep(3000);

    //////////////////////FOLLOWERS WITH PAGINATION ALREADY //////////////////////////
    //(gets everything but one user, idk why, fuck it)

    var followers = []

    //ask for followers of an account of given if
    var followersFeed = ig.feed.accountFollowers(loggedInUser.pk);
    console.log(followersFeed);

    sleep(3000);
    //this is what allows us to get the next page, if we call this multiple times, then we get the next page at every request until followersFeed.isMoreAvailable() returns false
    //this is the list of followers
    var items = await followersFeed.items();
    
    for(var i = 0; i < items.length; i++)
    {
        followers.push(items[i].username);
    }

    console.log(followersFeed.isMoreAvailable());
    
    //the api pagination in this api is automated so we keep calling for followersFeed.items() until followersFeed.isMoreAvailable() returns false, means we went through all the pages
    while(followersFeed.isMoreAvailable() === true)
    {
        sleep(3000);

        //this is what allows us to get the next page, if we call this multiple times, then we get the next page at every request until .isMoreAvailable() returns false
        items = await followersFeed.items();

        for(var i = 0; i < items.length; i++)
        {
            followers.push(items[i].username);
        }
        console.log(followers.length);
    }

    console.log("followers we got " + followers);
    console.log(followers.length);

    sleep(3000);


     //////////////////////FOLLOWINGS WITH PAGINATION ALREADY //////////////////////////
    //(gets everything but one user, idk why, fuck it)


     var followings = []

     //ask for followings of an account of given if
     var followingsFeed = ig.feed.accountFollowing(loggedInUser.pk);
     //console.log(followingsFeed);
 
     sleep(3000);
     //this is what allows us to get the next page, if we call this multiple times, then we get the next page at every request until followingsFeed.isMoreAvailable() returns false
     //this is the list of followers
     var items = await followingsFeed.items();
     
     for(var i = 0; i < items.length; i++)
     {
         followings.push(items[i].username);
     }
 
     console.log(followingsFeed.isMoreAvailable());
     
     //the api pagination in this api is automated so we keep calling for followingsFeed.items() until followingsFeed.isMoreAvailable() returns false, means we went through all the pages
     while(followingsFeed.isMoreAvailable() === true)
     {
         sleep(3000);
 
         //this is what allows us to get the next page, if we call this multiple times, then we get the next page at every request until .isMoreAvailable() returns false
         items = await followingsFeed.items();
 
         for(var i = 0; i < items.length; i++)
         {
             followings.push(items[i].username);
         }
         console.log(followings.length);
     }
 
     console.log("followings we got " + followers);
     console.log(followings.length);
 
     sleep(3000);
    
    
    
})();

//sleeps for x miliseconds to seem more human
function sleep(miliseconds) {
    var currentTime = new Date().getTime();
 
    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}