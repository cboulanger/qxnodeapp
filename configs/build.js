var path = require("path");

module.exports = [
  { packagePath: "../plugins/http", root : path.resolve("testapp/build") },
  { packagePath: "../plugins/socket", namespace : "/testapp", loglevel : 0 },
  { packagePath: "../plugins/store" },
  { packagePath: "../plugins/users" },
  { packagePath: "../plugins/acl" }
];