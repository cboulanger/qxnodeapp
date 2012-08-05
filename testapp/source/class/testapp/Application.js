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
      var button1 = new qx.ui.form.Button("Authenticate", "testapp/test.png");
      var doc = this.getRoot();
      doc.add(button1, {left: 100, top: 50});

      // Add an event listener for the button
      button1.addListener("execute", function(e) {
        new dialog.Login({
          image : "dialog/logo.gif",
          text  : "Please log in",
          checkCredentials  : checkCredentials,
          callback : handleCheckCredentials
        }).show();
      },this);

      function checkCredentials( username, password, callback ) {
        socket.emit("authenticate", { username:username, password:password },
          function( err, data )
          {
            callback( err );
          }
        );
      }

      function handleCheckCredentials(err){
        if (err) {

        }
      }



    }
  }
});