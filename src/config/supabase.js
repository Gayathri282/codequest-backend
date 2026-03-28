// backend/src/config/supabase.js
// Supabase admin client — for storage operations (thumbnails, docs)
const { createClient } = require('@supabase/supabase-js');

let _client = null;

function getSupabase() {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_KEY is not set in environment');
    _client = createClient(url, key);
  }
  return _client;
}

module.exports = getSupabase;
