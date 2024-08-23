import { Cloudflare } from 'cloudflare'
import { getFullDomain } from './domainUtils'

const cf = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_KRONE_SH_DNS_TOKEN,
})

const ZoneId = process.env.CLOUDFLARE_ZONE_ID
const VercelCNAME = 'cname.vercel-dns.com'

const cloudflareClient = {
  dns: {
    getSubdomain: async (subdomain: string) => {
      if (!ZoneId) {
        throw new Error('CLOUDFLARE_ZONE_ID is not set')
      }

      const records = await cf.dns.records.list({
        zone_id: ZoneId,
      })

      return records.result.find((r) => r.name === getFullDomain(subdomain))
    },
    createSubdomain: async (subdomain: string) => {
      if (!ZoneId) {
        throw new Error('CLOUDFLARE_ZONE_ID is not set')
      }

      try {
        const response = await cf.dns.records.create({
          zone_id: ZoneId,
          type: 'CNAME',
          name: subdomain,
          content: VercelCNAME,
          ttl: 1, // Auto
          proxied: true,
        })

        console.log(
          `Subdomain CNAME record for ${getFullDomain(subdomain)} created.`,
        )
        console.log('DNS Record ID:', response.id)

        return response
      } catch (error) {
        console.error('Error creating subdomain:', error)
        throw error
      }
    },
    deleteSubdomain: async (subdomain: string): Promise<void> => {
      if (!ZoneId) {
        throw new Error('CLOUDFLARE_ZONE_ID is not set')
      }

      try {
        const record = await cloudflareClient.dns.getSubdomain(subdomain)

        if (!record?.id) {
          console.log(`No DNS record found for ${subdomain}`)
          return
        }

        // Delete the record
        await cf.dns.records.delete(record.id, {
          zone_id: ZoneId,
        })

        console.log(`Subdomain ${subdomain} deleted`)
      } catch (error) {
        console.error('Error deleting subdomain:', error)
        throw error
      }
    },
    findOrCreateSubdomain: async (subdomain: string) => {
      const subdomainExists = await cloudflareClient.dns.getSubdomain(subdomain)
      if (!subdomainExists) {
        await cloudflareClient.dns.createSubdomain(subdomain)
        console.log(`Subdomain provisioned: ${subdomain}`)
      } else {
        console.log(`Subdomain ${subdomain} already exists`)
      }
    },
  },
}

export { cloudflareClient }
