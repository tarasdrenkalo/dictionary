import { GraphemeSpelling, GraphemeSymbol } from "./base.js";
export const ENGLISH_MAGIC_E_LONG: Record<string, GraphemeSpelling["English"]> = {
  A: "eɪ",
  E: "iː",
  I: "aɪ",
  O: "oʊ",
  U: "juː",
};
export const ENGLISH_GRAPHEMES = new Set<GraphemeSymbol["English"]>([
  "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S",
  "T","U","V","W","X","Y","Z",
  "WR","KN","AY","EI","AU","AW","OI","OY","EU",
  "ER","IR","UR","OR","AR","EAR","EER","AIR","URE",
  "GN","SH","QU","GH","CH","TH","LD","MB","PH","NG","CK",
  "EE","EA","AI","OA","IE","OU","OW","WH","OO",
  "TCH","DGE","IGH",
  "A_E","O_E","U_E","E_E","I_E"
]);
export const ENGLISH_POSSIBLE_SPELLINGS: Record<
  GraphemeSymbol["English"],
  GraphemeSpelling["English"][]
> = {
  // Single letters
  A: ["æ","eɪ","ɑ","ɔ","ə"],
  B: ["b"],
  C: ["k","s"],
  D: ["d"],
  E: ["ɛ","iː","ɪ","ə"],
  F: ["f"],
  G: ["ɡ","dʒ"],
  H: ["h"],
  I: ["ɪ","aɪ","iː"],
  J: ["dʒ"],
  K: ["k"],
  L: ["l"],
  M: ["m"],
  N: ["n","ŋ"],
  O: ["ɒ","ɑ","oʊ","ʌ","ə","uː"],
  P: ["p"],
  Q: ["kw"],
  R: ["r","ɹ"],
  S: ["s","z","ʒ"],
  T: ["t","tʃ"],
  U: ["ʌ","juː","uː","ʊ","ə"],
  V: ["v"],
  W: ["w"],
  X: ["ks","gz","z"],
  Y: ["ɪ","aɪ","iː","j"],
  Z: ["z"],

  // Digraphs & clusters
  SH: ["ʃ"],
  CH: ["tʃ","k","ʃ"],
  TH: ["θ","ð"],
  PH: ["f"],
  NG: ["ŋ"],
  CK: ["k"],
  GH: ["f","ɡ",""],

  WR: ["r"],
  KN: ["n"],
  GN: ["n"],
  MB: ["m","mb"],
  LD: ["ld","d"],

  QU: ["kw"],
  WH: ["w"],

  // Vowel digraphs
  EE: ["iː"],
  EA: ["iː","ɛ","eɪ","ɪ","ɛə"],
  AI: ["eɪ"],
  AY: ["eɪ"],
  OA: ["oʊ"],
  IE: ["aɪ","iː"],
  EI: ["iː","eɪ"],
  OU: ["aʊ","ʌ","uː","oʊ"],
  OW: ["oʊ","aʊ"],
  OO: ["uː","ʊ"],
  AU: ["ɔː"],
  AW: ["ɔː"],
  OI: ["ɔɪ"],
  OY: ["ɔɪ"],
  EU: ["juː"],

  // R-controlled vowels
  AR: ["ɑː"],
  ER: ["ɝ"],
  IR: ["ɝ"],
  UR: ["ɝ"],
  OR: ["ɔː"],

  // Triphthongs / special sequences
  EAR: ["ɪə","ɛə","ɝ"],
  AIR: ["ɛə"],
  URE: ["jʊə","ʊə"],
  EER: ["ɪə"],

  // Magic-E
  A_E: ["eɪ"],
  E_E: ["iː"],
  I_E: ["aɪ"],
  O_E: ["oʊ"],
  U_E: ["juː","uː"],

  // Special endings
  TCH: ["tʃ"],
  DGE: ["dʒ"],
  IGH: ["aɪ"],
};