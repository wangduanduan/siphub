const mysql = require('mysql')

var sql = mysql.format(`INSERT posts_?(a) value(?) WHERE id = ?`, [32, `'as`, 42]);
console.log(sql); // UPDATE posts SET modified = CURRENT_TIMESTAMP() WHERE id = 42