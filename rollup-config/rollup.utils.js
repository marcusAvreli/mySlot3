import path from 'path';
//https://github.com/digital-blueprint/toolkit/blob/dd581f6242e31930e5ab8640e59c4c8702b9a836/rollup.utils.js
/*import url from 'url';
import fs from 'fs';
import child_process from 'child_process';
import selfsigned from 'selfsigned';
import findCacheDir from 'find-cache-dir';
*/
export async function getPackagePath(packageName, assetPath) {
    let packageRoot;
    let current = require.resolve('./package.json');
    if (require(current).name === packageName) {
        // current package
        packageRoot = path.dirname(current);
    } else {
        // Other packages from nodes_modules etc.
        packageRoot = path.dirname(require.resolve(packageName + '/package.json'));
    }
    return path.relative(process.cwd(), path.join(packageRoot, assetPath));
}