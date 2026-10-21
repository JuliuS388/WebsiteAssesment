import { cp, mkdir, rm } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const publicDirectory = resolve('public');
const outputDirectory = resolve('vercel-public');

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(publicDirectory, outputDirectory, {
    recursive: true,
    filter: (sourcePath) => {
        const relativePath = relative(publicDirectory, sourcePath).replaceAll('\\', '/');

        return relativePath === '' || (
            relativePath !== 'index.php' &&
            relativePath !== 'hot' &&
            relativePath !== 'storage' &&
            !relativePath.startsWith('storage/')
        );
    },
});