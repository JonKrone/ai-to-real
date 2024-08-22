import { $ } from 'zx';
import { createSubdomain, getSubdomain } from './manageDNS';

// Suppress zx's default output
$.verbose = false;

export async function deployApp({appName}: {appName: string}) {
  console.log(`Starting deployment for new app: ${appName}`);

  // Subdomains
  // 1. Check if subdomain exists
  // 2. If it does, great
  // 3. If it doesn't, create it
  // 3.1. Create the CNAME record in cloudflare
  // 3.2. Configure Vercel to use the subdomain
  const subdomain = appName
  const subdomainExists = await getSubdomain(subdomain)
  if (!subdomainExists) {
    await createSubdomain(subdomain);
    console.log(`Subdomain provisioned: ${subdomain}`);
  }

  // Create Vercel project
  const vercelProjectSlug = appName
  const vercelExists = (await $`vercel ls ${vercelProjectSlug}`.text()).includes(`https://${vercelProjectSlug}`)
  if (!vercelExists) {
    await createVercelProject(appName)
    console.log(`Vercel project ${vercelProjectSlug} created`);
  }

  const fullUrl = `${subdomain}.krone.sh`
  const vercelDomainExists = (await $`vercel domains inspect ${fullUrl}`.text()).includes(`${fullUrl} found`)
  if (!vercelDomainExists) {
    await addDomainToVercel(subdomain, vercelProjectSlug)
    console.log(`Domain ${fullUrl} added to Vercel project ${vercelProjectSlug}`);
  }
  console.log('Vercel setup complete')

  // 2. Create dev and prod Supabase databases
  // const devDb = await createSupabaseProject(`${appName}-dev`, `${appName}DevPass123!`);
  // const prodDb = await createSupabaseProject(`${appName}-prod`, `${appName}ProdPass123!`);
  // console.log('Supabase projects created for dev and prod');

  // 3. Configure Vercel
  // await createSecret(`${appName}_DEV_DB_URL`, devDb.dbUrl);
  // await createSecret(`${appName}_PROD_DB_URL`, prodDb.dbUrl);
  // await createSecret(`${appName}_DEV_SUPABASE_KEY`, devDb.apiKey);
  // await createSecret(`${appName}_PROD_SUPABASE_KEY`, prodDb.apiKey);
  // console.log('Vercel configured with new secrets');

  return

  // 4. Build and deploy the app
  // Assuming the app is in a directory named after the app
  process.chdir(appName);

  // Install dependencies
  await $`npm install`;

  // Apply Prisma migrations to both dev and prod
  // await applyPrismaMigrations(devDb.projectRef, './prisma/schema.prisma');
  // await applyPrismaMigrations(prodDb.projectRef, './prisma/schema.prisma');

  // Build the app
  await $`npm run build`;

  // Deploy to Vercel
  await $`vercel --prod`;

  console.log(`Deployment completed for ${appName}`);
}


export const createVercelProject = async (appName: string) => {
  await $`vercel projects add ${appName}`
}

export const addDomainToVercel = async (subdomain: string, vercelProjectId: string) => {
  await $`vercel domains add ${subdomain} ${vercelProjectId}`
}
