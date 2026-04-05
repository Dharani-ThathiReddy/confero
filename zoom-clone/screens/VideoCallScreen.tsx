import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  SafeAreaView, Alert, Share, AppState, AppStateStatus,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { FontAwesome, MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { RootStackScreenProps } from '../types';
import { MeetingStore } from '../store/meetingStore';

type Tab = 'lobby' | 'notes' | 'participants';

// Build a Jitsi URL that works as a guest in any browser on any device:
// - prejoinPageEnabled=false  → skip the pre-join name form
// - disableDeepLinking=true   → never show "open in app" prompt
// - No JWT / no account needed for meet.jit.si
function buildJitsiUrl(roomId: string, userName: string): string {
  const encoded = encodeURIComponent(userName);
  return (
    `https://meet.jit.si/${roomId}` +
    `#userInfo.displayName="${encoded}"` +
    `&config.prejoinPageEnabled=false` +
    `&config.disableDeepLinking=true` +
    `&config.requireDisplayName=false` +
    `&config.startWithAudioMuted=false` +
    `&config.startWithVideoMuted=false` +
    `&config.enableWelcomePage=false` +
    `&interfaceConfig.MOBILE_APP_PROMO=false` +
    `&interfaceConfig.SHOW_JITSI_WATERMARK=false`
  );
}

export default function VideoCallScreen({
  route,
  navigation,
}: RootStackScreenProps<'VideoCall'>) {
  const { roomId, userName, topic, isHost } = route.params;

  const [activeTab, setActiveTab] = useState<Tab>('lobby');
  const [notes, setNotes] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [callLaunched, setCallLaunched] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const callStartedRef = useRef(false);

  const jitsiUrl = buildJitsiUrl(roomId, userName);

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  useEffect(() => {
    // Register this device in the meeting store
    if (isHost) {
      MeetingStore.startMeeting(roomId, topic, userName);
    } else {
      MeetingStore.joinMeeting(roomId, userName);
    }

    // Start elapsed timer
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);

    // AppState listener: detect when user comes back from browser (call ended)
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      // Came back to foreground after being in background (browser call)
      if (
        callStartedRef.current &&
        prev === 'background' &&
        next === 'active'
      ) {
        // User returned from the browser — offer to end meeting
        Alert.alert(
          'Back from Call',
          'Did you finish your meeting?',
          [
            { text: 'Still in call', style: 'cancel' },
            {
              text: 'End & See Summary',
              onPress: () => doEndMeeting(),
            },
          ]
        );
      }
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      sub.remove();
    };
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const launchCall = async () => {
    try {
      await Linking.openURL(jitsiUrl);
      callStartedRef.current = true;
      setCallLaunched(true);
    } catch {
      Alert.alert('Error', 'Could not open the browser. Please check your internet connection.');
    }
  };

  const copyRoomId = async () => {
    await Clipboard.setStringAsync(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMeeting = async () => {
    await Share.share({
      message:
        `Join my Confero meeting!\n\nTopic: ${topic}\nRoom ID: ${roomId}\n\n` +
        `Open Confero → Join → enter the Room ID above.\n\nOr join directly: ${jitsiUrl}`,
    });
  };

  const doEndMeeting = useCallback(() => {
    MeetingStore.updateNotes(notes);
    const completed = MeetingStore.endMeeting(notes);
    if (timerRef.current) clearInterval(timerRef.current);
    if (completed) {
      navigation.replace('MeetingSummary', { meeting: { ...completed } });
    } else {
      navigation.goBack();
    }
  }, [notes, navigation]);

  const endCall = () => {
    Alert.alert(
      'End Meeting',
      'This will end your meeting session and show the summary.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Meeting', style: 'destructive', onPress: doEndMeeting },
      ]
    );
  };

  const participants = MeetingStore.getActive()?.participants ?? [];
  const COLORS = ['#4f6ef7', '#2ecc71', '#e67e22', '#9b59b6', '#e74c3c', '#1abc9c'];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* ── Top bar ── */}
      <SafeAreaView style={styles.topSafe}>
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <View style={[styles.recDot, { backgroundColor: callLaunched ? '#e74c3c' : '#555' }]} />
            <Text style={styles.timerText}>{formatElapsed(elapsed)}</Text>
          </View>
          <View style={styles.topCenter}>
            <Text style={styles.topTopic} numberOfLines={1}>{topic}</Text>
            <Text style={styles.topSub}>
              {callLaunched ? 'Call active in browser' : 'Ready to start'}
            </Text>
          </View>
          <TouchableOpacity onPress={shareMeeting} style={styles.shareBtn}>
            <MaterialIcons name="share" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Room ID bar */}
        <TouchableOpacity style={styles.roomBar} onPress={copyRoomId} activeOpacity={0.75}>
          <FontAwesome name="key" size={11} color="#4f6ef7" />
          <Text style={styles.roomBarLabel}>Room ID: </Text>
          <Text style={styles.roomBarValue} numberOfLines={1}>{roomId}</Text>
          <FontAwesome
            name={copied ? 'check' : 'copy'}
            size={11}
            color={copied ? '#2ecc71' : '#4f6ef7'}
          />
          <Text style={{ color: copied ? '#2ecc71' : '#4f6ef7', fontSize: 11, marginLeft: 4 }}>
            {copied ? 'Copied!' : 'Tap to copy'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {(['lobby', 'participants', 'notes'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'lobby'
                ? '📹 Call'
                : tab === 'participants'
                ? `👥 People (${participants.length})`
                : '📝 Notes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Lobby Tab ── */}
      {activeTab === 'lobby' && (
        <ScrollView
          style={styles.lobbyScroll}
          contentContainerStyle={styles.lobbyContent}>
          {/* Big launch button */}
          <View style={styles.callCard}>
            <View style={styles.callCardIcon}>
              <FontAwesome name="video-camera" size={38} color="#4f6ef7" />
            </View>
            <Text style={styles.callCardTitle}>
              {callLaunched ? 'Call in Progress' : 'Start Your Video Call'}
            </Text>
            <Text style={styles.callCardSub}>
              {callLaunched
                ? 'Your call is running in the browser. Return here to take notes or end the meeting.'
                : 'Opens in your browser (Chrome / Safari) for full camera & microphone access on all devices.'}
            </Text>

            <TouchableOpacity
              style={[styles.launchBtn, callLaunched && styles.launchBtnAlt]}
              onPress={launchCall}
              activeOpacity={0.85}>
              <FontAwesome
                name={callLaunched ? 'external-link' : 'video-camera'}
                size={18}
                color="#fff"
              />
              <Text style={styles.launchBtnText}>
                {callLaunched ? 'Rejoin Call in Browser' : 'Open Call in Browser'}
              </Text>
            </TouchableOpacity>

            {callLaunched && (
              <View style={styles.liveRow}>
                <View style={styles.livePulse} />
                <Text style={styles.liveText}>
                  Call is live — switch to your browser to see video
                </Text>
              </View>
            )}
          </View>

          {/* How it works */}
          {!callLaunched && (
            <View style={styles.howCard}>
              <Text style={styles.howTitle}>How it works</Text>
              {[
                { icon: 'video-camera', text: 'Tap "Open Call in Browser" above' },
                { icon: 'chrome' as any, text: 'Chrome or Safari opens with your camera & mic ready' },
                { icon: 'users' as any, text: 'Share the Room ID so others can join' },
                { icon: 'arrow-left', text: 'Come back here to take notes or end the meeting' },
              ].map(({ icon, text }, i) => (
                <View key={i} style={styles.howRow}>
                  <View style={styles.howNum}>
                    <Text style={styles.howNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.howText}>{text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Share section */}
          <View style={styles.shareCard}>
            <Text style={styles.shareCardTitle}>Invite Others</Text>
            <Text style={styles.shareCardSub}>
              Share the Room ID — others open Confero → Join → paste it
            </Text>
            <View style={styles.roomIdDisplay}>
              <Text style={styles.roomIdDisplayText}>{roomId}</Text>
            </View>
            <TouchableOpacity style={styles.shareCardBtn} onPress={shareMeeting}>
              <MaterialIcons name="share" size={16} color="#fff" />
              <Text style={styles.shareCardBtnText}>Share Invite</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ── Participants Tab ── */}
      {activeTab === 'participants' && (
        <ScrollView style={styles.panel}>
          <Text style={styles.panelTitle}>In This Meeting</Text>
          {participants.length === 0 && (
            <Text style={styles.emptyText}>No participants tracked yet.</Text>
          )}
          {participants.map((p, i) => (
            <View key={i} style={styles.pRow}>
              <View style={[styles.pAvatar, { backgroundColor: COLORS[i % COLORS.length] }]}>
                <Text style={styles.pInitial}>{p.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.pInfo}>
                <Text style={styles.pName}>
                  {p.name}
                  {p.name === userName ? ' (You)' : ''}
                  {isHost && i === 0 ? ' 👑' : ''}
                </Text>
                <Text style={styles.pTime}>Joined {MeetingStore.formatTime(p.joinTime)}</Text>
              </View>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTagText}>Live</Text>
              </View>
            </View>
          ))}
          <View style={styles.tipCard}>
            <FontAwesome name="info-circle" size={13} color="#4f6ef7" />
            <Text style={styles.tipText}>
              Tap the Room ID bar at the top to copy it and share with others.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ── Notes Tab ── */}
      {activeTab === 'notes' && (
        <KeyboardAvoidingView
          style={styles.panel}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Text style={styles.panelTitle}>Meeting Notes</Text>
          <Text style={styles.panelSub}>
            These notes are saved in your meeting summary when you end the call.
          </Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={t => {
              setNotes(t);
              MeetingStore.updateNotes(t);
            }}
            placeholder={'Start typing…\n\n• Key decisions\n• Action items\n• Follow-ups'}
            placeholderTextColor="#2a2a4a"
            multiline
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
      )}

      {/* ── Bottom controls ── */}
      <SafeAreaView style={styles.bottomSafe}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={launchCall}>
            <FontAwesome name="video-camera" size={20} color="#4f6ef7" />
            <Text style={[styles.ctrlLabel, { color: '#4f6ef7' }]}>
              {callLaunched ? 'Rejoin' : 'Join Call'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endBtn} onPress={endCall}>
            <MaterialIcons name="call-end" size={26} color="#fff" />
            <Text style={styles.ctrlLabel}>End</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctrlBtn} onPress={shareMeeting}>
            <MaterialIcons name="share" size={20} color="#4f6ef7" />
            <Text style={[styles.ctrlLabel, { color: '#4f6ef7' }]}>Invite</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },

  // Top
  topSafe: { backgroundColor: '#0a0a0f', borderBottomWidth: 1, borderBottomColor: '#1a1a2e' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', width: 75 },
  recDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  timerText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  topCenter: { flex: 1, alignItems: 'center' },
  topTopic: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  topSub: { color: '#555', fontSize: 11, marginTop: 1 },
  shareBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center',
  },
  roomBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d0d1f', paddingHorizontal: 14, paddingVertical: 9,
    borderTopWidth: 1, borderTopColor: '#1a1a2e', gap: 5,
  },
  roomBarLabel: { color: '#555', fontSize: 12 },
  roomBarValue: { color: '#fff', fontSize: 13, fontWeight: 'bold', flex: 1, letterSpacing: 0.5 },

  // Tabs
  tabBar: {
    flexDirection: 'row', backgroundColor: '#0d0d1a',
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4f6ef7' },
  tabText: { color: '#444', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#4f6ef7' },

  // Lobby
  lobbyScroll: { flex: 1 },
  lobbyContent: { padding: 18, gap: 16, paddingBottom: 32 },
  callCard: {
    backgroundColor: '#13132a', borderRadius: 18,
    padding: 22, alignItems: 'center',
    borderWidth: 1, borderColor: '#1e1e3f',
  },
  callCardIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1a1a3a', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: '#4f6ef722',
  },
  callCardTitle: {
    color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center',
  },
  callCardSub: {
    color: '#555', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },
  launchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4f6ef7', borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 28, gap: 10, width: '100%',
  },
  launchBtnAlt: { backgroundColor: '#1e3a5f' },
  launchBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  liveRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16,
  },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e74c3c' },
  liveText: { color: '#e74c3c', fontSize: 12 },

  howCard: {
    backgroundColor: '#13132a', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#1e1e3f',
  },
  howTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 14 },
  howRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  howNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#4f6ef7', justifyContent: 'center', alignItems: 'center',
  },
  howNumText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  howText: { color: '#888', fontSize: 13, flex: 1, lineHeight: 18 },

  shareCard: {
    backgroundColor: '#13132a', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#1e1e3f', alignItems: 'center',
  },
  shareCardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  shareCardSub: { color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 14, lineHeight: 18 },
  roomIdDisplay: {
    backgroundColor: '#0a0a0f', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#4f6ef744', marginBottom: 14, width: '100%', alignItems: 'center',
  },
  roomIdDisplayText: { color: '#4f6ef7', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  shareCardBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#4f6ef7', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24,
  },
  shareCardBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  // Panels
  panel: { flex: 1, padding: 18 },
  panelTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  panelSub: { color: '#444', fontSize: 12, marginBottom: 16, lineHeight: 18 },
  emptyText: { color: '#333', fontSize: 14, marginBottom: 16 },
  pRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132a', borderRadius: 12, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: '#1e1e3f',
  },
  pAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  pInitial: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pInfo: { flex: 1 },
  pName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  pTime: { color: '#555', fontSize: 11, marginTop: 2 },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2ecc71' },
  liveTagText: { color: '#2ecc71', fontSize: 11 },
  tipCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#13132a', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#1e1e3f', marginTop: 8,
  },
  tipText: { color: '#555', fontSize: 12, flex: 1, lineHeight: 18 },
  notesInput: {
    flex: 1, color: '#fff', fontSize: 14, lineHeight: 22,
    backgroundColor: '#13132a', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#1e1e3f', minHeight: 300,
  },

  // Bottom controls
  bottomSafe: { backgroundColor: '#0a0a0f', borderTopWidth: 1, borderTopColor: '#1a1a2e' },
  controls: {
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 24,
  },
  ctrlBtn: {
    alignItems: 'center', padding: 10,
    borderRadius: 12, minWidth: 70, backgroundColor: '#1a1a2e',
  },
  endBtn: {
    alignItems: 'center', justifyContent: 'center',
    width: 58, height: 58, borderRadius: 29, backgroundColor: '#e74c3c',
  },
  ctrlLabel: { color: '#888', fontSize: 10, marginTop: 4, textAlign: 'center' },
});
