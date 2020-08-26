const {format} = require('mysql')


let s = format('a_? b=? c',[1,3])

console.log(s)