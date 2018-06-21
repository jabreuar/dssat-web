var environment = [
    { "platform": "win32", "path": "c:/", "dssatPro": "DSSATPRO.V47", "tools": "Tools/" }, // windows
    { "platform": "linux", "path": "/", "dssatPro": "DSSATPRO.L47", "tools": "Tools/" }, // linux
    { "platform": "darwin", "path": "/", "dssatPro": "DSSATPRO.L47", "tools": "Tools/" } // mac
];

// Update DSSAT version descending, because the function that decides which dssat version to use get the latest dssat version 
// for instance, if DSSAT47 is found on user's file system, the preferredVersion function ends loop
var dssatVersions = ["DSSAT47", "DSSAT46"];

exports.environmentVariables = function(platform) {
    return environment.find( env => env.platform === platform );
};

exports.versions = function() {
    return dssatVersions;
};