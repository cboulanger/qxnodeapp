var path = require("path");

module.exports = [
  { packagePath: "../plugins/http",
    root : path.resolve("testapp/build"),
    host : "qxnodeapp.nodejitsu.com",
    port : 8080
  },
  { packagePath: "../plugins/socket", namespace : "/testapp", loglevel : 2 },
  { packagePath: "../plugins/store" },
  { packagePath: "../plugins/users" },
  { packagePath: "../plugins/acl" }
];