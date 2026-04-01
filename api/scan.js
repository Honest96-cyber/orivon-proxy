import crypto from 'crypto'

export default async function handler(req, res) {
  try {
    const { targetUrl } = req.body

    const method = 'POST'
    const path = '/v1/scrape-score'
    const timestamp = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString('hex')

    const bodyPayload = {
      targetUrl,
      action: 'full_scan'
    }

    const bodyString = JSON.stringify(bodyPayload)

    const bodySha256 = crypto
      .createHash('sha256')
      .update(bodyString)
      .digest('hex')

    const dataToSign = [method, path, timestamp, nonce, bodySha256].join('|')

    const signature = crypto
      .createHmac('sha256', process.env.SHARED_SECRET)
      .update(dataToSign)
      .digest('hex')

    const response = await fetch('https://wowseoweb3.com/v1/scrape-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-zgap-key-id': 'v1-orivon-browser',
        'x-zgap-timestamp': timestamp,
        'x-zgap-nonce': nonce,
        'x-zgap-payload-sha256': bodySha256,
        'x-zgap-signature': signature
      },
      body: bodyString
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Proxy failed', details: err.message })
  }
}
