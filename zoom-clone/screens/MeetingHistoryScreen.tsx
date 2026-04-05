import React from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { RootStackScreenProps, MeetingRecord } from '../types';
import { MeetingStore } from '../store/meetingStore';

function MeetingCard({ meeting, onPress }: { meeting: MeetingRecord; onPress: () => void }) {
  const duration = meeting.endTime
    ? MeetingStore.formatDuration(meeting.endTime - meeting.startTime)
    : 'Ongoing';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        <View style={styles.cardIcon}>
          <FontAwesome name="video-camera" size={18} color="#4f6ef7" />
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTopic} numberOfLines={1}>{meeting.topic}</Text>
        <Text style={styles.cardMeta}>
          {MeetingStore.formatDate(meeting.startTime)} · {MeetingStore.formatTime(meeting.startTime)}
        </Text>
        <View style={styles.cardStats}>
          <Ionicons name="people" size={12} color="#555" />
          <Text style={styles.cardStat}>{meeting.participants.length} attendees</Text>
          <FontAwesome name="clock-o" size={11} color="#555" style={{ marginLeft: 10 }} />
          <Text style={styles.cardStat}>{duration}</Text>
        </View>
      </View>
      <FontAwesome name="chevron-right" size={14} color="#333" />
    </TouchableOpacity>
  );
}

export default function MeetingHistoryScreen({ navigation }: RootStackScreenProps<'MeetingHistory'>) {
  const meetings = MeetingStore.getAll();

  if (meetings.length === 0) {
    return (
      <View style={styles.empty}>
        <FontAwesome name="calendar-o" size={60} color="#1e1e3f" />
        <Text style={styles.emptyTitle}>No meetings yet</Text>
        <Text style={styles.emptyText}>Your past meetings will appear here after you end a call.</Text>
        <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('MeetingRoom')}>
          <Text style={styles.startBtnText}>Start a Meeting</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <Text style={styles.count}>{meetings.length} meeting{meetings.length !== 1 ? 's' : ''}</Text>
      {meetings.map((m, i) => (
        <MeetingCard
          key={i}
          meeting={m}
          onPress={() => navigation.navigate('MeetingSummary', { meeting: m })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#0a0a0f', flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  count: { color: '#444', fontSize: 12, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132a', borderRadius: 14,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1e1e3f',
  },
  cardLeft: { marginRight: 14 },
  cardIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1a1a3a', justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1 },
  cardTopic: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  cardMeta: { color: '#555', fontSize: 12, marginBottom: 6 },
  cardStats: { flexDirection: 'row', alignItems: 'center' },
  cardStat: { color: '#555', fontSize: 12, marginLeft: 4 },
  empty: { flex: 1, backgroundColor: '#0a0a0f', alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { color: '#333', fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  emptyText: { color: '#333', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  startBtn: { backgroundColor: '#4f6ef7', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
