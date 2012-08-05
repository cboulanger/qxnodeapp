var path = require('path');
var architect = require("architect");

var configName = process.argv[2] || "source";
var configPath = path.resolve("./configs/", configName);
var config     = architect.loadConfig(configPath);

architect.createApp(config, function (err, app) {
    if (err) {
        console.error("While starting the '%s' setup:", configName);
        throw err;
    }
    console.log("Started '%s'!", configName);
});