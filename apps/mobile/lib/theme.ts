import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

const primary = '#3A7FFF';
const backgroundDark = '#050b18';
const cardDark = '#0d1529';
const textDark = '#f5f7ff';

export const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary,
    background: '#f5f7ff',
    card: '#ffffff',
    text: '#0b1739',
    border: '#d5dcff',
    notification: '#f97316',
  },
};

export const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary,
    background: backgroundDark,
    card: cardDark,
    text: textDark,
    border: '#1f2b45',
    notification: '#f59e0b',
  },
};

export const surfaceColors = {
  primary,
  backgroundDark,
  cardDark,
  textDark,
};
