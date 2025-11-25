// (generateSchemaFile.js) writes schema to a file

// imports
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function generateSchemaFile(
  schema,
  flags = {},
  defaultOutFileName = "schema.json",
) {
  // outFile: should store the absolute file path containing the generated schema
  let outFile = "";

  // if user did not provide an output file path
  if (!flags.outFile) {
    // default to ./schema.json
    outFile = path.resolve(process.env.INIT_CWD, defaultOutFileName);
  } else {
    // otherwise, normalize their input into an absolute path
    const outPath = path.resolve(process.env.INIT_CWD, flags.outFile);

    // if user input is a directory, append default output file name (schema.json)
    if (outPath.endsWith(path.sep) || path.extname(outPath) === "") {
      outFile = path.join(outPath, defaultOutFileName);
    } else if (path.extname(outPath) === ".json") {
      // otherwise, if user provided a file, use as is
      outFile = outPath;
    } else {
      // otherwise, if neither a directory nor a file, throw an exception
      throw new Error(
        `❌ Error: user input for --out/--output is neither a directory nor a json file: ${outPath}`,
      );
    }
  }

  function writeFile() {
    // create the file path if it does not exist
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    // write schema to file
    fs.writeFileSync(outFile, JSON.stringify(schema, null, 2));
    if (!flags.quiet) {
      console.log(`💾 Saved: Schema has been written to ${outFile}`);
    }
  }

  // if the file already exists,
  // Wrap in a Promise so async prompt can resolve properly:
  return new Promise((resolve) => {
    if (fs.existsSync(outFile)) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      // prompt the user if they'd like to overwrite it
      rl.question(
        `⚠️ Warning: The file "${outFile}" already exists. Overwrite? (y/N): `,
        (answer) => {
          if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
            writeFile();
            resolve(outFile);
          } else {
            console.log("🛑 Aborted.");
            resolve(""); // return empty string if aborted
          }
          rl.close();
        },
      );
    } else {
      writeFile();
      resolve(outFile);
    }
  });
}

module.exports = generateSchemaFile;
