// Netlify function: handles PCO OAuth callback
// PCO redirects here after user authorizes → we exchange code for token → store in Supabase

import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  const { code, state, error } = event.queryStringParameters || {};

  // Handle PCO authorization errors
  if (error) {
    return redirect(`/?pco_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return redirect('/?pco_error=no_code');
  }

  const clientId = process.env.VITE_PCO_CLIENT_ID;
  const clientSecret = process.env.VITE_PCO_CLIENT_SECRET;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  const redirectUri = process.env.URL
    ? `${process.env.URL}/auth/pco/callback`
    : 'http://localhost:8888/auth/pco/callback';

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.planningcenteronline.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Token exchange failed:', errText);
      return redirect('/?pco_error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // 2. Get user info from PCO token owner endpoint
    const meResponse = await fetch('https://api.planningcenteronline.com/oauth/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let pcoUserId, pcoOrgName, pcoUserName;

    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('PCO me response:', JSON.stringify(meData).slice(0, 500));
      pcoUserId = meData?.id || meData?.data?.id || String(meData?.attributes?.id);
      pcoOrgName = meData?.organization?.name || meData?.attributes?.organization_name || 'My Church';
      pcoUserName = meData?.name || meData?.attributes?.name || 
                    `${meData?.first_name || ''} ${meData?.last_name || ''}`.trim() || 'User';
    }

    // Fallback: try to get org info from services endpoint
    if (!pcoUserId) {
      try {
        // Try to get current user from services API
        const servicesMeRes = await fetch('https://api.planningcenteronline.com/services/v2/people?per_page=1&filter=self', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const servicesMeData = await servicesMeRes.json();
        const firstPerson = servicesMeData?.data?.[0];
        if (firstPerson?.id) {
          pcoUserId = firstPerson.id;
          pcoUserName = firstPerson.attributes?.full_name || firstPerson.attributes?.name || 'Worship MD';
        }
      } catch (e) {}
    }

    // Try to get org name from organization endpoint
    try {
      const orgRes = await fetch('https://api.planningcenteronline.com/services/v2', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const orgData = await orgRes.json();
      const orgName = orgData?.data?.attributes?.organization_name || orgData?.meta?.parent?.attributes?.name;
      if (orgName) pcoOrgName = orgName;
    } catch (e) {}

    // Final fallback: use token slice as stable ID
    if (!pcoUserId) {
      pcoUserId = access_token.slice(-32);
      pcoUserName = pcoUserName || 'Worship MD';
    }

    console.log('Using pcoUserId:', pcoUserId, 'org:', pcoOrgName);

    // 3. Store token in Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('pco_connections')
      .upsert({
        pco_user_id: pcoUserId,
        pco_org_name: pcoOrgName,
        pco_user_name: pcoUserName,
        access_token,
        refresh_token,
        expires_at: expiresAt,
        connected_at: new Date().toISOString(),
      }, { onConflict: 'pco_user_id' });

    if (dbError) {
      console.error('Supabase error:', dbError);
      return redirect('/?pco_error=db_error');
    }

    // 4. Redirect back to app with success + user info
    const params = new URLSearchParams({
      pco_success: '1',
      pco_user_id: pcoUserId,
      pco_org: pcoOrgName,
      pco_name: pcoUserName,
    });

    return redirect(`/?${params}`);

  } catch (err) {
    console.error('PCO callback error:', err);
    return redirect('/?pco_error=unexpected');
  }
};

const redirect = (url) => ({
  statusCode: 302,
  headers: { Location: url },
  body: '',
});
