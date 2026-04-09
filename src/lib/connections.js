import { supabase } from '@/src/lib/supabase';

const USERS_TABLE = 'Users';
const CONNECTIONS_TABLE = 'Connections';

function sortUserPair(userId, otherUserId) {
  return [String(userId), String(otherUserId)].sort((a, b) => a.localeCompare(b));
}

function normalizeUserRow(row) {
  if (!row) return null;

  return {
    id: row.user_id,
    user_id: row.user_id,
    first_name: row.first_name || '',
    last_name: row.last_name || '',
    username: row.username || '',
    email: row.email || '',
    avatar_url: row.avatar_url || null,
    full_name: [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || row.username || 'Traveler',
  };
}

export function getConnectionTableMissingMessage() {
  return 'The Connections table is missing. Run the SQL migration in supabase/migrations before using Connections.';
}

export async function getConnections(userId) {
  if (!userId) return { data: [], error: null, tableMissing: false };

  const { data: connectionRows, error } = await supabase
    .from(CONNECTIONS_TABLE)
    .select('connection_id, user_a_id, user_b_id, created_at')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) {
    const tableMissing = error.code === 'PGRST205' || /relation .*Connections.* does not exist/i.test(error.message || '');
    return { data: [], error, tableMissing };
  }

  const otherUserIds = [
    ...new Set(
      (connectionRows || [])
        .map((row) => (String(row.user_a_id) === String(userId) ? row.user_b_id : row.user_a_id))
        .filter(Boolean)
    ),
  ];

  if (!otherUserIds.length) {
    return { data: [], error: null, tableMissing: false };
  }

  const { data: users, error: usersError } = await supabase
    .from(USERS_TABLE)
    .select('user_id, first_name, last_name, username, email, avatar_url')
    .in('user_id', otherUserIds);

  if (usersError) {
    return { data: [], error: usersError, tableMissing: false };
  }

  const userMap = new Map((users || []).map((row) => [row.user_id, normalizeUserRow(row)]));

  return {
    data: otherUserIds.map((id) => userMap.get(id)).filter(Boolean),
    error: null,
    tableMissing: false,
  };
}

export async function searchUsers(query, currentUserId, excludeUserIds = []) {
  const trimmed = String(query || '').trim();
  if (!trimmed) return { data: [], error: null };

  const safeQuery = trimmed.replace(/[%(),]/g, ' ').trim();
  const orQuery = [
    `first_name.ilike.%${safeQuery}%`,
    `last_name.ilike.%${safeQuery}%`,
    `username.ilike.%${safeQuery}%`,
    `email.ilike.%${safeQuery}%`,
  ].join(',');

  let request = supabase
    .from(USERS_TABLE)
    .select('user_id, first_name, last_name, username, email, avatar_url')
    .or(orQuery)
    .limit(20);

  if (currentUserId) {
    request = request.neq('user_id', currentUserId);
  }

  const { data, error } = await request;

  if (error) {
    return { data: [], error };
  }

  const excluded = new Set((excludeUserIds || []).map(String));

  return {
    data: (data || [])
      .map(normalizeUserRow)
      .filter((row) => row && !excluded.has(String(row.user_id))),
    error: null,
  };
}

export async function addConnection(userId, otherUserId) {
  if (!userId || !otherUserId) {
    throw new Error('Both users are required to add a connection.');
  }

  if (String(userId) === String(otherUserId)) {
    throw new Error('You cannot connect with yourself.');
  }

  const [user_a_id, user_b_id] = sortUserPair(userId, otherUserId);

  const { data, error } = await supabase
    .from(CONNECTIONS_TABLE)
    .upsert(
      [
        {
          user_a_id,
          user_b_id,
        },
      ],
      {
        onConflict: 'user_a_id,user_b_id',
        ignoreDuplicates: true,
      }
    )
    .select('connection_id, user_a_id, user_b_id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeConnection(userId, otherUserId) {
  const [user_a_id, user_b_id] = sortUserPair(userId, otherUserId);

  const { error } = await supabase
    .from(CONNECTIONS_TABLE)
    .delete()
    .match({ user_a_id, user_b_id });

  if (error) {
    throw error;
  }

  return true;
}
