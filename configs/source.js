var path = require("path");

module.exports = [
  { packagePath: "../plugins/http", root : path.resolve(".") },
  { packagePath: "../plugins/socket", namespace : "/testapp", loglevel : 3 },
  { packagePath: "../plugins/store" },
  { packagePath: "../plugins/users" }
];