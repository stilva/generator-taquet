// node modules
var fs        = require('fs'),
  util      = require('util'),
  path      = require('path'),
  wrench    = require('wrench'),
  _         = require('lodash'),
  generator = require('yeoman-generator'),

  pattern   = /(?:[^\/]+)/ig,

  deps      = [
    {name:'jquery', path:"/jquery", file:"jquery.js", target:""},
    {name:'lodash', path:"/lodash/dist", file:"lodash.js", target:""},
    {name:'jasmine', path:"/jasmine/lib/jasmine-core", file:"", target:"/test"},
    {name:'backbone', path:"/backbone", file:"backbone.js", target:""}
  ],

  depNames  = _.map(deps, function(el) {return el.name});

function moveTemplateFile() {
  var mPath   = process.cwd(),
    relativePath,
    relativePathToTaquet,
    pathToFile = "test/com/backbone/index.html";

  console.log(("I shall proceed to create an index.html file for the Backbone QUnit Test Suite for Taquet"));

  relativePathToTaquet = path.relative(path.dirname(mPath + "/" + pathToFile), mPath);
  relativePath = relativePathToTaquet+"/src/vendor";

  this.template("test-backbone.html", pathToFile, {pathToBackbone: relativePath+"/backbone.js", pathToTaquet: relativePathToTaquet+"/taquet.js"});
};

var Generator = module.exports = function Generator() {

  generator.Base.apply(this, arguments);

  // Let's fetch dependencies with Bower.
  this.bowerInstall(depNames, function() {
    var mPath   = process.cwd(),
      folder  = "/src/vendor/",
      message = "\nI have successfully fetched all the dependencies.".blue
        + "\nLet me clean the files.".grey
        + "\n\n";

    // check required folders & create if needed.
    checkRequiredPaths.bind(this)(mPath, folder);

    for(var i = 0, l = deps.length; i<l; i++) {
      fs.rename(mPath+'/app/components'+deps[i].path+'/'+deps[i].file, mPath+(!!deps[i].target ? deps[i].target: folder)+deps[i].file, function (err) {
        if (err) throw err;
        console.log('renamed complete');
      });
    }

    moveTemplateFile.bind(this)();

    //special case, where we also fetch backbone's test folder
    wrench.copyDirSyncRecursive(mPath+'/app/components/backbone/test', mPath+"/test/com/backbone", {
      forceDelete: false, // Whether to overwrite existing directory or not
      excludeHiddenUnix: true, // Whether to copy hidden Unix files or not (preceding .)
      preserveFiles: true, // If we're overwriting something and the file already exists, keep the existing
      inflateSymlinks: false // Whether to follow symlinks or not when copying files
    });
  }.bind(this));
};

util.inherits(Generator, generator.Base);

Generator.prototype.askFor = function askFor() {
  // welcome message
  var message   = "\nHello, thanks for using taquet".blue
    + "\nI will proceed the fetching process of third party libraries.".grey
    + "\nIt shouldn't take too long.".grey
    + "\n\n";

  console.log(message);
};

function checkRequiredPaths(basePath, folder) {

  var path    = ""

  if(!fs.existsSync(basePath)) {
    console.error("Apologies, there seems to be an issue with the paths settings...".red);
  }

  folder.replace(pattern, function(match, index, original) {
    path = basePath + original.substring(0, index)+match;

    if(!fs.existsSync(path)) {
      console.log(("I am creating new folder here:\r" + path).blue)
      this.mkdir(path);
    }
    // not to alter the original
    return match;
  }.bind(this));
}