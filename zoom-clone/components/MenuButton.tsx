import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { menusItems } from '../constants/temData';

const COLORS = ['#4f6ef7', '#2ecc71', '#e67e22', '#9b59b6'];

type Props = { handleNavigate: (title: string) => void };

export default function MenuButton({ handleNavigate }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {menusItems.map(({ name, title }, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.btn, { backgroundColor: COLORS[i] + '22', borderColor: COLORS[i] + '44' }]}
            onPress={() => handleNavigate(title)}
            activeOpacity={0.8}>
            <View style={[styles.iconWrap, { backgroundColor: COLORS[i] }]}>
              <FontAwesome name={name as any} size={20} color="#fff" />
            </View>
            <Text style={[styles.text, { color: COLORS[i] }]}>{title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, marginTop: 24, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  btn: {
    width: '47%', borderRadius: 16, borderWidth: 1,
    paddingVertical: 16, alignItems: 'center',
  },
  iconWrap: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  text: { fontSize: 13, fontWeight: '700' },
});
