import { mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const file = process.env.DEPLOYMENT_FILE;
const project = process.env.PROJECT_ROOT;
const directory = process.env.BUILD_DIR;

if (!file || !project || !directory) {
  throw new Error('DEPLOYMENT_FILE, PROJECT_ROOT and BUILD_DIR are required.');
}

const absoluteProject = realpathSync(resolve(project));
const absoluteDirectory = realpathSync(resolve(directory));
mkdirSync(dirname(resolve(file)), { recursive: true });
writeFileSync(resolve(file), JSON.stringify({ project: absoluteProject, directory: absoluteDirectory }));
console.log(`deployment: ${resolve(file)} -> ${absoluteDirectory}`);
