/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(testapp/*)
#asset(dialog/*)
#require(dialog.*)
#ignore(io)
#ignore(dialog)

************************************************************************ */

/**
 * This is the main application class of your custom application "testapp"
 */
qx.Class.define("testapp.Application",
{
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      // create the qx message bus singleton and give it a socket.io-like API
      // note that the argument passed to the subscriber is a qooxdoo event object
      var bus = qx.event.message.Bus.getInstance();
      bus.on = bus.subscribe;
      bus.emit = bus.dispatchByName;

      // set up socket.io
      var loc = document.location;
      var url = loc.protocol + "//" + loc.host;
      var socket = io.connect(url + "/testapp");

      // Create a button
      var loginButton = new qx.ui.form.Button("Login", "testapp/test.png");
      var doc = this.getRoot();
      doc.add(loginButton, {left: 100, top: 50});

      // we'll need these vars in the closure
      var loginWindow, userid = null, username="";

      // Add an event listener for the button
      loginButton.addListener("execute", function(e)
      {
        // if someone is logged in, log out
        if (userid){
          return socket.emit("logout",userid, function(err){
            if(err) return alert("Something went wrong");
            loginButton.setLabel("Login");
            userid=null;
            bus.emit("updatePermissions");
          });
        }

        // create or reuse login window
        if ( ! loginWindow ){
          loginWindow = new dialog.Login({
            image : "dialog/logo.gif",
            text  : "Please log in",
            checkCredentials  : checkCredentials,
            callback : finalCallback
          });
        }
        loginWindow.show();
      },this);

      // this asyncronously checks the user credentials
      function checkCredentials( username, password, callback ) {
        socket.emit("authenticate", { username:username, password:password }, callback );
      }

      // this reacts on the result of the authentication
      function finalCallback(err, data){
        // error
        if (err) {
          return dialog.Dialog.error( err );
        }
        // Success!
        userid    = data.id;
        username  = data.name
        loginButton.setLabel( "Logout " + username );
        dialog.Dialog.alert("Welcome, " + username + "!" );
        // now permissions have changed, update them
        bus.emit("updatePermissions");
      }

      //  ACL

      // a resource controller that reacts on permission updates
      // we don't do any type checking to keep this short
      function resourceController( resourceName ){
        var targets =[], permissions={};
        var self = {
          // bind a property of a widget to a permission
          add : function( widget, property, permission, hook ){
            targets.push( {
              widget: widget,
              permission: permission,
              property: property,
              hook: hook || function(v){return v;}
            });
            return self; // make it chainable
          },
          // enforce the given or stored permissions with the controlled
          // widgets
          enforce : function(perms){
            if ( perms ) permissions = perms;
            targets.forEach(function(t){
              var value = t.hook(permissions[t.permission]||false);
              t.widget.set(t.property, value );
            });
          },
          // pull the permissions from the server
          pull : function(){
            socket.emit("allowedPermissions",resourceName,function(err,data){
              if(err) return alert(err);
              self.enforce(data[resourceName]);
            });
          },
          // start listening to events concerning permissions and pull data
          start : function() {
            bus.on("updatePermissions", self.pull );
            socket.on("updatePermissions", self.pull );
            socket.on("acl-update-"+resourceName, self.enforce );
            // this will normally disable everything since no permissions are set
            self.enforce();
            // get permissions from server
            self.pull();
          }
        };
        return self;
      }

      // create buttons
      var readButton = new qx.ui.form.Button("Read");
      doc.add(readButton, {left: 100, top: 100});
      var writeButton = new qx.ui.form.Button("Write");
      doc.add(writeButton, {left: 150, top: 100});
      var deleteButton = new qx.ui.form.Button("Delete");
      doc.add(deleteButton, {left: 200, top: 100});

      // configure ACL
      resourceController("db")
        .add(readButton,  "enabled", "read")
        .add(writeButton, "enabled", "write")
        .add(deleteButton, "enabled", "delete")
        .start();


    } // end main
  }
});