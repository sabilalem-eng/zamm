import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DrawerMenu } from './components/DrawerMenu';
import { HomeScreenView } from './components/HomeScreenView';
import { LiveExamWorkspace } from './components/LiveExamWorkspace';
import { ExamBrowserView } from './components/ExamBrowserView';
import { StudyModeView } from './components/StudyModeView';
import { HistoryView } from './components/HistoryView';
import { AndroidSourceView } from './components/AndroidSourceView';
import { SettingsView } from './components/SettingsView';
import { FloatingRobotWidget } from './components/FloatingRobotWidget';
import { AntiExitWarningModal } from './components/AntiExitWarningModal';
import { PermissionModal } from './components/PermissionModal';
import {
  AppSettings,
  AutoPilotProgress,
  ExamQuestion,
  AnalysisResult,
  RobotBubbleState,
} from './types';
import { EXAM_SETS } from './data/sampleExamSets';
import { openFloatingRobotPip, PipController } from './services/pipService';
import { screenScannerService } from './services/screenScannerService';

const DEFAULT_SETTINGS: AppSettings = {
  robotEnabled: true,
  autoPilotActive: true,
  autoPilotSpeed: 'normal',
  robotSize: 'medium',
  robotOpacity: 1.0,
  bubbleEnabled: true,
  saveRobotPosition: true,
  robotPosition: { x: 20, y: 140 },
  aiProvider: 'gemini',
  geminiApiKey: '',
  model: 'gemini-2.5-flash',
  temperature: 0.2,
  screenshotQuality: 'high',
  ocrLanguage: 'id',
  visualAnalysisEnabled: true,
  overlayPermissionGranted: true,
  accessibilityPermissionGranted: true,
  mediaProjectionGranted: true,
  antiExitWarningEnabled: true,
  crossTabFloatingEnabled: true,
};

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('exam');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAntiExitWarningOpen, setIsAntiExitWarningOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);

  // Robot master status
  const [robotStatus, setRobotStatus] = useState<'OFF' | 'ON'>('ON');
  const [bubbleState, setBubbleState] = useState<RobotBubbleState>('waiting');
  const [customBubbleText, setCustomBubbleText] = useState<string | undefined>(undefined);

  const pipControllerRef = useRef<PipController | null>(null);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('zyl_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Auto-Pilot progress state
  const [autoPilotProgress, setAutoPilotProgress] = useState<AutoPilotProgress>({
    status: 'idle',
    totalQuestions: EXAM_SETS[0].questions.length,
    currentQuestionIndex: 0,
    solvedCount: 0,
    currentQuestion: null,
    lastAnswerGiven: null,
    speedMs: 1400,
    warningAntiExitActive: false,
  });

  // Selected study question
  const [selectedStudyQuestion, setSelectedStudyQuestion] = useState<ExamQuestion | null>(
    EXAM_SETS[0].questions[0]
  );

  // History list
  const [historyList, setHistoryList] = useState<AnalysisResult[]>(() => {
    try {
      const saved = localStorage.getItem('zyl_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'hist-1',
        questionNumber: 1,
        date: '04 Oktober 2026',
        timestamp: Date.now() - 3600000,
        question: 'Sebuah persamaan aljabar menyatakan: 3x - 5 = 19. Berapakah nilai x yang memenuhi persamaan tersebut?',
        type: 'multiple_choice',
        options: [
          { key: 'A', text: 'x = 6' },
          { key: 'B', text: 'x = 8' },
          { key: 'C', text: 'x = 12' },
          { key: 'D', text: 'x = 14' },
        ],
        bestAnswer: 'B',
        confidence: 99,
        explanation: '3x - 5 = 19 -> 3x = 24 -> x = 8. Robot otomatis mengklik pilihan B.',
      },
      {
        id: 'hist-2',
        questionNumber: 2,
        date: '04 Oktober 2026',
        timestamp: Date.now() - 7200000,
        question: 'PERNYATAAN SAINS: Dalam reaksi terang fotosintesis, gas oksigen (O2) dihasilkan dari fotolisis molekul air (H2O).',
        type: 'true_false',
        options: [
          { key: 'BENAR', text: 'BENAR' },
          { key: 'SALAH', text: 'SALAH' },
        ],
        bestAnswer: 'BENAR',
        confidence: 98,
        explanation: 'Pernyataan BENAR: Fotolisis air pada membran tilakoid kloroplas membebaskan O2.',
      },
    ];
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('zyl_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('zyl_history', JSON.stringify(historyList));
    } catch (e) {
      console.warn('Failed to save history:', e);
    }
  }, [historyList]);

  // Handle Scan Result (dari PiP atau Live Screen Scanner)
  const handleNewScanResult = (result: AnalysisResult) => {
    setHistoryList(prev => [result, ...prev]);

    // Update study mode
    const converted: ExamQuestion = {
      id: result.id,
      number: result.questionNumber,
      type: result.type || 'multiple_choice',
      question: result.question,
      options: result.options,
      correctAnswer: result.bestAnswer,
      explanation: result.explanation,
      confidence: result.confidence,
    };
    setSelectedStudyQuestion(converted);

    setBubbleState('solving');
    setCustomBubbleText(`[${result.bestAnswer}] ${result.explanation.substring(0, 35)}...`);
  };

  // Buka PiP Jendela Melayang Always-On-Top
  const handleOpenPip = () => {
    if (pipControllerRef.current && pipControllerRef.current.isOpen()) {
      pipControllerRef.current.close();
      pipControllerRef.current = null;
      setIsPipActive(false);
      setCustomBubbleText('Jendela melayang ditutup');
    } else {
      const controller = openFloatingRobotPip(settings, handleNewScanResult);
      if (controller) {
        pipControllerRef.current = controller;
        setIsPipActive(true);
        setBubbleState('solving');
        setCustomBubbleText('🚀 Melayang di atas website lain!');
      }
    }
  };

  // Scan layar tab lain langsung
  const handleScanScreen = async () => {
    setBubbleState('counting');
    setCustomBubbleText('Memindai soal di tab ujian lain...');
    const res = await screenScannerService.scanAndSolveActiveScreen(settings);
    if (res) {
      handleNewScanResult(res);
    } else {
      setBubbleState('waiting');
      setCustomBubbleText('Gagal memindai layar.');
    }
  };

  // ANTI-EXIT & CROSS-TAB SCANNING LISTENER:
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pengguna beralih tab atau membuka aplikasi ujian lain
        setBubbleState('solving');
        if (isPipActive || screenScannerService.isConnected()) {
          setCustomBubbleText('🚀 Robot melayang aktif di tab lain...');
        } else {
          setCustomBubbleText('💡 Robot standby untuk scan...');
        }
      } else {
        // Kembali ke tab utama
        if (isPipActive) {
          setCustomBubbleText('🚀 Jendela melayang aktif');
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoPilotProgress.status === 'solving' && !isPipActive && !settings.crossTabFloatingEnabled) {
        e.preventDefault();
        e.returnValue = 'Robot sedang mengerjakan soal! Buka Jendela Melayang jika ingin berpindah tab.';
        return e.returnValue;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoPilotProgress.status, isPipActive, settings.crossTabFloatingEnabled]);

  // Start auto-pilot from anywhere
  const handleTriggerAutoPilotStart = () => {
    setActiveTab('exam');
    setBubbleState('counting');
    setCustomBubbleText('Menganalisis & Menghitung Soal...');
    setAutoPilotProgress(prev => ({
      ...prev,
      status: 'counting',
      warningAntiExitActive: false,
    }));
  };

  const handleTriggerAutoPilotPause = () => {
    setAutoPilotProgress(prev => ({ ...prev, status: 'paused' }));
    setBubbleState('waiting');
    setCustomBubbleText('Auto-Pilot Dijeda');
  };

  const handleTriggerAutoPilotReset = () => {
    setAutoPilotProgress(prev => ({
      ...prev,
      status: 'idle',
      solvedCount: 0,
      currentQuestionIndex: 0,
      currentQuestion: null,
      lastAnswerGiven: null,
      warningAntiExitActive: false,
    }));
    setBubbleState('waiting');
    setCustomBubbleText(undefined);
  };

  // Toggle robot ON / OFF
  const handleToggleRobot = (targetOn: boolean) => {
    if (targetOn) {
      setRobotStatus('ON');
      setBubbleState('waiting');
      setCustomBubbleText('Robot Melayang Siap');
    } else {
      setRobotStatus('OFF');
      setAutoPilotProgress(prev => ({ ...prev, status: 'idle' }));
      setCustomBubbleText(undefined);
      if (pipControllerRef.current) {
        pipControllerRef.current.close();
        pipControllerRef.current = null;
      }
      screenScannerService.disconnectScreen();
    }
  };

  // Open study mode for question
  const handleOpenStudyDetail = (q: ExamQuestion) => {
    setSelectedStudyQuestion(q);
    setActiveTab('study');
  };

  return (
    <div className="min-h-screen bg-yellow-dots text-[#111111] flex flex-col items-center justify-start pb-16 selection:bg-[#00B8D9] selection:text-white">
      {/* App Container */}
      <div className="w-full max-w-2xl min-h-screen bg-transparent flex flex-col relative shadow-2xl">
        {/* Top Header */}
        <Header
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenSettings={() => setActiveTab('settings')}
          robotStatus={robotStatus}
          autoPilotProgress={autoPilotProgress}
          onStartAutoPilot={handleTriggerAutoPilotStart}
          onPauseAutoPilot={handleTriggerAutoPilotPause}
          onOpenPip={handleOpenPip}
          isPipActive={isPipActive}
        />

        {/* Tab Quick Switcher Bar */}
        <div className="w-full px-4 pt-3 flex items-center justify-center">
          <div className="w-full bg-[#111111] p-1.5 rounded-2xl flex items-center gap-1 shadow-[3px_3px_0px_#111111]">
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'exam'
                  ? 'bg-[#FFC800] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-transparent text-white hover:bg-neutral-800'
              }`}
            >
              ⚡ Soal &amp; Auto-Pilot
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#FFC800] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-transparent text-white hover:bg-neutral-800'
              }`}
            >
              Dashboard Robot
            </button>
            <button
              onClick={() => setActiveTab('exambrowser')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'exambrowser'
                  ? 'bg-[#FFC800] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-transparent text-white hover:bg-neutral-800'
              }`}
            >
              🌐 Scan Website Lain
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                activeTab === 'android'
                  ? 'bg-[#FFC800] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-transparent text-white hover:bg-neutral-800'
              }`}
            >
              📱 <span className="hidden xs:inline ml-1">Base</span> APK
            </button>
          </div>
        </div>

        {/* Main Body Content */}
        <main className="flex-1 p-4">
          {/* Quick Floating Banner if not yet active */}
          {!isPipActive && (
            <div className="bg-amber-100/90 border-2 border-[#111111] rounded-2xl p-2.5 px-3.5 mb-3 flex items-center justify-between gap-2 shadow-[2px_2px_0px_#111111]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                <span className="text-base">🚀</span>
                <span>
                  Mau robot tetap melayang saat buka website ujian lain (Google Forms/CBT)?
                </span>
              </div>
              <button
                onClick={handleOpenPip}
                className="px-3 py-1 bg-[#18C96E] hover:bg-[#15B362] border-1.5 border-[#111111] rounded-xl text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer whitespace-nowrap"
              >
                Aktifkan Melayang
              </button>
            </div>
          )}

          {activeTab === 'exam' && (
            <LiveExamWorkspace
              settings={settings}
              autoPilotProgress={autoPilotProgress}
              onUpdateAutoPilot={setAutoPilotProgress}
              onTriggerAntiExitWarning={() => setIsAntiExitWarningOpen(true)}
              onOpenStudyDetail={handleOpenStudyDetail}
              onOpenPip={handleOpenPip}
              isPipActive={isPipActive}
            />
          )}

          {activeTab === 'home' && (
            <HomeScreenView
              settings={settings}
              robotStatus={robotStatus}
              autoPilotProgress={autoPilotProgress}
              onToggleRobot={handleToggleRobot}
              onNavigateTab={setActiveTab}
              onStartAutoPilot={handleTriggerAutoPilotStart}
              onOpenPermissionModal={() => setIsPermissionModalOpen(true)}
              onTriggerAntiExitWarning={() => setIsAntiExitWarningOpen(true)}
              onOpenPip={handleOpenPip}
              isPipActive={isPipActive}
            />
          )}

          {activeTab === 'exambrowser' && (
            <ExamBrowserView
              settings={settings}
              autoPilotProgress={autoPilotProgress}
              onStartAutoPilot={handleTriggerAutoPilotStart}
              onPauseAutoPilot={handleTriggerAutoPilotPause}
              onTriggerAntiExitWarning={() => setIsAntiExitWarningOpen(true)}
              onNewScanResult={handleNewScanResult}
            />
          )}

          {activeTab === 'study' && (
            <StudyModeView currentQuestion={selectedStudyQuestion} />
          )}

          {activeTab === 'history' && (
            <HistoryView
              historyList={historyList}
              onDeleteHistoryItem={(id) => setHistoryList(prev => prev.filter(x => x.id !== id))}
              onClearAllHistory={() => setHistoryList([])}
              onOpenStudyMode={(res) => {
                const converted: ExamQuestion = {
                  id: res.id,
                  number: res.questionNumber,
                  type: res.type || 'multiple_choice',
                  question: res.question,
                  options: res.options,
                  correctAnswer: res.bestAnswer,
                  explanation: res.explanation,
                  confidence: res.confidence,
                };
                setSelectedStudyQuestion(converted);
                setActiveTab('study');
              }}
            />
          )}

          {activeTab === 'android' && <AndroidSourceView />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={(newVals) => setSettings(prev => ({ ...prev, ...newVals }))}
              onClearHistory={() => setHistoryList([])}
              onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
              onOpenPermissionModal={() => setIsPermissionModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Floating Robot Widget (Draggable Everywhere on screen) */}
      <FloatingRobotWidget
        isVisible={robotStatus === 'ON' && settings.robotEnabled}
        bubbleState={bubbleState}
        customBubbleText={customBubbleText}
        autoPilotProgress={autoPilotProgress}
        onTapRobot={() => setActiveTab('exam')}
        onStartAutoPilot={handleTriggerAutoPilotStart}
        onPauseAutoPilot={handleTriggerAutoPilotPause}
        onResetAutoPilot={handleTriggerAutoPilotReset}
        onOpenPip={handleOpenPip}
        isPipActive={isPipActive}
        onScanScreen={handleScanScreen}
        savedPosition={settings.robotPosition}
        onUpdatePosition={(pos) => {
          if (settings.saveRobotPosition) {
            setSettings(prev => ({ ...prev, robotPosition: pos }));
          }
        }}
        robotSize={settings.robotSize}
        robotOpacity={settings.robotOpacity}
        bubbleEnabled={settings.bubbleEnabled}
      />

      {/* Drawer Menu */}
      <DrawerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        robotStatus={robotStatus}
        autoPilotActive={autoPilotProgress.status === 'solving'}
      />

      {/* Anti-Exit Warning Modal */}
      <AntiExitWarningModal
        isOpen={isAntiExitWarningOpen}
        onDismiss={() => setIsAntiExitWarningOpen(false)}
        onOpenPip={handleOpenPip}
      />

      {/* Permission Modal */}
      <PermissionModal
        isOpen={isPermissionModalOpen}
        overlayGranted={settings.overlayPermissionGranted}
        accessibilityGranted={settings.accessibilityPermissionGranted}
        onToggleOverlay={() =>
          setSettings(prev => ({ ...prev, overlayPermissionGranted: !prev.overlayPermissionGranted }))
        }
        onToggleAccessibility={() =>
          setSettings(prev => ({ ...prev, accessibilityPermissionGranted: !prev.accessibilityPermissionGranted }))
        }
        onGrantAll={() => {
          setSettings(prev => ({
            ...prev,
            overlayPermissionGranted: true,
            accessibilityPermissionGranted: true,
          }));
          setIsPermissionModalOpen(false);
        }}
        onClose={() => setIsPermissionModalOpen(false)}
      />
    </div>
  );
}
