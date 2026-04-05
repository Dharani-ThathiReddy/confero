import React, { useState } from 'react';
import {
  StyleSheet, View, TextInput, Text,
  TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { RootStackScreenProps } from '../types';

// Normalize room ID exactly the same way as the host:
// strip all spaces, dashes, lowercase → uppercase, keep only alphanumeric
function normalizeRoomId(raw: string): string {
  return raw.trim().replace(/[\s\-_]/g, '').toUpperCase();
}

export default function JoinMeetingScreen({ navigation }: RootStackScreenProps<'JoinMeeting'>) {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');

  const joinMeeting = () => {
    if (!userName.trim()) {
      Alert.alert('Name Required', 'Enter your display name.');
      return;
    }
    const cleaned = normalizeRoomId(roomId);
    if (!cleaned) {
      Alert.alert('Room ID Required', 'Enter the Room ID shared by your host.');
      return;
    }
    // Navigate with the EXACT same normalized roomId so Jitsi opens the same room
    navigation.navigate('VideoCall', {
      roomId: cleaned,
      userName: userName.trim(),
      topic: `Meeting ${cleaned}`,
      isHost: false,
    });
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.content}>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <FontAwesome name="sign-in" size={46} color="#4f6ef7" />
        </View>
        <Text style={styles.title}>Join a Meeting</Text>
        <Text style={styles.sub}>Enter the Room ID shared by your host</Text>
      </View>

      <Text style={styles.label}>Your Name *</Text>
      <View style={styles.inputBox}>
        <MaterialIcons name="person" size={20} color="#555" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={setUserName}
          placeholder="Display name"
          placeholderTextColor="#444"
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      <Text style={styles.label}>Room ID *</Text>
      <View style={styles.inputBox}>
        <MaterialIcons name="meeting-room" size={20} color="#555" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          value={roomId}
          onChangeText={setRoomId}
          placeholder="e.g. CONFEROABCD1234"
          placeholderTextColor="#444"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={joinMeeting}
        />
      </View>

      <View style={styles.tipBox}>
        <FontAwesome name="info-circle" size={14} color="#4f6ef7" />
        <Text style={styles.tipText}>
          The Room ID is shown at the top of your host's call screen. Both devices must use the exact same ID.
        </Text>
      </View>

      <TouchableOpacity style={styles.joinBtn} onPress={joinMeeting} activeOpacity={0.85}>
        <FontAwesome name="video-camera" size={18} color="#fff" />
        <Text style={styles.joinBtnText}>Join Meeting</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#0a0a0f', flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 30, paddingBottom: 40 },
  iconWrap: { alignItems: 'center', marginBottom: 36 },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#13132a', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#1e1e3f', marginBottom: 16,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  sub: { color: '#555', fontSize: 13, textAlign: 'center' },
  label: {
    color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 8, marginLeft: 2,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132a', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e1e3f',
    paddingHorizontal: 14, marginBottom: 16,
  },
  input: { flex: 1, height: 50, color: '#fff', fontSize: 15 },
  tipBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#13132a', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#1e1e3f', marginBottom: 24,
  },
  tipText: { color: '#555', fontSize: 12, flex: 1, lineHeight: 18 },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4f6ef7', borderRadius: 14,
    paddingVertical: 16, gap: 10, marginTop: 4,
  },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
