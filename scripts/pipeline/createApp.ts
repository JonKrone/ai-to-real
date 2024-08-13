import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createApp(appName: string, template: string = 'next-app'): Promise<void> {
  const templateDir = path.join(__dirname, '..', '..', 'templates', template);
  const appDir = path.join(__dirname, '..', '..', 'apps', appName);

  try {
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template "${template}" does not exist.`);
    }

    await fs.copy(templateDir, appDir);

    // Update package.json with the new app name
    const packageJsonPath = path.join(appDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = appName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    console.log(`Created new app: ${appName} using ${template} template`);
  } catch (err) {
    console.error('Error creating app:', err);
  }
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const appName = process.argv[2];
  const template = process.argv[3] || 'next-app';
  if (!appName) {
    console.error('Please provide an app name');
    process.exit(1);
  }
  createApp(appName, template);
}

export default createApp;

// curitiba.ns.porkbun.com
// fortaleza.ns.porkbun.com
// maceio.ns.porkbun.com
// salvador.ns.porkbun.com
