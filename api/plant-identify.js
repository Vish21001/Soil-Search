// Vercel Serverless Function: Proxies Plant.id API using a secret env var
// Reads API key from process.env.PLANT_ID_API_KEY and forwards requests.

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.PLANT_ID_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server misconfigured: missing PLANT_ID_API_KEY' });
    }

    try {
        const contentType = req.headers['content-type'] || '';
        if (!contentType.includes('application/json')) {
            return res.status(400).json({ error: 'Expected application/json body' });
        }

        const { imageBase64, details, language = 'en', similar_images = true } = req.body || {};

        if (!imageBase64 || typeof imageBase64 !== 'string') {
            return res.status(400).json({ error: 'imageBase64 is required' });
        }

        const base64Raw = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

        const queryDetails = Array.isArray(details) ?
            details.join(',') :
            typeof details === 'string' && details.trim() ?
            details.trim() :
            ['common_names', 'url', 'description', 'taxonomy'].join(',');

        const endpoint = `https://plant.id/api/v3/identification?details=${encodeURIComponent(queryDetails)}&language=${encodeURIComponent(language)}`;

        const payload = {
            images: [base64Raw],
            similar_images: Boolean(similar_images)
        };

        const upstream = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': apiKey
            },
            body: JSON.stringify(payload)
        });

        const text = await upstream.text();

        // Forward status and JSON/text body as-is when possible
        const contentTypeUp = upstream.headers.get('content-type') || '';
        if (contentTypeUp.includes('application/json')) {
            try {
                const json = JSON.parse(text);
                return res.status(upstream.status).json(json);
            } catch (e) {
                // Fall through to send raw text
            }
        }

        res.status(upstream.status);
        res.setHeader('Content-Type', contentTypeUp || 'text/plain; charset=utf-8');
        return res.send(text);
    } catch (err) {
        console.error('Proxy error:', err);
        return res.status(500).json({ error: 'Proxy request failed' });
    }
}
