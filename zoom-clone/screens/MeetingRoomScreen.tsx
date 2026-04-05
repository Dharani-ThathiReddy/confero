import React, { useState } from 'react';
import {
  StyleSheet, View, TextInput, Text,
  TouchableOpacity, Switch, ScrollView, Alert,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../types';

// Simple alphanumeric room ID — NO dashes, NO special chars
// So encodeURIComponent leaves it exactly as-is and both devices get the same Jitsi room
function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars like 0/O, 1/I
  let id = 'confero';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id; // e.g. "conferoABCD1234"
}

export default function MeetingRoomScreen({ navigation }: RootStackScreenProps<'MeetingRoom'>) {
  const [userName, setUserName] = useState('');
  const [topic, setTopic] = useState('');
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  const startMeeting = () => {
    if (!userName.trim()) {
      Alert.alert('Name Required', 'Please enter your display name.');
      return;
    }
    const roomId = generateRoomId();
    navigation.navigate('VideoCall', {
      roomId,
      userName: userName.trim(),
      topic: topic.trim() || 'Confero Meeting',
      isHost: true,
    });
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.previewBox}>
        <View style={styles.avatarCircle}>
          <FontAwesome name="user" size={55} color="#3a3a5c" />
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: audioOn ? '#2ecc71' : '#e74c3c' }]} />
          <Text style={styles.statusText}>{audioOn ? 'Mic On' : 'Mic Off'}</Text>
          <View style={[styles.statusDot, { backgroundColor: videoOn ? '#2ecc71' : '#e74c3c', marginLeft: 12 }]} />
          <Text style={styles.statusText}>{videoOn ? 'Camera On' : 'Camera Off'}</Text>
        </View>
      </View>

      <View style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <View style={[styles.toggleIcon, { backgroundColor: audioOn ? '#4f6ef7' : '#333' }]}>
            <FontAwesome name={audioOn ? 'microphone' : 'microphone-slash'} size={18} color="#fff" />
          </View>
          <Text style={styles.toggleLabel}>Microphone</Text>
          <Switch value={audioOn} onValueChange={setAudioOn}
            trackColor={{ false: '#333', true: '#4f6ef7' }} thumbColor="#fff" />
        </View>
        <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: '#1a1a2e', paddingTop: 14 }]}>
          <View style={[styles.toggleIcon, { backgroundColor: videoOn ? '#4f6ef7' : '#333' }]}>
            <FontAwesome name={videoOn ? 'video-camera' : 'eye-slash'} size={18} color="#fff" />
          </View>
          <Text style={styles.toggleLabel}>Camera</Text>
          <Switch value={videoOn} onValueChange={setVideoOn}
            trackColor={{ false: '#333', true: '#4f6ef7' }} thumbColor="#fff" />
        </View>
      </View>

      <Text style={styles.label}>Your Name *</Text>
      <View style={styles.inputBox}>
        <MaterialIcons name="person" size={20} color="#555" style={{ marginRight: 10 }} />
        <TextInput style={styles.input} value={userName} onChangeText={setUserName}
          placeholder="Display name" placeholderTextColor="#444"
          autoCapitalize="words" returnKeyType="next" />
      </View>

      <Text style={styles.label}>Meeting Topic</Text>
      <View style={styles.inputBox}>
        <MaterialIcons name="topic" size={20} color="#555" style={{ marginRight: 10 }} />
        <TextInput style={styles.input} value={topic} onChangeText={setTopic}
          placeholder="e.g. Weekly Standup" placeholderTextColor="#444"
          autoCapitalize="sentences" returnKeyType="done" />
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={startMeeting} activeOpacity={0.85}>
        <FontAwesome name="video-camera" size={18} color="#fff" />
        <Text style={styles.startBtnText}>Start Meeting</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>A unique Room ID is generated — share it so others can join</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#0a0a0f', flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 40 },
  previewBox: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#13132a', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#1e1e3f', marginBottom: 12,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: '#666', fontSize: 12, marginLeft: 5 },
  toggleCard: {
    backgroundColor: '#13132a', borderRadius: 16, padding: 16,
    marginBottom: 24, borderWidth: 1, borderColor: '#1e1e3f',
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 14 },
  toggleIcon: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  toggleLabel: { color: '#ccc', fontSize: 15, flex: 1 },
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
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4f6ef7', borderRadius: 14,
    paddingVertical: 16, gap: 10, marginTop: 6, marginBottom: 16,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  hint: { color: '#333', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
