import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useThemeColor } from '../hooks/useThemeColor';
import { SyncStatus } from '../lib/db';

type SyncIndicatorProps = {
  status: SyncStatus;
  onRestart?: () => void;
};

const SyncIndicator: React.FC<SyncIndicatorProps> = ({ status, onRestart }) => {
  const getIconAndColor = () => {
    switch (status) {
      case 'active':
        return { icon: null, color: '#4caf50' }; // Green for active
      case 'paused':
        return { icon: 'pause' as const, color: '#ff9800' }; // Orange for paused
      case 'complete':
        return { icon: 'check' as const, color: '#4caf50' }; // Green for complete
      case 'error':
        return { icon: 'exclamation-triangle' as const, color: '#f44336' }; // Red for error
      case 'denied':
        return { icon: 'ban' as const, color: '#f44336' }; // Red for denied
      default:
        return { icon: 'cloud' as const, color: '#9e9e9e' }; // Grey for pending or unknown
    }
  };

  const { icon, color } = getIconAndColor();
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
  
  const isError = status === 'error' || status === 'denied';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {status === 'active' ? (
        <ActivityIndicator size={16} color={color} style={styles.icon} />
      ) : (
        icon && (
          <TouchableOpacity
            onPress={isError && onRestart ? onRestart : undefined}
            disabled={!isError || !onRestart}
          >
            <FontAwesome name={icon} size={16} color={color} style={styles.icon} />
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  icon: {
    width: 16,
    height: 16,
  },
});

export default SyncIndicator;