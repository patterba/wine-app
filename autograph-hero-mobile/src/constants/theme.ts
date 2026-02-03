import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// AutographHero brand colors
const brandColors = {
  primary: '#1E3A5F',       // Deep navy blue
  secondary: '#D4AF37',     // Gold/amber for accents
  tertiary: '#2E7D32',      // Success green
  error: '#D32F2F',         // Error red
  background: '#FAFAFA',    // Light gray background
  surface: '#FFFFFF',       // White surface
  surfaceVariant: '#E8E8E8', // Slightly darker surface
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    tertiary: brandColors.tertiary,
    error: brandColors.error,
    background: brandColors.background,
    surface: brandColors.surface,
    surfaceVariant: brandColors.surfaceVariant,
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#1C1B1F',
    onSurface: '#1C1B1F',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4A90D9',      // Lighter blue for dark mode
    secondary: brandColors.secondary,
    tertiary: '#66BB6A',     // Lighter green
    error: '#EF5350',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#E6E1E5',
    onSurface: '#E6E1E5',
  },
};

// Category colors for visual distinction
export const categoryColors: Record<string, string> = {
  NFL: '#013369',
  MLB: '#002D72',
  NBA: '#1D428A',
  NHL: '#000000',
  Music: '#1DB954',
  Film: '#E50914',
  TV: '#8B5CF6',
  Wrestling: '#FFD700',
  Comedy: '#FF6B6B',
  Anime: '#FF69B4',
};
