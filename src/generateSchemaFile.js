// generateSchema.js
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function generateSchemaFile(
  schema,
  flags = {},
  defaultOutFileName = "schema.json",
) {
  //const outputDir = path.join(process.cwd(), outputDirName);
  //const outputDir = process.cwd();
  //if (!fs.existsSync(outputDir)) {
  //  fs.mkdirSync(outputDir, { recursive: true });
  //}

  //const outputPath = path.join(
  //  process.cwd(),
  //  options.outputFile ? options.outputFile : outputFileName,
  //);
  const outPath = path.resolve(
    process.cwd(),
    flags.outFile ? flags.outFile : defaultOutFileName,
  );

  function writeFile() {
    fs.writeFileSync(outPath, JSON.stringify(schema, null, 2));
    if (!flags.quiet) {
      console.log(`💾 Saved: Schema has been written to ${outPath}`);
    } else {
      console.log("✅ Success.");
    }
  }

  /* if a schema.json file already exists, */
  if (fs.existsSync(outPath)) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    /* prompt the user if they'd like to overwrite it */
    rl.question(
      `⚠️ Warning: A "schema.json" already exists in your current directory. Overwrite? (y/N): `,
      (answer) => {
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
          writeFile();
        } else {
          console.log("🛑 Aborted.");
        }
        rl.close();
      },
    );
  } else {
    writeFile();
  }
}

module.exports = generateSchemaFile;
