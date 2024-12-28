import metadata from '../output/metadata.json'

export interface MidjourneyJob {
  id: string
  prompt: string
  url: string
}

export function getMidjourneyData(): MidjourneyJob[] {
  console.log('Metadata content:', metadata)
  // Convert object to array
  const jobsArray = Object.values(metadata)
  console.log('Converted to array:', jobsArray)
  return jobsArray
}

export function getRandomJob(): MidjourneyJob {
  const jobs = getMidjourneyData()
  console.log('Available jobs:', jobs.length)
  const randomIndex = Math.floor(Math.random() * jobs.length)
  console.log('Selected index:', randomIndex)
  const selectedJob = jobs[randomIndex]
  console.log('Selected job:', selectedJob)
  return selectedJob
} 