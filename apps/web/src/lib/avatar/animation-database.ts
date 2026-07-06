'use client';

export interface AnimationEntry {
  id: string;
  name: string;
  arabicName: string;
  category: 'greeting' | 'common' | 'question' | 'emergency' | 'medical' | 'numbers' | 'letters' | 'emotion' | 'daily';
  glbPath: string;
  duration: number;
  fps: number;
  handShape: string;
  motion: string;
  tags: string[];
  available: boolean;
}

export interface FingerspellingEntry {
  letter: string;
  glbPath: string;
  duration: number;
}

export const ANIMATION_DATABASE: AnimationEntry[] = [
  { id: 'hello', name: 'Hello', arabicName: 'مرحبا', category: 'greeting', glbPath: '/animations/gestures/hello.glb', duration: 1.2, fps: 30, handShape: 'open', motion: 'wave', tags: ['greeting', 'hi', 'hey'], available: false },
  { id: 'thank_you', name: 'Thank You', arabicName: 'شكرا', category: 'greeting', glbPath: '/animations/gestures/thank_you.glb', duration: 1.0, fps: 30, handShape: 'flat', motion: 'chin_to_out', tags: ['thanks', 'grateful'], available: false },
  { id: 'good_morning', name: 'Good Morning', arabicName: 'صباح الخير', category: 'greeting', glbPath: '/animations/gestures/good_morning.glb', duration: 1.5, fps: 30, handShape: 'open', motion: 'arc', tags: ['morning', 'am'], available: false },
  { id: 'goodbye', name: 'Goodbye', arabicName: 'مع السلامة', category: 'greeting', glbPath: '/animations/gestures/goodbye.glb', duration: 1.2, fps: 30, handShape: 'open', motion: 'wave', tags: ['bye', 'see you'], available: false },
  { id: 'please', name: 'Please', arabicName: 'من فضلك', category: 'common', glbPath: '/animations/gestures/please.glb', duration: 1.0, fps: 30, handShape: 'flat', motion: 'chest_circle', tags: ['request', 'kindly'], available: false },
  { id: 'yes', name: 'Yes', arabicName: 'نعم', category: 'common', glbPath: '/animations/gestures/yes.glb', duration: 0.8, fps: 30, handShape: 'fist', motion: 'nod', tags: ['affirm', 'correct'], available: false },
  { id: 'no', name: 'No', arabicName: 'لا', category: 'common', glbPath: '/animations/gestures/no.glb', duration: 0.8, fps: 30, handShape: 'open', motion: 'side_shake', tags: ['deny', 'negative'], available: false },
  { id: 'help', name: 'Help', arabicName: 'مساعدة', category: 'emergency', glbPath: '/animations/gestures/help.glb', duration: 1.0, fps: 30, handShape: 'fist_on_flat', motion: 'lift', tags: ['assist', 'aid'], available: false },
  { id: 'water', name: 'Water', arabicName: 'ماء', category: 'daily', glbPath: '/animations/gestures/water.glb', duration: 0.9, fps: 30, handShape: 'w', motion: 'chin_tap', tags: ['drink', 'thirsty'], available: false },
  { id: 'food', name: 'Food', arabicName: 'طعام', category: 'daily', glbPath: '/animations/gestures/food.glb', duration: 0.9, fps: 30, handShape: 'flat', motion: 'mouth_tap', tags: ['eat', 'hungry'], available: false },
  { id: 'hospital', name: 'Hospital', arabicName: 'مستشفى', category: 'medical', glbPath: '/animations/gestures/hospital.glb', duration: 1.2, fps: 30, handShape: 'h', motion: 'cross', tags: ['medical', 'doctor', 'clinic'], available: false },
  { id: 'doctor', name: 'Doctor', arabicName: 'طبيب', category: 'medical', glbPath: '/animations/gestures/doctor.glb', duration: 1.0, fps: 30, handShape: 'flat', motion: 'wrist_tap', tags: ['physician', 'medic'], available: false },
  { id: 'school', name: 'School', arabicName: 'مدرسة', category: 'daily', glbPath: '/animations/gestures/school.glb', duration: 1.1, fps: 30, handShape: 'open', motion: 'clap', tags: ['education', 'learn', 'class'], available: false },
  { id: 'go', name: 'Go', arabicName: 'اذهب', category: 'common', glbPath: '/animations/gestures/go.glb', duration: 0.8, fps: 30, handShape: 'point', motion: 'forward', tags: ['move', 'leave', 'depart'], available: false },
  { id: 'come', name: 'Come', arabicName: 'تعال', category: 'common', glbPath: '/animations/gestures/come.glb', duration: 0.8, fps: 30, handShape: 'open', motion: 'beckon', tags: ['approach', 'here'], available: false },
  { id: 'i', name: 'I', arabicName: 'أنا', category: 'common', glbPath: '/animations/gestures/i.glb', duration: 0.6, fps: 30, handShape: 'point', motion: 'self', tags: ['me', 'myself'], available: false },
  { id: 'you', name: 'You', arabicName: 'أنت', category: 'common', glbPath: '/animations/gestures/you.glb', duration: 0.6, fps: 30, handShape: 'point', motion: 'forward_point', tags: ['yourself'], available: false },
  { id: 'what', name: 'What', arabicName: 'ماذا', category: 'question', glbPath: '/animations/gestures/what.glb', duration: 0.8, fps: 30, handShape: 'open', motion: 'shake', tags: ['which', 'query'], available: false },
  { id: 'where', name: 'Where', arabicName: 'أين', category: 'question', glbPath: '/animations/gestures/where.glb', duration: 0.9, fps: 30, handShape: 'point', motion: 'side_to_side', tags: ['location', 'place'], available: false },
  { id: 'when', name: 'When', arabicName: 'متى', category: 'question', glbPath: '/animations/gestures/when.glb', duration: 0.9, fps: 30, handShape: 'flat', motion: 'chin_stroke', tags: ['time', 'date'], available: false },
  { id: 'how', name: 'How', arabicName: 'كيف', category: 'question', glbPath: '/animations/gestures/how.glb', duration: 0.9, fps: 30, handShape: 'curved', motion: 'roll', tags: ['method', 'way'], available: false },
  { id: 'good', name: 'Good', arabicName: 'جيد', category: 'emotion', glbPath: '/animations/gestures/good.glb', duration: 0.8, fps: 30, handShape: 'flat', motion: 'thumbs_up', tags: ['well', 'fine', 'nice'], available: false },
  { id: 'bad', name: 'Bad', arabicName: 'سيء', category: 'emotion', glbPath: '/animations/gestures/bad.glb', duration: 0.8, fps: 30, handShape: 'flat', motion: 'thumbs_down', tags: ['poor', 'terrible'], available: false },
  { id: 'sorry', name: 'Sorry', arabicName: 'آسف', category: 'emotion', glbPath: '/animations/gestures/sorry.glb', duration: 1.0, fps: 30, handShape: 'fist', motion: 'chest_circle', tags: ['apologize', 'forgive'], available: false },
  { id: 'name', name: 'Name', arabicName: 'اسم', category: 'common', glbPath: '/animations/gestures/name.glb', duration: 0.9, fps: 30, handShape: 'flat', motion: 'tap', tags: ['call', 'called'], available: false },
  { id: 'today', name: 'Today', arabicName: 'اليوم', category: 'daily', glbPath: '/animations/gestures/today.glb', duration: 0.8, fps: 30, handShape: 'y', motion: 'down', tags: ['now', 'this day'], available: false },
  { id: 'tomorrow', name: 'Tomorrow', arabicName: 'غدا', category: 'daily', glbPath: '/animations/gestures/tomorrow.glb', duration: 0.9, fps: 30, handShape: 'flat', motion: 'forward', tags: ['next day'], available: false },
  { id: 'yesterday', name: 'Yesterday', arabicName: 'امس', category: 'daily', glbPath: '/animations/gestures/yesterday.glb', duration: 0.9, fps: 30, handShape: 'flat', motion: 'backward', tags: ['last day'], available: false },
  { id: 'love', name: 'Love', arabicName: 'حب', category: 'emotion', glbPath: '/animations/gestures/love.glb', duration: 1.0, fps: 30, handShape: 'crossed', motion: 'hug_self', tags: ['like', 'adore'], available: false },
  { id: 'work', name: 'Work', arabicName: 'عمل', category: 'daily', glbPath: '/animations/gestures/work.glb', duration: 0.9, fps: 30, handShape: 'fist', motion: 'tap', tags: ['job', 'labor'], available: false },
  { id: 'time', name: 'Time', arabicName: 'وقت', category: 'daily', glbPath: '/animations/gestures/time.glb', duration: 0.8, fps: 30, handShape: 'point', motion: 'wrist_tap', tags: ['hour', 'clock'], available: false },
  { id: 'family', name: 'Family', arabicName: 'عائلة', category: 'common', glbPath: '/animations/gestures/family.glb', duration: 1.1, fps: 30, handShape: 'f', motion: 'circle', tags: ['relative', 'home'], available: false },
  { id: 'friend', name: 'Friend', arabicName: 'صديق', category: 'common', glbPath: '/animations/gestures/friend.glb', duration: 1.0, fps: 30, handShape: 'interlock', motion: 'shake', tags: ['buddy', 'pal'], available: false },
  { id: 'happy', name: 'Happy', arabicName: 'سعيد', category: 'emotion', glbPath: '/animations/gestures/happy.glb', duration: 1.0, fps: 30, handShape: 'flat', motion: 'chest_stroke', tags: ['joy', 'glad'], available: false },
  { id: 'sad', name: 'Sad', arabicName: 'حزين', category: 'emotion', glbPath: '/animations/gestures/sad.glb', duration: 1.0, fps: 30, handShape: 'flat', motion: 'face_stroke', tags: ['unhappy', 'upset'], available: false },
  { id: 'need', name: 'Need', arabicName: 'احتاج', category: 'common', glbPath: '/animations/gestures/need.glb', duration: 0.8, fps: 30, handShape: 'curved', motion: 'pull', tags: ['want', 'require'], available: false },
  { id: 'know', name: 'Know', arabicName: 'اعرف', category: 'common', glbPath: '/animations/gestures/know.glb', duration: 0.7, fps: 30, handShape: 'flat', motion: 'forehead_tap', tags: ['understand', 'aware'], available: false },
  { id: 'think', name: 'Think', arabicName: 'افكر', category: 'common', glbPath: '/animations/gestures/think.glb', duration: 0.9, fps: 30, handShape: 'point', motion: 'temple_tap', tags: ['consider', 'ponder'], available: false },
  { id: 'want', name: 'Want', arabicName: 'اريد', category: 'common', glbPath: '/animations/gestures/want.glb', duration: 0.7, fps: 30, handShape: 'curved', motion: 'pull', tags: ['desire', 'wish'], available: false },
  { id: 'like', name: 'Like', arabicName: 'احب', category: 'emotion', glbPath: '/animations/gestures/like.glb', duration: 0.8, fps: 30, handShape: 'thumb_up', motion: 'chest_tap', tags: ['enjoy', 'prefer'], available: false },
  { id: 'see', name: 'See', arabicName: 'ارى', category: 'common', glbPath: '/animations/gestures/see.glb', duration: 0.7, fps: 30, handShape: 'v', motion: 'eyes_to_out', tags: ['look', 'view', 'watch'], available: false },
  { id: 'hear', name: 'Hear', arabicName: 'اسمع', category: 'common', glbPath: '/animations/gestures/hear.glb', duration: 0.7, fps: 30, handShape: 'cup', motion: 'ear_tap', tags: ['listen', 'sound'], available: false },
  { id: 'speak', name: 'Speak', arabicName: 'تكلم', category: 'common', glbPath: '/animations/gestures/speak.glb', duration: 0.8, fps: 30, handShape: 'flat', motion: 'mouth_circle', tags: ['talk', 'say', 'tell'], available: false },
  { id: 'read', name: 'Read', arabicName: 'اقرأ', category: 'common', glbPath: '/animations/gestures/read.glb', duration: 0.9, fps: 30, handShape: 'v', motion: 'palm_scan', tags: ['book', 'study'], available: false },
  { id: 'write', name: 'Write', arabicName: 'اكتب', category: 'common', glbPath: '/animations/gestures/write.glb', duration: 0.9, fps: 30, handShape: 'pen', motion: 'write', tags: ['pen', 'paper'], available: false },
  { id: 'eat', name: 'Eat', arabicName: 'اكل', category: 'daily', glbPath: '/animations/gestures/eat.glb', duration: 0.8, fps: 30, handShape: 'flat', motion: 'mouth_tap', tags: ['food', 'meal'], available: false },
  { id: 'drink', name: 'Drink', arabicName: 'شرب', category: 'daily', glbPath: '/animations/gestures/drink.glb', duration: 0.8, fps: 30, handShape: 'cup', motion: 'mouth_tilt', tags: ['water', 'beverage'], available: false },
  { id: 'sleep', name: 'Sleep', arabicName: 'نوم', category: 'daily', glbPath: '/animations/gestures/sleep.glb', duration: 1.0, fps: 30, handShape: 'flat', motion: 'head_tilt', tags: ['rest', 'night'], available: false },
  { id: 'one', name: 'One', arabicName: 'واحد', category: 'numbers', glbPath: '/animations/gestures/one.glb', duration: 0.5, fps: 30, handShape: 'index', motion: 'hold', tags: ['1', 'first'], available: false },
  { id: 'two', name: 'Two', arabicName: 'اثنان', category: 'numbers', glbPath: '/animations/gestures/two.glb', duration: 0.5, fps: 30, handShape: 'v', motion: 'hold', tags: ['2', 'second'], available: false },
  { id: 'three', name: 'Three', arabicName: 'ثلاثة', category: 'numbers', glbPath: '/animations/gestures/three.glb', duration: 0.5, fps: 30, handShape: 'three', motion: 'hold', tags: ['3', 'third'], available: false },
];

export const FINGERSPELLING_DATABASE: FingerspellingEntry[] = [
  { letter: 'A', glbPath: '/animations/fingerspelling/a.glb', duration: 0.4 },
  { letter: 'B', glbPath: '/animations/fingerspelling/b.glb', duration: 0.4 },
  { letter: 'C', glbPath: '/animations/fingerspelling/c.glb', duration: 0.4 },
  { letter: 'D', glbPath: '/animations/fingerspelling/d.glb', duration: 0.4 },
  { letter: 'E', glbPath: '/animations/fingerspelling/e.glb', duration: 0.4 },
  { letter: 'F', glbPath: '/animations/fingerspelling/f.glb', duration: 0.4 },
  { letter: 'G', glbPath: '/animations/fingerspelling/g.glb', duration: 0.4 },
  { letter: 'H', glbPath: '/animations/fingerspelling/h.glb', duration: 0.4 },
  { letter: 'I', glbPath: '/animations/fingerspelling/i.glb', duration: 0.4 },
  { letter: 'J', glbPath: '/animations/fingerspelling/j.glb', duration: 0.5 },
  { letter: 'K', glbPath: '/animations/fingerspelling/k.glb', duration: 0.4 },
  { letter: 'L', glbPath: '/animations/fingerspelling/l.glb', duration: 0.4 },
  { letter: 'M', glbPath: '/animations/fingerspelling/m.glb', duration: 0.4 },
  { letter: 'N', glbPath: '/animations/fingerspelling/n.glb', duration: 0.4 },
  { letter: 'O', glbPath: '/animations/fingerspelling/o.glb', duration: 0.4 },
  { letter: 'P', glbPath: '/animations/fingerspelling/p.glb', duration: 0.4 },
  { letter: 'Q', glbPath: '/animations/fingerspelling/q.glb', duration: 0.4 },
  { letter: 'R', glbPath: '/animations/fingerspelling/r.glb', duration: 0.4 },
  { letter: 'S', glbPath: '/animations/fingerspelling/s.glb', duration: 0.4 },
  { letter: 'T', glbPath: '/animations/fingerspelling/t.glb', duration: 0.4 },
  { letter: 'U', glbPath: '/animations/fingerspelling/u.glb', duration: 0.4 },
  { letter: 'V', glbPath: '/animations/fingerspelling/v.glb', duration: 0.4 },
  { letter: 'W', glbPath: '/animations/fingerspelling/w.glb', duration: 0.4 },
  { letter: 'X', glbPath: '/animations/fingerspelling/x.glb', duration: 0.4 },
  { letter: 'Y', glbPath: '/animations/fingerspelling/y.glb', duration: 0.4 },
  { letter: 'Z', glbPath: '/animations/fingerspelling/z.glb', duration: 0.5 },
];

const animationMap = new Map<string, AnimationEntry>();
const fingerspellingMap = new Map<string, FingerspellingEntry>();

for (const entry of ANIMATION_DATABASE) {
  animationMap.set(entry.id, entry);
  for (const tag of entry.tags) {
    animationMap.set(tag.toLowerCase(), entry);
  }
}

for (const entry of FINGERSPELLING_DATABASE) {
  fingerspellingMap.set(entry.letter, entry);
}

export function lookupGesture(token: string): AnimationEntry | null {
  const normalized = token.toLowerCase().trim().replace(/[_\s]+/g, '_');
  return animationMap.get(normalized) || null;
}

export function lookupFingerspelling(letter: string): FingerspellingEntry | null {
  return fingerspellingMap.get(letter.toUpperCase()) || null;
}

export function getAnimationsByCategory(category: AnimationEntry['category']): AnimationEntry[] {
  return ANIMATION_DATABASE.filter((e) => e.category === category);
}

export function getAllAnimationPaths(): string[] {
  return ANIMATION_DATABASE.map((e) => e.glbPath);
}

export function getFingerspellingPaths(): string[] {
  return FINGERSPELLING_DATABASE.map((e) => e.glbPath);
}
