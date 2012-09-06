// This plugin provides access control
module.exports = function setup(options, imports, register)
{
  var acl = require("acl");
  acl = new acl(new acl.memoryBackend());

  // socket events
  var io = imports.socket;
  io.on("connection", function(socket){
    socket.on("allowedPermissions",function(resource,callback){
      socket.get("userid", function(err,userId){
        // anonymous has no permissions
        if( ! userId ) return callback(null,{});
        // for registered users, get permissions
        console.log("Querying permissions for "+userId+" on resource "+resource);
        acl.allowedPermissions( userId, resource, function(err,data){
          if(err) return callback(err);
          var permissions = data[resource];
          // prepare permission data for client consumption
          data = {};
          permissions.forEach(function(p){
            data[p] = true;
          });
          console.log(data);
          callback(null,data);
        });
      });
    });
  });

  // error checking callback
  var cb = function(err){
    if(err) console.log(err);
  }
  // create some mock permissions
  // in resource "db", users can only read, admins can read, write and delete
  acl.allow([{
    roles: 'admin',
    allows: [{
      resources: 'db',
      permissions: ['write', 'delete','read']
    }]
  },{
    roles: 'user',
    allows: [{
      resources: 'db',
      permissions: 'read'
    }]
  }],cb);
  acl.addUserRoles("john","user",cb);
  acl.addUserRoles("mary","admin",cb);

  // register plugin and provide plugin API
  register(null,{
      acl : acl
  });
}