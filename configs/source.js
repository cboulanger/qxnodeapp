var path = require("path");

module.exports = [
  { packagePath: "../plugins/http",
    root : path.resolve("."),
    host : process.env.C9_HOST,
    port : process.env.C9_PORT
  },
  { packagePath: "../plugins/socket", namespace : "/testapp", loglevel : 2 },
  { packagePath: "../plugins/store" },
  { packagePath: "../plugins/users" },
  { packagePath: "../plugins/acl" }
];