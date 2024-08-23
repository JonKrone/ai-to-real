import axios, { AxiosResponse } from 'axios'

const vercelRequest = axios.create({
  baseURL: 'https://api.vercel.com',
  headers: {
    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
  },
})

const vercelClient = {
  projects: {
    addDomain: async (
      projectId: string,
      domain: string,
    ): Promise<AxiosResponse<AddDomainResponse>> => {
      return vercelRequest.post(`/v10/projects/${projectId}/domains`, {
        name: domain,
        gitBranch: null,
        redirect: null,
        redirectStatusCode: null,
      })
    },
    hasDomain: async (projectId: string, domain: string): Promise<boolean> => {
      const response = await vercelRequest.get<ProjectDomainResponse>(
        `/v9/projects/${projectId}/domains`,
      )

      const projectDomainResponse = response.data

      return !!projectDomainResponse.domains.find((d) => d.name === domain)
    },
    createProject: async (
      appName: string,
    ): Promise<AxiosResponse<CreateProjectResponse>> => {
      return vercelRequest.post('/v10/projects', {
        name: appName,
        framework: 'nextjs', // Assuming the framework is Next.js, adjust as needed
      })
    },
    hasProject: async (appName: string): Promise<boolean> => {
      const response =
        await vercelRequest.get<ListProjectsResponse>('/v9/projects')
      const projects = response.data.projects
      return projects.some((project) => project.name === appName)
    },
    findOrCreateProject: async (appName: string): Promise<void> => {
      const projectExists = await vercelClient.projects.hasProject(appName)
      if (!projectExists) {
        await vercelClient.projects.createProject(appName)
        console.log(`Vercel project ${appName} created`)
      } else {
        console.log(`Vercel project ${appName} already exists`)
      }
    },
    findOrCreateDomain: async (
      projectId: string,
      domain: string,
    ): Promise<void> => {
      const domainExists = await vercelClient.projects.hasDomain(
        projectId,
        domain,
      )
      if (!domainExists) {
        await vercelClient.projects.addDomain(projectId, domain)
        console.log(`Domain ${domain} added to Vercel project ${projectId}`)
      } else {
        console.log(
          `Domain ${domain} already exists in Vercel project ${projectId}`,
        )
      }
    },
  },
}

interface ProjectDomainResponse {
  domains: Array<{
    name: string
    projectId: string
    apexName: string
  }>
}

interface AddDomainResponse {
  name: string
  projectId: string
  gitBranch: string | null
  redirect: string | null
  redirectStatusCode: number | null
}

interface CreateProjectResponse {
  id: string
  name: string
  accountId: string
  createdAt: number
  updatedAt: number
  framework: string
}

interface ListProjectsResponse {
  projects: Array<{
    id: string
    name: string
    accountId: string
    createdAt: number
    updatedAt: number
    framework: string
  }>
}

export { vercelClient }
