const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kqpbnqlvmiigchkpoevr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxcGJucWx2bWlpZ2Noa3BvZXZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjkyODgzNywiZXhwIjoyMDcyNTA0ODM3fQ.7Z_pX6lq6M1FhkuDfXlglxDBPFqcKF1tkFTh2L7Z1rs'
);

// Exercise expansions organized by category and difficulty
const NEW_EXERCISES = [
  // PUSH PROGRESSIONS
  { name: 'Wall Push-ups', category: 'push', difficulty_level: 1, 
    instructions: 'Stand arms length from wall. Place hands on wall at shoulder height. Push body toward wall and back. Perfect for absolute beginners to learn the pushing motion.' },
  { name: 'Incline Push-ups', category: 'push', difficulty_level: 2,
    instructions: 'Hands on elevated surface (bench, chair, stairs). The higher the surface, the easier the exercise. Progress by lowering the incline over time.' },
  { name: 'Knee Push-ups', category: 'push', difficulty_level: 2,
    instructions: 'Standard push-up position but on knees instead of toes. Keep straight line from knees to head. Focus on full range of motion.' },
  { name: 'Diamond Push-ups', category: 'push', difficulty_level: 4,
    instructions: 'Hands in diamond shape under chest. Emphasizes triceps more than regular push-ups. More challenging than standard push-ups.' },
  { name: 'Archer Push-ups', category: 'push', difficulty_level: 6,
    instructions: 'Wide hand position. Lower to one side, keeping one arm straight. Builds unilateral strength for one-arm push-up progression.' },
  { name: 'Pseudo Planche Push-ups', category: 'push', difficulty_level: 7,
    instructions: 'Hands positioned lower on torso, leaning forward. Builds planche strength. Advanced pushing movement requiring good wrist mobility.' },
  { name: 'One-Arm Push-ups', category: 'push', difficulty_level: 9,
    instructions: 'Ultimate push-up progression. Requires significant unilateral strength and stability. Work up through archer push-ups first.' },
  { name: 'Planche Push-ups', category: 'push', difficulty_level: 10,
    instructions: 'Push-ups in planche position (feet off ground). Extremely advanced skill requiring years of progressive training.' },

  // PULL PROGRESSIONS  
  { name: 'Dead Hang', category: 'pull', difficulty_level: 1,
    instructions: 'Simply hang from bar with good grip. Build grip strength and shoulder stability. Foundation for all pulling movements.' },
  { name: 'Assisted Pull-ups (Band)', category: 'pull', difficulty_level: 2,
    instructions: 'Use resistance band for assistance. Focus on full range of motion. Gradually reduce band assistance over time.' },
  { name: 'Negative Pull-ups', category: 'pull', difficulty_level: 2,
    instructions: 'Start at top position, lower slowly (3-5 seconds). Builds strength in lowering phase. Excellent for building pull-up strength.' },
  { name: 'Inverted Rows (Table)', category: 'pull', difficulty_level: 2,
    instructions: 'Lie under sturdy table, pull chest to table edge. Easier than ring rows. Use feet position to adjust difficulty.' },
  { name: 'Wide-Grip Pull-ups', category: 'pull', difficulty_level: 5,
    instructions: 'Hands wider than shoulder-width. Emphasizes lats more. Slightly harder than regular pull-ups.' },
  { name: 'Commando Pull-ups', category: 'pull', difficulty_level: 6,
    instructions: 'Pull up to one side of bar, lower, then pull to other side. Builds unilateral strength and core stability.' },
  { name: 'L-sit Pull-ups', category: 'pull', difficulty_level: 7,
    instructions: 'Pull-ups while holding L-sit position. Combines pulling strength with core strength. Very challenging.' },
  { name: 'Weighted Pull-ups', category: 'pull', difficulty_level: 8,
    instructions: 'Add weight via belt or vest. Progressive overload for strength building. Start with 5-10lbs additional weight.' },
  { name: 'One-Arm Pull-ups', category: 'pull', difficulty_level: 10,
    instructions: 'Ultimate pulling goal. Requires exceptional strength. Progress through archer pull-ups and assisted one-arm work.' },

  // LEGS PROGRESSIONS
  { name: 'Wall Sit', category: 'legs', difficulty_level: 1,
    instructions: 'Back against wall, slide down until thighs parallel to ground. Hold position. Builds quad endurance and strength.' },
  { name: 'Assisted Squats', category: 'legs', difficulty_level: 1,
    instructions: 'Hold onto sturdy object for balance. Focus on proper squat form. Great for mobility and strength building.' },
  { name: 'Step-ups', category: 'legs', difficulty_level: 2,
    instructions: 'Step onto elevated surface, step down with control. Use higher surface for more difficulty. Builds single-leg strength.' },
  { name: 'Calf Raises', category: 'legs', difficulty_level: 2,
    instructions: 'Rise onto balls of feet, lower with control. Can be done single-leg for more difficulty. Builds calf strength.' },
  { name: 'Jump Squats', category: 'legs', difficulty_level: 4,
    instructions: 'Explosive squat with jump at top. Land softly and immediately descend into next rep. Builds power and conditioning.' },
  { name: 'Bulgarian Split Squats', category: 'legs', difficulty_level: 4,
    instructions: 'Rear foot elevated, single-leg squat. Excellent for building unilateral leg strength and balance.' },
  { name: 'Single-Leg Glute Bridges', category: 'legs', difficulty_level: 5,
    instructions: 'Bridge position with one leg extended. Builds glute strength and hip stability. Foundation for pistol squats.' },
  { name: 'Shrimp Squats', category: 'legs', difficulty_level: 8,
    instructions: 'Single-leg squat holding other leg behind. More challenging than pistol squat. Requires excellent balance and flexibility.' },
  { name: 'Jump Pistol Squats', category: 'legs', difficulty_level: 9,
    instructions: 'Explosive pistol squat with jump. Extremely challenging power movement. Master regular pistols first.' },

  // CORE PROGRESSIONS
  { name: 'Dead Bug', category: 'core', difficulty_level: 1,
    instructions: 'Lie on back, arms up, knees at 90°. Lower opposite arm and leg slowly. Excellent for core stability and coordination.' },
  { name: 'Hollow Body Hold', category: 'core', difficulty_level: 2,
    instructions: 'Lie on back, press lower back to ground, lift shoulders and legs. Foundation for many advanced core movements.' },
  { name: 'Side Plank', category: 'core', difficulty_level: 3,
    instructions: 'Plank on one side, body in straight line. Hold position. Builds lateral core strength often neglected.' },
  { name: 'Hanging Knee Raises', category: 'core', difficulty_level: 4,
    instructions: 'Hang from bar, lift knees to chest. Control the movement. Builds hanging core strength for advanced moves.' },
  { name: 'V-ups', category: 'core', difficulty_level: 4,
    instructions: 'Lie flat, simultaneously lift chest and legs to touch toes. Dynamic core strengthening movement.' },
  { name: 'L-sit Progression (Tuck)', category: 'core', difficulty_level: 5,
    instructions: 'Support body weight on hands, knees tucked to chest. Progress toward full L-sit by extending legs.' },
  { name: 'Planche Lean', category: 'core', difficulty_level: 6,
    instructions: 'Lean forward in push-up position, shift weight to hands. Foundation for planche training.' },
  { name: 'Hanging Leg Raises', category: 'core', difficulty_level: 7,
    instructions: 'Hang from bar, lift straight legs to horizontal. Requires significant core and grip strength.' },
  { name: 'Human Flag Progression', category: 'core', difficulty_level: 8,
    instructions: 'Side lever hold on vertical pole. One of the most impressive core strength demonstrations.' },
  { name: 'Front Lever', category: 'core', difficulty_level: 9,
    instructions: 'Horizontal body position hanging from bar. Incredible core and pulling strength required.' },

  // MOBILITY & SKILLS
  { name: 'Arm Circles', category: 'push', difficulty_level: 1,
    instructions: 'Large circles with arms. Forward and backward. Essential warm-up for shoulder health before upper body training.' },
  { name: 'Leg Swings', category: 'legs', difficulty_level: 1,
    instructions: 'Hold support, swing leg front-to-back and side-to-side. Dynamic warm-up for hip mobility.' },
  { name: 'Cat-Cow Stretch', category: 'core', difficulty_level: 1,
    instructions: 'On hands and knees, arch and round spine. Excellent mobility exercise for spine health.' },
  { name: 'Scapular Pull-ups', category: 'pull', difficulty_level: 1,
    instructions: 'Hang from bar, pull shoulder blades together without bending arms. Builds scapular strength for pulling.' },
  { name: 'Pike Walk', category: 'push', difficulty_level: 2,
    instructions: 'Walk hands forward from standing position to push-up, walk back. Dynamic full-body warm-up.' },
  { name: 'Handstand Wall Walk', category: 'push', difficulty_level: 5,
    instructions: 'Feet on wall, walk up toward handstand. Builds handstand strength and confidence safely.' },
  { name: 'Crow Pose', category: 'push', difficulty_level: 4,
    instructions: 'Balance on hands with knees on upper arms. Foundation skill for many advanced movements.' },
  { name: 'Bridge Hold', category: 'push', difficulty_level: 3,
    instructions: 'Arch back, hands and feet on ground. Builds back flexibility and strength. Foundation for back lever.' },
  { name: 'Frog Stand', category: 'push', difficulty_level: 3,
    instructions: 'Squat position, hands on ground, balance on hands. Easier version of crow pose for skill development.' }
];

async function expandExerciseDatabase() {
  console.log('🚀 Starting exercise database expansion...');
  
  try {
    // Check current count
    const { count: currentCount, error: countError } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error getting current count:', countError);
      return;
    }
    
    console.log(`📊 Current exercises in database: ${currentCount}`);
    
    // Insert new exercises in batches to avoid timeouts
    const BATCH_SIZE = 10;
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < NEW_EXERCISES.length; i += BATCH_SIZE) {
      const batch = NEW_EXERCISES.slice(i, i + BATCH_SIZE);
      
      console.log(`📤 Inserting batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(NEW_EXERCISES.length/BATCH_SIZE)}...`);
      
      for (const exercise of batch) {
        // Check if exercise already exists
        const { data: existing } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', exercise.name)
          .single();
          
        if (existing) {
          console.log(`⏭️  Skipping ${exercise.name} (already exists)`);
          skipped++;
          continue;
        }
        
        // Insert new exercise
        const { error } = await supabase
          .from('exercises')
          .insert(exercise);
          
        if (error) {
          console.error(`❌ Error inserting ${exercise.name}:`, error);
        } else {
          console.log(`✅ Added: ${exercise.name} (${exercise.category}, level ${exercise.difficulty_level})`);
          inserted++;
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Get final count
    const { count: finalCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });
    
    console.log('\\n🎉 Exercise expansion complete!');
    console.log(`📊 Total exercises: ${finalCount}`);
    console.log(`➕ New exercises added: ${inserted}`);
    console.log(`⏭️  Exercises skipped: ${skipped}`);
    
    // Show breakdown by category
    const { data: breakdown } = await supabase
      .from('exercises')
      .select('category, difficulty_level')
      .order('category')
      .order('difficulty_level');
      
    if (breakdown) {
      const stats = breakdown.reduce((acc, ex) => {
        acc[ex.category] = (acc[ex.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\\n📈 Breakdown by category:');
      Object.entries(stats).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} exercises`);
      });
    }
    
  } catch (error) {
    console.error('❌ Expansion failed:', error);
  }
}

// Run the expansion
expandExerciseDatabase();