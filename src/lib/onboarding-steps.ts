import type { OnboardingStep } from '@/types/onboarding'

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Body by Rings! 🚀',
    description: 'Let\'s create your personalized calisthenics program. This will take about 3 minutes.',
    questions: [
      {
        id: 'full_name',
        type: 'text',
        question: 'What\'s your name?',
        description: 'We\'ll use this to personalize your experience',
        placeholder: 'Enter your full name',
        required: true
      }
    ]
  },

  {
    id: 'fitness-assessment',
    title: 'Fitness Assessment 💪',
    description: 'Help us understand your current fitness level. Be honest - this ensures your program is safe and effective!',
    questions: [
      {
        id: 'can_do_pushups',
        type: 'number',
        question: 'How many push-ups can you do in a row?',
        description: 'Full push-ups from toes, chest touching the ground. If you can\'t do any, enter 0.',
        min: 0,
        max: 100,
        required: true
      },
      {
        id: 'can_do_pullups',
        type: 'number',
        question: 'How many pull-ups can you do in a row?',
        description: 'Full pull-ups, chin over the bar. Dead hang to full extension. Enter 0 if you can\'t do any.',
        min: 0,
        max: 50,
        required: true
      },
      {
        id: 'can_hold_plank',
        type: 'number',
        question: 'How long can you hold a plank? (seconds)',
        description: 'Forearm plank, body straight, no sagging. Enter your maximum hold time.',
        min: 0,
        max: 600,
        required: true
      }
    ]
  },

  {
    id: 'goals-preferences',
    title: 'Your Goals & Preferences 🎯',
    description: 'Tell us about your fitness goals and training preferences.',
    questions: [
      {
        id: 'primary_goal',
        type: 'select',
        question: 'What\'s your primary fitness goal?',
        description: 'Choose the goal that matters most to you right now.',
        options: [
          { value: 'strength', label: 'Build Strength - Get stronger with advanced movements' },
          { value: 'muscle_building', label: 'Build Muscle - Develop size and definition' },
          { value: 'skill_development', label: 'Learn Skills - Master handstands, muscle-ups, etc.' },
          { value: 'general_fitness', label: 'General Fitness - Overall health and conditioning' },
          { value: 'weight_loss', label: 'Weight Loss - Burn fat and improve body composition' },
          { value: 'endurance', label: 'Endurance - Improve cardiovascular fitness' }
        ],
        required: true
      },
      {
        id: 'training_frequency',
        type: 'select',
        question: 'How many days per week do you want to train?',
        description: 'Be realistic - consistency beats intensity.',
        options: [
          { value: '2', label: '2 days/week - Perfect for beginners' },
          { value: '3', label: '3 days/week - Balanced approach (recommended)' },
          { value: '4', label: '4 days/week - For dedicated trainees' },
          { value: '5', label: '5 days/week - High commitment' },
          { value: '6', label: '6 days/week - Advanced athletes only' }
        ],
        required: true
      }
    ]
  },

  {
    id: 'equipment-schedule',
    title: 'Equipment, Schedule & Background ⏰',
    description: 'Let\'s set up your training environment, schedule, and understand your experience.',
    questions: [
      {
        id: 'available_equipment',
        type: 'multiselect',
        question: 'What equipment do you have access to?',
        description: 'Select all that apply. Don\'t worry if you have nothing - we can work with just your body!',
        options: [
          { value: 'rings', label: 'Gymnastics Rings' },
          { value: 'pullup_bar', label: 'Pull-up Bar (or sturdy branch)' },
          { value: 'parallette_bars', label: 'Parallette Bars or Push-up Handles' },
          { value: 'resistance_bands', label: 'Resistance Bands' },
          { value: 'none', label: 'No equipment - bodyweight only' }
        ],
        required: true
      },
      {
        id: 'typical_workout_time',
        type: 'select',
        question: 'When do you prefer to work out?',
        description: 'Choose the time that works best for your schedule.',
        options: [
          { value: 'morning', label: 'Morning (6AM - 11AM)' },
          { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
          { value: 'evening', label: 'Evening (6PM - 10PM)' }
        ],
        required: true
      },
      {
        id: 'previous_training',
        type: 'multiselect',
        question: 'What types of training have you done before?',
        description: 'Select all that apply, even if it was years ago.',
        options: [
          { value: 'gym', label: 'Gym/Weight Training' },
          { value: 'bodyweight', label: 'Bodyweight/Calisthenics' },
          { value: 'yoga', label: 'Yoga/Pilates' },
          { value: 'sports', label: 'Team Sports (football, basketball, etc.)' },
          { value: 'running', label: 'Running/Cardio' },
          { value: 'martial_arts', label: 'Martial Arts' },
          { value: 'dancing', label: 'Dancing' },
          { value: 'none', label: 'No previous training experience' }
        ],
        required: true
      }
    ]
  },

  {
    id: 'experience-background',
    title: 'Health & Safety Information 🏥',
    description: 'Finally, let us know about any health considerations to ensure your safety.',
    questions: [
      {
        id: 'injuries_or_limitations',
        type: 'text',
        question: 'Do you have any injuries or physical limitations?',
        description: 'Optional: Tell us about any current injuries, past surgeries, or physical limitations. This helps us modify exercises for your safety.',
        placeholder: 'e.g., Lower back pain, shoulder injury, knee problems...',
        required: false
      }
    ]
  }
]

// Helper function to get step by ID
export function getStepById(stepId: string): OnboardingStep | undefined {
  return ONBOARDING_STEPS.find(step => step.id === stepId)
}

// Helper function to get next step
export function getNextStep(currentStepId: string): OnboardingStep | null {
  const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStepId)
  if (currentIndex === -1 || currentIndex === ONBOARDING_STEPS.length - 1) {
    return null
  }
  return ONBOARDING_STEPS[currentIndex + 1]
}

// Helper function to get previous step
export function getPreviousStep(currentStepId: string): OnboardingStep | null {
  const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStepId)
  if (currentIndex <= 0) {
    return null
  }
  return ONBOARDING_STEPS[currentIndex - 1]
}

// Calculate total progress percentage
export function calculateProgress(currentStepId: string): number {
  const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStepId)
  return Math.round(((currentIndex + 1) / ONBOARDING_STEPS.length) * 100)
}