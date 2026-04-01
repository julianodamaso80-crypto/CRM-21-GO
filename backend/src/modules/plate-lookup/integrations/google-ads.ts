import axios from 'axios'

const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID
const GOOGLE_ADS_CONVERSION_ACTION = process.env.GOOGLE_ADS_CONVERSION_ACTION
const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
const GOOGLE_ADS_ACCESS_TOKEN = process.env.GOOGLE_ADS_ACCESS_TOKEN

interface GoogleAdsInput {
  gclid: string
  conversionValue: number
  conversionTime: string
}

export async function sendGoogleAdsConversion(input: GoogleAdsInput) {
  if (!GOOGLE_ADS_CUSTOMER_ID || !GOOGLE_ADS_CONVERSION_ACTION || !GOOGLE_ADS_DEVELOPER_TOKEN || !GOOGLE_ADS_ACCESS_TOKEN) {
    console.warn('[GoogleAds] Missing credentials, skipping offline conversion')
    return { skipped: true, reason: 'Missing credentials' }
  }

  const url = `https://googleads.googleapis.com/v16/customers/${GOOGLE_ADS_CUSTOMER_ID}:uploadClickConversions`

  const body = {
    conversions: [
      {
        gclid: input.gclid,
        conversionAction: `customers/${GOOGLE_ADS_CUSTOMER_ID}/conversionActions/${GOOGLE_ADS_CONVERSION_ACTION}`,
        conversionDateTime: input.conversionTime.replace('T', ' ').replace('Z', '+00:00'),
        conversionValue: input.conversionValue,
        currencyCode: 'BRL',
      },
    ],
    partialFailure: true,
  }

  console.log('[GoogleAds] Sending offline conversion:', JSON.stringify({
    customerId: GOOGLE_ADS_CUSTOMER_ID,
    gclid: input.gclid,
    value: input.conversionValue,
  }))

  const response = await axios.post(url, body, {
    headers: {
      'Authorization': `Bearer ${GOOGLE_ADS_ACCESS_TOKEN}`,
      'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  })

  console.log('[GoogleAds] Response:', response.status, JSON.stringify(response.data))
  return response.data
}
