'use client';

// ESL (Emirati Sign Language) sign database using Animics BML format
// BML = Behavior Markup Language for sign language animation

export interface SignEntry {
  gloss: string;
  english: string;
  handshape: string;
  movement: string;
  location: string;
  duration: number;
  nonManual?: string;
  hamnosys?: string;
  bml?: string;
}

// ESL signs with BML notation
export const ESL_SIGNS: Record<string, SignEntry> = {
  HELLO: {
    gloss: 'HELLO',
    english: 'Hello / Greetings',
    handshape: 'flat_hand',
    movement: 'wave',
    location: 'shoulder_height',
    duration: 1.2,
    nonManual: 'smile',
    bml: '<face id="smile" start="0" end="1.2"/><lhand start="0" end="1.2"><hand shape="flat" move="wave" loc="shoulder_r"/></lhand>',
  },
  THANK_YOU: {
    gloss: 'THANK_YOU',
    english: 'Thank you',
    handshape: 'flat_hand',
    movement: 'chin_to_forward',
    location: 'chin',
    duration: 1.0,
    nonManual: 'smile',
    bml: '<face id="smile" start="0" end="1.0"/><rhand start="0" end="1.0"><hand shape="flat" move="chin_forward" loc="chin"/></rhand>',
  },
  PLEASE: {
    gloss: 'PLEASE',
    english: 'Please',
    handshape: 'flat_hand',
    movement: 'chest_circle',
    location: 'chest',
    duration: 1.0,
    bml: '<rhand start="0" end="1.0"><hand shape="flat" move="circle" loc="chest"/></rhand>',
  },
  YES: {
    gloss: 'YES',
    english: 'Yes',
    handshape: 'fist',
    movement: 'nod',
    location: 'neutral',
    duration: 0.8,
    nonManual: 'nod',
    bml: '<head start="0" end="0.8"><movement type="nod"/></head><rhand start="0" end="0.8"><hand shape="fist" move="nod" loc="neutral"/></rhand>',
  },
  NO: {
    gloss: 'NO',
    english: 'No',
    handshape: 'flat_hand',
    movement: 'side_to_side',
    location: 'neutral',
    duration: 0.8,
    nonManual: 'frown',
    bml: '<face id="frown" start="0" end="0.8"/><rhand start="0" end="0.8"><hand shape="flat" move="shake" loc="neutral"/></rhand>',
  },
  HELP: {
    gloss: 'HELP',
    english: 'Help',
    handshape: 'flat_hand',
    movement: 'upward',
    location: 'chest',
    duration: 0.8,
    bml: '<rhand start="0" end="0.4"><hand shape="flat" move="up" loc="chest"/></rhand><lhand start="0" end="0.4"><hand shape="flat" move="up" loc="chest"/></lhand>',
  },
  GOOD: {
    gloss: 'GOOD',
    english: 'Good',
    handshape: 'thumbs_up',
    movement: 'forward',
    location: 'chest',
    duration: 0.8,
    nonManual: 'smile',
    bml: '<face id="smile" start="0" end="0.8"/><rhand start="0" end="0.8"><hand shape="thumbs_up" move="forward" loc="chest"/></rhand>',
  },
  I: {
    gloss: 'I',
    english: 'I / Me',
    handshape: 'point',
    movement: 'self',
    location: 'chest',
    duration: 0.6,
    bml: '<rhand start="0" end="0.6"><hand shape="point" move="self" loc="chest"/></rhand>',
  },
  YOU: {
    gloss: 'YOU',
    english: 'You',
    handshape: 'point',
    movement: 'forward',
    location: 'neutral',
    duration: 0.6,
    bml: '<rhand start="0" end="0.6"><hand shape="point" move="forward" loc="neutral"/></rhand>',
  },
  WHAT: {
    gloss: 'WHAT',
    english: 'What',
    handshape: 'open_palm',
    movement: 'shake',
    location: 'neutral',
    duration: 0.8,
    nonManual: 'brow_up',
    bml: '<face id="brow_up" start="0" end="0.8"/><rhand start="0" end="0.8"><hand shape="open_palm" move="shake" loc="neutral"/></rhand>',
  },
  WHERE: {
    gloss: 'WHERE',
    english: 'Where',
    handshape: 'open_palm',
    movement: 'side_to_side',
    location: 'neutral',
    duration: 0.8,
    nonManual: 'brow_up',
    bml: '<face id="brow_up" start="0" end="0.8"/><rhand start="0" end="0.8"><hand shape="open_palm" move="shake" loc="neutral"/></rhand>',
  },
  HOW: {
    gloss: 'HOW',
    english: 'How',
    handshape: 'open_palm',
    movement: 'circle',
    location: 'neutral',
    duration: 0.8,
    nonManual: 'brow_up',
    bml: '<face id="brow_up" start="0" end="0.8"/><rhand start="0" end="0.8"><hand shape="open_palm" move="circle" loc="neutral"/></rhand>',
  },
  SCHOOL: {
    gloss: 'SCHOOL',
    english: 'School',
    handshape: 'flat_hand',
    movement: 'clap',
    location: 'chest',
    duration: 0.8,
    bml: '<rhand start="0" end="0.4"><hand shape="flat" move="clap" loc="chest"/></rhand><lhand start="0" end="0.4"><hand shape="flat" move="clap" loc="chest"/></lhand>',
  },
  GO: {
    gloss: 'GO',
    english: 'Go',
    handshape: 'point',
    movement: 'forward',
    location: 'waist',
    duration: 0.6,
    bml: '<rhand start="0" end="0.6"><hand shape="point" move="forward" loc="waist"/></rhand>',
  },
  COME: {
    gloss: 'COME',
    english: 'Come',
    handshape: 'open_palm',
    movement: 'toward_self',
    location: 'waist',
    duration: 0.6,
    bml: '<rhand start="0" end="0.6"><hand shape="open_palm" move="toward" loc="waist"/></rhand>',
  },
  NAME: {
    gloss: 'NAME',
    english: 'Name',
    handshape: 'point',
    movement: 'tap',
    location: 'chest',
    duration: 0.6,
    bml: '<rhand start="0" end="0.3"><hand shape="point" move="tap" loc="chest"/></rhand>',
  },
  GOODBYE: {
    gloss: 'GOODBYE',
    english: 'Goodbye',
    handshape: 'flat_hand',
    movement: 'wave',
    location: 'shoulder_height',
    duration: 1.2,
    nonManual: 'smile',
    bml: '<face id="smile" start="0" end="1.2"/><rhand start="0" end="1.2"><hand shape="flat" move="wave" loc="shoulder_r"/></rhand>',
  },
  LOVE: {
    gloss: 'LOVE',
    english: 'Love',
    handshape: 'open_palm',
    movement: 'cross_chest',
    location: 'chest',
    duration: 1.0,
    nonManual: 'smile',
    bml: '<face id="smile" start="0" end="1.0"/><rhand start="0" end="1.0"><hand shape="open_palm" move="cross" loc="chest"/></rhand><lhand start="0" end="1.0"><hand shape="open_palm" move="cross" loc="chest"/></lhand>',
  },
  SORRY: {
    gloss: 'SORRY',
    english: 'Sorry',
    handshape: 'fist',
    movement: 'chest_circle',
    location: 'chest',
    duration: 1.0,
    nonManual: 'sad',
    bml: '<face id="sad" start="0" end="1.0"/><rhand start="0" end="1.0"><hand shape="fist" move="circle" loc="chest"/></rhand>',
  },
  FRIEND: {
    gloss: 'FRIEND',
    english: 'Friend',
    handshape: 'interlock',
    movement: 'hook',
    location: 'chest',
    duration: 0.8,
    nonManual: 'smile',
    bml: '<face id="smile" start="0" end="0.8"/><rhand start="0" end="0.8"><hand shape="hook" move="interlock" loc="chest"/></rhand><lhand start="0" end="0.8"><hand shape="hook" move="interlock" loc="chest"/></lhand>',
  },
  FAMILY: {
    gloss: 'FAMILY',
    english: 'Family',
    handshape: 'open_palm',
    movement: 'circle',
    location: 'chest',
    duration: 1.0,
    nonManual: 'smile',
    bml: '<face id="smile" start="0" end="1.0"/><rhand start="0" end="1.0"><hand shape="open_palm" move="circle" loc="chest"/></rhand>',
  },
  WORK: {
    gloss: 'WORK',
    english: 'Work',
    handshape: 'fist',
    movement: 'tap',
    location: 'wrist',
    duration: 0.6,
    bml: '<rhand start="0" end="0.3"><hand shape="fist" move="tap" loc="wrist"/></rhand>',
  },
  WATER: {
    gloss: 'WATER',
    english: 'Water',
    handshape: 'w_shape',
    movement: 'forward',
    location: 'chin',
    duration: 0.6,
    bml: '<rhand start="0" end="0.6"><hand shape="w" move="forward" loc="chin"/></rhand>',
  },
  FOOD: {
    gloss: 'FOOD',
    english: 'Food',
    handshape: 'flat_hand',
    movement: 'mouth',
    location: 'mouth',
    duration: 0.6,
    bml: '<rhand start="0" end="0.6"><hand shape="flat" move="mouth" loc="mouth"/></rhand>',
  },
  EAT: {
    gloss: 'EAT',
    english: 'Eat',
    handshape: 'flat_hand',
    movement: 'mouth_tap',
    location: 'mouth',
    duration: 0.6,
    bml: '<rhand start="0" end="0.6"><hand shape="flat" move="tap" loc="mouth"/></rhand>',
  },
  DRINK: {
    gloss: 'DRINK',
    english: 'Drink',
    handshape: 'cup',
    movement: 'mouth',
    location: 'mouth',
    duration: 0.6,
    bml: '<rhand start="0" end="0.6"><hand shape="cup" move="mouth" loc="mouth"/></rhand>',
  },
};

export function lookupESLSign(gloss: string): SignEntry | null {
  return ESL_SIGNS[gloss.toUpperCase()] || null;
}

export function getAllESLGlosses(): string[] {
  return Object.keys(ESL_SIGNS);
}

export function searchESLSigns(query: string): SignEntry[] {
  const q = query.toLowerCase();
  return Object.values(ESL_SIGNS).filter(
    (s) => s.gloss.toLowerCase().includes(q) || s.english.toLowerCase().includes(q)
  );
}

// Fingerspelling A-Z
export const FINGERSPELLING: Record<string, { handshape: string; duration: number }> = {
  A: { handshape: 'fist_thumb_up', duration: 0.4 },
  B: { handshape: 'flat_fingers', duration: 0.4 },
  C: { handshape: 'c_shape', duration: 0.4 },
  D: { handshape: 'point_up', duration: 0.4 },
  E: { handshape: 'curled_fingers', duration: 0.4 },
  F: { handshape: 'ok_sign', duration: 0.4 },
  G: { handshape: 'point_side', duration: 0.4 },
  H: { handshape: 'two_fingers_side', duration: 0.4 },
  I: { handshape: 'pinky_up', duration: 0.4 },
  J: { handshape: 'pinky_hook', duration: 0.6 },
  K: { handshape: 'peace_up', duration: 0.4 },
  L: { handshape: 'l_shape', duration: 0.4 },
  M: { handshape: 'three_fingers', duration: 0.4 },
  N: { handshape: 'two_fingers_down', duration: 0.4 },
  O: { handshape: 'o_shape', duration: 0.4 },
  P: { handshape: 'point_down', duration: 0.4 },
  Q: { handshape: 'hook_down', duration: 0.4 },
  R: { handshape: 'crossed_fingers', duration: 0.4 },
  S: { handshape: 'fist_thumb_front', duration: 0.4 },
  T: { handshape: 'thumb_between', duration: 0.4 },
  U: { handshape: 'two_fingers_up', duration: 0.4 },
  V: { handshape: 'peace_sign', duration: 0.4 },
  W: { handshape: 'three_fingers_spread', duration: 0.4 },
  X: { handshape: 'hook', duration: 0.4 },
  Y: { handshape: 'phone_sign', duration: 0.4 },
  Z: { handshape: 'point_trace', duration: 0.6 },
};
