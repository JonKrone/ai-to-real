import { cloudflare } from '../lib/cloudflareClient'
import { getFullDomain } from '../lib/domainUtils'
import { vercel } from '../lib/vercelClient'

export async function deployApp({ appName }: { appName: string }) {
  await setupProjectAndDomain({ appName })

  return

  // The following code is commented out as it is not currently used
  // process.chdir(appName)
  // await $`npm install`
  // await $`npm run build`
  // await $`vercel --prod`
  // console.log(`Deployment completed for ${appName}`)
}

export async function setupProjectAndDomain({ appName }: { appName: string }) {
  await cloudflare.dns.findOrCreateSubdomain(appName)

  await vercel.projects.findOrCreateProject(appName)

  await vercel.projects.findOrCreateDomain(appName, getFullDomain(appName))

  // At some point we need to create a .vercel/project.json file with the correct projectId
}
