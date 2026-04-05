import { MeetingRecord, Participant } from '../types';

let meetings: MeetingRecord[] = [];
let activeMeeting: MeetingRecord | null = null;

function deepCopy(m: MeetingRecord): MeetingRecord {
  return {
    ...m,
    participants: m.participants.map(p => ({ ...p })),
  };
}

export const MeetingStore = {
  startMeeting(roomId: string, topic: string, hostName: string): MeetingRecord {
    activeMeeting = {
      roomId,
      topic,
      hostName,
      startTime: Date.now(),
      participants: [{
        id: `${hostName}-${Date.now()}`,
        name: hostName,
        joinTime: Date.now(),
      }],
      notes: '',
    };
    return deepCopy(activeMeeting);
  },

  joinMeeting(roomId: string, userName: string): MeetingRecord {
    if (activeMeeting && activeMeeting.roomId === roomId) {
      const exists = activeMeeting.participants.find(p => p.name === userName);
      if (!exists) {
        activeMeeting.participants.push({
          id: `${userName}-${Date.now()}`,
          name: userName,
          joinTime: Date.now(),
        });
      }
      return deepCopy(activeMeeting);
    }
    // Guest creating their own local record
    activeMeeting = {
      roomId,
      topic: `Meeting ${roomId}`,
      hostName: userName,
      startTime: Date.now(),
      participants: [{
        id: `${userName}-${Date.now()}`,
        name: userName,
        joinTime: Date.now(),
      }],
      notes: '',
    };
    return deepCopy(activeMeeting);
  },

  participantLeft(name: string) {
    if (!activeMeeting) return;
    const p = activeMeeting.participants.find(x => x.name === name);
    if (p && !p.leaveTime) p.leaveTime = Date.now();
  },

  endMeeting(notes: string = ''): MeetingRecord | null {
    if (!activeMeeting) return null;
    const now = Date.now();
    activeMeeting.endTime = now;
    activeMeeting.notes = notes;
    activeMeeting.participants.forEach(p => {
      if (!p.leaveTime) p.leaveTime = now;
    });
    const completed = deepCopy(activeMeeting); // deep copy BEFORE nulling
    meetings.unshift(completed);
    activeMeeting = null;
    return completed; // return the copy — always has endTime set
  },

  updateNotes(notes: string) {
    if (activeMeeting) activeMeeting.notes = notes;
  },

  getActive(): MeetingRecord | null {
    return activeMeeting;
  },

  getAll(): MeetingRecord[] {
    return meetings;
  },

  formatDuration(ms: number): string {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  },

  formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString([], {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  },
};
