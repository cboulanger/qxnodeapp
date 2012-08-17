// This plugin provides access control
module.exports = function setup(options, imports, register)
{
  var roles = require("roles");

  // caches
  var userProfiles = {}; // a map of user ids and profiles ("roles")
  var apps = {}; // these are really "resources"
  var profiles = {}; // these are really "roles"
  var appRoles = {}; // a map to keep track of already added roles

  function getApp( appName )
  {
    if ( ! apps[appName] ){
      apps[appName] = roles.addApplication(appName);
    }
    return apps[appName];
  }

  function getProfile( profileName )
  {
    if ( ! profiles[profileName] ){
      profiles[profileName]  = roles.addProfile(profileName);
    }
    return profiles[profileName] ;
  }

  function arrayfy( value )
  {
    return Array.isArray( value ) ? value : [value];
  }

  // allows access to resources
  function allow( roleName, resourceName, permissions, callback )
  {
    var app = getApp(resourceName);
    var profile = getProfile(roleName);
    arrayfy(permissions).forEach(function(permission){
      appRoles[resourceName] = appRoles[resourceName] || [];
      if( appRoles[resourceName].indexOf(permission) ===-1 ){
        app.addRoles(permission);
        appRoles[resourceName].push(permission);
      }
      profile.addRoles(resourceName + "." + permission);
    });
    if( callback ) callback();
  }

  // assign a role to a userid
  function addUserRoles( userId, roles, callback )
  {
    if ( !userProfiles[userId] ){
      userProfiles[userId] = [];
    }
    userProfiles[userId] = userProfiles[userId].concat( arrayfy(roles) );
    if( callback ) callback();
  }

  // testing access
  function isAllowed( userId, resource, permissions, callback )
  {
    var userRoles = userProfiles[userId];
    if( userRoles === undefined ){
      var error = new Error("User '" + userId + "' has no profile.")
      if ( callback ) return callback(error);
      throw error;
    }
    var permissions = arrayfy(permissions);
    var isAllowed = false;
    for( var i=0; i<userRoles.length; i++){
      for( var j=0; j< permissions.length; j++){
        if ( ! getProfile( userRoles[i] ).hasRoles(resource + "." + permissions[j] ) ) {
          isAllowed= false; break;
        } else{
          isAllowed = true;
        }
      }
      if( isAllowed ) break;
    }
    if ( callback ) callback(isAllowed);
    return isAllowed; // synchronous shortcut
  }

  // return all permissions of a user connected to one or more resources
  // returns a map of resource names containing maps of permissions
  function allowedPermissions( userId, resources, callback ) {
    var p, permissions = {};
    arrayfy(resources).forEach(function(resource){
      appRoles[resource].forEach(function(permission){
        // we're cheating here, using a synchronous call because we can.
        // sessions without user ids (not logged in) have no permissions
        p = userId ? isAllowed( userId, resource, permission ): false;
        if ( ! permissions[resource] ) permissions[resource] = {};
        permissions[resource][permission] = p;
      });
    });
    callback(null, permissions);
  }

  // API. Only selected methods are actually implemented
  var acl = {
    allow : allow,
    removeAllow : null,
    isAllowed : isAllowed,
    addUserRoles : addUserRoles,
    removeUserRoles : null,
    userRoles : null,
    addRoleParents: null,
    removeRole: null,
    removeResource: null,
    allowedPermissions : allowedPermissions,
    areAnyRolesAllowed : null,
    whatResources : null
  };

  // socket events
  var io = imports.socket;
  io.on("connection", function(socket){
    socket.on("allowedPermissions",function(resources,callback){
      socket.get("userid", function(err,userId){
        allowedPermissions( userId, resources, callback );
      });
    });
  });

  // create some mock data
  acl.allow("anonymous","db",[]);
  acl.allow("admin","db",["read","write","delete"]);
  acl.allow("user","db","read");
  acl.addUserRoles("john","user");
  acl.addUserRoles("mary","admin");

  // register plugin and provide plugin API
  register(null,{
      acl : acl
  });
}