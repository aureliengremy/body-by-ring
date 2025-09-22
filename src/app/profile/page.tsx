'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Trophy, Zap, Star, Moon, Sun } from 'lucide-react'
import type { ExperienceLevel } from '@/types/onboarding'

interface UserProfile {
  id: string
  email: string
  full_name: string
  experience_level: ExperienceLevel
  gamification_enabled: boolean
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    experience_level: '' as ExperienceLevel,
    gamification_enabled: true
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, redirect to onboarding
            router.push('/onboarding')
            return
          }
          throw error
        }

        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          experience_level: data.experience_level || 'beginner',
          gamification_enabled: data.gamification_enabled ?? true
        })
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, router])

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          experience_level: formData.experience_level,
          gamification_enabled: formData.gamification_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name,
        experience_level: formData.experience_level,
        gamification_enabled: formData.gamification_enabled,
        updated_at: new Date().toISOString()
      } : null)

      setSuccess('Profile updated successfully!')
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle input changes
  function handleInputChange(field: keyof typeof formData, value: string | boolean) {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear messages when user starts editing
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and training preferences
          </p>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile details. Changes to your experience level may affect your training program.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success/Error Messages */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">
                  Email cannot be changed. Contact support if you need to update your email address.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => handleInputChange('experience_level', value as ExperienceLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      Beginner - New to calisthenics
                    </SelectItem>
                    <SelectItem value="intermediate">
                      Intermediate - Some experience with bodyweight training
                    </SelectItem>
                    <SelectItem value="advanced">
                      Advanced - Experienced with advanced movements
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Changing your experience level may generate a new training program.
                </p>
              </div>

              {/* Gamification Settings */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Préférences d'interface
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Personnalisez votre expérience d'entraînement
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-gray-900">
                        Mode Gamification
                      </h4>
                      {formData.gamification_enabled && (
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Activé
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formData.gamification_enabled 
                        ? "Affiche les niveaux, XP, séries et défis pour rendre l'entraînement plus motivant"
                        : "Interface simplifiée sans éléments de gamification"
                      }
                    </p>
                    
                    {formData.gamification_enabled && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Système XP & Niveaux
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Achievements
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Défis hebdomadaires
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Switch
                    checked={formData.gamification_enabled}
                    onCheckedChange={(checked) => handleInputChange('gamification_enabled', checked)}
                  />
                </div>

                {/* Theme Settings - Disabled for now */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sun className="h-5 w-5 text-gray-400" />
                      <h4 className="font-medium text-gray-500">
                        Thème de l'interface
                      </h4>
                      <Badge className="bg-gray-100 text-gray-600">
                        Mode Clair
                      </Badge>
                      <Badge className="bg-blue-50 text-blue-600 text-xs">
                        Bientôt disponible
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Le mode sombre sera disponible dans une prochaine mise à jour
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Sun className="h-3 w-3" />
                        Mode clair uniquement
                      </div>
                      <div className="flex items-center gap-1">
                        <Moon className="h-3 w-3" />
                        En développement
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled
                    className="cursor-not-allowed"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Account Info */}
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
                <p>Account created: {new Date(profile.created_at).toLocaleDateString()}</p>
                <p>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Re-run Onboarding</h3>
                <p className="text-sm text-gray-500">
                  This will reset your progress and create a new program
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/onboarding')}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Reset Program
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}