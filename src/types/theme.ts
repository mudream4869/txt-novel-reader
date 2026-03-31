export type ReaderThemeName = 'white' | 'yellow' | 'dark'

export interface ReaderTheme {
  name: ReaderThemeName
  colors: {
    appBackground: string
    panelBackground: string
    panelBorder: string
    buttonBackground: string
    buttonBorder: string
    buttonActiveBackground: string
    buttonActiveBorder: string
    textPrimary: string
    textSecondary: string
  }
}

export const readerThemes: Record<ReaderThemeName, ReaderTheme> = {
  white: {
    name: 'white',
    colors: {
      appBackground: '#f3f3f3',
      panelBackground: '#ffffff',
      panelBorder: '#d6d6d6',
      buttonBackground: '#f6f6f6',
      buttonBorder: '#d6d6d6',
      buttonActiveBackground: '#eafaf3',
      buttonActiveBorder: '#42b983',
      textPrimary: '#111111',
      textSecondary: '#555555'
    }
  },
  yellow: {
    name: 'yellow',
    colors: {
      appBackground: '#f3ecd1',
      panelBackground: '#fff8de',
      panelBorder: '#d4c59a',
      buttonBackground: '#f7efd1',
      buttonBorder: '#d4c59a',
      buttonActiveBackground: '#efe1b2',
      buttonActiveBorder: '#a8872f',
      textPrimary: '#2d2717',
      textSecondary: '#5c4f2f'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      appBackground: '#1b1d21',
      panelBackground: '#22262b',
      panelBorder: '#3a3f46',
      buttonBackground: '#2a2f36',
      buttonBorder: '#434a54',
      buttonActiveBackground: '#334452',
      buttonActiveBorder: '#6aa6ff',
      textPrimary: '#e9edf2',
      textSecondary: '#b8c2cf'
    }
  }
}
