import { config } from '@vue/test-utils'
import PrimeVue from 'primevue/config'

// PrimeVue est installé globalement pour tous les composants montés dans les tests
config.global.plugins = [PrimeVue]
