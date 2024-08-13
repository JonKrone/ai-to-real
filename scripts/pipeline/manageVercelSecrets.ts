#!/usr/bin/env zx

import { $ } from 'zx';

// Suppress zx's default output
$.verbose = false;

const vercelToken = process.env.VERCEL_TOKEN;

async function createSecret(name: string, value: string): Promise<void> {
  await $`vercel secrets add ${name} "${value}" --token ${vercelToken}`;
  console.log(`Secret ${name} created successfully`);
}

async function updateSecret(name: string, value: string): Promise<void> {
  // Vercel CLI doesn't have a direct update command, so we remove and add
  await deleteSecret(name);
  await createSecret(name, value);
  console.log(`Secret ${name} updated successfully`);
}

async function deleteSecret(name: string): Promise<void> {
  await $`vercel secrets rm ${name} -y --token ${vercelToken}`;
  console.log(`Secret ${name} deleted successfully`);
}



export { createSecret, deleteSecret, updateSecret };
