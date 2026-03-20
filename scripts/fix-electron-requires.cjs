const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.isFile() || !fullPath.endsWith('.cjs')) {
      continue;
    }

    const source = fs.readFileSync(fullPath, 'utf8');
    const rewritten = source.replace(
      /require\((['"])(\.\.?\/[^'"]+)\1\)/g,
      (match, quote, request) => {
        if (request.endsWith('.cjs') || request.endsWith('.json')) {
          return match;
        }
        return `require(${quote}${request}.cjs${quote})`;
      },
    );

    fs.writeFileSync(fullPath, rewritten);
  }
}

walk(path.join(process.cwd(), 'dist-electron'));
