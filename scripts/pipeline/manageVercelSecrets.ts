import path from 'path'
import { $, fs } from 'zx'

// Suppress zx's default output
$.verbose = false

const vercelToken = process.env.VERCEL_TOKEN
const githubWorkspace = process.env.GITHUB_WORKSPACE || '/tmp'

if (!vercelToken) {
  throw new Error('VERCEL_TOKEN must be set in environment variables')
}

async function vercel(command: string, input?: string): Promise<string> {
  // Use an array to pass arguments to avoid shell interpretation issues
  const args = command.split(' ')

  try {
    if (input) {
      const tempFilePath = path.join(githubWorkspace, 'vercel_input.txt')
      await fs.writeFile(tempFilePath, input)

      // Use $$ to run commands with input redirection
      return (await $`npx vercel ${args} < ${tempFilePath}`).stdout.trim()
    } else {
      return (await $`npx vercel ${args}`).stdout.trim()
    }
  } catch (error) {
    console.error('Error running Vercel command:', error)
    throw error
  }
}

// The rest of your code remains the same
export async function createSecret(name: string, value: string): Promise<void> {
  console.log(`Creating environment variable ${name}...`)
  await vercel(`env add ${name} production`, `${value}`)
  console.log(`Environment variable ${name} created successfully`)
}

export async function updateSecret(name: string, value: string): Promise<void> {
  console.log(`Updating environment variable ${name}...`)
  await deleteSecret(name)
  await createSecret(name, value)
}

export async function deleteSecret(name: string): Promise<void> {
  console.log(`Deleting environment variable ${name}...`)
  await vercel(`env rm ${name} production --yes`)
  console.log(`Environment variable ${name} deleted successfully`)
}
