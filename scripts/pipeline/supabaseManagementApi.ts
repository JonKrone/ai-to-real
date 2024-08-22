import axios from "axios";

const mgmtClient = axios.create({
  baseURL: 'https://api.supabase.com'
})

export const createSupabaseManagementClient = () => {

  return {
    createProject: async ({name, orgId}: {name: string, orgId: string}) => {
      const response = await mgmtClient.post('/v1/projects', {
        name,
        org_id: orgId,
        region: 'us-east-1',
        desired_instance_size: 'micro',
      })

      return response.data
    },
    getSchema: async (projectId: string) => {
      const query = `
        SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public';
      `
      const response = await mgmtClient.post(`/v1/projects/${projectId}/database/query`, {query})
      return response.data
    }
  }
};

