import { cloudflareClient } from '../lib/cloudflareClient'
import { getFullDomain } from '../lib/domainUtils'
import { vercelClient } from '../lib/vercelClient'

export async function deployApp({ appName }: { appName: string }) {
  await cloudflareClient.dns.findOrCreateSubdomain(appName)

  await vercelClient.projects.findOrCreateProject(appName)

  const fullUrl = getFullDomain(appName)
  await vercelClient.projects.findOrCreateDomain(appName, fullUrl)

  console.log('Vercel setup complete')

  return

  // The following code is commented out as it is not currently used
  // process.chdir(appName)
  // await $`npm install`
  // await $`npm run build`
  // await $`vercel --prod`
  // console.log(`Deployment completed for ${appName}`)
}
