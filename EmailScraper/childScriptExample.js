//this is how we refer the parameters passed from the parent script
const args =  process.argv[2];
//testing code using the parameters passed from the parent script
var fs = require('fs');
fs.writeFile("test.txt", args, function() {    
    console.log("The file was saved!");
});