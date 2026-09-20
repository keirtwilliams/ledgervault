import fetch from 'node-fetch';
import fs from 'fs';

const url = 'https://pazfhriqxqqulogfkoez.supabase.co/rest/v1/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhemZocmlxeHFxdWxvZ2Zrb2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNjk2NjMsImV4cCI6MjEwNDk0NTY2M30.-VGnTwkKh6ldvcNq0bHruelhV-1L2FxAgNZ9yXC1BMA';

async function main() {
  try {
    const res = await fetch(url, {
      headers: { 'apikey': key }
    });
    const data = await res.json();
    fs.writeFileSync('schema_clean.json', JSON.stringify(data, null, 2), 'utf-8');
    console.log("Wrote schema_clean.json");
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
