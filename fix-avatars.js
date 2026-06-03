const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedFiles = 0;

walkDir('./frontend/src', function(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We only want to replace places where avatar_url is used in an img src or similar context, and NOT already wrapped in getAvatarUrl.
    // Let's use regex to find `{...avatar_url}` and replace it.
    // Example: src={user.avatar_url}
    content = content.replace(/src=\{([a-zA-Z0-9_?.]+avatar_url)\}/g, 'src={$1 ? getAvatarUrl($1) : ""}');
    
    // Example: src={user.avatar_url ? user.avatar_url : ...}
    content = content.replace(/src=\{([a-zA-Z0-9_?.]+avatar_url) \? \1 :/g, 'src={$1 ? getAvatarUrl($1) :');

    // Example: src={user.avatar_url ? user.avatar_url : ...} (with different spacing)
    content = content.replace(/\? ([a-zA-Z0-9_?.]+avatar_url) :/g, '? getAvatarUrl($1) :');

    if (content !== original) {
        // add import if missing
        if (!content.includes('getAvatarUrl')) {
            // Find the last import
            const lastImportIndex = content.lastIndexOf('import ');
            if (lastImportIndex !== -1) {
                const endOfLastImport = content.indexOf('\n', lastImportIndex);
                // We need relative path to @/shared/utils/avatar
                content = content.slice(0, endOfLastImport + 1) + `import { getAvatarUrl } from '@/shared/utils/avatar';\n` + content.slice(endOfLastImport + 1);
            } else {
                content = `import { getAvatarUrl } from '@/shared/utils/avatar';\n` + content;
            }
        }
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
        modifiedFiles++;
    }
});

console.log('Total fixed:', modifiedFiles);
