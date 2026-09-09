import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  HelpCircle, 
  Grid, 
  User, 
  Check, 
  Clock, 
  Volume2, 
  ShieldCheck,
  FileText,
  Activity,
  Heart,
  ChevronRight,
  Sparkles,
  Camera,
  Mic,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Printer,
  Smartphone,
  Edit3,
  X,
  Stethoscope,
  FileCheck,
  Globe,
  Accessibility
} from 'lucide-react';

export type ScreenId = 
  | '00_IDLE'
  | '01_WELCOME'
  | '02_LANGUAGE'
  | '03_CONSENT'
  | '04_EXISTING_NEW'
  | '05_NEW_PATIENT_RECORD'
  | '06A_IDENTIFY_EXISTING'
  | '06B_ENTER_PHONE'
  | '06C_SEARCHING'
  | '07_EXISTING_FOUND'
  | '08_IDENTIFICATION_FAILED'
  | '09_NAME_INPUT'
  | '10_AGE_INPUT'
  | '11_GENDER_INPUT'
  | '12_PHONE_INPUT'
  | '13_PROFILE_CONFIRM'
  | '14_PHOTO_CAPTURE'
  | '14A_OUT_OF_FRAME'
  | '15_CLINICAL_CONVERSATION'
  | '16_LISTENING'
  | '17_PROCESSING'
  | '18_I_HEARD_CONFIRM'
  | '19_TOUCH_INPUT'
  | '20_CHOICE_QUESTION'
  | '21_RETRY_UNCLEAR'
  | '22_UNKNOWN_NOT_SURE'
  | '23_RED_FLAG'
  | '24_MEASUREMENTS_INTRO'
  | '25_BP_INSTRUCTIONS'
  | '26_BP_POSITIONING'
  | '27_BP_MEASURING'
  | '28_BP_RESULT'
  | '29_SPO2_MEASUREMENT'
  | '30_DOCUMENT_INTRO'
  | '31_PLACE_DOCUMENT'
  | '32_SCANNING_BACKGROUND'
  | '33_DOCUMENT_SCANNED'
  | '34_OCR_PROCESSING'
  | '35_DOCUMENT_PROBLEM'
  | '36_DOCUMENT_COMPLETE'
  | '37_PREPARING_CASE'
  | '38_CASE_READY'
  | '39_VISIT_QR'
  | '40_WRISTBAND_PRINTING'
  | '41_COLLECT_WRISTBAND'
  | '42_ALL_SET'
  | '43_SESSION_COMPLETE'
  | '44_RESET';

const ALL_SCREENS: { id: ScreenId; label: string; step: number; stepLabel: string }[] = [
  { id: '00_IDLE', label: '00. Idle & Presence Sensor', step: 0, stepLabel: 'Standby' },
  { id: '01_WELCOME', label: '01. Welcome Screen', step: 1, stepLabel: 'Welcome' },
  { id: '02_LANGUAGE', label: '02. Language Selection', step: 1, stepLabel: 'Language' },
  { id: '03_CONSENT', label: '03. Patient Consent', step: 1, stepLabel: 'Consent' },
  { id: '04_EXISTING_NEW', label: '04. Existing vs New Patient', step: 2, stepLabel: 'Patient Type' },
  { id: '05_NEW_PATIENT_RECORD', label: '05. Create Record or Session', step: 2, stepLabel: 'Record Choice' },
  { id: '06A_IDENTIFY_EXISTING', label: '06A. Select Identifier', step: 2, stepLabel: 'Identification' },
  { id: '06B_ENTER_PHONE', label: '06B. Enter Phone Number', step: 2, stepLabel: 'Authentication' },
  { id: '06C_SEARCHING', label: '06C. Searching Hospital Record', step: 2, stepLabel: 'Lookup' },
  { id: '07_EXISTING_FOUND', label: '07. Patient Record Found', step: 2, stepLabel: 'Verification' },
  { id: '08_IDENTIFICATION_FAILED', label: '08. Record Not Found Fallback', step: 2, stepLabel: 'Fallback' },
  { id: '09_NAME_INPUT', label: '09. Patient Name (Optional)', step: 2, stepLabel: 'Basic Info' },
  { id: '10_AGE_INPUT', label: '10. Patient Age (Optional)', step: 2, stepLabel: 'Basic Info' },
  { id: '11_GENDER_INPUT', label: '11. Patient Gender (Optional)', step: 2, stepLabel: 'Basic Info' },
  { id: '12_PHONE_INPUT', label: '12. Phone Input (New Patient)', step: 2, stepLabel: 'Basic Info' },
  { id: '13_PROFILE_CONFIRM', label: '13. Profile Confirmation', step: 2, stepLabel: 'Confirm Details' },
  { id: '14_PHOTO_CAPTURE', label: '14. Camera Photo Capture', step: 3, stepLabel: 'Photo Capture' },
  { id: '14A_OUT_OF_FRAME', label: '14A. Out of Frame Recovery', step: 3, stepLabel: 'Positioning' },
  { id: '15_CLINICAL_CONVERSATION', label: '15. Chief Complaint / Voice', step: 4, stepLabel: 'Tell Us About Your Health' },
  { id: '16_LISTENING', label: '16. Voice Listening State', step: 4, stepLabel: 'Listening' },
  { id: '17_PROCESSING', label: '17. AI Clinical Processing', step: 4, stepLabel: 'AI Structuring' },
  { id: '18_I_HEARD_CONFIRM', label: '18. "I Heard..." Confirmation', step: 4, stepLabel: 'Verification' },
  { id: '19_TOUCH_INPUT', label: '19. Touch Keypad Fallback', step: 4, stepLabel: 'Manual Input' },
  { id: '20_CHOICE_QUESTION', label: '20. Choice Question (Cough)', step: 4, stepLabel: 'Symptoms' },
  { id: '21_RETRY_UNCLEAR', label: '21. Unclear Speech Recovery', step: 4, stepLabel: 'Speech Retry' },
  { id: '22_UNKNOWN_NOT_SURE', label: '22. "I Don\'t Know / Not Sure"', step: 4, stepLabel: 'Uncertainty' },
  { id: '23_RED_FLAG', label: '23. Red-Flag Escalation Alert', step: 4, stepLabel: 'Clinical Safety' },
  { id: '24_MEASUREMENTS_INTRO', label: '24. Vitals Introduction', step: 5, stepLabel: 'Measurements' },
  { id: '25_BP_INSTRUCTIONS', label: '25. BP Measurement Guide', step: 5, stepLabel: 'BP Instructions' },
  { id: '26_BP_POSITIONING', label: '26. Arm Positioning Check', step: 5, stepLabel: 'Positioning' },
  { id: '27_BP_MEASURING', label: '27. BP Measuring in Progress', step: 5, stepLabel: 'Measuring' },
  { id: '28_BP_RESULT', label: '28. BP Reading Result', step: 5, stepLabel: 'BP Results' },
  { id: '29_SPO2_MEASUREMENT', label: '29. Pulse & SpO2 Measurement', step: 5, stepLabel: 'Oxygen & Pulse' },
  { id: '30_DOCUMENT_INTRO', label: '30. Medical Documents Intro', step: 6, stepLabel: 'Doc Scanning' },
  { id: '31_PLACE_DOCUMENT', label: '31. Insert Document in Slot', step: 6, stepLabel: 'Insert Slot' },
  { id: '32_SCANNING_BACKGROUND', label: '32. Background Scanning', step: 6, stepLabel: 'Scanning' },
  { id: '33_DOCUMENT_SCANNED', label: '33. Document Received', step: 6, stepLabel: 'Doc Captured' },
  { id: '34_OCR_PROCESSING', label: '34. OCR & Clinical Extraction', step: 6, stepLabel: 'OCR Extract' },
  { id: '35_DOCUMENT_PROBLEM', label: '35. Unclear Scan Recovery', step: 6, stepLabel: 'Scan Retry' },
  { id: '36_DOCUMENT_COMPLETE', label: '36. Documents Complete', step: 6, stepLabel: 'Docs Ready' },
  { id: '37_PREPARING_CASE', label: '37. Assembling Case Summary', step: 7, stepLabel: 'Preparing Case' },
  { id: '38_CASE_READY', label: '38. Case Ready Confirmation', step: 7, stepLabel: 'Case Ready' },
  { id: '39_VISIT_QR', label: '39. Visit QR Code Created', step: 7, stepLabel: 'Visit QR Created' },
  { id: '40_WRISTBAND_PRINTING', label: '40. Wristband Dispensing Intro', step: 7, stepLabel: 'Dispensing Wristband' },
  { id: '41_COLLECT_WRISTBAND', label: '41. Collect Printed Wristband', step: 7, stepLabel: 'Dispensing Wristband' },
  { id: '42_ALL_SET', label: '42. Proceed to Consultation', step: 7, stepLabel: 'You\'re All Set' },
  { id: '43_SESSION_COMPLETE', label: '43. Check-in Complete / Thanks', step: 7, stepLabel: 'Complete' },
  { id: '44_RESET', label: '44. Resetting to Idle', step: 0, stepLabel: 'Resetting' }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('01_WELCOME');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [presenceDetected, setPresenceDetected] = useState<boolean>(false);
  const [idleScene, setIdleScene] = useState<number>(1);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [showDoctorModal, setShowDoctorModal] = useState<boolean>(false);
  const [coughSeverity, setCoughSeverity] = useState<string>('Mild cough');
  const [typedComplaint, setTypedComplaint] = useState<string>('I have a fever since yesterday.');
  const [bpCountdown, setBpCountdown] = useState<number>(24);
  const [scanProgress, setScanProgress] = useState<number>(68);
  const [hisPushStatus, setHisPushStatus] = useState<'idle' | 'pushing' | 'synced'>('idle');
  const [mockSpeaking, setMockSpeaking] = useState<boolean>(false);

  // Gemini Live API Hook
  const { connect, disconnect, connectionState, isSpeaking, error: geminiError } = useGeminiLive(
    "You are MediKiosk, a helpful and empathetic clinical assistant. Ask the patient about their symptoms and chief complaint. Keep your responses concise (under 2 sentences) and natural."
  );

  // Manage Gemini connection lifecycle based on screen
  useEffect(() => {
    if (currentScreen === '15_CLINICAL_CONVERSATION') {
      connect();
    } else {
      disconnect();
    }
  }, [currentScreen, connect, disconnect]);
  // Patient Profile Data
  const [patientData] = useState({
    name: 'Rahul Sharma',
    age: 22,
    gender: 'Male',
    phone: '+91 98765 43210',
    uhid: 'HSP123456',
    abha: '91-4521-8890-1234',
    address: 'Bengaluru, Karnataka',
    token: 'A-104',
    chiefComplaint: 'Fever and headache since yesterday',
    hpi: 'Low-grade fever started ~24h ago with dull frontal headache. Denies chills or stiff neck.',
    vitals: {
      bp: '118/76 mmHg',
      bpSource: 'kiosk_device · Today 10:24 AM',
      spo2: '98%',
      pulse: '72 bpm',
      bloodGroup: 'B+ (Self-reported)'
    },
    ayush: {
      prakriti: 'Vata-Pitta',
      agni: 'Mandagni (Mildly impaired digestive fire)',
      koshtha: 'Madhyama'
    },
    redFlags: [
      { symptom: 'Frontal headache with fever', severity: 'Low-Medium (Monitor neurological signs)' }
    ]
  });

  const [currentTime, setCurrentTime] = useState('10:24 AM');
  const [currentDate, setCurrentDate] = useState('Mon, 7 Sept 2026');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasWebcam, setHasWebcam] = useState<boolean>(false);

  // Callback ref that guarantees stream is attached and played as soon as video mounts
  const setVideoElement = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      if (element.srcObject !== streamRef.current) {
        element.srcObject = streamRef.current;
      }
      element.play().catch(err => {
        console.warn("Autoplay playback error or permission needed:", err);
      });
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Open user webcam safely for realistic viewfinder on tablet and mobile
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
      } catch (err1) {
        console.warn("Front camera constraint failed, trying basic video constraint:", err1);
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err2) {
          console.error("Camera access failed:", err2);
          setHasWebcam(false);
          return;
        }
      }

      if (activeStream) {
        streamRef.current = activeStream;
        setHasWebcam(true);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
          videoRef.current.play().catch(() => {});
        }
      }
    };

    if (navigator.mediaDevices?.getUserMedia) {
      startWebcam();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Idle screen loop
  useEffect(() => {
    if (currentScreen === '00_IDLE' && !presenceDetected) {
      const sceneTimer = setInterval(() => {
        setIdleScene(prev => (prev >= 6 ? 1 : prev + 1));
      }, 3500);
      return () => clearInterval(sceneTimer);
    }
  }, [currentScreen, presenceDetected]);

  // BP countdown simulation
  useEffect(() => {
    if (currentScreen === '27_BP_MEASURING') {
      setBpCountdown(24);
      const bpTimer = setInterval(() => {
        setBpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(bpTimer);
            setCurrentScreen('28_BP_RESULT');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(bpTimer);
    }
  }, [currentScreen]);

  // Document scan progress simulation
  useEffect(() => {
    if (currentScreen === '32_SCANNING_BACKGROUND' || currentScreen === '34_OCR_PROCESSING') {
      setScanProgress(68);
      const scanTimer = setInterval(() => {
        setScanProgress(prev => (prev >= 95 ? 100 : prev + 12));
      }, 800);
      return () => clearInterval(scanTimer);
    }
  }, [currentScreen]);

  // Auto-advance for Searching record
  useEffect(() => {
    if (currentScreen === '06C_SEARCHING') {
      const timer = setTimeout(() => {
        setCurrentScreen('07_EXISTING_FOUND');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Auto-advance for Preparing case
  useEffect(() => {
    if (currentScreen === '37_PREPARING_CASE') {
      const timer = setTimeout(() => {
        setCurrentScreen('38_CASE_READY');
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const goTo = (screen: ScreenId) => {
    setCurrentScreen(screen);
  };

  const getActiveStep = () => {
    const item = ALL_SCREENS.find(s => s.id === currentScreen);
    return item ? item.step : 1;
  };

  const getActiveStepLabel = () => {
    const item = ALL_SCREENS.find(s => s.id === currentScreen);
    return item ? item.stepLabel : 'Tell Us About Your Health';
  };

  // Screen-specific Mascot Speech Bubbles (matching reference PDF)
  const getMascotSpeech = () => {
    switch (currentScreen) {
      case '00_IDLE':
        return presenceDetected 
          ? "Hello! 👋 I can help you prepare for your doctor visit."
          : "Need to see the doctor? I can help you get ready.";
      case '01_WELCOME':
        return "Welcome to MediKiosk! I'll help you get ready for your doctor consultation.";
      case '02_LANGUAGE':
        return "Which language would you like to use?";
      case '03_CONSENT':
        return "Before we begin, I'd like your permission to collect some health information.";
      case '04_EXISTING_NEW':
        return "Are you an existing patient or a new patient?";
      case '05_NEW_PATIENT_RECORD':
        return "Since this is your first time here, would you like me to create your patient record?";
      case '06A_IDENTIFY_EXISTING':
        return "Let's find your existing record.";
      case '06B_ENTER_PHONE':
        return "Please tell me your phone number.";
      case '06C_SEARCHING':
        return "Great! I'm now searching for your record...";
      case '07_EXISTING_FOUND':
        return "I found a record that matches your details! Please check if this is you.";
      case '08_IDENTIFICATION_FAILED':
        return "I couldn't find that record.";
      case '13_PROFILE_CONFIRM':
        return "Let's confirm your information! Say 'Looks good' or edit any details.";
      case '14_PHOTO_CAPTURE':
        return "Let's take your photo! This helps us identify your visit smoother.";
      case '15_CLINICAL_CONVERSATION':
        return "To start with, can you tell me what brings you here today? You can speak naturally, in your own words.";
      case '16_LISTENING':
        return "I'm listening... Take your time. You can speak naturally.";
      case '17_PROCESSING':
        return "Thanks! I'm now understanding your response... This may take a few seconds.";
      case '18_I_HEARD_CONFIRM':
        return "Here's what I heard... Please check if this is correct.";
      case '19_TOUCH_INPUT':
        return "No problem! You can type your answer instead. Take your time.";
      case '20_CHOICE_QUESTION':
        return "Do you currently have a cough? Please select the option that best describes your condition.";
      case '21_RETRY_UNCLEAR':
        return "I didn't quite catch that. Could you please repeat your answer in a different way?";
      case '22_UNKNOWN_NOT_SURE':
        return "No worries! It's okay if you're not sure or if this doesn't apply to you.";
      case '23_RED_FLAG':
        return "Your symptoms may need prompt attention. Based on what you've told me, this could be important.";
      case '24_MEASUREMENTS_INTRO':
        return "Now let's take some quick measurements. These help us understand your current health status better.";
      case '25_BP_INSTRUCTIONS':
        return "Let's measure your blood pressure. Please follow the steps below.";
      case '26_BP_POSITIONING':
        return "Great! Now let's make sure you're in the right position for an accurate reading.";
      case '27_BP_MEASURING':
        return "Measuring your blood pressure... Please stay still. This will take about 30 seconds.";
      case '28_BP_RESULT':
        return "Great! We've got your blood pressure reading. Here are your results from just now.";
      case '29_SPO2_MEASUREMENT':
        return "Now let's check your oxygen saturation. This shows how well your blood is carrying oxygen.";
      case '30_DOCUMENT_INTRO':
        return "Next, let's scan your medical documents. This helps the doctor understand your history better.";
      case '31_PLACE_DOCUMENT':
        return "Please insert your document into the slot below the screen. We'll scan it automatically.";
      case '32_SCANNING_BACKGROUND':
        return "I've started scanning your document in the background. You can continue.";
      case '33_DOCUMENT_SCANNED':
        return "Great! Your document has been scanned successfully. I'll extract key information as we continue.";
      case '34_OCR_PROCESSING':
        return "I'm now reading your document... I'm extracting the important information in the background.";
      case '35_DOCUMENT_PROBLEM':
        return "Looks like we couldn't read this document clearly. Would you like to scan again or skip?";
      case '36_DOCUMENT_COMPLETE':
        return "All your documents are collected! We have everything we need. Let's continue.";
      case '37_PREPARING_CASE':
        return "Preparing your case... I'm putting together all the information so your doctor has a complete picture.";
      case '38_CASE_READY':
        return "Your case is ready! We've combined your conversation, health details, and document information.";
      case '39_VISIT_QR':
        return "Your visit QR has been created! Your doctor can scan this code to securely access your case.";
      case '40_WRISTBAND_PRINTING':
        return "Get your wristband ready. Please place your hand close to the slot. It will dispense automatically.";
      case '41_COLLECT_WRISTBAND':
        return "Dispensing your wristband... Please keep your hand steady and take it once fully out.";
      case '42_ALL_SET':
        return "You're all set! Your information has been securely sent to your care team.";
      case '43_SESSION_COMPLETE':
        return "Thank you! Your check-in is complete. We appreciate you for using MediKiosk!";
      default:
        return "I'm here to help you get ready for your doctor consultation.";
    }
  };

  // Dual Caption Content based on Screen
  const getCaptions = () => {
    switch (currentScreen) {
      case '00_IDLE':
        return {
          medikiosk: presenceDetected ? "Hello! I can help you prepare for your doctor visit." : "Need to see the doctor? Step closer to begin.",
          you: "Listening..."
        };
      case '01_WELCOME':
        return {
          medikiosk: "Welcome to MediKiosk! I'll help you get ready for your doctor consultation.",
          you: "Listening for 'Start'..."
        };
      case '02_LANGUAGE':
        return {
          medikiosk: "Which language would you like to use? You can say or tap below.",
          you: `Selected: ${selectedLanguage}`
        };
      case '03_CONSENT':
        return {
          medikiosk: "Before we begin, I'd like your permission to collect health information.",
          you: "Waiting for consent..."
        };
      case '04_EXISTING_NEW':
        return {
          medikiosk: "Are you an existing patient or a new patient at this hospital?",
          you: "Listening for choice..."
        };
      case '06B_ENTER_PHONE':
        return {
          medikiosk: "Please tell me your phone number or enter using keypad.",
          you: phoneInput ? `Entered: ${phoneInput}` : "Listening..."
        };
      case '07_EXISTING_FOUND':
        return {
          medikiosk: `I found a record that matches your details! Rahul Sharma, UHID: HSP123456`,
          you: "Confirm if this is you..."
        };
      case '15_CLINICAL_CONVERSATION':
        return {
          medikiosk: connectionState === 'connected' ? (isSpeaking ? "Speaking..." : "I'm listening...") : "Connecting to Gemini Live...",
          you: isSpeaking ? "Listening..." : "Speak naturally..."
        };
      case '16_LISTENING':
        return {
          medikiosk: "Take your time. Speak naturally.",
          you: "Speaking..."
        };
      case '17_PROCESSING':
        return {
          medikiosk: "I'm now understanding your response... This will only take a few seconds.",
          you: "Processing AI draft..."
        };
      case '18_I_HEARD_CONFIRM':
        return {
          medikiosk: "You have been having a fever since yesterday. Is that right?",
          you: "Confirming..."
        };
      case '20_CHOICE_QUESTION':
        return {
          medikiosk: "Do you currently have a cough?",
          you: `Selected: ${coughSeverity}`
        };
      case '27_BP_MEASURING':
        return {
          medikiosk: "Measuring your blood pressure... Please stay still and avoid talking.",
          you: "Measuring in progress..."
        };
      case '28_BP_RESULT':
        return {
          medikiosk: "Your blood pressure is 118/76 mmHg. Normal range.",
          you: "Reading captured"
        };
      case '32_SCANNING_BACKGROUND':
      case '33_DOCUMENT_SCANNED':
      case '34_OCR_PROCESSING':
        return {
          medikiosk: "I've started scanning your document in the background. You can continue.",
          you: "Listening..."
        };
      case '39_VISIT_QR':
        return {
          medikiosk: "Your visit QR has been created! Your doctor can scan this code.",
          you: "Listening..."
        };
      case '40_WRISTBAND_PRINTING':
      case '41_COLLECT_WRISTBAND':
        return {
          medikiosk: "Please place your hand close to the wristband slot. Dispensing...",
          you: "Listening..."
        };
      case '42_ALL_SET':
      case '43_SESSION_COMPLETE':
        return {
          medikiosk: "Thank you! Your check-in is complete. Wishing you a safe visit!",
          you: "Listening..."
        };
      default:
        return {
          medikiosk: "I'll organize your information so your doctor has a complete picture.",
          you: "Listening..."
        };
    }
  };

  const captions = getCaptions();
  const mascotSpeech = getMascotSpeech();

  const handleKeyPress = (num: string) => {
    if (phoneInput.length < 10) setPhoneInput(prev => prev + num);
  };
  const handleKeyDelete = () => setPhoneInput(prev => prev.slice(0, -1));
  const handleKeySubmit = () => {
    if (phoneInput.length >= 10) goTo('06C_SEARCHING');
  };

  return (
    <div className="kiosk-wrapper">
      {/* Top Floating Dev/Judge Toolbar */}
      <div className="kiosk-toolbar">
        <div className="kiosk-toolbar-title">
          <Sparkles size={14} />
          <span>MediKiosk Reference Preview</span>
        </div>

        <select 
          className="kiosk-screen-select"
          value={currentScreen}
          onChange={(e) => goTo(e.target.value as ScreenId)}
        >
          {ALL_SCREENS.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        {currentScreen === '00_IDLE' && (
          <button
            onClick={() => setPresenceDetected(prev => !prev)}
            style={{
              background: presenceDetected ? '#16a34a' : '#475569',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {presenceDetected ? 'Presence: Detected' : 'Presence: Standby'}
          </button>
        )}

        <button 
          onClick={() => setShowDoctorModal(true)}
          style={{
            background: '#0e6c38',
            color: '#fff',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Stethoscope size={13} />
          <span>Doctor Review</span>
        </button>
      </div>

      {/* Main Kiosk Fullscreen Container (Responsive for Tablet) */}
      <div className="kiosk-fullscreen-container">


        {/* Persistent Header */}
        <header className="kiosk-header">
          <div className="header-brand">
            <svg className="medikiosk-cross-icon" viewBox="0 0 100 100" fill="none">
              <rect x="33" y="10" width="34" height="80" rx="17" fill="#22C55E" />
              <rect x="10" y="33" width="80" height="34" rx="17" fill="#22C55E" />
              <circle cx="50" cy="50" r="14" fill="#ffffff" />
              <ellipse cx="44" cy="46" rx="8" ry="6" transform="rotate(-30 44 46)" fill="#22C55E" />
              <ellipse cx="56" cy="54" rx="8" ry="6" transform="rotate(-30 56 54)" fill="#22C55E" />
            </svg>
            <div className="header-titles">
              <span className="header-name">MediKiosk</span>
              <span className="header-tagline">Care Closer to You</span>
            </div>
          </div>

          <div className="header-right">
            <div className="header-datetime">
              <Clock size={14} color="#168d4d" />
              <span>{currentDate} · {currentTime}</span>
            </div>
            <button className="header-help-btn" onClick={() => goTo('21_RETRY_UNCLEAR')}>
              <Headphones size={13} />
              <span>Help</span>
            </button>
          </div>
        </header>

        {/* Upper Hero Area: 3D Doctor Mascot & Camera Viewfinder */}
        <section className="mascot-hero-section">
          {/* Added onClick for manual demo testing */}
          <div className="mascot-avatar-wrapper" onClick={() => setMockSpeaking(!mockSpeaking)} style={{ cursor: 'pointer' }}>
            {/* IDLE VIDEO */}
            <video 
              src="/doctor_idle.webm" 
              className="mascot-hero-img"
              autoPlay loop muted playsInline
              style={{
                opacity: !(isSpeaking || mockSpeaking) ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out',
                transform: 'scale(1.15) translateY(25px)' // Pushed down so it doesn't cross the top header
              }}
            />
            
            {/* TALKING VIDEO */}
            <video 
              src="/doctor_talking.webm" 
              className="mascot-hero-img"
              autoPlay loop muted playsInline
              style={{
                position: 'absolute',
                opacity: (isSpeaking || mockSpeaking) ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out',
                transform: 'scale(0.95) translateY(-30px)', // Shifted up towards the header
                pointerEvents: 'none' // Let clicks pass through to the wrapper
              }}
            />
          </div>

          {/* Persistent Camera Viewfinder Widget (Top-Right of Hero) */}
          {currentScreen !== '00_IDLE' && (
            <motion.div 
              className="camera-viewfinder-widget"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="camera-preview-thumb">
                {hasWebcam ? (
                  <video ref={setVideoElement} autoPlay playsInline muted />
                ) : (
                  <img src="/assets/patient_viewfinder.jpg" alt="Live Webcam Preview" />
                )}
              </div>
              <div className="camera-status-row">
                <span className="camera-green-dot"></span>
                <span>Camera On</span>
              </div>
              <span className="camera-frame-tag">✔ You're in frame</span>
            </motion.div>
          )}
        </section>

        {/* Main Floating Interactive Card */}
        <main className="kiosk-main-card">
          <div className="card-content-area">
            <AnimatePresence mode="wait">

              {/* SCREEN 00: IDLE */}
              {currentScreen === '00_IDLE' && (
                <motion.div 
                  key="00_IDLE"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  {!presenceDetected ? (
                    <div>
                      <div className="card-main-title" style={{ fontSize: '22px' }}>
                        {idleScene === 1 && "Meet MediKiosk"}
                        {idleScene === 2 && "Tell me how you're feeling"}
                        {idleScene === 3 && "Bring your medical reports"}
                        {idleScene === 4 && "Get your measurements"}
                        {idleScene === 5 && "Spend your waiting time wisely"}
                        {idleScene === 6 && "Step closer to begin"}
                      </div>
                      <div className="card-main-subtitle" style={{ fontSize: '14px', marginTop: '6px' }}>
                        {idleScene === 1 && "Your digital pre-consultation assistant."}
                        {idleScene === 2 && "Speak naturally. I'll organize your information for the doctor."}
                        {idleScene === 3 && "MediKiosk can scan and organize your previous records."}
                        {idleScene === 4 && "Blood pressure and other supported measurements can be captured."}
                        {idleScene === 5 && "Prepare your case before you meet the doctor."}
                        {idleScene === 6 && "Just step closer or tap below."}
                      </div>

                      <div style={{ marginTop: '20px' }}>
                        <button className="btn-primary-pill" onClick={() => goTo('01_WELCOME')}>
                          <span>Touch to Start</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="card-main-title" style={{ fontSize: '24px' }}>
                        Hello! 👋
                      </div>
                      <div className="card-main-subtitle" style={{ fontSize: '15px', marginTop: '6px' }}>
                        I can help you prepare for your doctor visit.
                      </div>
                      <div style={{ marginTop: '20px' }}>
                        <button className="btn-primary-pill" onClick={() => goTo('01_WELCOME')}>
                          <span>Start Preparation</span>
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* SCREEN 01: WELCOME */}
              {currentScreen === '01_WELCOME' && (
                <motion.div 
                  key="01_WELCOME"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Welcome to MediKiosk!</h2>
                      <p className="card-main-subtitle">I'll help you get ready for your doctor consultation.</p>
                    </div>
                  </div>

                  {/* 4 Feature Callouts in Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(8px, 1.5vw, 14px)', margin: 'clamp(10px, 2vh, 20px) 0' }}>
                    {[
                      { icon: <FileText size={22} />, title: 'Share your health information' },
                      { icon: <Activity size={22} />, title: 'Get check-up ready' },
                      { icon: <Heart size={22} />, title: 'Upload your reports' },
                      { icon: <Sparkles size={22} />, title: 'Smoother consultation' }
                    ].map(f => (
                      <div key={f.title} style={{
                        background: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: 'clamp(12px, 2vh, 18px) clamp(8px, 1.2vw, 14px)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{ color: '#0e6c38' }}>{f.icon}</div>
                        <span style={{ fontSize: 'clamp(11px, 1.4vw, 13px)', fontWeight: 700, color: '#334155', lineHeight: 1.3 }}>{f.title}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'clamp(8px, 1.5vh, 16px)' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('02_LANGUAGE')} style={{ padding: 'clamp(12px, 1.8vh, 16px) clamp(36px, 5vw, 56px)', fontSize: 'clamp(17px, 2.2vw, 20px)' }}>
                      <span>Start</span>
                      <ArrowRight size={22} />
                    </button>
                    <div style={{ fontSize: 'clamp(11.5px, 1.5vw, 13.5px)', color: '#64748b', marginTop: '8px' }}>
                      You can speak or touch the screen to continue.
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: 'clamp(12px, 1.5vw, 14px)' }}>
                    <button 
                      onClick={() => goTo('02_LANGUAGE')}
                      style={{ background: 'none', border: 'none', color: '#0e6c38', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Globe size={15} /> Change language
                    </button>
                    <button 
                      onClick={() => alert('Accessibility mode enabled: High contrast & enhanced text-to-speech audio.')}
                      style={{ background: 'none', border: 'none', color: '#0e6c38', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <Accessibility size={15} /> Accessibility
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 02: LANGUAGE */}
              {currentScreen === '02_LANGUAGE' && (
                <motion.div 
                  key="02_LANGUAGE"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Which language would you like to use?</h2>
                      <p className="card-main-subtitle">You can say the language or tap one below.</p>
                    </div>
                  </div>

                  <div className="grid-3-cards" style={{ margin: 'clamp(8px, 1.5vh, 18px) 0' }}>
                    {[
                      { code: 'A', name: 'English', sub: 'English' },
                      { code: 'अ', name: 'हिन्दी', sub: 'Hindi' },
                      { code: 'অ', name: 'বাংলা', sub: 'Bengali' },
                      { code: 'अ', name: 'मराठी', sub: 'Marathi' },
                      { code: 'அ', name: 'தமிழ்', sub: 'Tamil' },
                      { code: 'అ', name: 'తెలుగు', sub: 'Telugu' }
                    ].map(l => (
                      <div 
                        key={l.sub}
                        className={`selection-card ${selectedLanguage === l.sub ? 'selected' : ''}`}
                        style={{ flexDirection: 'column', textAlign: 'center', padding: 'clamp(16px, 2.4vh, 24px) clamp(8px, 1.5vw, 16px)' }}
                        onClick={() => {
                          setSelectedLanguage(l.sub);
                          goTo('03_CONSENT');
                        }}
                      >
                        <div style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', fontWeight: 800, color: '#0e6c38' }}>{l.code}</div>
                        <div style={{ fontSize: 'clamp(15px, 2.1vw, 18px)', fontWeight: 700, color: '#0e6c38', marginTop: '4px' }}>{l.name}</div>
                        <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#64748b' }}>{l.sub}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: 'clamp(12px, 1.5vw, 13.5px)',
                    color: '#0e6c38',
                    fontWeight: 600,
                    margin: '8px auto 0 auto',
                    background: '#f4faf6',
                    padding: '8px 18px',
                    borderRadius: '999px',
                    width: 'fit-content'
                  }}>
                    <Mic size={15} />
                    <span>For example, you can say "Hindi" or "English".</span>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 03: CONSENT */}
              {currentScreen === '03_CONSENT' && (
                <motion.div 
                  key="03_CONSENT"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Before we begin, I'd like your permission</h2>
                      <p className="card-main-subtitle">to collect some information about your health and prepare it for your doctor.</p>
                    </div>
                  </div>

                  <div style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', fontWeight: 700, color: '#0e6c38', marginBottom: '8px' }}>
                    Why we collect this information?
                  </div>

                  <div className="grid-2-cards" style={{ gap: 'clamp(8px, 1.5vw, 14px)' }}>
                    {[
                      { icon: <FileText size={20} />, title: 'Understand your condition', desc: 'Symptoms & measurements' },
                      { icon: <Heart size={20} />, title: 'Use your reports', desc: 'Scan & read previous reports' },
                      { icon: <User size={20} />, title: 'Share with doctor only', desc: 'Treating healthcare team' },
                      { icon: <ShieldCheck size={20} />, title: 'Keep your data safe', desc: 'Hospital security guidelines' }
                    ].map(c => (
                      <div key={c.title} className="selection-card" style={{ padding: 'clamp(10px, 1.6vh, 16px) clamp(12px, 1.8vw, 18px)' }}>
                        <div style={{ color: '#0e6c38' }}>{c.icon}</div>
                        <div>
                          <div style={{ fontSize: 'clamp(12.5px, 1.6vw, 15px)', fontWeight: 700, color: '#0e6c38' }}>{c.title}</div>
                          <div style={{ fontSize: 'clamp(10.5px, 1.3vw, 12.5px)', color: '#64748b', marginTop: '2px' }}>{c.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'clamp(12px, 2vh, 20px)' }}>
                    <button className="btn-secondary-pill" onClick={() => goTo('22_UNKNOWN_NOT_SURE')}>
                      <HelpCircle size={16} />
                      <span>I have a question</span>
                    </button>
                    <button className="btn-primary-pill" onClick={() => goTo('04_EXISTING_NEW')}>
                      <Check size={18} />
                      <span>I agree / Continue</span>
                    </button>
                    <button 
                      onClick={() => goTo('00_IDLE')}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 'clamp(11.5px, 1.4vw, 13px)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Exit kiosk
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 04: EXISTING VS NEW PATIENT */}
              {currentScreen === '04_EXISTING_NEW' && (
                <motion.div 
                  key="04_EXISTING_NEW"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Are you an existing patient or a new patient?</h2>
                      <p className="card-main-subtitle">You can say it or tap an option below.</p>
                    </div>
                  </div>

                  <div className="grid-2-cards" style={{ margin: 'clamp(10px, 2vh, 20px) 0' }}>
                    <div 
                      className="selection-card"
                      style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'clamp(16px, 2.5vh, 24px)', position: 'relative' }}
                      onClick={() => goTo('06A_IDENTIFY_EXISTING')}
                    >
                      <div style={{ color: '#0e6c38' }}><RotateCw size={28} /></div>
                      <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 2.2vw, 20px)', color: '#0e6c38', marginTop: '10px' }}>
                        I am an existing patient
                      </div>
                      <div style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', color: '#64748b', marginTop: '3px' }}>
                        I have already visited this hospital before.
                      </div>
                      <ul style={{ fontSize: 'clamp(11.5px, 1.4vw, 13px)', color: '#16a34a', fontWeight: 600, marginTop: '10px', paddingLeft: '14px', lineHeight: 1.5 }}>
                        <li>Use your UHID or Phone</li>
                        <li>We'll find previous records</li>
                        <li>Faster and easier</li>
                      </ul>
                      <div style={{ position: 'absolute', bottom: '16px', right: '16px', color: '#0e6c38' }}>
                        <ArrowRight size={22} />
                      </div>
                    </div>

                    <div 
                      className="selection-card"
                      style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'clamp(16px, 2.5vh, 24px)', position: 'relative' }}
                      onClick={() => goTo('05_NEW_PATIENT_RECORD')}
                    >
                      <div style={{ color: '#0e6c38' }}><User size={28} /></div>
                      <div style={{ fontWeight: 800, fontSize: 'clamp(16px, 2.2vw, 20px)', color: '#0e6c38', marginTop: '10px' }}>
                        I am a new patient
                      </div>
                      <div style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', color: '#64748b', marginTop: '3px' }}>
                        This is my first visit to this hospital.
                      </div>
                      <ul style={{ fontSize: 'clamp(11.5px, 1.4vw, 13px)', color: '#16a34a', fontWeight: 600, marginTop: '10px', paddingLeft: '14px', lineHeight: 1.5 }}>
                        <li>Create a new patient profile</li>
                        <li>Share basic information</li>
                        <li>We'll guide step by step</li>
                      </ul>
                      <div style={{ position: 'absolute', bottom: '16px', right: '16px', color: '#0e6c38' }}>
                        <ArrowRight size={22} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 05: NEW PATIENT - CREATE RECORD OR CONTINUE WITHOUT */}
              {currentScreen === '05_NEW_PATIENT_RECORD' && (
                <motion.div 
                  key="05_NEW_PATIENT_RECORD"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Since this is your first time here,</h2>
                      <p className="card-main-subtitle">would you like me to create your patient record?</p>
                    </div>
                  </div>

                  <div className="grid-2-cards" style={{ margin: '8px 0' }}>
                    <div 
                      className="selection-card"
                      style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px' }}
                      onClick={() => goTo('12_PHONE_INPUT')}
                    >
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0e6c38' }}>Create my patient record</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>Keep your information for future visits.</div>
                      <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '6px' }}>✔ Faster check-in next time</div>
                      <div style={{ fontSize: '10px', color: '#16a34a' }}>✔ Past records in one place</div>
                    </div>

                    <div 
                      className="selection-card"
                      style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px' }}
                      onClick={() => goTo('14_PHOTO_CAPTURE')}
                    >
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0e6c38' }}>Continue for this visit</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>Prepare information for today's consultation only.</div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>• No permanent record saved</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>• Can create profile later</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 06A: IDENTIFIER SELECTION */}
              {currentScreen === '06A_IDENTIFY_EXISTING' && (
                <motion.div 
                  key="06A_IDENTIFY_EXISTING"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Let's find your existing record</h2>
                      <p className="card-main-subtitle">You can use your registered phone number.</p>
                    </div>
                  </div>

                  <div className="grid-3-cards" style={{ margin: '10px 0' }}>
                    <div 
                      className="selection-card selected"
                      style={{ flexDirection: 'column', textAlign: 'center' }}
                      onClick={() => goTo('06B_ENTER_PHONE')}
                    >
                      <Smartphone size={24} color="#0e6c38" />
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38', marginTop: '4px' }}>Phone Number</div>
                      <div style={{ fontSize: '9.5px', color: '#16a34a', fontWeight: 700 }}>Recommended</div>
                    </div>

                    <div className="selection-card" style={{ opacity: 0.5, flexDirection: 'column', textAlign: 'center' }}>
                      <User size={24} color="#64748b" />
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#64748b', marginTop: '4px' }}>ABHA ID</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>Coming soon</div>
                    </div>

                    <div className="selection-card" style={{ opacity: 0.5, flexDirection: 'column', textAlign: 'center' }}>
                      <FileText size={24} color="#64748b" />
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#64748b', marginTop: '4px' }}>UHID</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>Coming soon</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('06B_ENTER_PHONE')}>
                      <span>Enter Phone Number</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 06B: ENTER PHONE / KEYPAD */}
              {currentScreen === '06B_ENTER_PHONE' && (
                <motion.div 
                  key="06B_ENTER_PHONE"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block" style={{ marginBottom: '6px' }}>
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Enter your phone number</h2>
                      <p className="card-main-subtitle">You can say it aloud or enter using the keypad.</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '6px auto',
                    padding: '8px 16px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    width: 'fit-content',
                    fontSize: '18px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    color: '#0e6c38'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '15px' }}>+91</span>
                    <span>{phoneInput ? phoneInput : 'XXXXX-XXXXX'}</span>
                  </div>

                  <div className="keypad-matrix">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
                      <button key={n} className="keypad-cell" onClick={() => handleKeyPress(n)}>{n}</button>
                    ))}
                    <button className="keypad-cell" onClick={handleKeyDelete}>⌫</button>
                    <button className="keypad-cell" onClick={() => handleKeyPress('0')}>0</button>
                    <button className="keypad-cell keypad-cell-action" onClick={handleKeySubmit}>
                      <Check size={18} />
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '6px' }}>
                    <button className="btn-secondary-pill" onClick={() => setPhoneInput('9876543210')}>
                      <Sparkles size={13} /> Speak "9876543210"
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 06C: SEARCHING RECORD */}
              {currentScreen === '06C_SEARCHING' && (
                <motion.div 
                  key="06C_SEARCHING"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    style={{ display: 'inline-block', marginBottom: '10px' }}
                  >
                    <RotateCw size={36} color="#0e6c38" />
                  </motion.div>
                  <h2 className="card-main-title">Searching your record...</h2>
                  <p className="card-main-subtitle">Please wait a moment while I check the hospital system.</p>

                  <div style={{ maxWidth: '280px', margin: '14px auto 0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#16a34a', fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Connecting to hospital system (Bahmni)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#16a34a', fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Searching for matching record
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#0e6c38', fontWeight: 700 }}>
                      <Activity size={14} /> Retrieving patient information...
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 07: RECORD FOUND */}
              {currentScreen === '07_EXISTING_FOUND' && (
                <motion.div 
                  key="07_EXISTING_FOUND"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">I found a record that matches your details!</h2>
                      <p className="card-main-subtitle">Please check if this is you.</p>
                    </div>
                  </div>

                  <div style={{
                    background: '#f4faf6',
                    border: '1.5px solid var(--color-mint-border)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    margin: '8px 0'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Full Name</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0e6c38' }}>{patientData.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Hospital UHID</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0e6c38' }}>{patientData.uhid}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Date of Birth / Age</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>14 Mar 2003 (22 years)</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Phone Number</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>{patientData.phone}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <button className="btn-secondary-pill" onClick={() => goTo('08_IDENTIFICATION_FAILED')}>
                      <X size={14} /> No, this is not me
                    </button>
                    <button className="btn-primary-pill" onClick={() => goTo('15_CLINICAL_CONVERSATION')}>
                      <Check size={16} /> Yes, this is me / Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 14: PHOTO CAPTURE */}
              {currentScreen === '14_PHOTO_CAPTURE' && (
                <motion.div 
                  key="14_PHOTO_CAPTURE"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Look at the camera</h2>
                      <p className="card-main-subtitle">Position your face within the frame and stay still.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '8px 0' }}>
                    <div style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '16px',
                      border: '2.5px solid #16a34a',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0
                    }}>
                      {hasWebcam ? (
                        <video ref={setVideoElement} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                      ) : (
                        <img src="/assets/patient_viewfinder.jpg" alt="Webcam face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontWeight: 700
                      }}>
                        Position face in oval
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: 700, color: '#0e6c38' }}>Tips for a clear photo:</div>
                      <div>👤 Face the camera directly</div>
                      <div>💡 Make sure your face is well lit</div>
                      <div>👁 Keep a neutral expression</div>
                      <div>👓 Remove sunglasses or cap</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '6px' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('15_CLINICAL_CONVERSATION')}>
                      <Camera size={16} /> Tap to capture
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 15: MAIN CLINICAL CONVERSATION (GEMINI LIVE) */}
              {currentScreen === '15_CLINICAL_CONVERSATION' && (
                <motion.div 
                  key="15_CLINICAL_CONVERSATION"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
                >
                  <div className="card-header-block" style={{ marginBottom: '6px' }}>
                    <div className="card-speech-wave-icon">
                      {isSpeaking ? (
                        <>
                          <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="sound-bar"></motion.div>
                          <motion.div animate={{ height: [4, 20, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="sound-bar"></motion.div>
                          <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.9 }} className="sound-bar"></motion.div>
                        </>
                      ) : (
                        <>
                          <div className="sound-bar"></div>
                          <div className="sound-bar"></div>
                          <div className="sound-bar"></div>
                        </>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Gemini Live AI</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: connectionState === 'connected' ? '#0e6c38' : '#eab308' }}>
                        {connectionState === 'connecting' && "Connecting to Server..."}
                        {connectionState === 'connected' && "Connected. You can speak now."}
                        {connectionState === 'error' && "Connection Error"}
                        {connectionState === 'disconnected' && "Disconnected"}
                      </div>
                    </div>
                  </div>

                  {geminiError && (
                    <div style={{ background: '#fee2e2', color: '#ef4444', padding: '8px', borderRadius: '8px', fontSize: '12px', marginTop: '10px' }}>
                      {geminiError}
                    </div>
                  )}

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div 
                      animate={connectionState === 'connected' && !isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{
                        background: isSpeaking ? '#e2e8f0' : (connectionState === 'connected' ? '#dcfce7' : '#f1f5f9'),
                        width: '120px', height: '120px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `4px solid ${isSpeaking ? '#cbd5e1' : (connectionState === 'connected' ? '#4ade80' : '#cbd5e1')}`
                      }}
                    >
                      <Mic size={48} color={isSpeaking ? '#94a3b8' : (connectionState === 'connected' ? '#22c55e' : '#94a3b8')} />
                    </motion.div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                      className="btn-primary-pill" 
                      onClick={() => goTo('24_MEASUREMENTS_INTRO')} 
                      style={{ background: '#0e6c38', padding: '12px 30px', margin: '0 auto' }}
                    >
                      <span>Finish Conversation</span>
                      <ArrowRight size={18} />
                    </button>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Powered by Google Gemini Multimodal Live API
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 17: PROCESSING / UNDERSTANDING */}
              {currentScreen === '17_PROCESSING' && (
                <motion.div 
                  key="17_PROCESSING"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <Sparkles size={34} color="#0e6c38" style={{ margin: '0 auto 8px auto' }} />
                  <h2 className="card-main-title">Thinking about what you said...</h2>
                  <p className="card-main-subtitle">Using AI to understand your response and extract clinical details.</p>

                  <div style={{ maxWidth: '280px', margin: '12px auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                    <div style={{ color: '#16a34a', fontWeight: 600 }}>✔ Converting speech to text</div>
                    <div style={{ color: '#16a34a', fontWeight: 600 }}>✔ Understanding meaning</div>
                    <div style={{ color: '#0e6c38', fontWeight: 700 }}>✔ Identifying key details...</div>
                  </div>

                  <button className="btn-primary-pill" onClick={() => goTo('18_I_HEARD_CONFIRM')}>
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* SCREEN 18: "I HEARD..." CONFIRMATION */}
              {currentScreen === '18_I_HEARD_CONFIRM' && (
                <motion.div 
                  key="18_I_HEARD_CONFIRM"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">I heard that...</h2>
                      <p className="card-main-subtitle">Please confirm if this is correct.</p>
                    </div>
                  </div>

                  <div style={{
                    background: '#f4faf6',
                    border: '1.5px solid var(--color-mint-border)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0e6c38',
                    fontStyle: 'italic',
                    margin: '8px 0'
                  }}>
                    "{typedComplaint}"
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <button className="btn-secondary-pill" onClick={() => goTo('19_TOUCH_INPUT')}>
                      <Edit3 size={13} /> No, let me correct it
                    </button>
                    <button className="btn-primary-pill" onClick={() => goTo('20_CHOICE_QUESTION')}>
                      <Check size={16} /> Yes, that's right
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 19: TOUCH INPUT */}
              {currentScreen === '19_TOUCH_INPUT' && (
                <motion.div 
                  key="19_TOUCH_INPUT"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <h2 className="card-main-title">Type your response</h2>
                  <p className="card-main-subtitle">What brings you here today? Type in your own words.</p>

                  <textarea 
                    value={typedComplaint}
                    onChange={(e) => setTypedComplaint(e.target.value)}
                    style={{
                      width: '100%',
                      height: '70px',
                      padding: '10px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--color-mint-border)',
                      fontSize: '13.5px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      marginTop: '8px'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                    <button className="btn-secondary-pill" onClick={() => goTo('15_CLINICAL_CONVERSATION')}>
                      Cancel
                    </button>
                    <button className="btn-primary-pill" onClick={() => goTo('20_CHOICE_QUESTION')}>
                      Done
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 20: CHOICE-BASED QUESTION */}
              {currentScreen === '20_CHOICE_QUESTION' && (
                <motion.div 
                  key="20_CHOICE_QUESTION"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block" style={{ marginBottom: '6px' }}>
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Do you currently have a cough?</h2>
                      <p className="card-main-subtitle">Please select one option below.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '6px 0' }}>
                    {[
                      { title: 'No cough', desc: 'I do not have a cough' },
                      { title: 'Mild cough', desc: 'Occasional cough, not too bothersome' },
                      { title: 'Moderate cough', desc: 'Frequent cough, somewhat bothersome' },
                      { title: 'Severe cough', desc: 'Continuous cough, very bothersome' }
                    ].map(opt => (
                      <div 
                        key={opt.title}
                        className={`selection-card ${coughSeverity === opt.title ? 'selected' : ''}`}
                        style={{ padding: '8px 12px' }}
                        onClick={() => setCoughSeverity(opt.title)}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: coughSeverity === opt.title ? '5px solid #16a34a' : '2px solid #cbd5e1',
                          background: '#fff'
                        }}></div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38' }}>{opt.title}</div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>{opt.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <button className="btn-secondary-pill" onClick={() => goTo('22_UNKNOWN_NOT_SURE')}>
                      I'm not sure
                    </button>
                    <button className="btn-primary-pill" onClick={() => goTo('24_MEASUREMENTS_INTRO')}>
                      <span>Next</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 23: RED FLAG ALERT */}
              {currentScreen === '23_RED_FLAG' && (
                <motion.div 
                  key="23_RED_FLAG"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ border: '1.5px solid #ef4444', borderRadius: '18px', padding: '12px', background: '#fff5f5' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                    <AlertTriangle size={22} />
                    <h2 style={{ fontSize: '16px', fontWeight: 800 }}>This may be a serious symptom</h2>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#991b1b', marginTop: '3px' }}>
                    Common reasons to seek urgent care include chest pressure, breathlessness, or dizziness.
                  </p>

                  <div style={{ background: '#fff', borderRadius: '12px', padding: '10px', margin: '8px 0', border: '1px solid #fecaca', fontSize: '11px', color: '#7f1d1d' }}>
                    <strong>What should you do now?</strong>
                    <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
                      <li>Please inform the facility staff immediately.</li>
                      <li>They will prioritize you for prompt triage.</li>
                    </ul>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button className="btn-primary-pill" style={{ background: '#dc2626' }} onClick={() => goTo('24_MEASUREMENTS_INTRO')}>
                      I understand →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 24: MEASUREMENTS INTRO */}
              {currentScreen === '24_MEASUREMENTS_INTRO' && (
                <motion.div 
                  key="24_MEASUREMENTS_INTRO"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">We'll now take a few measurements</h2>
                      <p className="card-main-subtitle">These are simple, quick, and painless.</p>
                    </div>
                  </div>

                  <div className="grid-2-cards" style={{ margin: '8px 0' }}>
                    <div className="selection-card">
                      <Heart size={22} color="#0e6c38" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38' }}>Blood Pressure</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Checks your arterial pressure</div>
                      </div>
                    </div>
                    <div className="selection-card">
                      <Activity size={22} color="#0e6c38" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#0e6c38' }}>Oxygen Saturation</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Carrying oxygen status</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('25_BP_INSTRUCTIONS')}>
                      <span>Let's begin</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 25: BP INSTRUCTIONS */}
              {currentScreen === '25_BP_INSTRUCTIONS' && (
                <motion.div 
                  key="25_BP_INSTRUCTIONS"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Blood Pressure Measurement</h2>
                      <p className="card-main-subtitle">A quick check to understand your heart health.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#334155', margin: '8px 0' }}>
                    <div>1. Sit comfortably with back supported and feet on floor.</div>
                    <div>2. Place arm into the desk cuff as shown.</div>
                    <div>3. Keep still and avoid talking for 30 seconds.</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('26_BP_POSITIONING')}>
                      <span>Ready to measure</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 26: BP POSITIONING */}
              {currentScreen === '26_BP_POSITIONING' && (
                <motion.div 
                  key="26_BP_POSITIONING"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center' }}
                >
                  <h2 className="card-main-title">Position Your Arm</h2>
                  <p className="card-main-subtitle">Please adjust your position as shown below.</p>

                  <img src="/assets/bp_graphic.png" alt="BP Cuff" style={{ maxHeight: '110px', objectFit: 'contain', margin: '8px auto' }} />

                  <div>
                    <button className="btn-primary-pill" onClick={() => goTo('27_BP_MEASURING')}>
                      <span>Looks good</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 27: BP MEASURING */}
              {currentScreen === '27_BP_MEASURING' && (
                <motion.div 
                  key="27_BP_MEASURING"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <h2 className="card-main-title">Measuring Your Blood Pressure</h2>
                  <p className="card-main-subtitle">Please stay still and avoid talking.</p>

                  <div style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    border: '4px solid #22c55e',
                    borderTopColor: '#0e6c38',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '12px auto'
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#0e6c38' }}>{bpCountdown}</span>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>seconds left</span>
                  </div>

                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0e6c38' }}>
                    Reading your blood pressure...
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <button className="btn-secondary-pill" onClick={() => goTo('28_BP_RESULT')}>
                      Skip countdown
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 28: BP RESULT */}
              {currentScreen === '28_BP_RESULT' && (
                <motion.div 
                  key="28_BP_RESULT"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Your Blood Pressure Result</h2>
                      <p className="card-main-subtitle">Measured just now using the kiosk device.</p>
                    </div>
                  </div>

                  <div className="grid-2-cards" style={{ margin: '8px 0' }}>
                    <div style={{ background: '#f4faf6', border: '1.5px solid var(--color-mint-border)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>Systolic (Upper)</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: '#0e6c38' }}>118</div>
                      <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>Normal</div>
                    </div>
                    <div style={{ background: '#f4faf6', border: '1.5px solid var(--color-mint-border)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>Diastolic (Lower)</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: '#0e6c38' }}>76</div>
                      <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>Normal</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>Measured: 10:24 AM</span>
                    <button className="btn-primary-pill" onClick={() => goTo('29_SPO2_MEASUREMENT')}>
                      <span>Continue</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 29: SPO2 MEASUREMENT */}
              {currentScreen === '29_SPO2_MEASUREMENT' && (
                <motion.div 
                  key="29_SPO2_MEASUREMENT"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Oxygen Saturation Measurement</h2>
                      <p className="card-main-subtitle">A quick and painless check in few seconds.</p>
                    </div>
                  </div>

                  <div className="grid-2-cards" style={{ margin: '8px 0' }}>
                    <div style={{ background: '#f4faf6', border: '1.5px solid var(--color-mint-border)', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>SpO2</div>
                      <div style={{ fontSize: '30px', fontWeight: 800, color: '#0e6c38' }}>98%</div>
                      <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>Normal</div>
                    </div>
                    <div style={{ background: '#f4faf6', border: '1.5px solid var(--color-mint-border)', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Heart Rate</div>
                      <div style={{ fontSize: '30px', fontWeight: 800, color: '#0e6c38' }}>72 <span style={{ fontSize: '14px' }}>bpm</span></div>
                      <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>Normal</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('30_DOCUMENT_INTRO')}>
                      <span>Ready to measure</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 30: DOCUMENT INTRO */}
              {currentScreen === '30_DOCUMENT_INTRO' && (
                <motion.div 
                  key="30_DOCUMENT_INTRO"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">Scan Your Medical Documents</h2>
                      <p className="card-main-subtitle">You can scan any relevant reports, prescriptions or test results.</p>
                    </div>
                  </div>

                  <div className="grid-2-cards" style={{ margin: '8px 0' }}>
                    <div className="selection-card">
                      <FileText size={20} color="#0e6c38" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0e6c38' }}>Lab test reports</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Blood, urine tests</div>
                      </div>
                    </div>
                    <div className="selection-card">
                      <Heart size={20} color="#0e6c38" />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0e6c38' }}>Doctor prescriptions</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Current & past Rx</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <button className="btn-secondary-pill" onClick={() => goTo('37_PREPARING_CASE')}>
                      Skip documents
                    </button>
                    <button className="btn-primary-pill" onClick={() => goTo('31_PLACE_DOCUMENT')}>
                      <span>Continue</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 31: INSERT DOCUMENT */}
              {currentScreen === '31_PLACE_DOCUMENT' && (
                <motion.div 
                  key="31_PLACE_DOCUMENT"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center' }}
                >
                  <h2 className="card-main-title">Insert Your Document</h2>
                  <p className="card-main-subtitle">Feed your document into the scanner slot as shown below.</p>

                  <img src="/assets/scanner_graphic.png" alt="Scanner slot" style={{ maxHeight: '100px', objectFit: 'contain', margin: '8px auto' }} />

                  <div>
                    <button className="btn-primary-pill" onClick={() => goTo('32_SCANNING_BACKGROUND')}>
                      <span>Scanning...</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 32: BACKGROUND SCANNING */}
              {currentScreen === '32_SCANNING_BACKGROUND' && (
                <motion.div 
                  key="32_SCANNING_BACKGROUND"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <h2 className="card-main-title">Scanning Document</h2>
                  <p className="card-main-subtitle">Your document is being scanned. This will only take a few seconds.</p>

                  <div style={{
                    width: '74px',
                    height: '90px',
                    border: '2px solid #0e6c38',
                    borderRadius: '10px',
                    margin: '12px auto',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#f8fafc'
                  }}>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${scanProgress}%`,
                      background: 'linear-gradient(180deg, #22c55e 0%, #0e6c38 100%)',
                      transition: 'height 0.4s ease'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: scanProgress > 50 ? '#ffffff' : '#0e6c38'
                    }}>
                      {scanProgress}%
                    </div>
                  </div>

                  <button className="btn-primary-pill" onClick={() => goTo('34_OCR_PROCESSING')}>
                    Continue session
                  </button>
                </motion.div>
              )}

              {/* SCREEN 34: OCR EXTRACTION */}
              {currentScreen === '34_OCR_PROCESSING' && (
                <motion.div 
                  key="34_OCR_PROCESSING"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <h2 className="card-main-title">Reading your document...</h2>
                  <p className="card-main-subtitle">Extracting important medical entities in the background.</p>

                  <div style={{ maxWidth: '270px', margin: '12px auto', textAlign: 'left', fontSize: '11px', color: '#16a34a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>✔ Document Received (100%)</div>
                    <div>✔ Text & Prescriptions Extracted</div>
                    <div>✔ Attached to Doctor's Case Summary</div>
                  </div>

                  <button className="btn-primary-pill" onClick={() => goTo('36_DOCUMENT_COMPLETE')}>
                    Next →
                  </button>
                </motion.div>
              )}

              {/* SCREEN 36: DOCUMENT COMPLETE */}
              {currentScreen === '36_DOCUMENT_COMPLETE' && (
                <motion.div 
                  key="36_DOCUMENT_COMPLETE"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 8px auto' }} />
                  <h2 className="card-main-title">All your documents are collected!</h2>
                  <p className="card-main-subtitle">We have everything we need. Let's assemble your case.</p>

                  <div style={{ marginTop: '14px' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('37_PREPARING_CASE')}>
                      <span>Assemble Case</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 37: PREPARING YOUR CASE */}
              {currentScreen === '37_PREPARING_CASE' && (
                <motion.div 
                  key="37_PREPARING_CASE"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <Sparkles size={36} color="#0e6c38" style={{ margin: '0 auto 8px auto' }} />
                  <h2 className="card-main-title">Preparing your case...</h2>
                  <p className="card-main-subtitle">Putting together all information — conversation, health details, and documents.</p>

                  <div style={{
                    width: '75%',
                    height: '6px',
                    background: '#e2e8f0',
                    borderRadius: '999px',
                    margin: '16px auto 0 auto',
                    overflow: 'hidden'
                  }}>
                    <motion.div 
                      style={{ height: '100%', background: '#16a34a' }}
                      animate={{ width: ['20%', '80%', '100%'] }}
                      transition={{ duration: 2.2, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* SCREEN 38: CASE READY */}
              {currentScreen === '38_CASE_READY' && (
                <motion.div 
                  key="38_CASE_READY"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 8px auto' }} />
                  <h2 className="card-main-title">Your case is ready!</h2>
                  <p className="card-main-subtitle">We've combined conversation, health details, and documents.</p>

                  <div style={{ marginTop: '16px' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('39_VISIT_QR')}>
                      <span>Create Visit QR</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 39: VISIT QR CREATED */}
              {currentScreen === '39_VISIT_QR' && (
                <motion.div 
                  key="39_VISIT_QR"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center' }}
                >
                  <h2 className="card-main-title">Your visit QR has been created!</h2>
                  <p className="card-main-subtitle">Your doctor can scan this code to securely access your prepared case.</p>

                  <div style={{
                    background: '#ffffff',
                    border: '1.5px solid var(--color-mint-border)',
                    borderRadius: '16px',
                    padding: '12px',
                    width: 'fit-content',
                    margin: '10px auto',
                    boxShadow: '0 6px 18px rgba(14, 108, 56, 0.08)'
                  }}>
                    <QrCode size={90} color="#0e6c38" />
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0e6c38', marginTop: '4px' }}>
                      Token: {patientData.token}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('40_WRISTBAND_PRINTING')}>
                      <span>Print Wristband</span>
                      <Printer size={15} />
                    </button>
                    <button className="btn-secondary-pill" onClick={() => goTo('42_ALL_SET')}>
                      Skip
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 40: WRISTBAND PRINTING */}
              {currentScreen === '40_WRISTBAND_PRINTING' && (
                <motion.div 
                  key="40_WRISTBAND_PRINTING"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <h2 className="card-main-title">Get Your Wristband Ready</h2>
                  <p className="card-main-subtitle">Your wristband with QR code will be dispensed automatically.</p>

                  <Printer size={44} color="#0e6c38" style={{ margin: '14px auto' }} className="animate-bounce" />

                  <div>
                    <button className="btn-primary-pill" onClick={() => goTo('41_COLLECT_WRISTBAND')}>
                      <span>Dispense Wristband</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 41: COLLECT WRISTBAND */}
              {currentScreen === '41_COLLECT_WRISTBAND' && (
                <motion.div 
                  key="41_COLLECT_WRISTBAND"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <h2 className="card-main-title">Dispensing your wristband...</h2>
                  <p className="card-main-subtitle">Please keep your hand steady and take the wristband once fully out.</p>

                  <div style={{
                    background: '#f4faf6',
                    border: '1px solid var(--color-mint-border)',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    margin: '10px auto',
                    width: 'fit-content',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0e6c38'
                  }}>
                    🎟 Token #{patientData.token} · Rahul Sharma
                  </div>

                  <button className="btn-primary-pill" onClick={() => goTo('42_ALL_SET')}>
                    <span>I collected my wristband</span>
                    <Check size={16} />
                  </button>
                </motion.div>
              )}

              {/* SCREEN 42: YOU'RE ALL SET */}
              {currentScreen === '42_ALL_SET' && (
                <motion.div 
                  key="42_ALL_SET"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="card-header-block">
                    <div className="card-speech-wave-icon">
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                      <div className="sound-bar"></div>
                    </div>
                    <div>
                      <h2 className="card-main-title">You're All Set!</h2>
                      <p className="card-main-subtitle">Your information has been securely sent to your care team.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0', fontSize: '11.5px', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#16a34a" />
                      <span>Please keep your wristband with you.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#16a34a" />
                      <span>Take a seat in Room 4 waiting area.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#16a34a" />
                      <span>You will be notified when your token <strong>#{patientData.token}</strong> is called.</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('43_SESSION_COMPLETE')}>
                      <span>Finish</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 43: SESSION COMPLETE */}
              {currentScreen === '43_SESSION_COMPLETE' && (
                <motion.div 
                  key="43_SESSION_COMPLETE"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  style={{ textAlign: 'center', margin: 'auto 0' }}
                >
                  <Heart size={36} color="#0e6c38" style={{ margin: '0 auto 6px auto' }} />
                  <h2 className="card-main-title" style={{ fontSize: '22px' }}>Thank You!</h2>
                  <p className="card-main-subtitle">
                    Your check-in is complete. We appreciate you for using MediKiosk.<br />Wishing you a safe and healthy visit!
                  </p>

                  <div style={{ marginTop: '16px' }}>
                    <button className="btn-primary-pill" onClick={() => goTo('00_IDLE')}>
                      <span>Return to Home</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Dual Bottom Captions Bar (Inside the Card) */}
          <div className="dual-captions-bar">
            <div className="caption-box">
              <div className="caption-icon-circle">
                <Volume2 size={13} />
              </div>
              <div className="caption-texts">
                <span className="caption-author-tag">MediKiosk</span>
                <span className="caption-line-text">{captions.medikiosk}</span>
              </div>
            </div>

            <div className="caption-box" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
              <div className="caption-icon-circle" style={{ background: '#fef3c7', color: '#d97706', borderColor: '#fde68a' }}>
                <Mic size={13} />
              </div>
              <div className="caption-texts">
                <span className="caption-author-tag" style={{ color: '#b45309' }}>You</span>
                <span className="caption-line-text">{captions.you}</span>
              </div>
            </div>
          </div>

          {/* Card Footer Navigation Bar */}
          <div className="card-nav-footer">
            <button 
              className="card-back-btn"
              onClick={() => {
                const idx = ALL_SCREENS.findIndex(s => s.id === currentScreen);
                if (idx > 0) goTo(ALL_SCREENS[idx - 1].id);
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            {/* Stepper removed per user request */}
            <div style={{ flex: 1 }} />

            <button className="card-help-btn" onClick={() => goTo('21_RETRY_UNCLEAR')}>
              <HelpCircle size={14} />
              <span>Need help? Talk to me</span>
            </button>
          </div>
        </main>

        {/* Sub-Footer Motto Banner */}
        <footer className="kiosk-subfooter">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src="/assets/sprout_icon.png" alt="Sprout" style={{ width: '14px', height: 'auto' }} />
            <span>Healthier People, Brighter Tomorrows</span>
          </div>
          <span>A smarter tomorrow for healthier communities</span>
        </footer>

      </div>

      {/* Doctor Interface Case Review Modal */}
      <AnimatePresence>
        {showDoctorModal && (
          <div className="doctor-modal-overlay" onClick={() => setShowDoctorModal(false)}>
            <motion.div 
              className="doctor-modal-window"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Doctor Review Header */}
              <div style={{
                background: '#0e6c38',
                color: '#ffffff',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stethoscope size={20} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800 }}>MediKiosk Doctor Review Desk</h3>
                    <div style={{ fontSize: '10px', opacity: 0.85 }}>SIH26047 · Pre-Consultation Prepared Summary</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: '#22c55e',
                    color: '#074723',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 800
                  }}>
                    Token #{patientData.token}
                  </span>
                  <button 
                    onClick={() => setShowDoctorModal(false)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Doctor Review Body */}
              <div style={{ padding: '16px 20px', overflowY: 'auto', maxHeight: '72vh', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Red Flag Alert */}
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '12px', color: '#991b1b' }}>
                      Clinical Red Flag Flagged by Kiosk
                    </div>
                    <div style={{ fontSize: '11px', color: '#b91c1c' }}>
                      {patientData.redFlags[0].symptom} — {patientData.redFlags[0].severity}
                    </div>
                  </div>
                </div>

                {/* Patient Demographics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 14px'
                }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Patient</div>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>{patientData.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Age / Gender</div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>{patientData.age}y / {patientData.gender}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Hospital UHID</div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>{patientData.uhid}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Phone</div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>{patientData.phone}</div>
                  </div>
                </div>

                {/* Structured Clinical Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ fontWeight: 800, fontSize: '11px', color: '#0e6c38', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Chief Complaint (Voice-Elicited)
                    </div>
                    <div style={{ fontSize: '12px', color: '#1e293b' }}>
                      {patientData.chiefComplaint}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ fontWeight: 800, fontSize: '11px', color: '#0e6c38', textTransform: 'uppercase', marginBottom: '4px' }}>
                      History of Present Illness (HPI)
                    </div>
                    <div style={{ fontSize: '12px', color: '#1e293b' }}>
                      {patientData.hpi}
                    </div>
                  </div>
                </div>

                {/* Vitals with Provenance */}
                <div style={{ background: '#f4faf6', border: '1px solid var(--color-mint-border)', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '11px', color: '#0e6c38', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Vitals & Measurements (With Source & Timestamp Provenance)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Blood Pressure</div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0e6c38' }}>{patientData.vitals.bp}</div>
                      <div style={{ fontSize: '9px', color: '#16a34a' }}>{patientData.vitals.bpSource}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>SpO2</div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0e6c38' }}>{patientData.vitals.spo2}</div>
                      <div style={{ fontSize: '9px', color: '#16a34a' }}>kiosk_device</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Pulse</div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0e6c38' }}>{patientData.vitals.pulse}</div>
                      <div style={{ fontSize: '9px', color: '#16a34a' }}>kiosk_device</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Blood Group</div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0e6c38' }}>B+</div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>Self-reported</div>
                    </div>
                  </div>
                </div>

                {/* AYUSH Assessment */}
                <div style={{ background: '#fdfbf7', border: '1px solid #fef3c7', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '11px', color: '#b45309', textTransform: 'uppercase', marginBottom: '6px' }}>
                    AYUSH Specific Intake (Ministry of Ayush / AIIA)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#78716c' }}>Prakriti</div>
                      <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#92400e' }}>{patientData.ayush.prakriti}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#78716c' }}>Agni</div>
                      <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#92400e' }}>{patientData.ayush.agni}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#78716c' }}>Koshtha</div>
                      <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#92400e' }}>{patientData.ayush.koshtha}</div>
                    </div>
                  </div>
                </div>

                {/* Scanned Document Thumbnails */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '50px',
                    height: '64px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px'
                  }}>
                    <FileCheck size={18} color="#0e6c38" />
                    <span style={{ fontSize: '8px', fontWeight: 700, color: '#475569' }}>Rx.pdf</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                    <strong>Prescription from PHC:</strong> Amoxicillin 500mg, Paracetamol 650mg. OCR extraction confidence 96.4%. Original document verified.
                  </div>
                </div>

              </div>

              {/* Doctor Review Footer */}
              <div style={{
                borderTop: '1px solid #e2e8f0',
                padding: '12px 20px',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  Offline sync status: <strong>Cached in local SQLite</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-secondary-pill"
                    onClick={() => alert('Opening clinical editor modal...')}
                  >
                    <Edit3 size={13} /> Edit Summary
                  </button>

                  <button 
                    className="btn-primary-pill"
                    onClick={() => {
                      setHisPushStatus('pushing');
                      setTimeout(() => {
                        setHisPushStatus('synced');
                        alert('Confirmed and pushed to Bahmni OpenMRS via FHIR R4 Bundle!');
                      }, 800);
                    }}
                  >
                    {hisPushStatus === 'pushing' ? 'Pushing...' : hisPushStatus === 'synced' ? '✔ Pushed to HIS' : 'Confirm & Push to HIS'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
