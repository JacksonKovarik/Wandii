import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '@/src/lib/supabase';

const USERS_TABLE = 'Users';
const AVATAR_BUCKET = 'avatars';

function splitNameParts(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

export function getInitialsFromName(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export async function getUserProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('user_id, first_name, last_name, username, email, avatar_url')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadAvatarIfNeeded(userId, avatarUri) {
  if (!avatarUri) return null;
  if (/^https?:\/\//i.test(avatarUri)) return avatarUri;

  const fileExt = avatarUri?.split('.').pop()?.toLowerCase()?.split('?')[0] || 'jpg';
  const fileName = `${userId}/avatar.${fileExt}`;

  const base64 = await FileSystem.readAsStringAsync(avatarUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const contentType =
    fileExt === 'png'
      ? 'image/png'
      : fileExt === 'webp'
      ? 'image/webp'
      : 'image/jpeg';

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(fileName, decode(base64), {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(uploadData.path);

  if (!publicUrlData?.publicUrl) {
    return null;
  }

  return `${publicUrlData.publicUrl}?t=${Date.now()}`;
}

export async function saveUserProfile({
  userId,
  firstName,
  lastName,
  username,
  email,
  avatarUri,
  password,
}) {
  if (!userId) {
    throw new Error('Missing user id.');
  }

  const normalizedFirstName = String(firstName || '').trim();
  const normalizedLastName = String(lastName || '').trim();
  const normalizedUsername = String(username || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedFirstName || !normalizedLastName || !normalizedUsername || !normalizedEmail) {
    throw new Error('First name, last name, username, and email are required.');
  }

  let avatarUrl = null;
  if (avatarUri) {
    avatarUrl = await uploadAvatarIfNeeded(userId, avatarUri);
  }

  const authUpdate = {};
  const { data: authUserData } = await supabase.auth.getUser();
  const currentEmail = String(authUserData?.user?.email || '').trim().toLowerCase();

  if (normalizedEmail && normalizedEmail !== currentEmail) {
    authUpdate.email = normalizedEmail;
  }

  if (password) {
    authUpdate.password = password;
  }

  if (Object.keys(authUpdate).length) {
    const { error: authError } = await supabase.auth.updateUser(authUpdate);
    if (authError) {
      throw authError;
    }
  }

  const payload = {
    first_name: normalizedFirstName,
    last_name: normalizedLastName,
    username: normalizedUsername,
    email: normalizedEmail,
  };

  if (avatarUrl) {
    payload.avatar_url = avatarUrl;
  }

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update(payload)
    .eq('user_id', userId)
    .select('user_id, first_name, last_name, username, email, avatar_url')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    ...data,
    full_name: splitNameParts(data?.first_name, data?.last_name),
  };
}
