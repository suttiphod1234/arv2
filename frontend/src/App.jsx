import React, { useState, useEffect } from 'react'
import RestaurantScene from './components/RestaurantScene.jsx'

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [portfolio, setPortfolio] = useState([]);
  
  // Quiz & Speech States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [dialogueScore, setDialogueScore] = useState(0);
  const [speechScore, setSpeechScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [recognition, setRecognition] = useState(null);

  const questions = [
    {
      q: "ลูกค้ายืนรอที่หน้าประตูร้าน คุณควรพูดอย่างไร?",
      options: [
        { text: "Welcome to our restaurant! Do you have a reservation?", correct: true },
        { text: "What do you want to eat today?", correct: false },
        { text: "Please wait outside, we are busy.", correct: false }
      ]
    },
    {
      q: "ลูกค้าไม่มีการจองโต๊ะและร้านเต็ม คุณควรพูดยังไง?",
      options: [
        { text: "Go away, no table.", correct: false },
        { text: "We are currently full. Would you mind waiting for about 15 minutes?", correct: true },
        { text: "I don't care, find your own table.", correct: false }
      ]
    }
  ];

  // Fetch portfolio data from Node.js backend
  useEffect(() => {
    fetchPortfolio();
    
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setSpokenText(text);
        
        // Call Backend API (Python via Node)
        fetch('http://localhost:3000/api/analyze-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spoken_text: text,
            target_text: "May I recommend our chef's special menu for tonight?"
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setSpeechScore(data.score);
          }
        })
        .catch(err => console.error('Failed to analyze speech:', err));
      };

      setRecognition(rec);
    }
  }, []);

  const fetchPortfolio = () => {
    fetch('http://localhost:3000/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(data))
      .catch(err => console.error('Failed to fetch portfolio:', err));
  };

  const handleDialogueAnswer = (correct) => {
    if (correct) setDialogueScore(dialogueScore + 50);
    
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentView('speech');
    }
  };

  const submitFinalScore = () => {
    const totalScore = Math.round((dialogueScore + speechScore) / 2);
    fetch('http://localhost:3000/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'React Student',
        scenario: 'Greeting & Welcome',
        score: totalScore
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(`บันทึกคะแนนสำเร็จ! คะแนนรวม: ${totalScore}`);
      fetchPortfolio(); // Refresh list
      setCurrentView('modules');
      // Reset state
      setCurrentQuestion(0);
      setDialogueScore(0);
      setSpeechScore(0);
      setSpokenText('');
    })
    .catch(err => alert('Failed to save score. Is backend running?'));
  };

  return (
    <div className="font-body antialiased flex justify-center bg-[#050811] min-h-screen">
      {/* Main App Container (Simulating Phone width on Desktop) */}
      <div className="w-full max-w-md h-screen bg-[#0B101E] relative shadow-2xl overflow-hidden flex flex-col">

        {/* 1. WELCOME SCREEN */}
        {currentView === 'welcome' && (
          <section className="flex-1 flex flex-col justify-between p-6 bg-[url('https://images.unsplash.com/photo-1517248113827-02a8f990b5cc?ixlib=rb-4.0.3')] bg-cover bg-center relative">
            {/* Overlay to darken background */}
            <div className="absolute inset-0 bg-black/70 z-0"></div>

            <div className="relative z-10 text-center mt-20">
              <div className="w-20 h-20 bg-[#D4AF37]/10 border-2 border-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                <i className="fa-solid fa-utensils text-3xl text-[#D4AF37]"></i>
              </div>
              <h1 className="font-heading text-xs uppercase tracking-widest text-[#D4AF37] mb-2">Integrated Restaurant Service</h1>
              <h2 className="font-heading text-3xl font-bold text-white mb-2">3D & AR TRAINING SIMULATION</h2>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">PROFESSIONAL HOSPITALITY LEARNING EXPERIENCE</p>
            </div>

            <div className="relative z-10 space-y-3 mb-10">
              <button onClick={() => setCurrentView('modules')} className="w-full bg-[#D4AF37] text-slate-900 font-heading font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg flex items-center justify-center gap-2">
                START EXPERIENCE <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
              <button className="w-full bg-white/5 border border-white/10 text-white font-heading font-bold py-3.5 rounded-xl hover:bg-white/10 transition-colors">
                HOW TO USE
              </button>
            </div>
          </section>
        )}

        {/* 2. LEARNING MODULES (Dashboard) */}
        {currentView === 'modules' && (
          <section className="flex-1 p-5 overflow-y-auto pb-24">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-heading text-2xl font-bold text-white">LEARNING MODULES</h1>
                <p className="text-xs text-slate-400">พัฒนาสมรรถนะวิชาชีพของคุณ</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#151D2F] border border-white/10 flex items-center justify-center">
                <i className="fa-solid fa-bell text-slate-400"></i>
              </div>
            </div>

            {/* Module List */}
            <div className="space-y-4">
              {/* Module: 3D Scene */}
              <div onClick={() => setCurrentView('3d')} className="bg-[#151D2F]/60 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 border border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37]">
                <div className="w-12 h-12 rounded-lg bg-[#151D2F] border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-cube text-[#D4AF37] text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-semibold text-white">3D Restaurant Scene</h3>
                  <p className="text-xs text-slate-400 mt-1">สำรวจร้านอาหารแบบ 3D</p>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-600 text-xs"></i>
              </div>

              {/* Module 1: Interactive Quiz (Updated) */}
              <div onClick={() => setCurrentView('dialogue')} className="bg-[#151D2F]/60 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 border border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37]">
                <div className="w-12 h-12 rounded-lg bg-[#151D2F] border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-door-open text-[#D4AF37] text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-semibold text-white">Greeting & Welcome (Practice)</h3>
                  <p className="text-xs text-slate-400 mt-1">เริ่มทำแบบทดสอบและฝึกพูด</p>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-600 text-xs"></i>
              </div>

              {/* Module 2 */}
              <div className="bg-[#151D2F]/60 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 border border-white/5">
                <div className="w-12 h-12 rounded-lg bg-[#151D2F] border border-white/5 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-book-open text-[#D4AF37] text-xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-semibold text-white">Menu Recommendation</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4AF37]" style={{ width: '80%' }}></div>
                    </div>
                    <span className="text-[10px] text-slate-400">80%</span>
                  </div>
                </div>
                <i className="fa-solid fa-lock text-slate-600 text-xs"></i>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="mt-6">
              <h2 className="font-heading text-lg font-bold text-white mb-3">MY PORTFOLIO</h2>
              <div className="space-y-3">
                {portfolio.length === 0 ? (
                  <div className="bg-[#151D2F]/30 p-4 rounded-xl text-center border border-white/5">
                    <p className="text-xs text-slate-500">ยังไม่มีประวัติการทำกิจกรรม (หรือ Server ยังไม่ได้เปิด)</p>
                  </div>
                ) : (
                  portfolio.map((act, index) => (
                    <div key={index} className="bg-[#151D2F]/60 backdrop-blur-md p-3 rounded-xl flex items-center justify-between border border-white/5">
                      <div>
                        <h3 className="text-sm font-medium text-white">{act.name}</h3>
                        <p className="text-[10px] text-slate-500">Completed: {act.date}</p>
                      </div>
                      <span className="text-green-400 font-bold">{act.score}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </section>
        )}

        {/* 3. DIALOGUE VIEW */}
        {currentView === 'dialogue' && (
          <section className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCurrentView('modules')} className="text-slate-400 hover:text-white transition-colors">
                  <i className="fa-solid fa-arrow-left"></i> ย้อนกลับ
                </button>
                <span className="text-xs text-[#D4AF37]">ข้อที่ {currentQuestion + 1}/{questions.length}</span>
              </div>
              
              <div className="bg-[#151D2F]/60 backdrop-blur-md p-5 rounded-xl border border-white/5 mb-6">
                <p className="text-white text-sm">{questions[currentQuestion].q}</p>
              </div>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((opt, index) => (
                  <button key={index} onClick={() => handleDialogueAnswer(opt.correct)} className="w-full text-left bg-[#151D2F]/30 border border-white/5 p-4 rounded-xl text-sm text-slate-300 hover:border-[#D4AF37]/50 hover:bg-[#151D2F]/50 transition-colors">
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4. SPEECH VIEW */}
        {currentView === 'speech' && (
          <section className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCurrentView('modules')} className="text-slate-400 hover:text-white transition-colors">
                  <i className="fa-solid fa-arrow-left"></i> ย้อนกลับ
                </button>
                <span className="text-xs text-[#D4AF37]">ฝึกพูดภาษาอังกฤษ</span>
              </div>

              <div className="text-center mb-10">
                <p className="text-xs text-slate-400 mb-2">อ่านออกเสียงประโยคต่อไปนี้:</p>
                <p className="text-white text-lg font-semibold">"May I recommend our chef's special menu for tonight?"</p>
              </div>

              <div className="flex flex-col items-center justify-center gap-4">
                <button 
                  onClick={() => {
                    if (isRecording) recognition.stop();
                    else recognition.start();
                  }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#D4AF37]'} text-slate-900 text-2xl shadow-lg`}
                >
                  <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
                </button>
                <p className="text-xs text-slate-400">{isRecording ? 'กำลังฟัง...' : 'แตะไมโครโฟนเพื่อเริ่มพูด'}</p>
              </div>

              {spokenText && (
                <div className="mt-8 bg-[#151D2F]/60 p-4 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-400 mb-1">คุณพูดว่า:</p>
                  <p className="text-white text-sm">"{spokenText}"</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#D4AF37] font-bold">คะแนนสำเนียง: {speechScore}%</span>
                    <span className="text-xs text-slate-500">{speechScore >= 80 ? 'ยอดเยี่ยม!' : 'พยายามอีกนิด'}</span>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => submitFinalScore()} className="w-full bg-[#D4AF37] text-slate-900 font-heading font-bold py-3.5 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg">
              บันทึกคะแนนและเสร็จสิ้น
            </button>
          </section>
        )}

        {/* 5. 3D SCENE VIEW */}
        {currentView === '3d' && (
          <section className="flex-1 flex flex-col h-full relative">
            <div className="absolute top-5 left-5 z-10">
              <button onClick={() => setCurrentView('modules')} className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            </div>
            <div className="flex-1">
              <RestaurantScene />
            </div>
            <div className="absolute bottom-5 left-5 right-5 bg-black/80 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <h3 className="font-heading text-sm font-semibold text-white">3D Environment</h3>
              <p className="text-xs text-slate-400 mt-1">ใช้สองนิ้วเพื่อหมุน และจีบนิ้วเพื่อซูม</p>
            </div>
          </section>
        )}

        {/* FIXED BOTTOM NAVIGATION BAR */}
        {currentView !== 'welcome' && currentView !== 'dialogue' && currentView !== 'speech' && (
          <nav className="absolute bottom-0 w-full bg-[#151D2F]/80 backdrop-blur-md border-t border-white/5 px-6 py-3 flex justify-between items-center z-50">
            <button onClick={() => setCurrentView('welcome')} className={`flex flex-col items-center gap-1 ${currentView === 'welcome' ? 'text-[#D4AF37]' : 'text-slate-500'}`}>
              <i className="fa-solid fa-house text-lg"></i>
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button onClick={() => setCurrentView('modules')} className={`flex flex-col items-center gap-1 ${currentView === 'modules' || currentView === '3d' ? 'text-[#D4AF37]' : 'text-slate-500'}`}>
              <i className="fa-solid fa-book-open text-lg"></i>
              <span className="text-[10px] font-medium">Learning</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-500">
              <i className="fa-solid fa-clapperboard text-lg"></i>
              <span className="text-[10px] font-medium">Scenarios</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-500">
              <i className="fa-solid fa-user text-lg"></i>
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </nav>
        )}

      </div>
    </div>
  )
}

export default App
