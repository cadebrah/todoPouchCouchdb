/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2196f3';
const tintColorDark = '#4dabf5';

export default {
  light: {
    text: '#000000',
    secondaryText: '#757575',
    background: '#f5f5f5',
    card: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#cccccc',
    tabIconSelected: tintColorLight,
    border: '#e0e0e0',
    notification: '#ff3b30',
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
  },
  dark: {
    text: '#ffffff',
    secondaryText: '#a0a0a0',
    background: '#000000',
    card: '#1c1c1e',
    tint: tintColorDark,
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
    border: '#333333',
    notification: '#ff453a',
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
  },
};