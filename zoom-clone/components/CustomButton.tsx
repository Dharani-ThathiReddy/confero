import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

type ButtonType = {
  title: string;
  onPress: () => void;
};

const CustomButton = ({ title, onPress }: ButtonType) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: 7,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#0470dc',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CustomButton;
