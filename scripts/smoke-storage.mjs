const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-images'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  process.exit(1)
}

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
}

async function readResponse(response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const bucketResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, { headers })
const buckets = await readResponse(bucketResponse)
const bucketExists = Array.isArray(buckets) && buckets.some((item) => item.name === bucket || item.id === bucket)

const publicProbeResponse = await fetch(`${supabaseUrl}/storage/v1/object/public/${bucket}/__modhaus_smoke__.txt`, { headers })
const publicProbe = await readResponse(publicProbeResponse)
const bucketMissing =
  publicProbeResponse.status === 400 &&
  typeof publicProbe === 'object' &&
  publicProbe !== null &&
  'message' in publicProbe &&
  String(publicProbe.message).toLowerCase().includes('bucket not found')

console.log(
  JSON.stringify(
    {
      bucket,
      bucketListStatus: bucketResponse.status,
      bucketVisibleInList: bucketExists,
      publicProbeStatus: publicProbeResponse.status,
      publicProbe,
    },
    null,
    2,
  ),
)

if (bucketMissing || !bucketExists) {
  console.error(`Storage smoke test failed: bucket "${bucket}" is missing or not visible to the publishable key.`)
  process.exit(1)
}

console.log(`Storage smoke test passed: bucket "${bucket}" exists.`)
