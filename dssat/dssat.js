// dssat.js

var fs = require('fs');
var readline = require('readline');
var operationSystem = require('os');
const { exec } = require('child_process');
var dssatconfig = require('../dssat/dssatconfig');
var macopen = require('mac-open');

// String form prototype
String.prototype.format = function () {
  var formatted = this;
  for (var i = 0; i < arguments.length; i++) {
    var regexp = new RegExp('\\{' + i + '\\}', 'gi');
    formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};

function sleep(seconds) {
  let e = new Date().getTime() + (seconds * 1000);
  while (new Date().getTime() <= e) { }
}

function insert(main_string, ins_string, pos) {
  if (typeof (pos) == "undefined") {
    pos = 0;
  }
  if (typeof (ins_string) == "undefined") {
    ins_string = '';
  }
  return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
}

// Keep DSSAT base path
var globalBasePath;
var delimiterPath;
var dataCde = [];
var platformConfig;
var latestVersion;

// Main functions
var dssat = (function () {

  // *** helper function ***
  var isExperimentFile = function (file) {
    if (file.endsWith('X')) return file;
    else return null;
  }

  var folderModel = function () {

    let obj = {};
    obj.path = "";
    obj.files = [];

    return obj;
  }

  // This function load all global variables that will be used in all functions of the dssat.js
  var initialize = function () {

    try {

      let platform = operationSystem.platform();
      platformConfig = dssatconfig.environmentVariables(platform);
      latestVersion = preferredVersion();

      console.log('dssat initialize plataform:{0} and version:{1}'.format(platform, latestVersion));

      globalBasePath = "{0}{1}/".format(platformConfig.path, latestVersion);

      if (platform === "win32")
        delimiterPath = "//";
      else
        delimiterPath = "/";

      console.log(globalBasePath);

      loadDataCde(globalBasePath);

    } catch (error) {
      alert(error.message);
      console.log(error);
    }
  }

  var preferredVersion = function () {
    let dssatVersions = dssatconfig.versions();

    for (let i = 0; i < dssatVersions.length; i++) {

      let directory = platformConfig.path + dssatVersions[i];

      if (fs.existsSync(directory)) {
        return dssatVersions[i];
      }
    }

    return "DSSAT47";
  }

  var experimentModel = function (number, name, description, modified) {

    let experiment = {};
    experiment.number = number;
    experiment.name = name;
    experiment.description = description;
    experiment.modified = modified;

    return experiment;
  }


  var openExternalTool = function (tool) {
    let fullPath = globalBasePath + platformConfig.tools + tool;

    exec(fullPath, function (err, data) {
      console.log(err)
      console.log(data.toString());
    });
  }

  // Get all files with *.X extension
  // The X files contains information about the experiment 
  var tree = function () {

    let tree = [];

    try {

      let dssatFolders = fs.readdirSync(globalBasePath);

      for (let i = 0; i < dssatFolders.length; i++) {
        let fullPath = globalBasePath + dssatFolders[i];

        let stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          let fullPathContent = fs.readdirSync(fullPath);

          // Get all folders that contains file extesion 'x'
          let containsXFile = fullPathContent.some(isExperimentFile);

          if (containsXFile) {
            let model = new folderModel();
            model.path = dssatFolders[i];

            for (let j = 0; j < fullPathContent.length; j++) {
              if (fullPathContent[j].endsWith('X'))
                model.files.push(fullPathContent[j]);
            }
            tree.push(model);
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      return tree;
    }
  }

  var experiments = function (crop) {

    let fullPath = globalBasePath + crop;

    let cropFolderContent = fs.readdirSync(fullPath);

    let experiments = [];

    let number = 1;

    try {
      for (let i = 0; i < cropFolderContent.length; i++) {

        let isFileX = cropFolderContent[i].endsWith('X');

        if (isFileX) {
          let filePath = '{0}/{1}'.format(fullPath, cropFolderContent[i]);

          let fileStats = fs.statSync(filePath);
          let description = experimentDescription(filePath);

          let experiment = new experimentModel(number, cropFolderContent[i], description, fileStats.mtime);

          experiments.push(experiment);

          number++;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      return experiments;
    }
  }

  var experimentDescription = function (filePath) {

    let data = fs.readFileSync(filePath);
    console.log("Synchronous read: " + data.toString());

    let fileLines = data.toString().split('\n');

    for (let i = 0; i < fileLines.length; i++) {
      if (fileLines[i].includes('*EXP.DETAILS:')) {
        console.log(fileLines[i].replace('*EXP.DETAILS:', ''));
        return fileLines[i].replace('*EXP.DETAILS:', '');
      }
    }
  }

  var treatments = function (cropSelected, experiments) {

    let treatments = [];

    for (let i = 0; i < experiments.length; i++) {

      let filePath = globalBasePath + cropSelected + delimiterPath + experiments[i];
      console.log(filePath);

      let data = fs.readFileSync(filePath);

      let content = data.toString();
      let str = content.substring(content.indexOf("*TREATMENTS"), content.indexOf("*CULTIVARS"));
      let lines = str.split(/[\r\n]+/g);

      for (let j = 2; j < lines.length; j++) {
        let treatment = lines[j].substring(9, 30).trim();
        if (treatment !== "") {
          let trtNo = lines[j].substring(0, 3).trim();
          let experiment = experiments[i];

          let obj = { treatment: treatment, trtNo: trtNo, experiment: experiment };

          treatments.push(obj);
        }
      }
    }
    return treatments;
  }

  var createBashFile = function (crop, experiments) {

    let directory = globalBasePath + crop;
    let experiment = experiments[0].experiment;

    // todo: remove hardcoded dssat version
    let fullBatchPath = globalBasePath + crop + '/DSSBatch.v47';

    let existsBatchFile = fs.existsSync(fullBatchPath);

    if (existsBatchFile) {
      fs.unlink(fullBatchPath, function (err) {
        if (err) throw err;
        console.log(fullBatchPath + ' File deleted!');
      });
    }

    let content = `$BATCH(${crop})` + '\r\n' +
      "!" + '\r\n' +
      `! Directory    : ${directory}` + '\r\n' +
      "! Command Line : C:\\DSSAT47\\DSCSM047.EXE CSCER047 B DSSBatch.v47" + '\r\n' +
      `! Crop         : ${crop}     ` + '\r\n' +
      `! Experiment   : ${experiment}` + '\r\n' +
      "! ExpNo        : 1" + '\r\n' +
      "! Debug        : C:\\DSSAT47\\DSCSM047.EXE CSCER047 \" B DSSBatch.v47\"" + '\r\n' +
      "!" + '\r\n' +
      "@FILEX                                                                                        TRTNO     RP     SQ     OP     CO" + '\r\n';

    for (let i = 0; i < experiments.length; i++) {
      let customString = "                                                                                                                                ";
      customString = insert(customString, `${globalBasePath}${delimiterPath}${crop}${delimiterPath}${experiments[i].experiment}`, 0);
      customString = insert(customString, `${experiments[i].trtNo}`, 98);
      customString = insert(customString, "1", 105);
      customString = insert(customString, "0", 112);
      customString = insert(customString, "0", 119);
      customString = insert(customString, "0", 126);

      content += customString + "\r\n";
    }

    console.log(content);

    fs.appendFile(fullBatchPath, content, function (err) {
      if (err) {
        throw err;
      } else {
        console.log('DSSBatch.v47 file created!');

        let cmd = `cd ${globalBasePath}${delimiterPath}${crop} && ${globalBasePath}${delimiterPath}DSCSM047.EXE CSCER047 B DSSBatch.v47`;

        exec(cmd, function (err) {
          if (err) {
            return false;
          } else {
            return true;
          }
        });
      }
    });
  }

  var runSimulation = function (crop, experiments) {
    createBashFile(crop, experiments);
  }

  var outFiles = function (cropSelected) {

    let path = globalBasePath + delimiterPath + cropSelected;
    console.log("outFiles function path: " + path);

    let cropFolderContent = fs.readdirSync(path);

    let outFiles = [];

    try {
      for (let i = 0; i < cropFolderContent.length; i++) {

        let isOutFile = cropFolderContent[i].endsWith('.OUT');

        if (isOutFile) {
          outFiles.push(cropFolderContent[i]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      return outFiles;
    }
  }

  var notEmptyString = function (value) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== " " && value[i]) return true;
    }
    return false;
  }


  var readOutFile = function (crop, outFile) {

    let path = globalBasePath + crop + "//" + outFile;
    let data = fs.readFileSync(path);

    let lines = data.toString().split(/[\r\n]+/g);

    let headers = [];
    let experiments = [];
    let result = [];
    let experiment = "";

    let treatment = "";
    let treatmentDescription = "";

    for (let i = 0; i <= lines.length; i++) {

      // get last treatment
      if (i == lines.length) {
        let model = { run: treatmentDescription, values: experiments };
        result.push(model);
        break;
      }

      if (lines[i].startsWith(' EXPERIMENT')) {
        experiment = lines[i].substring(18, lines[i].length).split(' ')[0];
      }

      if (lines[i].startsWith(' TREATMENT')) {

        let run = lines[i].split(':');

        let treatmentNumber = run[0];
        treatmentDescription = run[1];

        // check if treatment has changed
        if (treatment && treatment !== treatmentNumber) {
          let model = { run: treatmentDescription, experiment: experiment, values: experiments };
          result.push(model);
        }

        // clean up header to the next round
        experiments = [];

        treatment = treatmentNumber;
        continue;
      }

      if (lines[i].startsWith('@')) {

        // clean up header to the next round
        headers = [];

        let arrayHeaders = lines[i].split(" ");

        for (let j = 0; j < arrayHeaders.length; j++) {
          if (arrayHeaders[j] !== "") {
            headers.push(arrayHeaders[j]);
          }
        }
        continue;
      }

      // check if line start with space and isn't empty line
      if (lines[i].startsWith(" ") && notEmptyString(lines[i]) &&
        !lines[i].includes("MODEL") && !lines[i].includes("EXPERIMENT") && !lines[i].includes("DATA PATH") && !lines[i].includes("TREATMENT")) {
        // remove firt space from lines
        let simulationValues = lines[i].substring(1, lines[i].length);
        let simulationValuesArray = simulationValues.split(" ");

        // variable used to keep an index to retrieve the header from headers array
        let index = 0;

        for (let k = 0; k < simulationValuesArray.length; k++) {
          if (simulationValuesArray[k] !== "") {
            let values = [simulationValuesArray[k]];
            let obj = { cde: headers[index], values: values };
            if (experiments[index] != undefined) {
              experiments[index].values.push(simulationValuesArray[k]);
            } else {
              experiments.push(obj);
            }
            index++;
          }
        }
      }
    }
    return result;
  }

  var loadDataCde = function (dssatPath) {
    let cdeFile = dssatPath + "DATA.CDE";

    let data = fs.readFileSync(cdeFile);
    console.log("Synchronous read: " + data.toString());

    let fileLines = data.toString().split('\n');

    for (let i = 0; i < fileLines.length; i++) {
      if (fileLines[i].startsWith('*') ||
        fileLines[i].startsWith('!') ||
        fileLines[i].startsWith(' ') ||
        fileLines[i].startsWith('@') ||
        fileLines[i].length === 0 ||
        fileLines[i] === "") {
        continue;
      }

      let cdeModel = {};
      cdeModel.cde = fileLines[i].substr(0, 6);
      cdeModel.label = fileLines[i].substr(7, 16);
      cdeModel.description = fileLines[i].substr(22, 57);

      dataCde.push(cdeModel);
    }
  }

  var cde = function () {
    return dataCde;
  }

  var openDssatFolder = function () {
    if (platformConfig.platform === "darwin") {
      macopen(globalBasePath, { a: "Finder" }, function (error) {
        console.log(error);
      });
    } else {
      exec('start "" ' + globalBasePath + '');
    }
  }

  var openFileInEditor = function (crop, fileName) {
    let filePath = globalBasePath + crop + "//" + fileName;

    if (platformConfig.platform === "darwin") {
      macopen(filePath, { a: "TextEdit" }, function (error) {
        console.log(error);
      });
    } else {
      let command = `start notepad ${filePath}`;
      exec(command, function (err) {
        if (err) {
          alert("[runSimulation] error: " + err);
        } else {
          console.log("open file: " + filePath);
        }
      });
    }
  }

  var getDataFiles = function (crop) {
    let path = globalBasePath + crop;
    console.log('getting data files from ' + path);
    let cropFolderContent = fs.readdirSync(path);
    let dataFiles = [];

    try {
      for (let i = 0; i < cropFolderContent.length; i++) {

        let fileName = cropFolderContent[i];

        if ((fileName.endsWith('A') || fileName.endsWith('T')) && !fileName.endsWith('.OUT')) {
          dataFiles.push(fileName);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      return dataFiles;
    }
  }

  var folders = function () {
    let allfolders = [];

    try {
      let dssatFolders = fs.readdirSync(globalBasePath);

      for (let i = 0; i < dssatFolders.length; i++) {
        let fullPath = globalBasePath + dssatFolders[i];

        let stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          allfolders.push(dssatFolders[i]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      return allfolders;
    }

  }

  var path = function () {
    return globalBasePath;
  }

  var filePreview = function (crop, fileName) {

    try {

      let formated = "<p>";

      let path = globalBasePath + crop + "//" + fileName;

      let data = fs.readFileSync(path, 'utf8');

      let lines = data.toString().split(/[\r\n]+/g);

      for (let i = 0; i < lines.length; i++) {
        formated += lines[i];
        formated += "<br />";
      }

      formated += "</p>";

      console.log("Synchronous read: " + formated.toString());

      return formated.toString();
    } catch (error) {
      alert("not able to read file content. Error: " + error);
    }

  }

  var version = function () {
    return preferredVersion();
  }

  var platform = function () {
    return operationSystem.platform();;
  }

  var batchCommand = function () {
    let command = `${globalBasePath}DSCSM047.EXE CSCER047 B DSSBatch.v47`;

    return command;
  }

  var runBatchFile = function (crop) {
    let cmd = `cd ${globalBasePath}${delimiterPath}${crop} && ${globalBasePath}${delimiterPath}DSCSM047.EXE CSCER047 B DSSBatch.v47`;

    exec(cmd, function (err) {
      if (err) {
        alert("[runSimulation] error: " + err);
      } else {
        alert('Batch file ran successfully!');
      }
    });
  }

  // Explicitly reveal public pointers to the private functions 
  return {
    initialize: initialize,
    path: path,
    version: version,
    platform: platform,
    tree: tree,
    experiments: experiments,
    experimentDescription: experimentDescription,
    treatments: treatments,
    createBashFile: createBashFile,
    runSimulation: runSimulation,
    outFiles: outFiles,
    readOutFile: readOutFile,
    cde: cde,
    openExternalTool: openExternalTool,
    openDssatFolder: openDssatFolder,
    openFileInEditor: openFileInEditor,
    getDataFiles: getDataFiles,
    folders: folders,
    filePreview: filePreview,
    batchCommand: batchCommand,
    runBatchFile: runBatchFile
  }
})();

module.exports = {
  initialize: function () {
    return dssat.initialize()
  },
  version: function () {
    return dssat.version()
  },
  path: function () {
    return dssat.path()
  },
  platform: function () {
    return dssat.platform()
  },
  tree: function () {
    return dssat.tree()
  },
  experiments: function (crop) {
    return dssat.experiments(crop)
  },
  getDataFiles: function (crop) {
    return dssat.getDataFiles(crop)
  },
  treatments: function (cropSelected, experiments) {
    return dssat.treatments(cropSelected, experiments)
  },
  outFiles: function (crop) {
    return dssat.outFiles(crop)
  },
  runSimulation: function (crop, experiments) {
    return dssat.runSimulation(crop, experiments)
  },
  readOutFile: function (crop, outFile) {
    return dssat.readOutFile(crop, outFile);
  },
  cde: function () {
    return dssat.cde();
  }
}