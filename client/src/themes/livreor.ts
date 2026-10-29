import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

/**
 * Thème « carnet ancien » du Livre d'or :
 * papier crème + encre bordeaux, en clair comme en sombre.
 */

// Palette bordeaux (encre)
const bordeaux = {
  50: '#fbf3f4',
  100: '#f6e4e6',
  200: '#edc9ce',
  300: '#dfa2aa',
  400: '#cc727f',
  500: '#b4495a',
  600: '#9b3245',
  700: '#812638',
  800: '#6b2131',
  900: '#5a1e2c',
  950: '#330c15',
}

// Palette « papier » : neutres chauds, du crème au brun encre
const papier = {
  0: '#fffdf8',
  50: '#fdf8ef',
  100: '#f7efe1',
  200: '#ede1cc',
  300: '#dccbae',
  400: '#c2ad8a',
  500: '#a08a69',
  600: '#7f6c51',
  700: '#63543f',
  800: '#463b2d',
  900: '#2e271e',
  950: '#1c1712',
}

const LivreOrPreset = definePreset(Aura, {
  semantic: {
    primary: bordeaux,
    colorScheme: {
      light: {
        surface: papier,
        primary: {
          color: '{primary.700}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}',
        },
      },
      dark: {
        surface: papier,
        primary: {
          color: '{primary.300}',
          contrastColor: '{surface.950}',
          hoverColor: '{primary.200}',
          activeColor: '{primary.100}',
        },
      },
    },
  },
})

export default LivreOrPreset