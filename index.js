import fs from 'fs';
import semver from 'semver';
import yaml from 'js-yaml';

const version = process.argv[2];
const releaseFile = process.argv[3];

if (!version || !releaseFile) {
	console.log('USAGE: increment-release-yaml <version> /path/to/release.yml');
	process.exit();
}

if (!fs.existsSync(releaseFile)) {
	console.error(`Release file not found: ${releaseFile}`);
	process.exit(1);
}

console.log(`Loading ${releaseFile}`);
const doc = yaml.load(fs.readFileSync(releaseFile, 'utf8'));

const dest = doc?.on?.workflow_dispatch?.inputs?.version;
if (!dest) {
	console.error('Release.yml file is missing "version" input');
	process.exit(1);
}

dest.default = `Patch (${semver.inc(version, 'patch')})`;
dest.options = [ 'Patch', 'Minor', 'Major', 'Prepatch', 'Preminor', 'Premajor' ].map(type => {
	return `${type} (${semver.inc(version, type.toLowerCase())})`;
});
dest.options.push('Custom Version');

fs.writeFileSync(releaseFile, yaml.dump(doc));
console.log(`Successfully updated release file: ${releaseFile}`);
