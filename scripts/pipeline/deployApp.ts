import path from 'path'
import { $, cd } from 'zx'
import { cloudflare } from '../lib/cloudflareClient'
import { getFullDomain } from '../lib/domainUtils'
import { vercel } from '../lib/vercelClient'

export async function deployApp({
  appName,
  prod,
}: {
  appName: string
  prod: boolean
}) {
  // Presuming we're already set up
  // await setupProjectAndDomain({ appName })

  const appDir = path.join(process.cwd(), 'apps', appName)
  cd(appDir)

  await $`vercel pull --yes --environment=${prod ? 'production' : 'preview'} --token=${process.env.VERCEL_TOKEN}`
  await $`vercel build ${prod ? '--prod' : ''} --token=${process.env.VERCEL_TOKEN}`
  const previewDomain =
    await $`vercel deploy --prebuilt ${prod ? '--prod' : ''} --token=${process.env.VERCEL_TOKEN}`

  console.log(`Deployment completed for ${appName}`)
  return {
    domain: prod ? 'https://' + getFullDomain(appName) : previewDomain,
  }
}

export async function setupProjectAndDomain({ appName }: { appName: string }) {
  // TODO: To better support preview deployments, consider creating a ${appname}-preview domain
  await cloudflare.dns.findOrCreateSubdomain(appName)
  await vercel.projects.findOrCreateProject(appName)
  await vercel.projects.findOrCreateDomain(appName, getFullDomain(appName))

  // At some point we need to create a .vercel/project.json file with the correct projectId
}
