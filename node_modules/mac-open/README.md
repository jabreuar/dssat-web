# mac-open

[![Build Status](https://travis-ci.org/weareinteractive/node-mac-open.png?branch=master)](https://travis-ci.org/weareinteractive/node-mac-open)
[![Coverage Status](https://coveralls.io/repos/weareinteractive/node-mac-open/badge.png?branch=master)](https://coveralls.io/r/weareinteractive/node-mac-open?branch=master)
[![Dependency Status](https://gemnasium.com/weareinteractive/node-mac-open.png)](https://gemnasium.com/weareinteractive/node-mac-open)
[![NPM version](https://badge.fury.io/js/mac-open.png)](http://badge.fury.io/js/mac-open)

> Opens files via Mac OS's open Shell Command.
> By default, opens each file using the default application for that file.
> If the file is in the form of a URL, the file will be opened as a URL.

*This is for Mac OS's open command only. If you're looking for a cross platform
open command take a look at [node-open](https://github.com/pwnall/node-open). The
difference is, that this command allows for options to pass to the open command.*

## Options

All options are passed directly to the `open` command.

```
$ open

Usage: open [-e] [-t] [-f] [-W] [-R] [-n] [-g] [-h] [-b <bundle identifier>] [-a <application>] [filenames] [--args arguments]
Help: Open opens files from a shell.
      By default, opens each file using the default application for that file.
      If the file is in the form of a URL, the file will be opened as a URL.
Options:
      -a                Opens with the specified application.
      -b                Opens with the specified application bundle identifier.
      -e                Opens with TextEdit.
      -t                Opens with default text editor.
      -f                Reads input from standard input and opens with TextEdit.
      -F  --fresh       Launches the app fresh, that is, without restoring windows. Saved persistent state is lost, excluding Untitled documents.
      -R, --reveal      Selects in the Finder instead of opening.
      -W, --wait-apps   Blocks until the used applications are closed (even if they were already running).
          --args        All remaining arguments are passed in argv to the application's main() function instead of opened.
      -n, --new         Open a new instance of the application even if one is already running.
      -j, --hide        Launches the app hidden.
      -g, --background  Does not bring the application to the foreground.
      -h, --header      Searches header file locations for headers matching the given filenames, and opens them.

```

## Usage Examples

Install the module with: `npm install mac-open`

```javascript
var open = require('mac-open');

// Open URL with default Browser
open("http://www.google.com");

// Open file with Finder
open("/path/to/folder/file", { a: "Finder" }, function(error) {});

// Open file with Sublime Text in the background
open("/path/to/folder/file", { a: "Sublime Text 2", g: true }, function(error) {});
```

## Contributing
[![I Love Open Source](http://www.iloveopensource.io/images/logo-lightbg.png)](http://www.iloveopensource.io/projects/52ee312487659fce6600004d)

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License
Copyright (c) 2013 We Are Interactive under the MIT license.
