const deployablePackageJson = require('./npm.package.json');
const fs = require('fs');
const currentPackageJson = require('./package.json');
const { exec } = require('child_process');

const versionChange = process.argv[2];
const versions = deployablePackageJson.version.split('.');

if (versionChange !== 'n') {
    if (versionChange === 'major') {
        versions[0] = parseInt(versions[0], 10) + 1;
        versions[1] = 0;
        versions[2] = 0;
    } else if (versionChange === 'minor') {
        versions[1] = parseInt(versions[1], 10) + 1;
        versions[2] = 0;
    } else {
        versions[2] = parseInt(versions[2], 10) + 1;
    }

    deployablePackageJson.version = versions.join('.');

    fs.writeFileSync('./npm.package.json', JSON.stringify(deployablePackageJson, null, 2));

    currentPackageJson.version = deployablePackageJson.version;

    fs.writeFileSync('./package.json', JSON.stringify(currentPackageJson, null, 2));
}

exec('npm publish', (err, stdout, stderr) => {
    fs.writeFileSync('./package.json', JSON.stringify(currentPackageJson, null, 2));
    if (err) {
        console.error(err);
        return;
    }

    console.log(stdout);
});