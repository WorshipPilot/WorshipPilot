// Netlify function: fetches plans the user is scheduled on from PCO
import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  const { pco_user_id } = event.queryStringParameters || {};

  if (!pco_user_id) return jsonError(400, 'Missing pco_user_id');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const clientId = process.env.VITE_PCO_CLIENT_ID;
  const clientSecret = process.env.VITE_PCO_CLIENT_SECRET;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Get stored token
  const { data: conn, error: fetchError } = await supabase
    .from('pco_connections')
    .select('*')
    .eq('pco_user_id', pco_user_id)
    .single();

  if (fetchError || !conn) return jsonError(404, 'No PCO connection found');

  // 2. Refresh token if expired
  let accessToken = conn.access_token;
  if (new Date(conn.expires_at) < new Date()) {
    const refreshed = await refreshToken(conn.refresh_token, clientId, clientSecret);
    if (!refreshed) return jsonError(401, 'Token refresh failed — please reconnect PCO');
    accessToken = refreshed.access_token;
    await supabase.from('pco_connections').update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    }).eq('pco_user_id', pco_user_id);
  }

  // 3. Fetch service types first to get IDs
  const stRes = await fetch(
    'https://api.planningcenteronline.com/services/v2/service_types?per_page=50',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const stData = await stRes.json();
  const serviceTypes = stData?.data || [];

  // Filter to worship-related service types only (exclude Events, Kids, etc.)
  const worshipTypes = serviceTypes.filter(st => {
    const name = st.attributes?.name?.toLowerCase() || '';
    return !name.includes('kids') && 
           !name.includes('children') && 
           !name.includes('events') &&
           !name.includes('event');
  });

  console.log('Worship service types:', worshipTypes.map(st => st.attributes?.name));

  // 4. Fetch upcoming plans for each worship service type, including items and songs
  const plans = [];
  for (const st of worshipTypes.slice(0, 5)) {
    const plansRes = await fetch(
      `https://api.planningcenteronline.com/services/v2/service_types/${st.id}/plans?filter=future&per_page=10&include=items&order=sort_date`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const plansData = await plansRes.json();
    const included = plansData?.included || [];

    for (const plan of (plansData?.data || [])) {
      const attrs = plan.attributes;

      // Get song items from included data
      const itemIds = plan.relationships?.items?.data?.map(i => i.id) || [];
      const songItems = included
        .filter(i => itemIds.includes(i.id) && i.type === 'Item' && i.attributes?.item_type === 'song')
        .map(i => ({
          title: i.attributes?.title || 'Untitled',
          key: i.attributes?.key_name || '',
          sequence: i.attributes?.sequence || 0,
        }))
        .sort((a, b) => a.sequence - b.sequence);

      plans.push({
        id: plan.id,
        serviceType: st.attributes?.name || 'Service',
        serviceTypeId: st.id,
        title: attrs?.title || attrs?.dates || 'Untitled Plan',
        dates: attrs?.dates || '',
        sortDate: attrs?.sort_date || '',
        songs: songItems,
        totalItems: attrs?.items_count || 0,
      });
    }
  }

  // Sort by date
  plans.sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      org: conn.pco_org_name,
      name: conn.pco_user_name,
      plans,
    }),
  };
};

async function refreshToken(refreshTok, clientId, clientSecret) {
  try {
    const res = await fetch('https://api.planningcenteronline.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshTok,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

const jsonError = (status, message) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: message }),
});
