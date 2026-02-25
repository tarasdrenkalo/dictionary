import fs from "fs";
import path from "path";

// Match relative imports (./ or ../) not already ending with .js
const importRegex = /(from\s+['"])(\.{1,2}\/[^'"]*?)(?<!\.js)(['"])/g;

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const newContent = content.replace(importRegex, (_, p1, p2, p3) => `${p1}${p2}.js${p3}`);
  if (newContent !== content) fs.writeFileSync(filePath, newContent, "utf8");
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath); // recurse
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      fixImportsInFile(fullPath);
    }
  }
}

// Update relative imports in the build folder
const buildDir = path.resolve("./build");
processDirectory(buildDir);

console.log("✅ Relative imports updated with .js suffix");