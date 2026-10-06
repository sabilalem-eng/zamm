export type QuestionType = 'multiple_choice' | 'true_false';

export interface ExamOption {
  key: string; // 'A', 'B', 'C', 'D', 'E' or 'BENAR', 'SALAH'
  text: string;
}

export interface ExamQuestion {
  id: string;
  number: number;
  type: QuestionType;
  question: string;
  options: ExamOption[];
  correctAnswer: string;
  explanation: string;
  confidence: number;
  userSelectedAnswer?: string;
  isSolvedByRobot?: boolean;
}

export type AutoPilotStatus =
  | 'idle'
  | 'counting'
  | 'solving'
  | 'paused'
  | 'completed'
  | 'interrupted';

export interface AutoPilotProgress {
  status: AutoPilotStatus;
  totalQuestions: number;
  currentQuestionIndex: number;
  solvedCount: number;
  currentQuestion: ExamQuestion | null;
  lastAnswerGiven: string | null;
  speedMs: number; // e.g. 1400ms
  warningAntiExitActive: boolean;
}

export interface AnalysisResult {
  id: string;
  questionNumber: number;
  date: string;
  timestamp: number;
  question: string;
  type?: QuestionType;
  options: ExamOption[];
  bestAnswer: string;
  confidence: number;
  explanation: string;
  patternAnalysis?: string;
  studyConcept?: string;
  visualDetected?: boolean;
  screenshotThumbnail?: string;
  ocrRawText?: string;
}

export type RobotStatus = 'OFF' | 'ON';

export type RobotBubbleState =
  | 'waiting'
  | 'counting'
  | 'solving'
  | 'processing'
  | 'completed'
  | 'warning'
  | 'error';

export interface AppSettings {
  // Robot settings
  robotEnabled: boolean;
  autoPilotActive: boolean;
  autoPilotSpeed: 'normal' | 'fast' | 'instant';
  robotSize: 'small' | 'medium' | 'large';
  robotOpacity: number;
  bubbleEnabled: boolean;
  saveRobotPosition: boolean;
  robotPosition: { x: number; y: number };

  // AI engine settings
  aiProvider: 'gemini' | 'local';
  geminiApiKey: string;
  model: string;
  temperature: number;

  // Screen settings
  screenshotQuality: 'standard' | 'high';
  ocrLanguage: 'id' | 'en' | 'auto';
  visualAnalysisEnabled: boolean;

  // Permissions
  overlayPermissionGranted: boolean;
  accessibilityPermissionGranted: boolean;
  mediaProjectionGranted: boolean;
  antiExitWarningEnabled: boolean;
  crossTabFloatingEnabled?: boolean;
}

export interface PresetScreen {
  id: string;
  title: string;
  category: 'Matematika & Aljabar' | 'Pilihan Ganda CBT' | 'Benar / Salah' | 'Visual & Matriks' | 'Bahasa & Logika';
  difficulty: 'Mudah' | 'Sedang' | 'Tinggi';
  totalQuestionsInSet: number;
  questions: ExamQuestion[];
}
