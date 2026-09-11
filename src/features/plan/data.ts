export interface TrainingExercise {
  day: string
  schedule: string
  planPeriod: string
  focus: string
  exercise: string
  workingSet: string
  targetReps: string
  sets: string
  progression: string
}
export interface RunningWeek {
  week: number
  dateRange: string
  daysPerWeek: string
  runDays: string
  structure: string
  targetDistance: string
  notes?: string
}
export interface NutritionItem { food: string; unit: string; proteinG: number; calories: number }
export interface MenuRow { meal: string; food: string; qty: number; proteinG: number; calories: number }
export interface PhaseTarget { phase: string; weeks: string; dateRange: string; startWeightKg: number; bmr: number; tdee: number; deficit: number; targetIntake: number; proteinTargetG: number }
export interface WeeklyTarget { week: number; weekEndingDate: string; targetWeightKg: number; weeklyLossKg: number }

export const trainingExercises: TrainingExercise[] = [
  {day:'Mon',schedule:'Every Monday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Chest + Triceps + Core',exercise:'Machine chest press',workingSet:'15–20kg',targetReps:'8–12',sets:'3–4',progression:'At 15 reps for all sets, add 2.5–5kg on machines or 2.5kg dumbbells. Low-energy day: 10 reps, same weight.'},
  {day:'Mon',schedule:'Every Monday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Chest + Triceps + Core',exercise:'Chest fly (machine/cable)',workingSet:'As feels',targetReps:'10–12',sets:'3',progression:'Progress gradually; low-energy day: 10 reps, same weight.'},
  {day:'Mon',schedule:'Every Monday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Chest + Triceps + Core',exercise:'Triceps pushdown',workingSet:'As feels',targetReps:'10–12',sets:'3',progression:'Progress gradually; low-energy day: 10 reps, same weight.'},
  {day:'Mon',schedule:'Every Monday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Chest + Triceps + Core',exercise:'Core: leg raises',workingSet:'Bodyweight',targetReps:'12–15',sets:'3',progression:'Add ankle weight once easy.'},
  {day:'Mon',schedule:'Every Monday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Chest + Triceps + Core',exercise:'Core: crunches',workingSet:'Bodyweight',targetReps:'15–20',sets:'3',progression:'Slow controlled tempo.'},
  {day:'Tue',schedule:'Every Tuesday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Back + Biceps',exercise:'Lat pulldown',workingSet:'30–40kg',targetReps:'8–12',sets:'3–4',progression:'At 15 reps for all sets, add the next increment. Low-energy day: 10 reps, same weight.'},
  {day:'Tue',schedule:'Every Tuesday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Back + Biceps',exercise:'Seated cable row',workingSet:'25–35kg',targetReps:'8–12',sets:'3–4',progression:'At 15 reps for all sets, add the next increment. Low-energy day: 10 reps, same weight.'},
  {day:'Tue',schedule:'Every Tuesday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Back + Biceps',exercise:'Biceps curl',workingSet:'10kg',targetReps:'10–12',sets:'3–4',progression:'At 15 reps for all sets, add the next increment. Low-energy day: 10 reps, same weight.'},
  {day:'Wed',schedule:'Every Wednesday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Shoulders + Core',exercise:'Shoulder press',workingSet:'7.5–10kg',targetReps:'8–12',sets:'3–4',progression:'At 15 reps for all sets, add the next increment. Low-energy day: 10 reps, same weight.'},
  {day:'Wed',schedule:'Every Wednesday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Shoulders + Core',exercise:'Lateral raise',workingSet:'Light dumbbell',targetReps:'12–15',sets:'3',progression:'At 15 reps for all sets, add the next increment. Low-energy day: 10 reps, same weight.'},
  {day:'Wed',schedule:'Every Wednesday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Shoulders + Core',exercise:'Core: leg raises + crunches',workingSet:'Bodyweight',targetReps:'12–15',sets:'3',progression:'Slow controlled tempo.'},
  {day:'Thu',schedule:'Every Thursday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Legs (no evening run)',exercise:'Smith machine squat',workingSet:'40kg',targetReps:'8–10',sets:'4',progression:'At 15 reps for all sets, add the next increment. Low-energy day: 10 reps, same weight.'},
  {day:'Thu',schedule:'Every Thursday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Legs (no evening run)',exercise:'Leg press',workingSet:'40–60kg',targetReps:'10–12',sets:'3–4',progression:'At 15 reps for all sets, add the next increment. Low-energy day: 10 reps, same weight.'},
  {day:'Thu',schedule:'Every Thursday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Legs (no evening run)',exercise:'Leg curl/extension',workingSet:'Light',targetReps:'12–15',sets:'3',progression:'New addition — start light.'},
  {day:'Fri',schedule:'Every Friday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Full body + Core',exercise:'Chest press + lat pulldown superset',workingSet:'Same as Mon/Tue',targetReps:'10–12',sets:'3',progression:'At 15 reps for all sets, add the next increment. Low-energy day: 10 reps, same weight.'},
  {day:'Fri',schedule:'Every Friday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Full body + Core',exercise:'Biceps + triceps superset',workingSet:'Same as above',targetReps:'10–12',sets:'3',progression:'At 15 reps for all sets, add the next increment. Low-energy day: 10 reps, same weight.'},
  {day:'Fri',schedule:'Every Friday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Full body + Core',exercise:'Core: leg raises + crunches',workingSet:'Bodyweight',targetReps:'12–15',sets:'3',progression:'Slow controlled tempo.'},
  {day:'Sat',schedule:'Every Saturday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Active recovery / light full body + Core',exercise:'Light full-body machine circuit',workingSet:'Light',targetReps:'12–15',sets:'2–3',progression:'Keep light; this is a recovery day.'},
  {day:'Sat',schedule:'Every Saturday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Active recovery / light full body + Core',exercise:'Core: plank hold',workingSet:'Bodyweight',targetReps:'20–40 sec',sets:'3',progression:'Build hold time weekly.'},
  {day:'Sun',schedule:'Every Sunday',planPeriod:'08 Sep 2026 – 31 Jan 2027',focus:'Rest',exercise:'Full rest — no lifting',workingSet:'—',targetReps:'—',sets:'—',progression:'Walk if you feel like it; nothing structured.'},
]

export const runningWeeks: RunningWeek[] = [
  [1,'08-Sep to 14-Sep','3x','Mon / Wed / Fri','Jog 2min / walk 1min × 6–7 rounds','3.5–4 km','Skip evening run if legs day (Thu) energy carries over'],
  [2,'15-Sep to 21-Sep','3x','Mon / Wed / Fri','Jog 2.5min / walk 1min × 6–7 rounds','4–4.5 km'],
  [3,'22-Sep to 28-Sep','3x','Mon / Wed / Fri','Jog 3min / walk 1min × 6 rounds','4.5–5 km'],
  [4,'29-Sep to 05-Oct','3x','Mon / Wed / Fri','Jog 4min / walk 1min × 5 rounds','5–5.5 km'],
  [5,'06-Oct to 12-Oct','4x','Mon / Wed / Fri / Sat','Jog 5min / walk 1min × 4–5 rounds','5.5–6 km','Never on Thu (leg day).'],
  [6,'13-Oct to 19-Oct','4x','Mon / Wed / Fri / Sat','Jog 6min / walk 1min × 4 rounds','5.5–6 km'],
  [7,'20-Oct to 26-Oct','4x','Mon / Wed / Fri / Sat','Jog 8min / walk 1min × 3 rounds','6–6.5 km'],
  [8,'27-Oct to 02-Nov','4x','Mon / Wed / Fri / Sat','Jog 10min / walk 1min × 2–3 rounds','6–6.5 km'],
  [9,'03-Nov to 09-Nov','4x','Mon / Wed / Fri / Sat','Continuous jog 15min + easy 10min','6.5–7 km'],
  [10,'10-Nov to 16-Nov','4x','Mon / Wed / Fri / Sat','Continuous jog 20min + easy walk','6.5–7 km'],
  [11,'17-Nov to 23-Nov','4x','Mon / Wed / Fri / Sat','Continuous jog 25min','7 km'],
  [12,'24-Nov to 30-Nov','4x','Mon / Wed / Fri / Sat','Continuous jog 25–28min, push pace slightly','7–7.5 km'],
  [13,'01-Dec to 07-Dec','4x','Mon / Wed / Fri / Sat','Continuous jog 28–30min','7.5 km','Add Tuesday once week 13–14 feels manageable; still skip Thu.'],
  [14,'08-Dec to 14-Dec','4x','Mon / Wed / Fri / Sat','Continuous jog 30min, steady pace','7.5–8 km'],
  [15,'15-Dec to 21-Dec','5x','Mon / Tue / Wed / Fri / Sat','Continuous jog 30min + 1× tempo effort','8 km'],
  [16,'22-Dec to 28-Dec','5x','Mon / Tue / Wed / Fri / Sat','Continuous jog 32–35min','8 km'],
  [17,'29-Dec to 04-Jan','5x','Mon / Tue / Wed / Fri / Sat','Continuous jog 35min','8–8.5 km'],
  [18,'05-Jan to 11-Jan','5x','Mon / Tue / Wed / Fri / Sat','Continuous jog 35min, one faster interval day','8.5 km'],
  [19,'12-Jan to 18-Jan','5x','Mon / Tue / Wed / Fri / Sat','Continuous jog 35–40min','8.5–9 km'],
  [20,'19-Jan to 25-Jan','5x','Mon / Tue / Wed / Fri / Sat','Deload: easy 20–25min only','5–6 km','Recover for final check-in'],
].map(([week,dateRange,daysPerWeek,runDays,structure,targetDistance,notes])=>({week,dateRange,daysPerWeek,runDays,structure,targetDistance,notes}))

export const nutritionItems: NutritionItem[] = [
  ['Banana','1 medium',1.3,105],['Egg, whole','1 egg',6,70],['Egg white only','1 egg white',3.6,17],['Brown bread slice','1 slice',3,80],
  ['Roti / chapati','1 medium',3,104],['Cooked rice','100g',2.7,130],['Chicken curry (cooked meat)','100g',23,165],['Fish curry (cooked)','100g',20,145],
  ['Whole milk (fresh/farm)','100ml',3.4,61],['Whey protein scoop (ON Gold Std)','1 scoop',24,120],['Curd / dahi','100g',3.5,60],['Roasted chana','30g pack',6,90],['Paneer','100g',18,265],
].map(([food,unit,proteinG,calories])=>({food,unit,proteinG,calories}))

export const trainingMenu: MenuRow[] = [
  ['Pre-gym','Banana',1,1.3,105],['Breakfast (post-gym)','Egg, whole',3,18,210],['Breakfast (post-gym)','Egg white only',1,3.6,17],['Breakfast (post-gym)','Brown bread slice',2,6,160],
  ['Lunch','Roti / chapati',3,9,312],['Lunch','Chicken curry (cooked meat)',2,46,330],['Afternoon snack','Roasted chana',1,6,90],['Afternoon snack','Egg, whole',1,6,70],
  ['Evening','Whole milk (fresh/farm)',5,17,305],['Evening','Whey protein scoop (ON Gold Std)',1,24,120],['Dinner','Roti / chapati',2,6,208],['Dinner','Fish curry (cooked)',1.5,30,217.5],['Dinner','Curd / dahi',1,3.5,60],
].map(([meal,food,qty,proteinG,calories])=>({meal,food,qty,proteinG,calories}))
export const restMenu: MenuRow[] = [
  ['Breakfast','Egg, whole',3,18,210],['Breakfast','Egg white only',2,7.2,34],['Breakfast','Brown bread slice',1,3,80],['Lunch','Roti / chapati',2,6,208],
  ['Lunch','Chicken curry (cooked meat)',2.5,57.5,412.5],['Afternoon snack','Curd / dahi',1,3.5,60],['Afternoon snack','Roasted chana',1,6,90],
  ['Evening','Whole milk (fresh/farm)',5,17,305],['Evening','Whey protein scoop (ON Gold Std)',1,24,120],['Dinner','Roti / chapati',2,6,208],['Dinner','Fish curry (cooked)',1.5,30,217.5],
].map(([meal,food,qty,proteinG,calories])=>({meal,food,qty,proteinG,calories}))
export const phaseTargets: PhaseTarget[] = [
  ['Phase 1 — Foundation','Wk 1–4','08-Sep to 05-Oct',90,1901.25,2946.94,650,2296.94,180],
  ['Phase 2 — Build','Wk 5–12','06-Oct to 01-Dec',87.6,1877.25,2909.74,800,2109.74,180],
  ['Phase 3 — Push','Wk 13–20','02-Dec to 31-Jan',81.6,1817.25,2816.74,750,2066.74,180],
].map(([phase,weeks,dateRange,startWeightKg,bmr,tdee,deficit,targetIntake,proteinTargetG])=>({phase,weeks,dateRange,startWeightKg,bmr,tdee,deficit,targetIntake,proteinTargetG}))

export const weeklyTargets: WeeklyTarget[] = [
  [0,'2026-09-08',90,0],[1,'2026-09-15',89.4,.6],[2,'2026-09-22',88.8,.6],[3,'2026-09-29',88.2,.6],[4,'2026-10-06',87.6,.6],
  [5,'2026-10-13',86.85,.75],[6,'2026-10-20',86.1,.75],[7,'2026-10-27',85.35,.75],[8,'2026-11-03',84.6,.75],[9,'2026-11-10',83.85,.75],
  [10,'2026-11-17',83.1,.75],[11,'2026-11-24',82.35,.75],[12,'2026-12-01',81.6,.75],[13,'2026-12-08',80.9,.7],[14,'2026-12-15',80.2,.7],
  [15,'2026-12-22',79.5,.7],[16,'2026-12-29',78.8,.7],[17,'2027-01-05',78.1,.7],[18,'2027-01-12',77.4,.7],[19,'2027-01-19',76.7,.7],[20,'2027-01-26',76,.7],
].map(([week,weekEndingDate,targetWeightKg,weeklyLossKg])=>({week,weekEndingDate,targetWeightKg,weeklyLossKg}))

export const planRules = [
  'Never run on Thursday (leg day).',
  'If a scheduled run clashes with low energy or poor sleep, move it to the next day rather than stacking two runs.',
  'Progress the jog interval only when the current interval feels comfortable.',
  'Gym progression: when 15 reps are achieved for all sets, add the next small increment.',
  'Low-energy gym day: reduce reps to 10 and keep the same weight.',
  'Diet examples are flexible templates; compare the day total with the active phase calorie/protein target.',
]
