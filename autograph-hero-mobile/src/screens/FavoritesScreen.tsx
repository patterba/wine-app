import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SectionList, RefreshControl } from 'react-native';
import { Text, Chip, Searchbar, ActivityIndicator, IconButton } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Team } from '../types/database';
import { MainTabScreenProps } from '../navigation/types';
import { categoryColors } from '../constants/theme';

interface TeamSection {
  title: string;
  data: Team[];
}

export default function FavoritesScreen({ navigation }: MainTabScreenProps<'Favorites'>) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [favoriteTeamIds, setFavoriteTeamIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    // Fetch all teams
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
    } else {
      setTeams(teamsData || []);
    }

    // Fetch user's favorites if logged in
    if (user) {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('user_favorite_teams')
        .select('team_id')
        .eq('user_id', user.id);

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
      } else {
        setFavoriteTeamIds(new Set(favoritesData?.map((f) => f.team_id) || []));
      }
    }

    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const toggleFavorite = async (teamId: string) => {
    if (!user) return;

    const isFavorite = favoriteTeamIds.has(teamId);

    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorite_teams')
        .delete()
        .eq('user_id', user.id)
        .eq('team_id', teamId);

      if (!error) {
        setFavoriteTeamIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(teamId);
          return newSet;
        });
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorite_teams')
        .insert({ user_id: user.id, team_id: teamId });

      if (!error) {
        setFavoriteTeamIds((prev) => new Set(prev).add(teamId));
      }
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group teams by category
  const sections: TeamSection[] = Object.entries(
    filteredTeams.reduce((acc, team) => {
      const category = team.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(team);
      return acc;
    }, {} as Record<string, Team[]>)
  )
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => {
      // Sports first, then entertainment
      const sportsOrder = ['NFL', 'MLB', 'NBA', 'NHL'];
      const aIndex = sportsOrder.indexOf(a.title);
      const bIndex = sportsOrder.indexOf(b.title);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.title.localeCompare(b.title);
    });

  const renderTeamItem = ({ item }: { item: Team }) => {
    const isFavorite = favoriteTeamIds.has(item.id);
    const categoryColor = categoryColors[item.category] || '#666';

    return (
      <View style={styles.teamItem}>
        <View style={styles.teamInfo}>
          <Text variant="bodyLarge" style={styles.teamName}>
            {item.name}
          </Text>
          {item.city && (
            <Text variant="bodySmall" style={styles.teamCity}>
              {item.city}
            </Text>
          )}
        </View>
        <IconButton
          icon={isFavorite ? 'star' : 'star-outline'}
          iconColor={isFavorite ? '#D4AF37' : '#999'}
          size={24}
          onPress={() => toggleFavorite(item.id)}
        />
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: TeamSection }) => {
    const categoryColor = categoryColors[section.title] || '#666';
    return (
      <View style={[styles.sectionHeader, { borderLeftColor: categoryColor }]}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {section.title}
        </Text>
        <Chip compact style={{ backgroundColor: categoryColor }}>
          <Text style={styles.chipText}>{section.data.length}</Text>
        </Chip>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search teams, categories..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.summaryContainer}>
        <Text variant="bodyMedium" style={styles.summaryText}>
          {favoriteTeamIds.size} favorite{favoriteTeamIds.size !== 1 ? 's' : ''} selected
        </Text>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderTeamItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
      />
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
  summaryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  summaryText: {
    color: '#666',
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1E3A5F',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: '#333',
  },
  teamCity: {
    color: '#666',
  },
});
