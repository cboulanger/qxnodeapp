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

      // set up socket.io
      var loc = document.location;
      var url = loc.protocol + "//" + loc.host;
      var socket = io.connect(url + "/testapp");

      // Create a button
      var loginButton = new qx.ui.form.Button("Login", "testapp/test.png");
      var doc = this.getRoot();
      doc.add(loginButton, {left: 100, top: 50});

      // Add an event listener for the button
      var loginWindow, loginStatus = false;
      loginButton.addListener("execute", function(e)
      {
        // if someone is logged in, log out
        if (loginStatus){
          loginButton.setLabel("Login");
          loginStatus = false;
          return;
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
        loginStatus = true;
        loginButton.setLabel( "Logout " + data );
        dialog.Dialog.alert("Welcome, " + data + "!" )
      }
    }
  }
});