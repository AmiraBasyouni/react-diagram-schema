// generateSchema.js
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function generateSchemaFile(
  schema,
  outputDirName = "./",
  outputFileName = "schema.json",
) {
  const outputDir = path.join(process.cwd(), outputDirName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, outputFileName);

  function writeFile() {
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    console.log(`✅ Schema written to: ${outputPath}`);
  }

  /* if a schema.json file already exists, */
  if (fs.existsSync(outputPath)) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    /* prompt the user if they'd like to overwrite it */
    rl.question(
      `⚠️  A "schema.json" already exists in your current directory. Overwrite? (y/N): `,
      (answer) => {
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
          writeFile();
        } else {
          console.log("Aborted.");
        }
        rl.close();
      },
    );
  } else {
    writeFile();
  }
}

module.exports = generateSchemaFile;
