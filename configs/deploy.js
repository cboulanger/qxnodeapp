var path = require("path");

module.exports = [
  { packagePath: "../plugins/http", root : path.resolve("testapp/build"),
    host : process.env.OPENSHIFT_INTERNAL_IP,
    port : process.env.OPENSHIFT_INTERNAL_PORT
  },
  { packagePath: "../plugins/socket", namespace : "/testapp", loglevel : 0 },
  { packagePath: "../plugins/store" },
  { packagePath: "../plugins/users" },
  { packagePath: "../plugins/acl" }
];