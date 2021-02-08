//Import the library that lets you run child processes
const { execFile } = require('child_process');

//The variable that we will pass into the child script, it will be the proxy username of the account we re using and the password of the account were using
//later on we will have to pass cookies file names as well
var myName = "Anna";

//Spawn a child process on the CPU, because they will run in different threads, so we will 'split' the cpu in x childs scripts that we want running
var spawn = require('child_process').spawn;

//Use node as the command to start the child script, use test2 as the name of the file where we have the actual code of the scraper, pass the variable my name, these variables will be the 
//proxy, username of the insta account we re using and password of the insta account we re using, eventually we will also want to pass in the name of the cookies file
spawn('node', ['test2.ts', myName], {

    //NO IDEA WHAT THIS DOES
    detached: true
});