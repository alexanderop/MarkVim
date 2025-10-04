import type { ColorTheme } from '~/modules/color-theme/api'

export interface ColorDefinition {
  key: keyof ColorTheme
  label: string
  description: string
  icon: string
  category: 'core' | 'alerts'
}

export const colorDefinitions: readonly ColorDefinition[] = [
  {
    key: 'background',
    label: 'Background',
    description: 'Main application background color',
    icon: 'lucide:layout',
    category: 'core',
  },
  {
    key: 'foreground',
    label: 'Foreground',
    description: 'Primary text and content color',
    icon: 'lucide:type',
    category: 'core',
  },
  {
    key: 'accent',
    label: 'Accent',
    description: 'Interactive elements, links, and highlights',
    icon: 'lucide:zap',
    category: 'core',
  },
  {
    key: 'muted',
    label: 'Muted',
    description: 'Subtle backgrounds and secondary surfaces hover for example',
    icon: 'lucide:layers',
    category: 'core',
  },
  {
    key: 'border',
    label: 'Border',
    description: 'Separators, input borders, and dividers',
    icon: 'lucide:minus',
    category: 'core',
  },
  {
    key: 'alertNote',
    label: 'Alert Note',
    description: 'Note/info alert color (blue)',
    icon: 'lucide:info',
    category: 'alerts',
  },
  {
    key: 'alertTip',
    label: 'Alert Tip',
    description: 'Tip/success alert color (green)',
    icon: 'lucide:lightbulb',
    category: 'alerts',
  },
  {
    key: 'alertImportant',
    label: 'Alert Important',
    description: 'Important alert color (purple)',
    icon: 'lucide:alert-triangle',
    category: 'alerts',
  },
  {
    key: 'alertWarning',
    label: 'Alert Warning',
    description: 'Warning alert color (orange)',
    icon: 'lucide:alert-circle',
    category: 'alerts',
  },
  {
    key: 'alertCaution',
    label: 'Alert Caution',
    description: 'Caution/danger alert color (red)',
    icon: 'lucide:octagon-x',
    category: 'alerts',
  },
] as const

export const coreColors = colorDefinitions.filter(def => def.category === 'core')
export const alertColors = colorDefinitions.filter(def => def.category === 'alerts')
