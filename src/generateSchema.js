// generateSchema.js
const fs = require("fs");
const path = require("path");

function generateSchemaFile(
  schema,
  outputDirName = "../public",
  outputFileName = "schema.json",
) {
  const outputDir = path.join(__dirname, outputDirName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, outputFileName);
  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));

  console.log(`✅ Schema written to: ${outputPath}`);
}

module.exports = generateSchemaFile;
