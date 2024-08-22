import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp(appName: string, template: string = 'next-app'): Promise<void> {
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


    // TODO: `npx vercel link` or create .vercel/project.json folder

    console.log(`Created new app: ${appName} using ${template} template`);
  } catch (err) {
    console.error('Error creating app:', err);
  }
}
