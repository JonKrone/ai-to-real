const TargetDomain = 'krone.sh'

export const getFullDomain = (subdomain: string): string => {
  return `${subdomain}.${TargetDomain}`
}
