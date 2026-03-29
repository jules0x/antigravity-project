const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env' });

async function run() {
  const client = createClient({
    url: 'file:payload.db',
  });

  console.log('Fetching playlists...');
  const playlists = await client.execute('SELECT id, youtubeURL, title FROM playlists');
  
  // Hardcoded extraction logic (simplified version of youtubePlaylist.ts)
  // Since we can't easily import the typescript utility here without more setup,
  // we'll just do a quick fetch + regex for this one-off migration.
  
  const https = require('https');

  async function fetchHtml(url) {
    return new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  for (const row of playlists.rows) {
    console.log(`\nProcessing: ${row.title}`);
    try {
      const html = await fetchHtml(row.youtubeURL);
      const vIds = [...new Set([...html.matchAll(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]))];
      console.log(`Found ${vIds.length} candidate IDs.`);
      
      let count = 0;
      for (const vId of vIds) {
        // Link item to playlist by updating its playlist column
        const res = await client.execute({
          sql: 'UPDATE items SET playlist_id = ? WHERE youtube_id = ?',
          args: [row.id, vId]
        });
        if (res.rowsAffected > 0) count++;
      }
      console.log(`[✓] Linked ${count} items to "${row.title}"`);
    } catch (e) {
      console.error(`Error with ${row.title}: ${e.message}`);
    }
  }

  process.exit(0);
}

run();
