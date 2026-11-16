import { execSync } from 'child_process';

const args = process.argv.slice(2);
const specificTest = args[0]; // e.g. "checkout"

console.log(`Triggering manual tests${specificTest ? ` for: ${specificTest}` : '...'}`);

try {
    const cmd = specificTest
        ? `npx playwright test ${specificTest} --headed`
        : `npx playwright test --headed`;

    execSync(cmd, { stdio: 'inherit' });
    console.log('Tests completed successfully.');
} catch (error) {
    console.error('Test execution failed.');
    process.exit(1);
}
