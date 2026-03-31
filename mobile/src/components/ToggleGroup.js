import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../theme/Theme';

export default function ToggleGroup({ options, value, onChange }) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.button, isActive && styles.activeButton]}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.md,
    padding: 4,
    width: 200,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.sm,
  },
  activeButton: {
    backgroundColor: Theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textMuted,
  },
  activeText: {
    color: Theme.colors.bg,
  },
});
