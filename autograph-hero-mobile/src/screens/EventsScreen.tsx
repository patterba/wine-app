import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, Searchbar, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { Event } from '../types/database';
import { MainTabScreenProps } from '../navigation/types';
import { categoryColors } from '../constants/theme';

export default function EventsScreen({ navigation }: MainTabScreenProps<'Events'>) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEventCard = ({ item }: { item: Event }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.is_free && (
            <Chip compact style={styles.freeChip} textStyle={styles.freeChipText}>
              FREE
            </Chip>
          )}
        </View>

        <View style={styles.eventDetails}>
          <Text variant="bodyMedium" style={styles.dateText}>
            {formatDate(item.event_date)}
            {item.start_time && ` at ${formatTime(item.start_time)}`}
          </Text>

          {item.venue_name && (
            <Text variant="bodySmall" style={styles.venueText} numberOfLines={1}>
              {item.venue_name}
            </Text>
          )}

          {(item.city || item.state) && (
            <Text variant="bodySmall" style={styles.locationText}>
              {[item.city, item.state].filter(Boolean).join(', ')}
            </Text>
          )}
        </View>

        {!item.is_free && (item.price_min || item.price_max) && (
          <Text variant="bodySmall" style={styles.priceText}>
            {item.price_min && item.price_max
              ? `$${item.price_min} - $${item.price_max}`
              : item.price_min
              ? `From $${item.price_min}`
              : `Up to $${item.price_max}`}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search events, cities..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No Upcoming Events
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {searchQuery
              ? 'No events match your search. Try different keywords.'
              : 'Check back soon for new signing events!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontWeight: '600',
    color: '#1E3A5F',
    marginRight: 8,
  },
  freeChip: {
    backgroundColor: '#2E7D32',
  },
  freeChipText: {
    color: '#fff',
    fontSize: 10,
  },
  eventDetails: {
    gap: 4,
  },
  dateText: {
    color: '#D4AF37',
    fontWeight: '500',
  },
  venueText: {
    color: '#333',
  },
  locationText: {
    color: '#666',
  },
  priceText: {
    marginTop: 8,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#1E3A5F',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});
