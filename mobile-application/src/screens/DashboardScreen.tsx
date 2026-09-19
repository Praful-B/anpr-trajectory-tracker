import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { hotlistApi } from '../services/api';
import { clearAuth } from '../services/auth';
import { formatPlate } from '../utils/plateUtils';

interface HotlistEntry {
  id: string;
  plateNumber: string;
  status: string;
  addedAt: string;
  firDeadline: string;
  firReferenceNo: string;
  lastSeenLat: string;
  lastSeenLng: string;
  lastSeenAt: string;
  cooldownUntil: string;
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const [hotlist, setHotlist] = useState<HotlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const loadHotlist = useCallback(async () => {
    try {
      const data = await hotlistApi.getAll();
      setHotlist(data);
    } catch (error) {
      console.error('Failed to load hotlist:', error);
      Alert.alert('Error', 'Failed to load hotlist data');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadHotlist();
  }, [loadHotlist]);

  const filteredHotlist = hotlist.filter(entry => {
    const matchesSearch = searchQuery === '' ||
      entry.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || entry.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE_UNCONFIRMED':
        return '#f59e0b';
      case 'ACTIVE_CONFIRMED':
        return '#10b981';
      case 'EXPIRED':
        return '#6b7280';
      case 'RECOVERED':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'ACTIVE_UNCONFIRMED':
        return 'Pending FIR';
      case 'ACTIVE_CONFIRMED':
        return 'FIR Verified';
      case 'EXPIRED':
        return 'Expired';
      case 'RECOVERED':
        return 'Recovered';
      default:
        return status;
    }
  };

  const isUrgent = (entry: HotlistEntry): boolean => {
    if (entry.status !== 'ACTIVE_UNCONFIRMED' || !entry.firDeadline) return false;
    const deadline = new Date(entry.firDeadline);
    const now = new Date();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursLeft < 6;
  };

  const renderItem = ({ item }: { item: HotlistEntry }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.plateNumber, { color: theme.colors.text }]}>
            {formatPlate(item.plateNumber)}
          </Text>
          <Text style={[styles.ownerInfo, { color: theme.colors.text, opacity: 0.7 }]}>
            Added: {formatDate(item.addedAt)}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      {item.firReferenceNo && (
        <View style={[styles.firRow, { borderColor: theme.colors.border }]}>
          <Text style={[styles.firLabel, { color: theme.colors.text }]}>FIR:</Text>
          <Text style={[styles.firValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
            {item.firReferenceNo}
          </Text>
        </View>
      )}

      {isUrgent(item) && (
        <View style={[styles.urgentBanner, { backgroundColor: '#ef4444' }]}>
          <Text style={styles.urgentText}>⚠ FIR DEADLINE APPROACHING</Text>
        </View>
      )}

      {item.lastSeenLat && (
        <View style={[styles.locationRow, { borderColor: theme.colors.border }]}>
          <Text style={[styles.locationIcon, { color: theme.colors.primary }]}>📍</Text>
          <Text style={[styles.locationText, { color: theme.colors.text }]}>
            {item.lastSeenLat}, {item.lastSeenLng}
          </Text>
          {item.lastSeenAt && (
            <Text style={[styles.timestampText, { color: theme.colors.text, opacity: 0.6 }]}>
              Last seen: {formatDate(item.lastSeenAt)}
            </Text>
          )}
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => Alert.alert('View Details', `Plate: ${formatPlate(item.plateNumber)}\nStatus: ${item.status}`)}
        >
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 16 }}>Loading hotlist...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>RAKSHAK Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {hotlist.length} vehicles on hotlist
        </Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
          placeholder="Search by plate number..."
          placeholderTextColor={theme.colors.primary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#ef4444' }]}
          onPress={async () => {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                  await clearAuth();
                },
              },
            ]);
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.filterContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Filter: </Text>
        <View style={styles.filterChips}>
          {['ALL', 'ACTIVE_UNCONFIRMED', 'ACTIVE_CONFIRMED', 'EXPIRED', 'RECOVERED'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterChipText,
                { color: filterStatus === status ? '#fff' : theme.colors.text }
              ]}>
                {status === 'ALL' ? 'All' : getStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        style={styles.list}
        data={filteredHotlist}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.emptyText, { color: theme.colors.text, opacity: 0.6 }]}>
              No vehicles match your search
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  ownerInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  firRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  firLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  firValue: {
    fontSize: 14,
  },
  urgentBanner: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  urgentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  timestampText: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
