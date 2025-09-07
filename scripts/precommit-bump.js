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

	console.log(`pre-commit: bumping version ${oldVer} -> ${newVer}`);

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

	// update package.json explicitly
	pkg.version = newVer;
	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
	if (!changed.includes('package.json')) changed.push('package.json');

	// Stage changes so the ongoing commit will include the version bump
	try {
		execSync('git add -A', { cwd: root, stdio: 'inherit' });
		console.log('pre-commit: staged files:', changed);
	} catch (e) {
		console.error('pre-commit: git add failed', e && e.message ? e.message : e);
		process.exit(1);
	}
}

main();
