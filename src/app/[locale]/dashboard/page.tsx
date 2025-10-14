'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, lazy, Suspense } from 'react'
import { GamificationSystem, UserGameData } from '@/lib/gamification'
import { UserProfile } from '@/types/profile'
import { Program } from '@/types/program'
import {
  Zap,
  Trophy,
  Target,
  BarChart3,
  Heart
} from 'lucide-react'

// Lazy load gamification components for better performance
const StreakTracker = lazy(() => import('@/components/gamification/StreakTracker').then(module => ({ default: module.StreakTracker })))
const MotivationCenter = lazy(() => import('@/components/gamification/MotivationCenter').then(module => ({ default: module.MotivationCenter })))

// Loading component for lazy-loaded components
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [program, setProgram] = useState<Program | null>(null)
  const [isWelcome, setIsWelcome] = useState(false)
  const [gamificationEnabled, setGamificationEnabled] = useState(true)
  const [gameData, setGameData] = useState<UserGameData>({
    xp: 850,
    level: 3,
    streak: {
      current: 7,
      longest: 12,
      lastWorkoutDate: new Date().toISOString(),
      isActive: true,
      freezesUsed: 0,
      maxFreezes: 3
    },
    weeklyChallenge: GamificationSystem.generateWeeklyChallenge(3),
    lastLoginDate: new Date().toISOString(),
    totalWorkouts: 45,
    totalXpEarned: 850
  })

  // Load user data
  useEffect(() => {
    async function loadData() {
      if (!user) return

      // Check for welcome parameter
      setIsWelcome(searchParams.get('welcome') === 'true')

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      // If no profile exists, redirect to onboarding
      if (!profileData) {
        router.push('/onboarding')
        return
      }

      setProfile(profileData)

      // Set gamification preference
      setGamificationEnabled(profileData?.gamification_enabled ?? true)

      // Load active program
      const { data: programData } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      setProgram(programData)
    }

    loadData()
  }, [user, searchParams, router])

  // Handle authentication redirect
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [loading, user, router])

  // Don't render if not authenticated
  if (!loading && !user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isWelcome ? 'Welcome to Body by Rings! 🎉' : 'Welcome back! 🚀'}
          </h1>
          <p className="text-gray-600">
            {profile?.full_name || user?.email}
            {profile?.experience_level && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {profile.experience_level}
              </span>
            )}
          </p>
        </div>

        {/* Welcome Message */}
        {isWelcome && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎯 Your Program is Ready!
                </h2>
                <p className="text-gray-600 mb-4">
                  We&apos;ve created a personalized training program based on your fitness level and goals.
                  Your journey to calisthenics mastery starts now!
                </p>
                <Button onClick={() => setIsWelcome(false)}>
                  Let&apos;s Get Started! 💪
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className={`w-full ${gamificationEnabled ? 'grid grid-cols-4' : 'grid grid-cols-1'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {gamificationEnabled ? 'Overview' : 'Dashboard'}
            </TabsTrigger>
            {gamificationEnabled && (
              <>
                <TabsTrigger value="gamification" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Progression
                </TabsTrigger>
                <TabsTrigger value="motivation" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Motivation
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Défis
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🏋️ Current Program</CardTitle>
                  <CardDescription>
                    {program ? `${program.name} - Phase ${program.phase}` : 'Loading...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {program ? (
                    <>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>• Cycle {program.cycle_number}</p>
                        <p>• Started {new Date(program.started_at).toLocaleDateString()}</p>
                        <p>• Status: <span className="font-medium text-green-600">{program.status}</span></p>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => router.push('/workout/start')}
                      >
                        Start Next Workout
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        Ready to start your calisthenics journey!
                      </p>
                      <Button
                        className="mt-4 w-full"
                        onClick={() => router.push('/onboarding')}
                      >
                        Create Program
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {gamificationEnabled ? (
                      <>
                        <Zap className="h-5 w-5 text-orange-500" />
                        Série de {gameData.streak.current} jour{gameData.streak.current > 1 ? 's' : ''}
                      </>
                    ) : (
                      <>
                        📊 Progression
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {gamificationEnabled
                      ? `Niveau ${gameData.level} • ${gameData.xp} XP`
                      : 'Suivez vos progrès'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gamificationEnabled ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span>Record: {gameData.streak.longest} jours</span>
                          <span className="text-green-600 font-medium">Actif</span>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => router.push('/workout/start')}
                        >
                          Continuer la série
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-600 space-y-2">
                          <p>• {gameData.totalWorkouts} séances complétées</p>
                          <p>• {gameData.streak.current} jours consécutifs</p>
                          <p>• Record: {gameData.streak.longest} jours</p>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => router.push('/analytics')}
                        >
                          Voir les analyses
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎯 Next Session</CardTitle>
                  <CardDescription>Upcoming workout</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Push Session 1 - Upper body foundations
                  </p>
                  <Button variant="outline" className="mt-4 w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {gamificationEnabled && (
            <>
              <TabsContent value="gamification" className="space-y-6">
                <Suspense fallback={<ComponentLoader />}>
                  <StreakTracker gameData={gameData} />
                </Suspense>
              </TabsContent>

              <TabsContent value="motivation" className="space-y-6">
                <Suspense fallback={<ComponentLoader />}>
                  <MotivationCenter
                    userLevel={gameData.level}
                    streak={gameData.streak.current}
                    lastLoginDate={gameData.lastLoginDate}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-6">
                {gameData.weeklyChallenge && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Target className="h-6 w-6 text-green-600" />
                      Défis & Challenges
                    </h2>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{gameData.weeklyChallenge.icon}</span>
                          {gameData.weeklyChallenge.title}
                        </CardTitle>
                        <CardDescription>
                          Défi de la semaine • {gameData.weeklyChallenge.xpReward} XP
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700">
                          {gameData.weeklyChallenge.description}
                        </p>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Progression</span>
                            <span className="text-sm text-gray-600">
                              {gameData.weeklyChallenge.current} / {gameData.weeklyChallenge.target}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${(gameData.weeklyChallenge.current / gameData.weeklyChallenge.target) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-gray-600">
                            Se termine le {new Date(gameData.weeklyChallenge.endDate).toLocaleDateString('fr-FR')}
                          </div>
                          {gameData.weeklyChallenge.completed ? (
                            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                              <Trophy className="h-4 w-4" />
                              Complété !
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => router.push('/workout/start')}>
                              Progresser
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-16"
              onClick={() => router.push('/workout/start')}
            >
              🏋️ Start Workout
            </Button>
            <Button
              variant="outline"
              className="h-16"
              onClick={() => router.push('/programs')}
            >
              📈 My Programs
            </Button>
            <Button
              variant="outline"
              className="h-16"
              onClick={() => router.push('/analytics')}
            >
              📊 Analytics
            </Button>
            <Button
              variant="outline"
              className="h-16"
              onClick={() => router.push('/profile')}
            >
              ⚙️ Profile
            </Button>
          </div>

          {/* Gamification Promotion */}
          {!gamificationEnabled && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 mb-1">
                    Améliorez votre motivation ! 🚀
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Activez le mode gamification pour débloquer les niveaux, XP, défis et achievements qui vous aideront à rester motivé.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => router.push('/profile')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Activer dans les paramètres
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}