import { Cloudflare } from 'cloudflare';

// Initialize Cloudflare client
const cf = new Cloudflare({
  token: process.env.CLOUDFLARE_KRONE_SH_DNS_TOKEN
});

const zoneId = process.env.CLOUDFLARE_ZONE_ID;

export async function createSubdomain(appName: string, targetDomain: string): Promise<void> {
  if (!zoneId) {
    throw new Error('CLOUDFLARE_ZONE_ID is not set');
  }

  const subdomain = `${appName}.yourdomain.com`;

  try {
    const response = await cf.dnsRecords.add(zoneId, {
      type: 'CNAME',
      name: subdomain,
      content: targetDomain,
      ttl: 1, // Auto
      proxied: true
    });

    console.log(`Subdomain ${subdomain} created and pointed to ${targetDomain}`);
    console.log('DNS Record ID:', response.id);
  } catch (error) {
    console.error('Error creating subdomain:', error);
    throw error;
  }
}

export async function deleteSubdomain(appName: string): Promise<void> {
  if (!zoneId) {
    throw new Error('CLOUDFLARE_ZONE_ID is not set');
  }

  const subdomain = `${appName}.yourdomain.com`;

  try {
    // First, we need to find the DNS record ID
    const records = await cf.dnsRecords.browse(zoneId);
    const record = records.result.find(r => r.name === subdomain);

    if (!record) {
      console.log(`No DNS record found for ${subdomain}`);
      return;
    }

    // Delete the record
    await cf.dnsRecords.del(zoneId, record.id);

    console.log(`Subdomain ${subdomain} deleted`);
  } catch (error) {
    console.error('Error deleting subdomain:', error);
    throw error;
  }
}
