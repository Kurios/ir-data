let fs = require('fs')

let file = fs.readFileSync("words.json",{encoding:"utf8",flag:"r"});
let json = JSON.parse(file);
output = JSON.stringify(json,null,1);
fs.writeFileSync("words.json",output);