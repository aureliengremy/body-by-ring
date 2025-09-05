-- ==========================================
-- Body by Rings - Exercise Database Expansion
-- Adding progression-based exercises for DAY 3
-- ==========================================

-- PUSH PROGRESSIONS (Adding missing beginner -> advanced progressions)
INSERT INTO exercises (name, category, difficulty_level, instructions, video_url) VALUES

-- Beginner Push Progressions (1-3)
('Wall Push-ups', 'push', 1, 'Stand arms length from wall. Place hands on wall at shoulder height. Push body toward wall and back. Perfect for absolute beginners to learn the pushing motion.', null),
('Incline Push-ups', 'push', 2, 'Hands on elevated surface (bench, chair, stairs). The higher the surface, the easier the exercise. Progress by lowering the incline over time.', null),
('Knee Push-ups', 'push', 2, 'Standard push-up position but on knees instead of toes. Keep straight line from knees to head. Focus on full range of motion.', null),

-- Intermediate Push Variations (4-6)  
('Diamond Push-ups', 'push', 4, 'Hands in diamond shape under chest. Emphasizes triceps more than regular push-ups. More challenging than standard push-ups.', null),
('Archer Push-ups', 'push', 6, 'Wide hand position. Lower to one side, keeping one arm straight. Builds unilateral strength for one-arm push-up progression.', null),
('Pseudo Planche Push-ups', 'push', 7, 'Hands positioned lower on torso, leaning forward. Builds planche strength. Advanced pushing movement requiring good wrist mobility.', null),

-- Advanced Push Skills (8-10)
('One-Arm Push-ups', 'push', 9, 'Ultimate push-up progression. Requires significant unilateral strength and stability. Work up through archer push-ups first.', null),
('Planche Push-ups', 'push', 10, 'Push-ups in planche position (feet off ground). Extremely advanced skill requiring years of progressive training.', null),

-- PULL PROGRESSIONS (Adding missing beginner -> advanced progressions)

-- Beginner Pull Progressions (1-3)
('Dead Hang', 'pull', 1, 'Simply hang from bar with good grip. Build grip strength and shoulder stability. Foundation for all pulling movements.', null),
('Assisted Pull-ups (Band)', 'pull', 2, 'Use resistance band for assistance. Focus on full range of motion. Gradually reduce band assistance over time.', null),
('Negative Pull-ups', 'pull', 2, 'Start at top position, lower slowly (3-5 seconds). Builds strength in lowering phase. Excellent for building pull-up strength.', null),
('Inverted Rows (Table)', 'pull', 2, 'Lie under sturdy table, pull chest to table edge. Easier than ring rows. Use feet position to adjust difficulty.', null),

-- Intermediate Pull Variations (4-6)
('Wide-Grip Pull-ups', 'pull', 5, 'Hands wider than shoulder-width. Emphasizes lats more. Slightly harder than regular pull-ups.', null),
('Commando Pull-ups', 'pull', 6, 'Pull up to one side of bar, lower, then pull to other side. Builds unilateral strength and core stability.', null),
('L-sit Pull-ups', 'pull', 7, 'Pull-ups while holding L-sit position. Combines pulling strength with core strength. Very challenging.', null),

-- Advanced Pull Skills (8-10) 
('Weighted Pull-ups', 'pull', 8, 'Add weight via belt or vest. Progressive overload for strength building. Start with 5-10lbs additional weight.', null),
('One-Arm Pull-ups', 'pull', 10, 'Ultimate pulling goal. Requires exceptional strength. Progress through archer pull-ups and assisted one-arm work.', null),

-- LEGS PROGRESSIONS (Adding missing progressions)

-- Beginner Legs (1-3)
('Wall Sit', 'legs', 1, 'Back against wall, slide down until thighs parallel to ground. Hold position. Builds quad endurance and strength.', null),
('Assisted Squats', 'legs', 1, 'Hold onto sturdy object for balance. Focus on proper squat form. Great for mobility and strength building.', null),
('Step-ups', 'legs', 2, 'Step onto elevated surface, step down with control. Use higher surface for more difficulty. Builds single-leg strength.', null),
('Calf Raises', 'legs', 2, 'Rise onto balls of feet, lower with control. Can be done single-leg for more difficulty. Builds calf strength.', null),

-- Intermediate Legs (4-6)
('Jump Squats', 'legs', 4, 'Explosive squat with jump at top. Land softly and immediately descend into next rep. Builds power and conditioning.', null),
('Bulgarian Split Squats', 'legs', 4, 'Rear foot elevated, single-leg squat. Excellent for building unilateral leg strength and balance.', null),
('Single-Leg Glute Bridges', 'legs', 5, 'Bridge position with one leg extended. Builds glute strength and hip stability. Foundation for pistol squats.', null),
('Shrimp Squats', 'legs', 8, 'Single-leg squat holding other leg behind. More challenging than pistol squat. Requires excellent balance and flexibility.', null),

-- Advanced Legs (7-10)
('Jump Pistol Squats', 'legs', 9, 'Explosive pistol squat with jump. Extremely challenging power movement. Master regular pistols first.', null),
('Dragon Squats', 'legs, 10', 'Single-leg squat with other leg extended high. Most challenging single-leg squat variation.', null),

-- CORE PROGRESSIONS (Adding missing progressions)

-- Beginner Core (1-3)
('Dead Bug', 'core', 1, 'Lie on back, arms up, knees at 90°. Lower opposite arm and leg slowly. Excellent for core stability and coordination.', null),
('Hollow Body Hold', 'core', 2, 'Lie on back, press lower back to ground, lift shoulders and legs. Foundation for many advanced core movements.', null),
('Side Plank', 'core', 3, 'Plank on one side, body in straight line. Hold position. Builds lateral core strength often neglected.', null),

-- Intermediate Core (4-6)
('Hanging Knee Raises', 'core', 4, 'Hang from bar, lift knees to chest. Control the movement. Builds hanging core strength for advanced moves.', null),
('V-ups', 'core', 4, 'Lie flat, simultaneously lift chest and legs to touch toes. Dynamic core strengthening movement.', null),
('L-sit Progression (Tuck)', 'core, 5', 'Support body weight on hands, knees tucked to chest. Progress toward full L-sit by extending legs.', null),

-- Advanced Core (7-10)
('Hanging Leg Raises', 'core', 7, 'Hang from bar, lift straight legs to horizontal. Requires significant core and grip strength.', null),
('Human Flag Progression', 'core', 8, 'Side lever hold on vertical pole. One of the most impressive core strength demonstrations.', null),
('Front Lever', 'core', 9, 'Horizontal body position hanging from bar. Incredible core and pulling strength required.', null),
('Planche Lean', 'core', 6, 'Lean forward in push-up position, shift weight to hands. Foundation for planche training.', null),

-- MOBILITY & WARM-UP EXERCISES
('Arm Circles', 'push', 1, 'Large circles with arms. Forward and backward. Essential warm-up for shoulder health before upper body training.', null),
('Leg Swings', 'legs', 1, 'Hold support, swing leg front-to-back and side-to-side. Dynamic warm-up for hip mobility.', null),
('Cat-Cow Stretch', 'core', 1, 'On hands and knees, arch and round spine. Excellent mobility exercise for spine health.', null),
('Scapular Pull-ups', 'pull', 1, 'Hang from bar, pull shoulder blades together without bending arms. Builds scapular strength for pulling.', null),
('Pike Walk', 'push', 2, 'Walk hands forward from standing position to push-up, walk back. Dynamic full-body warm-up.', null),

-- SKILL PROGRESSIONS  
('Handstand Wall Walk', 'push', 5, 'Feet on wall, walk up toward handstand. Builds handstand strength and confidence safely.', null),
('Crow Pose', 'push', 4, 'Balance on hands with knees on upper arms. Foundation skill for many advanced movements.', null),
('Bridge Hold', 'push', 3, 'Arch back, hands and feet on ground. Builds back flexibility and strength. Foundation for back lever.', null),
('Frog Stand', 'push', 3, 'Squat position, hands on ground, balance on hands. Easier version of crow pose for skill development.', null);

-- Update existing exercises with better instructions
UPDATE exercises SET instructions = 'Start in push-up position. Lower body as one unit until chest nearly touches ground. Keep elbows at 45° angle to body. Press back up maintaining straight body line from head to heels. Focus on controlled movement both up and down.' WHERE name = 'Push-ups';

UPDATE exercises SET instructions = 'Start in downward dog position (inverted V). Hands shoulder-width apart. Lower head toward ground between hands, keeping legs straight. Press back to starting position. Builds overhead pressing strength.' WHERE name = 'Pike Push-ups';

UPDATE exercises SET instructions = 'Hang from pull-up bar with overhand grip, hands shoulder-width apart. Pull body up until chin clears bar. Lower with control to full hang. Focus on pulling with back muscles, not just arms.' WHERE name = 'Pull-ups';

UPDATE exercises SET instructions = 'Similar to pull-up but with underhand (supinated) grip. Generally easier than pull-ups due to greater bicep involvement. Excellent progression toward regular pull-ups.' WHERE name = 'Chin-ups';

UPDATE exercises SET instructions = 'Set rings at appropriate height. Lean back, body straight, pull chest to rings. Adjust difficulty by changing body angle - more upright is easier, more horizontal is harder.' WHERE name = 'Ring Rows';

UPDATE exercises SET instructions = 'Stand with feet hip-width apart. Lower body by pushing hips back and bending knees. Descend until thighs parallel to ground. Drive through heels to return to start. Keep chest up throughout movement.' WHERE name = 'Squats';

UPDATE exercises SET instructions = 'Stand on one leg, extend other leg forward. Lower body until rear touches heel, keeping extended leg straight. Drive through standing leg to return to start. Extremely challenging single-leg movement.' WHERE name = 'Pistol Squats';

UPDATE exercises SET instructions = 'Start in forearm or straight-arm plank position. Keep body in straight line from head to heels. Engage core, avoid sagging hips or raised butt. Breathe normally while holding position.' WHERE name = 'Plank';

UPDATE exercises SET instructions = 'Sit with legs extended, hands beside hips. Press down to lift body, keeping legs parallel to ground. Advanced core strength exercise. Progress through tucked L-sit first.' WHERE name = 'L-sit';

-- ==========================================
-- Exercise count should now be ~60 exercises
-- Covering complete progression paths from beginner to advanced
-- ==========================================