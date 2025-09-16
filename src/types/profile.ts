export interface UserProfile {
  id: string
  email: string
  full_name?: string
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  gamification_enabled: boolean
  created_at: string
  updated_at?: string
}

export interface ProfileSettings {
  full_name?: string
  experience_level?: 'beginner' | 'intermediate' | 'advanced'
  gamification_enabled: boolean
  // Autres préférences à ajouter plus tard
  notifications_enabled?: boolean
  weekly_goal?: number
}