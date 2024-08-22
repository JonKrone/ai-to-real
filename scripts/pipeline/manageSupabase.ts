import { createClient } from '@supabase/supabase-js'
import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const SUPABASE_ORG_ID = process.env.SUPABASE_ORG_ID

if (!SUPABASE_ACCESS_TOKEN || !SUPABASE_ORG_ID) {
  throw new Error('SUPABASE_ACCESS_TOKEN and SUPABASE_ORG_ID must be set in environment variables')
}

const supabase = createClient('https://api.supabase.com', SUPABASE_ACCESS_TOKEN)

export async function createSupabaseProject(projectName: string, dbPassword: string): Promise<{ projectRef: string, dbUrl: string, apiKey: string }> {
  console.log(`Creating Supabase project: ${projectName}...`)

  const { data, error } = await supabase.functions.invoke('projects', {
    body: {
      name: projectName,
      organization_id: SUPABASE_ORG_ID,
      db_pass: dbPassword,
      region: 'us-east-1', // You can change this as needed
      plan: 'free'
    }
  })

  if (error) throw error

  const projectRef = data.project.ref
  console.log(`Supabase project ${projectName} created successfully. Project ref: ${projectRef}`)

  // Get the API key
  const { data: apiKeys, error: apiKeyError } = await supabase.functions.invoke('projects-api-keys', {
    body: { ref: projectRef }
  })
  if (apiKeyError) throw apiKeyError

  const apiKey = apiKeys.find(key => key.name === 'anon')?.api_key

  // Construct the database URL
  const dbUrl = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`

  return { projectRef, dbUrl, apiKey }
}

export async function deleteSupabaseProject(projectRef: string): Promise<void> {
  console.log(`Deleting Supabase project: ${projectRef}...`)

  const { error } = await supabase.functions.invoke('projects', {
    body: { ref: projectRef },
    method: 'DELETE'
  })

  supabase.

  if (error) throw error

  console.log(`Supabase project ${projectRef} deleted successfully`)
}

export async function getProjectInfo(projectRef: string): Promise<{ dbUrl: string, apiKey: string }> {
  // Get the API key
  const { data: apiKeys, error: apiKeyError } = await supabase.functions.invoke('projects-api-keys', {
    body: { ref: projectRef }
  })
  if (apiKeyError) throw apiKeyError

  const apiKey = apiKeys.find(key => key.name === 'anon')?.api_key

  // Get the database password
  const { data: secrets, error: secretsError } = await supabase.functions.invoke('secrets', {
    body: { ref: projectRef }
  })
  if (secretsError) throw secretsError

  const dbPassword = secrets.find(secret => secret.name === 'postgres_password')?.value

  // Construct the database URL
  const dbUrl = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`

  return { dbUrl, apiKey }
}


export async function applyPrismaMigrations(projectRef: string, schemaPath: string): Promise<void> {
  console.log(`Applying Prisma migrations for project: ${projectRef}...`)

  // Get the database URL
  const { dbUrl } = await getProjectInfo(projectRef)

  // Create a temporary .env file with the DATABASE_URL
  const envPath = path.join(process.cwd(), '.env.temp')
  await fs.writeFile(envPath, `DATABASE_URL="${dbUrl}"`)

  try {
    // Generate Prisma client
    await execAsync(`npx prisma generate --schema=${schemaPath}`)

    // Run Prisma migrations
    await execAsync(`npx prisma migrate deploy --schema=${schemaPath}`, {
      env: { ...process.env, DATABASE_URL: dbUrl }
    })

    console.log('Prisma migrations applied successfully')
  } catch (error) {
    console.error('Error applying Prisma migrations:', error)
    throw error
  } finally {
    // Clean up the temporary .env file
    await fs.unlink(envPath)
  }
}

export async function ensureSchemaUpToDate(projectRef: string, schemaPath: string): Promise<void> {
  console.log(`Ensuring schema is up to date for project: ${projectRef}...`)

  // Get the database URL
  const { dbUrl } = await getProjectInfo(projectRef)

  try {
    // Check if there are any pending migrations
    const { stdout } = await execAsync(`npx prisma migrate status --schema=${schemaPath}`, {
      env: { ...process.env, DATABASE_URL: dbUrl }
    })

    if (stdout.includes('have not been applied')) {
      console.log('Pending migrations found. Applying migrations...')
      await applyPrismaMigrations(projectRef, schemaPath)
    } else {
      console.log('Schema is up to date')
    }
  } catch (error) {
    console.error('Error checking schema status:', error)
    throw error
  }
}
