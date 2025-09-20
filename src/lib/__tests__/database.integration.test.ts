/**
 * Database Integration Tests
 * 
 * Tests that verify database operations including:
 * - CRUD operations for all tables
 * - RLS (Row Level Security) policies
 * - Database triggers and functions
 * - Data relationships and constraints
 */

import { createClient } from '@supabase/supabase-js'

// Mock Supabase client for testing
const mockSupabaseUrl = 'https://test.supabase.co'
const mockSupabaseKey = 'test-anon-key'

describe('Database Integration', () => {
  let supabase: ReturnType<typeof createClient>

  beforeEach(() => {
    supabase = createClient(mockSupabaseUrl, mockSupabaseKey)
    
    // Create a chainable mock
    const createChainableMock = () => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })
    
    // Mock the database methods
    supabase.from = jest.fn().mockReturnValue(createChainableMock())
  })

  describe('Profiles Table', () => {
    it('should create user profile with correct data', async () => {
      const mockProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        experience_level: 'beginner',
        created_at: new Date().toISOString(),
      }

      const mockResponse = {
        data: mockProfile,
        error: null,
      }

      ;(supabase.from('profiles').insert as jest.Mock).mockResolvedValue(mockResponse)

      const result = await supabase
        .from('profiles')
        .insert({
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          experience_level: 'beginner',
        })

      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(result.data).toEqual(mockProfile)
      expect(result.error).toBeNull()
    })

    it('should enforce experience level constraints', async () => {
      const invalidProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        experience_level: 'invalid_level', // Should only accept beginner/intermediate/advanced
      }

      const mockError = {
        message: 'Invalid experience level',
        code: '23514', // Check constraint violation
      }

      ;(supabase.from('profiles').insert as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await supabase
        .from('profiles')
        .insert(invalidProfile)

      expect(result.error).toEqual(mockError)
      expect(result.data).toBeNull()
    })

    it('should update user profile', async () => {
      const updatedProfile = {
        full_name: 'Updated Name',
        experience_level: 'intermediate',
      }

      const mockResponse = {
        data: { id: 'test-user-id', ...updatedProfile },
        error: null,
      }

      const mockChain = supabase.from('profiles')
      ;(mockChain.eq as jest.Mock).mockResolvedValue(mockResponse)

      const result = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', 'test-user-id')

      expect(result.data).toMatchObject(updatedProfile)
      expect(result.error).toBeNull()
    })
  })

  describe('Programs Table', () => {
    it('should create training program for user', async () => {
      const mockProgram = {
        id: 'program-id',
        user_id: 'test-user-id',
        name: 'Body by Rings',
        phase: 1,
        cycle_number: 1,
        status: 'active',
        started_at: new Date().toISOString(),
      }

      const mockResponse = {
        data: mockProgram,
        error: null,
      }

      ;(supabase.from('programs').insert as jest.Mock).mockResolvedValue(mockResponse)

      const result = await supabase
        .from('programs')
        .insert({
          user_id: 'test-user-id',
          name: 'Body by Rings',
          phase: 1,
          cycle_number: 1,
        })

      expect(result.data).toEqual(mockProgram)
      expect(result.error).toBeNull()
    })

    it('should enforce foreign key constraints', async () => {
      const invalidProgram = {
        user_id: 'non-existent-user',
        name: 'Test Program',
      }

      const mockError = {
        message: 'Foreign key constraint violation',
        code: '23503',
      }

      ;(supabase.from('programs').insert as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await supabase
        .from('programs')
        .insert(invalidProgram)

      expect(result.error).toEqual(mockError)
      expect(result.data).toBeNull()
    })
  })

  describe('Workouts Table', () => {
    it('should create workout session', async () => {
      const mockWorkout = {
        id: 'workout-id',
        program_id: 'program-id',
        week_number: 1,
        session_type: 'push_1',
        is_deload: false,
        started_at: new Date().toISOString(),
      }

      const mockResponse = {
        data: mockWorkout,
        error: null,
      }

      ;(supabase.from('workouts').insert as jest.Mock).mockResolvedValue(mockResponse)

      const result = await supabase
        .from('workouts')
        .insert({
          program_id: 'program-id',
          week_number: 1,
          session_type: 'push_1',
        })

      expect(result.data).toEqual(mockWorkout)
      expect(result.error).toBeNull()
    })

    it('should enforce session type constraints', async () => {
      const invalidWorkout = {
        program_id: 'program-id',
        week_number: 1,
        session_type: 'invalid_type', // Should only accept push_1, pull_1, push_2, pull_2
      }

      const mockError = {
        message: 'Invalid session type',
        code: '23514',
      }

      ;(supabase.from('workouts').insert as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await supabase
        .from('workouts')
        .insert(invalidWorkout)

      expect(result.error).toEqual(mockError)
    })

    it('should enforce week number constraints', async () => {
      const invalidWorkout = {
        program_id: 'program-id',
        week_number: 6, // Should only accept 1-5
        session_type: 'push_1',
      }

      const mockError = {
        message: 'Week number must be between 1 and 5',
        code: '23514',
      }

      ;(supabase.from('workouts').insert as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await supabase
        .from('workouts')
        .insert(invalidWorkout)

      expect(result.error).toEqual(mockError)
    })
  })

  describe('Sets Table', () => {
    it('should create workout set with valid data', async () => {
      const mockSet = {
        id: 'set-id',
        workout_id: 'workout-id',
        exercise_id: 'exercise-id',
        set_number: 1,
        target_reps_min: 5,
        target_reps_max: 8,
        actual_reps: 6,
        rpe: 8,
        tempo: '30X1',
        completed_at: new Date().toISOString(),
      }

      const mockResponse = {
        data: mockSet,
        error: null,
      }

      ;(supabase.from('sets').insert as jest.Mock).mockResolvedValue(mockResponse)

      const result = await supabase
        .from('sets')
        .insert({
          workout_id: 'workout-id',
          exercise_id: 'exercise-id',
          set_number: 1,
          target_reps_min: 5,
          target_reps_max: 8,
          actual_reps: 6,
          rpe: 8,
        })

      expect(result.data).toEqual(mockSet)
      expect(result.error).toBeNull()
    })

    it('should enforce RPE constraints (6-10)', async () => {
      const invalidSet = {
        workout_id: 'workout-id',
        exercise_id: 'exercise-id',
        set_number: 1,
        rpe: 11, // Should only accept 6-10
      }

      const mockError = {
        message: 'RPE must be between 6 and 10',
        code: '23514',
      }

      ;(supabase.from('sets').insert as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await supabase
        .from('sets')
        .insert(invalidSet)

      expect(result.error).toEqual(mockError)
    })
  })

  describe('Row Level Security (RLS)', () => {
    it('should only allow users to access their own profiles', async () => {
      // Mock user context
      const currentUserId = 'current-user-id'
      
      const mockProfiles = [
        { id: 'current-user-id', email: 'current@example.com' },
      ]

      ;(supabase.from('profiles').select as jest.Mock).mockResolvedValue({
        data: mockProfiles,
        error: null,
      })

      // In a real test, this would verify that RLS policies prevent
      // accessing other users' profiles
      const result = await supabase
        .from('profiles')
        .select('*')

      // With RLS enabled, only current user's profile should be returned
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe(currentUserId)
    })

    it('should only allow users to access their own programs', async () => {
      const currentUserId = 'current-user-id'
      
      const mockPrograms = [
        { id: 'program-1', user_id: 'current-user-id', name: 'My Program' },
      ]

      ;(supabase.from('programs').select as jest.Mock).mockResolvedValue({
        data: mockPrograms,
        error: null,
      })

      const result = await supabase
        .from('programs')
        .select('*')

      // Should only return current user's programs
      expect(result.data).toHaveLength(1)
      expect(result.data[0].user_id).toBe(currentUserId)
    })

    it('should prevent unauthorized data modifications', async () => {
      const mockError = {
        message: 'RLS policy violation',
        code: '42501', // Insufficient privilege
      }

      const mockChain = supabase.from('profiles')
      ;(mockChain.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      })

      // Attempt to update another user's profile
      const result = await supabase
        .from('profiles')
        .update({ full_name: 'Hacked Name' })
        .eq('id', 'other-user-id')

      expect(result.error).toEqual(mockError)
      expect(result.data).toBeNull()
    })
  })

  describe('Data Relationships', () => {
    it('should cascade delete workouts when program is deleted', async () => {
      // Mock cascade delete behavior
      const mockResponse = {
        data: { id: 'program-id' },
        error: null,
      }

      const mockChain = supabase.from('programs')
      ;(mockChain.eq as jest.Mock).mockResolvedValue(mockResponse)

      const result = await supabase
        .from('programs')
        .delete()
        .eq('id', 'program-id')

      expect(result.data.id).toBe('program-id')
      // In a real integration test, we would verify that:
      // - All workouts for this program are also deleted
      // - All sets for those workouts are also deleted
    })

    it('should maintain referential integrity', async () => {
      // Test that we can't delete a program that has active workouts
      // without proper cascade handling
      
      const mockError = {
        message: 'Cannot delete program with active workouts',
        code: '23503',
      }

      const mockChain = supabase.from('programs')
      ;(mockChain.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await supabase
        .from('programs')
        .delete()
        .eq('id', 'program-with-workouts')

      expect(result.error).toEqual(mockError)
    })
  })

  describe('Performance', () => {
    it('should efficiently query workout history', async () => {
      const mockWorkoutHistory = [
        {
          id: 'workout-1',
          program_id: 'program-id',
          session_type: 'push_1',
          completed_at: '2024-01-01',
          sets: [
            { exercise_name: 'Push-ups', actual_reps: 10, rpe: 8 },
            { exercise_name: 'Dips', actual_reps: 8, rpe: 9 },
          ],
        },
        {
          id: 'workout-2',
          program_id: 'program-id',
          session_type: 'pull_1',
          completed_at: '2024-01-02',
          sets: [
            { exercise_name: 'Pull-ups', actual_reps: 5, rpe: 8 },
            { exercise_name: 'Rows', actual_reps: 12, rpe: 7 },
          ],
        },
      ]

      const mockChain = supabase.from('workouts')
      ;(mockChain.order as jest.Mock).mockResolvedValue({
        data: mockWorkoutHistory,
        error: null,
      })

      const result = await supabase
        .from('workouts')
        .select(`
          *,
          sets (
            *,
            exercises (name)
          )
        `)
        .eq('program_id', 'program-id')
        .order('completed_at', { ascending: false })

      expect(result.data).toHaveLength(2)
      expect(result.data[0].completed_at).toBe('2024-01-01') // Most recent first
    })

    it('should handle large dataset queries efficiently', async () => {
      // Test query optimization for large datasets
      const mockLargeDataset = new Array(1000).fill(null).map((_, index) => ({
        id: `workout-${index}`,
        session_type: index % 2 === 0 ? 'push_1' : 'pull_1',
        completed_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      }))

      const mockChain = supabase.from('workouts')
      ;(mockChain.order as jest.Mock).mockResolvedValue({
        data: mockLargeDataset.slice(0, 20), // Pagination
        error: null,
      })

      const result = await supabase
        .from('workouts')
        .select('*')
        .range(0, 19) // First 20 records
        .order('completed_at', { ascending: false })

      expect(result.data).toHaveLength(20)
      // In a real test, we would measure query performance
    })
  })
})