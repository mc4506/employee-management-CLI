const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "mike",
    password: "password",
    database: "employees_DB"
});

module.exports = connection;