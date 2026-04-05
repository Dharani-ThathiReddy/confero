import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { contactsMenuButtons } from '../constants/temData';

export default function ContactsMenu() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Contacts</Text>
      {contactsMenuButtons.map(({ name, title, type, photoUrl, job }, index) =>
        type === 'Started' ? (
          <View style={styles.row} key={index}>
            <View style={styles.starIcon}>
              <AntDesign name="star" size={22} color="#4f6ef7" />
            </View>
            <Text style={styles.text}>{title}</Text>
          </View>
        ) : (
          <View style={styles.row} key={index}>
            <Image source={photoUrl} style={styles.image} />
            <View>
              <Text style={styles.text}>{name}</Text>
              <Text style={styles.job}>{job}</Text>
            </View>
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, paddingBottom: 30 },
  sectionTitle: {
    color: '#333', fontSize: 11, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  starIcon: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: '#13132a', justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: '#1e1e3f',
  },
  image: { width: 50, height: 50, borderRadius: 25 },
  text: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 14 },
  job: { color: '#555', fontSize: 12, marginLeft: 14, marginTop: 2 },
});
