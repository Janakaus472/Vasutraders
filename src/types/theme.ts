// Shared types and defaults for the homepage theme system.
// Imported by both API routes (server) and components (client/server).

export interface FestivalThemeConfig {
  bannerUrl?: string
  greetingText?: string
  subText?: string
  showDecorations: boolean
  decorationType: 'diyas' | 'confetti' | 'lights' | 'none'
  primaryColor: string
  secondaryColor: string
  startDate?: string
  endDate?: string
}

export interface PromoSlide {
  id: string
  imageUrl?: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaUrl?: string
}

export interface PromoThemeConfig {
  slides: PromoSlide[]
  autoSlideInterval: number
  showDots: boolean
  showArrows: boolean
}

export type ActiveTheme = 'default' | 'festival' | 'promotional'

export interface ThemeConfig {
  activeTheme: ActiveTheme
  festival: FestivalThemeConfig
  promotional: PromoThemeConfig
}

export const DEFAULT_FESTIVAL: FestivalThemeConfig = {
  greetingText: '',
  subText: '',
  showDecorations: true,
  decorationType: 'diyas',
  primaryColor: '#FF6B00',
  secondaryColor: '#FAC41A',
}

export const DEFAULT_PROMO: PromoThemeConfig = {
  slides: [],
  autoSlideInterval: 4,
  showDots: true,
  showArrows: true,
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  activeTheme: 'default',
  festival: DEFAULT_FESTIVAL,
  promotional: DEFAULT_PROMO,
}
