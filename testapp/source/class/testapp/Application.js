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
      var url = loc.protocol + "//" + loc.host + ":" + loc.port;
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
      function createController( resourceName ){
        var targets =[], permissions={};
        var controller = {
          // bind a property of a widget to a permission
          add : function( widget, property, permission, converter ){
            targets.push( {
              widget: widget,
              permission: permission,
              property: property,
              converter: converter || function(p){return p;}
            });
            return controller; // make it chainable
          },
          // set the permissions
          setPermissions : function(perms){
            permissions = perms;
          },
          // enforce the given or stored permissions with the controlled
          // widgets
          enforce : function(){
            targets.forEach(function(t){
              // compute new property value by calling hook function with
              // permission value and original property value
              var propVal = t.widget.get(t.property);
              var computedPropVal = t.converter(permissions[t.permission]||false, propVal);
              t.widget.set(t.property, computedPropVal );
            });
            return controller;
          },
          // pull the permissions from the server
          pull : function(){
            socket.emit("allowedPermissions",resourceName,function(err,data){
              if(err) return alert(err);
              controller.setPermissions(data);
              controller.enforce();
            });
            return controller;
          },
          // start listening to events concerning permissions and pull data
          start : function() {
            bus.on("updatePermissions", controller.pull );
            socket.on("updatePermissions", controller.pull );
            socket.on("acl-update-"+resourceName, controller.enforce );
            // this will normally disable everything since no permissions are set
            controller.enforce();
            // get permissions from server
            controller.pull();
            return controller;
          }
        };
        return controller;
      }

      // create new resource controller over a fictional "db" resource
      var dbController = createController("db");

      // create buttons
      var readButton = new qx.ui.form.Button("Read");
      doc.add(readButton, {left: 100, top: 100});
      var writeButton = new qx.ui.form.Button("Write");
      doc.add(writeButton, {left: 150, top: 100});
      var deleteButton = new qx.ui.form.Button("Delete");
      doc.add(deleteButton, {left: 200, top: 100});

      // delete button is only enabled when the checkbox is checked
      // a change in state needs to trigger an update
      var confirmDeleteCB = new qx.ui.form.CheckBox("Enable Delete");
      confirmDeleteCB.addListener("changeValue",dbController.enforce)
      doc.add(confirmDeleteCB,{left:270, top:100});

      // configure ACL
      dbController
        .add(readButton,  "enabled", "read")
        .add(writeButton, "enabled", "write")
        .add(deleteButton, "enabled", "delete", function(p,v){return p && confirmDeleteCB.getValue()})
        .add(confirmDeleteCB, "enabled", "delete")
        .add(confirmDeleteCB, "value", "delete", function(p,v){return p? v:false})
        .start();

    } // end main
  }
});