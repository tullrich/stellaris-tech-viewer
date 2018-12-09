/*
* Uses the jomini parsing library to convert a directory of clauswitz format
* data files to json. Many replacements are not supported (i.e. $).
*/
const program = require('commander');
const jomini = require('jomini');
const fs = require('fs-extra');
const klaw = require('klaw')
const path = require('path');

// Convert clauswitz file at in_path and write json file to out_path
function convert(in_path, out_path) {
  console.log(`converting file... ${in_path} to ${out_path}`);
  const input = fs.readFileSync(in_path, "utf8");
  const output = jomini.parse(input);
  fs.writeJsonSync(out_path, output, { spaces: 2 });
  //console.dir(output);
}

program
  .version('1.0.0');


program
  .command('convert <input_dir> <output_dir>')
  .description('convert clausewitz data directory input dir to json at output dir')
  .action(function (in_dir, out_dir, cmd) {
    console.log(`Converting ${in_dir} to ${out_dir}`);
    klaw(in_dir)
      .on('readable', function () {
          let item
          while ((item = this.read())) {
            if (item.stats.isFile()) {
              let out_path = path.join(out_dir, path.basename(item.path, '.txt')) + '.json';
              convert(item.path, out_path);
            }
          }
      })
      .on('end', () => console.log('done')) // => [ ... array of files]
  });

program
  .command('locale <locale_file> <out_file>')
  .action(function (locale_file, out_file, cmd) {
    let localeStrs = {};
    let array = fs.readFileSync(locale_file).toString().split("\n");
    for (let line of array) {
      line = line.trim();
      if (line.length > 0 && !line.startsWith('#')) {
        var rgx = new RegExp('^([a-zA-Z0-9_]+):[0-9]+ "(.*)"');
        let match = rgx.exec(line);
        if (match && match[1] !== undefined && match[2] !== undefined) {
          localeStrs[match[1]] = match[2];
        } else {
          console.log("Bad line: " + line);
        }
      }
    }
    fs.writeJsonSync(out_file, localeStrs, { spaces: 2 });
  });

program.parse(process.argv);
