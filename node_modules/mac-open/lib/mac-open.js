
/*
node-mac-open
https://github.com/weareinteractive/node-mac-open

Copyright (c) 2013 We Are Interactive
Licensed under the MIT license.
 */

(function() {
  "use strict";
  var escape, exec, path;

  path = require("path");

  exec = require("child_process").exec;


  /*
  Opens files from a shell.
  By default, opens each file using the default application for that file.
  If the file is in the form of a URL, the file will be opened as a URL.
  
  @param {string} filenames The files to open.
  @param {object} [options] Options to open the file
  @param {function(error)} [callback] Called with null on success, or an error object that contains a property 'code' with the exit code of the process.
  @return {ChildProcess} The child process object.
   */

  module.exports = function(filenames, options, callback) {
    var cmd, key, test, value, _fn;
    if (options == null) {
      options = {};
    }
    if (callback == null) {
      callback = null;
    }
    if (filenames == null) {
      return false;
    }
    cmd = ["open"];
    test = false;
    if ((options.test != null) && options.test === true) {
      delete options.test;
      test = true;
    }
    _fn = function(key, value) {
      if (value === true) {
        return cmd.push("-" + key);
      } else if (typeof value === "string") {
        value = "\"" + value + "\"";
        return cmd.push("-" + key + " " + value);
      }
    };
    for (key in options) {
      value = options[key];
      _fn(key, value);
    }
    cmd.push(escape(filenames));
    if (test) {
      return cmd.join(' ');
    } else {
      return exec(cmd.join(' '), callback);
    }
  };


  /*
  @param {string} value Value to escape
  @return {string}
   */

  escape = function(value) {
    return '"' + value.replace(/(["\s'$`\\])/g, '\\$1') + '"';
  };

}).call(this);
