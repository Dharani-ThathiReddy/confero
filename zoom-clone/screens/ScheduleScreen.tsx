import React, { useState } from 'react';
import {
  StyleSheet, View, TextInput, Text,
  TouchableOpacity, ScrollView, Alert, Share,
} from 'react-native';
import { FontAwesome, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { RootStackScreenProps } from '../types';

function generateRoomId(): string {
  const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${seg()}-${seg()}-${seg()}`;
}

export default function ScheduleScreen({ navigation }: RootStackScreenProps<'Schedule'>) {
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [host, setHost] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [meetingId] = useState(generateRoomId());

  const schedule = () => {
    if (!topic.trim() || !date.trim() || !time.trim() || !host.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setScheduled(true);
  };

  const share = async () => {
    await Share.share({
      message: `You're invited to a Confero meeting!\n\nTopic: ${topic}\nHost: ${host}\nDate: ${date} at ${time}\nRoom ID: ${meetingId}\nLink: https://meet.jit.si/${meetingId}`,
    });
  };

  if (scheduled) {
    return (
      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.successContent}>
          <AntDesign name="checkcircle" size={64} color="#2ecc71" />
          <Text style={styles.successTitle}>Meeting Scheduled!</Text>
          <Text style={styles.successTopic}>{topic}</Text>
          <View style={styles.detailCard}>
            {[
              { icon: 'user', label: 'Host', value: host },
              { icon: 'calendar', label: 'Date', value: date },
              { icon: 'clock-o', label: 'Time', value: time },
              { icon: 'key', label: 'Room ID', value: meetingId },
            ].map(({ icon, label, value }) => (
              <View key={label} style={styles.detailRow}>
                <FontAwesome name={icon as any} size={14} color="#4f6ef7" />
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={share}>
            <MaterialIcons name="share" size={18} color="#fff" />
            <Text style={styles.shareBtnText}>Share Invite</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startNowBtn}
            onPress={() => navigation.navigate('VideoCall', { roomId: meetingId, userName: host, topic, isHost: true })}>
            <FontAwesome name="video-camera" size={16} color="#fff" />
            <Text style={styles.startNowText}>Start Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.backBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <FontAwesome name="calendar-plus-o" size={40} color="#4f6ef7" />
        </View>
        <Text style={styles.sub}>Plan a meeting for later</Text>
      </View>

      {[
        { label: 'Host Name *', value: host, set: setHost, placeholder: 'Your name', icon: 'person', caps: 'words' as const },
        { label: 'Meeting Topic *', value: topic, set: setTopic, placeholder: 'e.g. Sprint Planning', icon: 'topic', caps: 'sentences' as const },
        { label: 'Date *', value: date, set: setDate, placeholder: 'e.g. 26 March 2026', icon: 'calendar-today', caps: 'words' as const },
        { label: 'Time *', value: time, set: setTime, placeholder: 'e.g. 3:00 PM IST', icon: 'access-time', caps: 'words' as const },
      ].map(({ label, value, set, placeholder, icon, caps }) => (
        <React.Fragment key={label}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name={icon as any} size={20} color="#555" style={{ marginRight: 10 }} />
            <TextInput style={styles.input} value={value} onChangeText={set}
              placeholder={placeholder} placeholderTextColor="#444"
              autoCapitalize={caps} />
          </View>
        </React.Fragment>
      ))}

      <View style={styles.generatedBox}>
        <Text style={styles.generatedLabel}>Auto-generated Room ID</Text>
        <Text style={styles.generatedId}>{meetingId}</Text>
      </View>

      <TouchableOpacity style={styles.scheduleBtn} onPress={schedule} activeOpacity={0.85}>
        <FontAwesome name="calendar-check-o" size={18} color="#fff" />
        <Text style={styles.scheduleBtnText}>Schedule Meeting</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#0a0a0f', flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 40 },
  successContent: { paddingHorizontal: 22, paddingTop: 50, paddingBottom: 40, alignItems: 'center' },
  iconWrap: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#13132a', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#1e1e3f', marginBottom: 12,
  },
  sub: { color: '#555', fontSize: 14 },
  label: {
    color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 8, marginLeft: 2,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132a', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e1e3f',
    paddingHorizontal: 14, marginBottom: 18,
  },
  input: { flex: 1, height: 50, color: '#fff', fontSize: 15 },
  generatedBox: {
    backgroundColor: '#13132a', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: '#4f6ef744',
  },
  generatedLabel: { color: '#555', fontSize: 11, marginBottom: 6 },
  generatedId: { color: '#4f6ef7', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  scheduleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4f6ef7', borderRadius: 14,
    paddingVertical: 16, gap: 10,
  },
  scheduleBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  // Success
  successTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 18, marginBottom: 6 },
  successTopic: { color: '#555', fontSize: 15, marginBottom: 28 },
  detailCard: {
    backgroundColor: '#13132a', borderRadius: 16, padding: 16,
    width: '100%', marginBottom: 24, borderWidth: 1, borderColor: '#1e1e3f',
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a2e', gap: 10,
  },
  detailLabel: { color: '#555', fontSize: 13, width: 55 },
  detailValue: { color: '#ccc', fontSize: 13, flex: 1 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4f6ef7', borderRadius: 14, paddingVertical: 14,
    gap: 10, width: '100%', marginBottom: 12,
  },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  startNowBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2ecc71', borderRadius: 14, paddingVertical: 14,
    gap: 10, width: '100%', marginBottom: 12,
  },
  startNowText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backBtn: { paddingVertical: 12 },
  backBtnText: { color: '#444', fontSize: 14 },
});
