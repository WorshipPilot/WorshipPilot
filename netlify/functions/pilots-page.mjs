// Netlify function: pilots-page.mjs
// Handles all Pilots Page community operations:
// GET  ?action=browse&search=&sort=&page=  — browse community songs
// GET  ?action=song&id=                    — get single song detail
// GET  ?action=profile&pco_user_id=        — get user profile
// POST action=publish                      — publish a song
// POST action=import                       — record an import
// POST action=flag                         — flag a song
// POST action=upsert_user                  — create/update user profile

import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export const handler = async (event) => {
  const supabase = getSupabase();
  const method = event.httpMethod;
  const params = event.queryStringParameters || {};

  try {
    // ── GET requests ──
    if (method === 'GET') {
      const action = params.action;

      // Browse community songs
      if (action === 'browse') {
        const search = params.search || '';
        const sort = params.sort || 'popular'; // popular | recent
        const page = parseInt(params.page || '0');
        const limit = 20;

        let query = supabase
          .from('wp_community_songs')
          .select(`
            id, song_title, artist, key, bpm, time_sig,
            style_tags, description, md_notes_preview,
            published_at, import_count, pco_user_id,
            wp_users!inner(display_name, church_name, city)
          `)
          .eq('is_visible', true)
          .range(page * limit, (page + 1) * limit - 1);

        if (search) {
          query = query.ilike('song_title', `%${search}%`);
        }

        if (sort === 'recent') {
          query = query.order('published_at', { ascending: false });
        } else {
          query = query.order('import_count', { ascending: false });
        }

        const { data, error } = await query;
        if (error) return jsonError(500, error.message);
        return json200({ songs: data || [] });
      }

      // Single song detail
      if (action === 'song') {
        const { data, error } = await supabase
          .from('wp_community_songs')
          .select(`
            *,
            wp_users!inner(display_name, church_name, city, bio)
          `)
          .eq('id', params.id)
          .eq('is_visible', true)
          .single();

        if (error) return jsonError(404, 'Song not found');
        return json200({ song: data });
      }

      // User profile + their songs
      if (action === 'profile') {
        const { data: user, error: userErr } = await supabase
          .from('wp_users')
          .select('*')
          .eq('pco_user_id', params.pco_user_id)
          .single();

        if (userErr) return jsonError(404, 'User not found');

        const { data: songs } = await supabase
          .from('wp_community_songs')
          .select('id, song_title, key, bpm, import_count, published_at')
          .eq('pco_user_id', params.pco_user_id)
          .eq('is_visible', true)
          .order('import_count', { ascending: false });

        return json200({ user, songs: songs || [] });
      }

      // Leaderboard
      if (action === 'leaderboard') {
        const { data } = await supabase
          .from('wp_users')
          .select('display_name, church_name, city, song_count, import_count')
          .order('import_count', { ascending: false })
          .limit(10);

        return json200({ leaderboard: data || [] });
      }
    }

    // ── POST requests ──
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const action = body.action;

      // Create/update user profile
      if (action === 'upsert_user') {
        const { pco_user_id, display_name, church_name, city } = body;
        if (!pco_user_id) return jsonError(400, 'Missing pco_user_id');

        const { data, error } = await supabase
          .from('wp_users')
          .upsert({
            pco_user_id,
            display_name: display_name || 'Worship MD',
            church_name: church_name || 'My Church',
            city: city || null,
          }, { onConflict: 'pco_user_id' })
          .select()
          .single();

        if (error) return jsonError(500, error.message);
        return json200({ user: data });
      }

      // Publish a song to the community
      if (action === 'publish') {
        const { pco_user_id, song } = body;
        if (!pco_user_id || !song) return jsonError(400, 'Missing required fields');

        // Get or create user
        const { data: user } = await supabase
          .from('wp_users')
          .select('id')
          .eq('pco_user_id', pco_user_id)
          .single();

        if (!user) return jsonError(401, 'User not found — connect PCO first');

        // Build MD notes preview from first section with a note
        const firstNote = song.sections?.find(s => s.note)?.note || '';
        const preview = firstNote.length > 120 ? firstNote.slice(0, 120) + '…' : firstNote;

        const { data, error } = await supabase
          .from('wp_community_songs')
          .insert({
            user_id: user.id,
            pco_user_id,
            song_title: song.title,
            artist: song.artist || '',
            key: song.key,
            bpm: song.bpm,
            time_sig: song.timeSig || '4/4',
            sections: song.sections,
            style_tags: song.styleTags || [],
            description: song.description || '',
            md_notes_preview: preview,
          })
          .select()
          .single();

        if (error) return jsonError(500, error.message);

        // Update user song count
        await supabase.rpc('increment_song_count', { uid: user.id }).catch(() => {});

        return json200({ published: data });
      }

      // Record an import
      if (action === 'import') {
        const { song_id, importer_pco_user_id } = body;
        if (!song_id || !importer_pco_user_id) return jsonError(400, 'Missing fields');

        // Upsert import record (won't double count)
        const { error: impErr } = await supabase
          .from('wp_imports')
          .upsert({ song_id, importer_pco_user_id }, { onConflict: 'song_id,importer_pco_user_id' });

        if (!impErr) {
          // Increment import count on song
          await supabase
            .from('wp_community_songs')
            .update({ import_count: supabase.raw('import_count + 1') })
            .eq('id', song_id);

          // Increment import count on song owner
          const { data: song } = await supabase
            .from('wp_community_songs')
            .select('user_id')
            .eq('id', song_id)
            .single();

          if (song?.user_id) {
            await supabase
              .from('wp_users')
              .update({ import_count: supabase.raw('import_count + 1') })
              .eq('id', song.user_id);
          }
        }

        return json200({ success: true });
      }

      // Flag a song
      if (action === 'flag') {
        const { song_id, reporter_pco_user_id, reason } = body;
        if (!song_id || !reporter_pco_user_id) return jsonError(400, 'Missing fields');

        await supabase.from('wp_flags').upsert(
          { song_id, reporter_pco_user_id, reason: reason || '' },
          { onConflict: 'song_id,reporter_pco_user_id' }
        );

        // Auto-hide if 5+ flags
        const { count } = await supabase
          .from('wp_flags')
          .select('id', { count: 'exact' })
          .eq('song_id', song_id);

        if (count >= 5) {
          await supabase
            .from('wp_community_songs')
            .update({ is_visible: false })
            .eq('id', song_id);
        }

        return json200({ success: true });
      }
    }

    return jsonError(404, 'Unknown action');

  } catch (err) {
    console.error('Pilots Page error:', err);
    return jsonError(500, err.message || 'Unexpected error');
  }
};

const json200 = (data) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(data),
});

const jsonError = (status, message) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify({ error: message }),
});
