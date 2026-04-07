// Netlify function: initiates PCO OAuth flow
// User hits /auth/pco/connect → redirected to PCO login page

export const handler = async (event) => {
  const clientId = process.env.VITE_PCO_CLIENT_ID;
  const redirectUri = process.env.URL
    ? `${process.env.URL}/auth/pco/callback`
    : 'http://localhost:8888/auth/pco/callback';

  if (!clientId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'PCO Client ID not configured' }),
    };
  }

  // Generate a random state value for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'services',
    state,
  });

  const authUrl = `https://api.planningcenteronline.com/oauth/authorize?${params}`;

  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
      'Set-Cookie': `pco_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
    body: '',
  };
};
