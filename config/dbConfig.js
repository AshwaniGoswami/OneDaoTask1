const { Pool } = require("pg");

//for db connection. Its creating a pool of connections
const host = process.env.db_host;
const database = process.env.db_name;
const username = process.env.db_username;
const password = process.env.db_password;
const port = process.env.db_port;
const pool = new Pool({
  host,
  database,
  user: "postgres",
  password: "Ashen79!",
  port,
});

module.exports = pool;
