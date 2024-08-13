import fs from 'fs-extra';
import path from 'node:path';

async function deployApp(appName: string, environment: string = 'dev'): Promise<void> {
  const appDir = path.join(__dirname, '..', '..', '..', 'apps', appName);

  // Ensure the app exists
  if (!fs.existsSync(appDir)) {
    throw new Error(`App "${appName}" does not exist.`);
  }

  // Read the app's package.json to determine its type/requirements
  const packageJsonPath = path.join(appDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  console.log(`Deploying ${appName} (${packageJson.name}) to ${environment} environment`);

  // TODO: Implement Supabase project creation
  // TODO: Implement Vercel deployment

  // TODO: Implement Cloudflare DNS configuration
  // await createSubdomain(appName, vercelDeploymentUrl);
  // // If you need to remove a deployment
  // await deleteSubdomain(appName);

  // The implementation of these TODOs will depend on the specific requirements of the app
  // You may need to adjust the deployment process based on the app's package.json content
}

export default deployApp;

// If run directly
if (require.main === module) {
  const appName = process.argv[2];
  const environment = process.argv[3] || 'dev';
  if (!appName) {
    console.error('Please provide an app name');
    process.exit(1);
  }
  deployApp(appName, environment);
}
