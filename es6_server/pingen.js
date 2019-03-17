const crypt = require("crypto-js");
console.log(process.argv);
const input = parseInt(process.argv.slice(2));

console.log(input);

console.log(typeof input);
const md = crypt.MD5("" + input).toString();

console.log(md);
