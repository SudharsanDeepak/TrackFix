const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const fieldsToFix = ['vendorCode', 'googleId', 'expiresAt', 'uniqueQRId', 'timestamp', 'category'];

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    fieldsToFix.forEach(field => {
      // Look for: fieldName: { ... index: true ... }
      // This regex looks for the field, followed by an object, and replaces "index: true," with "// index: true,"
      const regex = new RegExp(`(${field}\\s*:\\s*\\{[^}]*?)index\\s*:\\s*true,?`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, '$1/* index: true */');
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed duplicates in ${filePath}`);
    }
  }
});
console.log('Done!');
