import SettingsHeader from '@/src/components/settingsHeader';
import { useAuth } from '@/src/context/AuthContext';
import { getInitialsFromName, getUserProfile, saveUserProfile } from '@/src/lib/profile';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fullName = useMemo(
    () => [firstName, lastName].filter(Boolean).join(' ').trim(),
    [firstName, lastName]
  );
  const initials = getInitialsFromName(fullName || username || email || 'Traveler');

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profile = await getUserProfile(user.id);
        if (!mounted) return;

        setFirstName(profile?.first_name || '');
        setLastName(profile?.last_name || '');
        setUsername(profile?.username || '');
        setEmail(profile?.email || user.email || '');
        setPhoto(profile?.avatar_url || null);
      } catch (error) {
        if (!mounted) return;
        Alert.alert('Could not load profile', error?.message || 'Unknown error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [user?.email, user?.id]);

  async function pickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please allow photo access to update your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.length) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Could not choose image', error?.message || 'Unknown error');
    }
  }

  async function handleSave() {
    if (!user?.id) {
      Alert.alert('Not signed in', 'Please sign in again.');
      return;
    }

    const emailValid = /\S+@\S+\.\S+/.test(String(email || '').trim());

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim()) {
      Alert.alert('Missing information', 'Please fill out first name, last name, username, and email.');
      return;
    }

    if (!emailValid) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Alert.alert('Password too short', 'New passwords must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure the new password fields match.');
      return;
    }

    try {
      setSaving(true);
      await saveUserProfile({
        userId: user.id,
        firstName,
        lastName,
        username,
        email,
        avatarUri: photo,
        password: newPassword || undefined,
      });

      Alert.alert(
        'Profile updated',
        newPassword
          ? 'Your profile was saved. If you changed your email, Supabase may send a confirmation email.'
          : 'Your profile changes have been saved.'
      );

      router.back();
    } catch (error) {
      Alert.alert('Could not save profile', error?.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <SettingsHeader
        title="Edit Profile"
        photo={photo}
        initials={initials}
        onPickImage={pickImage}
      />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#FF8820" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <View style={styles.form}>
                <View style={styles.row}>
                  <View style={[styles.fieldGroup, styles.halfField]}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Enter your first name"
                    />
                  </View>

                  <View style={[styles.fieldGroup, styles.halfField]}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Enter your last name"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter a username"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Leave blank to keep current password"
                    secureTextEntry
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter new password"
                    secureTextEntry
                  />
                </View>

                {newPassword !== '' && confirmPassword !== '' && newPassword !== confirmPassword ? (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#D9534F',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 35,
    backgroundColor: '#FF8820',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
