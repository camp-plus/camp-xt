#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walk(dir) {
  const res = [];
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) res.push(...walk(p)); else res.push(p);
  }
  return res;
}

function bumpPatch(v) {
  const parts = v.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join('.');
}

function main() {
  const root = path.resolve(__dirname, '..');
  const pkgPath = path.join(root, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const oldVer = pkg.version;
  const newVer = bumpPatch(oldVer);

  console.log(`Bumping version ${oldVer} -> ${newVer}`);

  const files = walk(root).filter(f => f.endsWith('.js') || f.endsWith('.md') || f.endsWith('.json'));
  const changed = [];
  for (const f of files) {
    let s = fs.readFileSync(f, 'utf8');
    if (s.includes(oldVer)) {
      const ns = s.split(oldVer).join(newVer);
      fs.writeFileSync(f, ns, 'utf8');
      changed.push(path.relative(root, f));
    }
  }

  // update package.json explicitly (already handled above but ensure exact replace)
  pkg.version = newVer;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  if (!changed.includes('package.json')) changed.push('package.json');

  console.log('Updated files:', changed);

  try {
    execSync('git add -A', { cwd: root, stdio: 'inherit' });
    execSync(`git commit -m "chore(release): bump version to ${newVer}"`, { cwd: root, stdio: 'inherit' });
    execSync(`git tag v${newVer}`, { cwd: root, stdio: 'inherit' });
    execSync('git push', { cwd: root, stdio: 'inherit' });
    execSync('git push --tags', { cwd: root, stdio: 'inherit' });
    console.log('Pushed commit and tag v' + newVer);
  } catch (e) {
    console.error('Git operations failed:', e && e.message ? e.message : e);
    process.exit(1);
  }
}

main();
