import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Profile } from '../types/database';
import { MainTabScreenProps } from '../navigation/types';

export default function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [alertRadius, setAlertRadius] = useState('100');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
      setDisplayName(data.display_name || '');
      setAlertRadius(data.alert_radius_mi?.toString() || '100');
    }

    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName || null,
        alert_radius_mi: parseInt(alertRadius) || 100,
      })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
      console.error('Error saving profile:', error);
    } else {
      Alert.alert('Success', 'Profile saved successfully!');
    }

    setSaving(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Account
          </Text>
          <Text variant="bodyMedium" style={styles.emailText}>
            {user?.email}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Profile Settings
          </Text>

          <TextInput
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Alert Radius (miles)"
            value={alertRadius}
            onChangeText={setAlertRadius}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />
          <Text variant="bodySmall" style={styles.helperText}>
            Get notified when events are within this distance
          </Text>

          <Button
            mode="contained"
            onPress={saveProfile}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Notifications
          </Text>
          <Text variant="bodyMedium" style={styles.notificationText}>
            Push notifications help you never miss a signing event from your favorite teams and signers.
          </Text>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Coming Soon', 'Push notifications will be available in a future update.')}
            style={styles.notificationButton}
          >
            Configure Notifications
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            App Info
          </Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>Version</Text>
            <Text variant="bodyMedium" style={styles.infoValue}>1.0.0</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.infoLabel}>Build</Text>
            <Text variant="bodyMedium" style={styles.infoValue}>1</Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleSignOut}
        style={styles.signOutButton}
        textColor="#D32F2F"
      >
        Sign Out
      </Button>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          AutographHero - Never miss a signing
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 12,
  },
  emailText: {
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  helperText: {
    color: '#666',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  notificationText: {
    color: '#666',
    marginBottom: 16,
  },
  notificationButton: {
    borderColor: '#1E3A5F',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    color: '#333',
  },
  divider: {
    backgroundColor: '#f0f0f0',
  },
  signOutButton: {
    borderColor: '#D32F2F',
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: '#999',
  },
});
