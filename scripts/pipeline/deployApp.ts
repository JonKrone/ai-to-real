import path from 'path'
import { $ } from 'zx'
import { cloudflare } from '../lib/cloudflareClient'
import { getFullDomain } from '../lib/domainUtils'
import { vercel } from '../lib/vercelClient'

export async function deployApp({ appName }: { appName: string }) {
  // Presuming we're already set up
  // await setupProjectAndDomain({ appName })

  // To deploy: 1. cd to project dir, `apps/<appName>`, 2. vercel pull env, 3. vercel build, 4. vercel deploy --prebuilt
  const appDir = path.join(process.cwd(), 'apps', appName)

  console.log(`Changing directory to: ${appDir}`)
  process.chdir(appDir)

  console.log('Pulling Vercel environment variables...')
  await $`vercel pull --yes --environment=production --token=${process.env.VERCEL_TOKEN}`

  console.log('Building project...')
  await $`vercel build --token=${process.env.VERCEL_TOKEN}`

  console.log('Deploying project...')
  await $`vercel deploy --prebuilt --prod --token=${process.env.VERCEL_TOKEN}`

  console.log(`Deployment completed for ${appName}`)
}

export async function setupProjectAndDomain({ appName }: { appName: string }) {
  await cloudflare.dns.findOrCreateSubdomain(appName)

  await vercel.projects.findOrCreateProject(appName)

  await vercel.projects.findOrCreateDomain(appName, getFullDomain(appName))

  // At some point we need to create a .vercel/project.json file with the correct projectId
}
