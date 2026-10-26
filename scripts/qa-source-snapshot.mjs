// Release QA input-lock proof: reject edits while Node tests/build are running.
// This is local, read-only and deterministic; dist/ and customer data are excluded.
import {createHash} from 'node:crypto';
import {readdirSync, lstatSync, readFileSync} from 'node:fs';
import {join, sep} from 'node:path';

const DIRS = Object.freeze(['site', 'scripts', 'tests', 'public-site', 'examples']);
const FILES = Object.freeze(['package.json', 'wrangler.jsonc', 'QA_SELF_WINDOWS.cmd']);

export function snapshotReleaseSources(root) {
  const entries = [];
  function walk(path) {
    const absolute = join(root, path);
    const stat = lstatSync(absolute); // Do not follow a symlink outside the source tree.
    if (stat.isSymbolicLink()) throw Error('RELEASE_QA_FAILED: source symlink: ' + path);
    if (stat.isDirectory()) {
      for (const name of readdirSync(absolute).sort()) walk(join(path, name));
    } else if (stat.isFile()) {
      entries.push({path: path.split(sep).join('/'), hash: createHash('sha256').update(readFileSync(absolute)).digest('hex')});
    } else {
      throw Error('RELEASE_QA_FAILED: unsupported source type: ' + path);
    }
  }
  for (const path of [...DIRS, ...FILES]) walk(path);
  entries.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const manifest = entries.map(({path,hash}) => path + '\0' + hash + '\n').join('');
  return {sha256: createHash('sha256').update(manifest, 'utf8').digest('hex'), files: entries.length};
}

export function requireUnchangedReleaseSources(before, after) {
  if (!before || !after || before.sha256 !== after.sha256 || before.files !== after.files) {
    throw Error('RELEASE_QA_FAILED: source changed during tests/build; rerun QA on a stable checkout');
  }
}
