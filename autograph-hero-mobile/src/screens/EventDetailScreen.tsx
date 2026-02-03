import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, Button, Card, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { Event } from '../types/database';
import { RootStackScreenProps } from '../navigation/types';

export default function EventDetailScreen({ route, navigation }: RootStackScreenProps<'EventDetail'>) {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'Failed to load event details');
      navigation.goBack();
    } else {
      setEvent(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const openMaps = () => {
    if (!event) return;

    const address = [event.address, event.city, event.state].filter(Boolean).join(', ');
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const openTickets = () => {
    if (!event?.ticket_url) return;
    Linking.openURL(event.ticket_url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="titleMedium">Event not found</Text>
      </View>
    );
  }

  const fullAddress = [event.address, event.city, event.state].filter(Boolean).join(', ');
  const startTime = formatTime(event.start_time);
  const endTime = formatTime(event.end_time);
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : startTime || 'Time TBD';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.mainCard}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              {event.title}
            </Text>
            {event.is_free && (
              <Chip style={styles.freeChip} textStyle={styles.freeChipText}>
                FREE
              </Chip>
            )}
          </View>

          {event.verified && (
            <Chip
              icon="check-circle"
              style={styles.verifiedChip}
              textStyle={styles.verifiedChipText}
              compact
            >
              Verified
            </Chip>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Date & Time
          </Text>
          <Text variant="bodyLarge" style={styles.dateText}>
            {formatDate(event.event_date)}
          </Text>
          <Text variant="bodyMedium" style={styles.timeText}>
            {timeRange}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Location
          </Text>
          {event.venue_name && (
            <Text variant="bodyLarge" style={styles.venueName}>
              {event.venue_name}
            </Text>
          )}
          {fullAddress && (
            <Text variant="bodyMedium" style={styles.addressText}>
              {fullAddress}
            </Text>
          )}
          <Button
            mode="outlined"
            icon="map-marker"
            onPress={openMaps}
            style={styles.mapButton}
          >
            Open in Maps
          </Button>
        </Card.Content>
      </Card>

      {!event.is_free && (event.price_min || event.price_max) && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Pricing
            </Text>
            <Text variant="bodyLarge" style={styles.priceText}>
              {event.price_min && event.price_max
                ? `$${event.price_min} - $${event.price_max}`
                : event.price_min
                ? `Starting at $${event.price_min}`
                : `Up to $${event.price_max}`}
            </Text>
          </Card.Content>
        </Card>
      )}

      {event.description && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="bodyMedium" style={styles.descriptionText}>
              {event.description}
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.actions}>
        {event.ticket_url && (
          <Button
            mode="contained"
            icon="ticket"
            onPress={openTickets}
            style={styles.ticketButton}
          >
            Get Tickets
          </Button>
        )}
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.sourceText}>
          Source: {event.source}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  mainCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginRight: 12,
  },
  freeChip: {
    backgroundColor: '#2E7D32',
  },
  freeChipText: {
    color: '#fff',
  },
  verifiedChip: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  verifiedChipText: {
    color: '#1976D2',
    fontSize: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  dateText: {
    color: '#D4AF37',
    fontWeight: '500',
  },
  timeText: {
    color: '#666',
    marginTop: 4,
  },
  venueName: {
    color: '#333',
    fontWeight: '500',
  },
  addressText: {
    color: '#666',
    marginTop: 4,
  },
  mapButton: {
    marginTop: 12,
    borderColor: '#1E3A5F',
  },
  priceText: {
    color: '#333',
    fontWeight: '500',
  },
  descriptionText: {
    color: '#666',
    lineHeight: 22,
  },
  actions: {
    marginTop: 8,
    marginBottom: 16,
  },
  ticketButton: {
    paddingVertical: 4,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sourceText: {
    color: '#999',
  },
});
