import React, { useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <AntDesign name="search1" size={18} color="#444" />
        <TextInput
          style={styles.input}
          onChangeText={setSearchTerm}
          value={searchTerm}
          placeholder="Search contacts or meetings"
          placeholderTextColor="#444"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginTop: 20, paddingHorizontal: 18 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132a', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e1e3f',
    paddingHorizontal: 14, height: 44, gap: 10,
  },
  input: { flex: 1, color: '#fff', fontSize: 14 },
});
