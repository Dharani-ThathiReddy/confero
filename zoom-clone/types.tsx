import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Participant = {
  id: string;
  name: string;
  joinTime: number;
  leaveTime?: number;
};

export type MeetingRecord = {
  roomId: string;
  topic: string;
  hostName: string;
  startTime: number;
  endTime?: number;
  participants: Participant[];
  notes: string;
};

export type RootStackParamList = {
  Home: undefined;
  MeetingRoom: undefined;
  JoinMeeting: undefined;
  VideoCall: {
    roomId: string;
    userName: string;
    topic: string;
    isHost: boolean;
  };
  MeetingSummary: { meeting: MeetingRecord };
  Schedule: undefined;
  MeetingHistory: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
