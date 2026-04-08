import { createClient } from '@supabase/supabase-js';

// Map PCO section names to our section types
const mapSectionType = (name) => {
  const n = (name || '').toLowerCase().trim();
  if (n.includes('intro')) return 'intro';
  if (n.includes('verse')) return 'verse';
  if (n.includes('pre') || n.includes('pre-chorus') || n.includes('prechorus')) return 'prechorus';
  if (n.includes('chorus') || n.includes('refrain')) return 'chorus';
  if (n.includes('bridge')) return 'bridge';
  if (n.includes('tag') || n.includes('hook')) return 'tag';
  if (n.includes('outro') || n.includes('ending')) return 'outro';
  if (n.includes('turn') || n.includes('turnaround')) return 'turnaround';
  if (n.includes('instrumental') || n.includes('interlude')) return 'instrumental';
  if (n.includes('breakdown')) return 'breakdown';
  if (n.includes('vamp') || n.includes('loop')) return 'vamp';
  return 'verse';
};

const DEFAULT_BARS = { intro: 8, verse: 16, prechorus: 8, chorus: 16, bridge: 8, tag: 8, outro: 8, turnaround: 4, instrumental: 16, breakdown: 8, vamp: 8 };

export const handler = async (event) => {
  const { pco_user_id } = event.queryStringParameters || {};
  if (!pco_user_id) return jsonError(400, 'Missing pco_user_id');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const clientId = process.env.VITE_PCO_CLIENT_ID;
  const clientSecret = process.env.VITE_PCO_CLIENT_SECRET;

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: conn, error: fetchError } = await supabase
    .from('pco_connections')
    .select('*')
    .eq('pco_user_id', pco_user_id)
    .single();

  if (fetchError || !conn) return jsonError(404, 'No PCO connection found');

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

  const pcoGet = (path) => fetch(
    `https://api.planningcenteronline.com/services/v2${path}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  ).then(r => r.json());

  // Get service types — worship only
  const stData = await pcoGet('/service_types?per_page=50');
  const worshipTypes = (stData?.data || []).filter(st => {
    const name = st.attributes?.name?.toLowerCase() || '';
    return name.includes('sunday service') ||
           name.includes('worship collective') ||
           name.includes('sunday worship');
  });

  const plans = [];
  for (const st of worshipTypes.slice(0, 3)) {
    const plansData = await pcoGet(
      `/service_types/${st.id}/plans?filter=future&per_page=6&order=sort_date`
    );

    for (const plan of (plansData?.data || [])) {
      const attrs = plan.attributes;

      // Fetch plan items
      const itemsData = await pcoGet(
        `/service_types/${st.id}/plans/${plan.id}/items?per_page=50`
      );
      const allItems = itemsData?.data || [];

      // Build song list with arrangement sections
      const songItems = [];
      for (const item of allItems) {
        if (item.attributes?.item_type !== 'song') continue;

        const title = item.attributes?.title || 'Untitled';
        const keyName = item.attributes?.key_name || '';
        const bpm = null; // Will fetch from arrangement if linked
        const arrangementName = item.attributes?.arrangement_name || '';

        // Try to fetch arrangement sections if song is linked
        let sections = [];
        const songId = item.relationships?.song?.data?.id;
        const arrangementId = item.relationships?.arrangement?.data?.id;

        if (songId && arrangementId) {
          try {
            const sectionsData = await pcoGet(
              `/songs/${songId}/arrangements/${arrangementId}/sections?per_page=50`
            );
            sections = (sectionsData?.data || []).map((sec, i) => {
              const label = sec.attributes?.label || sec.attributes?.name || `Section ${i + 1}`;
              const type = mapSectionType(label);
              return { label, type, bars: DEFAULT_BARS[type] || 8 };
            });
          } catch (e) {
            // sections stays empty — Live Mode will use defaults
          }
        }

        songItems.push({
          title,
          key: keyName,
          bpm: item.attributes?.length ? Math.round(item.attributes.length) : 120,
          sequence: item.attributes?.sequence || 0,
          arrangementName,
          sections,
        });
      }

      songItems.sort((a, b) => a.sequence - b.sequence);

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

  plans.sort((a, b) => new Date(a.sortDate) - new Date(b.sortDate));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ org: conn.pco_org_name, name: conn.pco_user_name, plans }),
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
