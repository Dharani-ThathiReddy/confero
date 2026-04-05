import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, ScrollView, Text } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { RootStackScreenProps } from '../types';
import SearchBar from '../components/SearchBar';
import MenuButton from '../components/MenuButton';
import ContactsMenu from '../components/ContactsMenu';

export default function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerLeft: () => (
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <Text style={styles.brandName}>Confero</Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity activeOpacity={0.5} style={styles.headerBtn}>
            <Entypo name="notification" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.5} style={styles.headerBtn}>
            <Entypo name="new-message" size={22} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const handleNavigate = (title: string) => {
    if (title === 'New Meeting') navigation.navigate('MeetingRoom');
    else if (title === 'Join') navigation.navigate('JoinMeeting');
    else if (title === 'Schedule') navigation.navigate('Schedule');
    else if (title === 'History') navigation.navigate('MeetingHistory');
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SearchBar />
        <MenuButton handleNavigate={handleNavigate} />
        <ContactsMenu />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#0a0a0f', flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  logoBox: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#4f6ef7',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  logoLetter: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  brandName: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 6 },
});
