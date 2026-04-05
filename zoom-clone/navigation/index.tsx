import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import MeetingRoomScreen from '../screens/MeetingRoomScreen';
import JoinMeetingScreen from '../screens/JoinMeetingScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import MeetingSummaryScreen from '../screens/MeetingSummaryScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import MeetingHistoryScreen from '../screens/MeetingHistoryScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0a0f' },
          headerTintColor: '#ffffff',
          headerTitleAlign: 'center',
          headerTitleStyle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MeetingRoom" component={MeetingRoomScreen} options={{ title: 'New Meeting' }} />
        <Stack.Screen name="JoinMeeting" component={JoinMeetingScreen} options={{ title: 'Join Meeting' }} />
        <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MeetingSummary" component={MeetingSummaryScreen} options={{ title: 'Meeting Summary', headerBackVisible: false }} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Schedule Meeting' }} />
        <Stack.Screen name="MeetingHistory" component={MeetingHistoryScreen} options={{ title: 'Meeting History' }} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
