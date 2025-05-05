import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  buttonLabel?: string;
  onButtonPress?: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'list-ul',
  buttonLabel,
  onButtonPress,
}) => {
  const iconColor = useThemeColor({ light: '#bdbdbd', dark: '#4f4f4f' }, 'text');
  const titleColor = useThemeColor({ light: '#424242', dark: '#e0e0e0' }, 'text');
  const descriptionColor = useThemeColor({ light: '#757575', dark: '#9e9e9e' }, 'text');
  const buttonColor = useThemeColor({ light: '#2196f3', dark: '#4dabf5' }, 'tint');

  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={50} color={iconColor} style={styles.icon} />
      
      <ThemedText 
        style={styles.title}
        lightColor={titleColor}
        darkColor={titleColor}
      >
        {title}
      </ThemedText>
      
      {description ? (
        <ThemedText 
          style={styles.description}
          lightColor={descriptionColor}
          darkColor={descriptionColor}
        >
          {description}
        </ThemedText>
      ) : null}
      
      {buttonLabel && onButtonPress ? (
        <Button
          mode="contained"
          onPress={onButtonPress}
          style={styles.button}
          buttonColor={buttonColor}
        >
          {buttonLabel}
        </Button>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    minWidth: 200,
  },
});

export default EmptyState;