import { Cloudflare } from 'cloudflare';

// Initialize Cloudflare client
const cf = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_KRONE_SH_DNS_TOKEN
});

const ZoneId = process.env.CLOUDFLARE_ZONE_ID;
const TargetDomain = 'krone.sh'
const VercelCNAME = 'cname.vercel-dns.com'

export async function getSubdomain(subdomain: string) {
  if (!ZoneId) {
    throw new Error('CLOUDFLARE_ZONE_ID is not set');
  }

  const records = await cf.dns.records.list({
    zone_id: ZoneId
  });

  return records.result.find(r => r.name === subdomain);
}

export async function createSubdomain(subdomain: string) {
  if (!ZoneId) {
    throw new Error('CLOUDFLARE_ZONE_ID is not set');
  }

  try {
    const response = await cf.dns.records.create({
      zone_id: ZoneId,
      type: 'CNAME',
      name: subdomain,
      content: VercelCNAME,
      ttl: 1, // Auto
      proxied: true
    });

    console.log(`Subdomain CNAME record for ${subdomain}.${TargetDomain} created.`);
    console.log('DNS Record ID:', response.id);

    return response
  } catch (error) {
    console.error('Error creating subdomain:', error);
    throw error;
  }
}

export async function deleteSubdomain(subdomain: string): Promise<void> {
  if (!ZoneId) {
    throw new Error('CLOUDFLARE_ZONE_ID is not set');
  }

  try {
    const record = await getSubdomain(subdomain);

    if (!record?.id) {
      console.log(`No DNS record found for ${subdomain}`);
      return;
    }

    // Delete the record
    await cf.dns.records.delete(record.id, {
      zone_id: ZoneId,
    });

    console.log(`Subdomain ${subdomain} deleted`);
  } catch (error) {
    console.error('Error deleting subdomain:', error);
    throw error;
  }
}
