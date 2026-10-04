import { useState, useEffect, useCallback, useRef } from 'react';

// ============ TYPES ============
type Page = 'cover' | 'menu' | 'petunjuk' | 'apersepsi' | 'materi' | 'aktivitas' | 'game' | 'latihan' | 'kuis' | 'hasil' | 'refleksi';
type MateriSub = 'intro' | 'abu-bakar' | 'umar';

interface QuizAnswer {
  question: number;
  selected: number | null;
  correct: boolean;
}

interface GameState {
  currentPage: Page;
  materiSub: MateriSub;
  quizAnswers: QuizAnswer[];
  quizFinished: boolean;
  quizScore: number;
  totalStars: number;
  startTime: number;
  activityScores: { matching: number; dragdrop: number; susunKata: number };
}

// ============ DATA ============
const quizQuestions = [
  {
    question: "Siapakah khalifah pertama setelah Rasulullah ﷺ wafat?",
    options: ["Umar bin Khattab", "Abu Bakar ash-Shiddiq", "Utsman bin Affan", "Ali bin Abi Thalib"],
    correct: 1,
    explanation: "Abu Bakar ash-Shiddiq adalah khalifah pertama yang diangkat setelah Rasulullah ﷺ wafat pada tahun 632 M."
  },
  {
    question: "Apa gelar yang diberikan kepada Abu Bakar karena selalu membenarkan Rasulullah ﷺ?",
    options: ["Al-Faruq", "Ash-Shiddiq", "Dzun Nurain", "Amirul Mu'minin"],
    correct: 1,
    explanation: "Ash-Shiddiq artinya 'yang sangat jujur/benar'. Gelar ini diberikan karena Abu Bakar selalu membenarkan perkataan Rasulullah ﷺ."
  },
  {
    question: "Apa arti gelar 'Al-Faruq' yang dimiliki Umar bin Khattab?",
    options: ["Yang pemberani", "Yang membedakan benar dan salah", "Yang bijaksana", "Yang dermawan"],
    correct: 1,
    explanation: "Al-Faruq artinya 'pembeda', yaitu orang yang mampu membedakan antara yang hak (benar) dan yang batil (salah)."
  },
  {
    question: "Salah satu jasa besar Abu Bakar ash-Shiddiq adalah...",
    options: ["Membangun masjid besar", "Mengumpulkan mushaf Al-Quran", "Memerangi orang yang enggan membayar zakat", "Membuat mata uang Islam"],
    correct: 2,
    explanation: "Abu Bakar memerangi orang-orang murtad dan yang enggan membayar zakat untuk menjaga keutuhan Islam."
  },
  {
    question: "Pada masa pemerintahan Umar bin Khattab, wilayah Islam meluas hingga mencakup...",
    options: ["China dan Jepang", "Persia dan Mesir", "India dan Afrika Selatan", "Eropa dan Amerika"],
    correct: 1,
    explanation: "Pada masa Umar, wilayah Islam meluas mencakup Persia, Syam, dan Mesir."
  },
  {
    question: "Apa nama perang melawan nabi palsu Musailamah Al-Kazzab pada masa Abu Bakar?",
    options: ["Perang Badar", "Perang Uhud", "Perang Yamamah", "Perang Khandaq"],
    correct: 2,
    explanation: "Perang Yamamah terjadi pada masa Abu Bakar untuk melawan nabi palsu Musailamah Al-Kazzab."
  },
  {
    question: "Umar bin Khattab mendirikan sistem administrasi yang disebut...",
    options: ["Baitul Mal", "Diwan", "Syura", "Hijrah"],
    correct: 1,
    explanation: "Umar mendirikan Diwan, yaitu sistem pencatatan dan administrasi untuk mengatur gaji tentara dan tunjangan rakyat."
  },
  {
    question: "Abu Bakar ash-Shiddiq berasal dari suku...",
    options: ["Aus", "Khazraj", "Quraisy (Bani Taim)", "Quraisy (Bani Umayyah)"],
    correct: 2,
    explanation: "Abu Bakar berasal dari suku Quraisy, tepatnya dari Bani Taim."
  },
  {
    question: "Jasa Umar bin Khattab yang masih digunakan hingga sekarang adalah...",
    options: ["Membuat kalender Hijriyah", "Membangun Ka'bah", "Menulis Al-Quran", "Mendirikan Haji"],
    correct: 0,
    explanation: "Umar bin Khattab menetapkan kalender Hijriyah yang dimulai dari peristiwa hijrahnya Rasulullah ﷺ."
  },
  {
    question: "Sikap keteladanan yang bisa kita ambil dari Abu Bakar ash-Shiddiq adalah...",
    options: ["Suka marah-marah", "Selalu jujur dan percaya pada kebenaran", "Suka pamer kekayaan", "Tidak peduli pada orang lain"],
    correct: 1,
    explanation: "Abu Bakar ash-Shiddiq dikenal sangat jujur, dermawan, dan selalu percaya pada kebenaran. Ini adalah sikap yang patut kita teladani."
  }
];

const latihanQuestions = [
  {
    question: "Abu Bakar ash-Shiddiq adalah sahabat Rasulullah ﷺ yang paling tua usianya. Benar atau salah?",
    options: ["Benar", "Salah"],
    correct: 1,
    explanation: "Salah. Abu Bakar bukan yang paling tua, namun beliau adalah sahabat yang paling dekat dan dipercaya oleh Rasulullah ﷺ."
  },
  {
    question: "Umar bin Khattab masuk Islam setelah mendengar ayat Al-Quran dari surat...",
    options: ["Al-Fatihah", "Thaha", "Al-Baqarah", "Ali Imran"],
    correct: 1,
    explanation: "Umar bin Khattab masuk Islam setelah mendengar bacaan surat Thaha yang membuat hatinya tersentuh."
  },
  {
    question: "Abu Bakar menggunakan hartanya untuk memerdekaan budak yang masuk Islam. Salah satu budak yang dimerdekakan adalah...",
    options: ["Bilal bin Rabah", "Zaid bin Haritsah", "Salman Al-Farisi", "Khabbab bin Arats"],
    correct: 0,
    explanation: "Abu Bakar memerdekaan Bilal bin Rabah dari penyiksaan tuannya dengan membelinya dan memerdekakannya."
  },
  {
    question: "Pada masa Umar bin Khattab, pertama kali diadakan shalat Tarawih berjamaah di masjid. Benar atau salah?",
    options: ["Benar", "Salah"],
    correct: 0,
    explanation: "Benar! Umar bin Khattab memerintahkan shalat Tarawih dilakukan berjamaah di masjid dengan imam Ubay bin Ka'ab."
  },
  {
    question: "Khalifah Abu Bakar memerintah selama berapa tahun?",
    options: ["1 tahun", "2 tahun 3 bulan", "4 tahun", "10 tahun"],
    correct: 1,
    explanation: "Abu Bakar ash-Shiddiq memerintah selama 2 tahun 3 bulan (632-634 M)."
  }
];

// ============ MAIN APP ============
export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('pai-khulafaurrasyidin-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return {
      currentPage: 'cover',
      materiSub: 'intro',
      quizAnswers: [],
      quizFinished: false,
      quizScore: 0,
      totalStars: 0,
      startTime: Date.now(),
      activityScores: { matching: 0, dragdrop: 0, susunKata: 0 }
    };
  });

  useEffect(() => {
    localStorage.setItem('pai-khulafaurrasyidin-state', JSON.stringify(gameState));
  }, [gameState]);

  const navigate = useCallback((page: Page) => {
    setGameState(prev => ({ ...prev, currentPage: page }));
    window.scrollTo(0, 0);
  }, []);

  const setMateriSub = useCallback((sub: MateriSub) => {
    setGameState(prev => ({ ...prev, materiSub: sub }));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-cream)] islamic-pattern">
      {gameState.currentPage === 'cover' && <CoverPage onStart={() => navigate('menu')} />}
      {gameState.currentPage === 'menu' && <MenuPage onNavigate={navigate} totalStars={gameState.totalStars} />}
      {gameState.currentPage === 'petunjuk' && <PetunjukPage onBack={() => navigate('menu')} />}
      {gameState.currentPage === 'apersepsi' && <ApersepsiPage onNext={() => navigate('materi')} onBack={() => navigate('menu')} />}
      {gameState.currentPage === 'materi' && <MateriPage sub={gameState.materiSub} setSub={setMateriSub} onBack={() => navigate('menu')} />}
      {gameState.currentPage === 'aktivitas' && <AktivitasPage onBack={() => navigate('menu')} onStarEarn={(pts) => setGameState(prev => ({...prev, totalStars: prev.totalStars + pts}))} />}
      {gameState.currentPage === 'game' && <GamePage onBack={() => navigate('menu')} onStarEarn={(pts) => setGameState(prev => ({...prev, totalStars: prev.totalStars + pts}))} />}
      {gameState.currentPage === 'latihan' && <LatihanPage onBack={() => navigate('menu')} onStarEarn={(pts) => setGameState(prev => ({...prev, totalStars: prev.totalStars + pts}))} />}
      {gameState.currentPage === 'kuis' && (
        <KuisPage 
          answers={gameState.quizAnswers}
          setAnswers={(a) => setGameState(prev => ({...prev, quizAnswers: a}))}
          onFinish={(score) => setGameState(prev => ({...prev, quizFinished: true, quizScore: score}))}
          onBack={() => navigate('menu')}
        />
      )}
      {gameState.currentPage === 'hasil' && (
        <HasilPage 
          score={gameState.quizScore} 
          totalStars={gameState.totalStars}
          startTime={gameState.startTime}
          onRetry={() => { setGameState(prev => ({...prev, quizAnswers: [], quizFinished: false, quizScore: 0})); navigate('kuis'); }}
          onBack={() => navigate('menu')}
        />
      )}
      {gameState.currentPage === 'refleksi' && <RefleksiPage onBack={() => navigate('menu')} />}
    </div>
  );
}

// ============ MASCOT COMPONENT ============
function Mascot({ expression = 'happy', size = 'md', message }: { expression?: 'happy' | 'thinking' | 'excited' | 'proud'; size?: 'sm' | 'md' | 'lg'; message?: string }) {
  const sizeClass = size === 'sm' ? 'w-16 h-16 text-2xl' : size === 'lg' ? 'w-32 h-32 text-5xl' : 'w-24 h-24 text-4xl';
  const expressions = { happy: '😊', thinking: '🤔', excited: '🤩', proud: '😎' };
  
  return (
    <div className={`flex flex-col items-center ${message ? 'gap-2' : ''}`}>
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-accent)] flex items-center justify-center shadow-lg animate-float`}>
        <span>{expressions[expression]}</span>
      </div>
      {message && (
        <div className="bg-white rounded-xl px-4 py-2 shadow-md border-2 border-[var(--color-primary)] max-w-[200px] text-center text-sm font-semibold relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-[var(--color-primary)] rotate-45"></div>
          <span className="relative z-10">{message}</span>
        </div>
      )}
    </div>
  );
}

// ============ NAVIGATION BAR ============
function NavBar({ onNavigate, currentPage }: { onNavigate: (page: Page) => void; currentPage: Page }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-[var(--color-primary)] z-50 shadow-lg">
      <div className="flex justify-around items-center py-2 px-1 max-w-4xl mx-auto">
        {[
          { icon: '🏠', label: 'Beranda', page: 'menu' as Page },
          { icon: '📖', label: 'Materi', page: 'materi' as Page },
          { icon: '🎯', label: 'Aktivitas', page: 'aktivitas' as Page },
          { icon: '🎮', label: 'Game', page: 'game' as Page },
          { icon: '📝', label: 'Latihan', page: 'latihan' as Page },
          { icon: '❓', label: 'Kuis', page: 'kuis' as Page },
        ].map(item => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 min-w-[48px] min-h-[48px] justify-center
              ${currentPage === item.page ? 'bg-[var(--color-primary)] text-white scale-105' : 'text-[var(--color-text-body)] hover:bg-[var(--color-bg-light)]'}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] font-bold hidden sm:block">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ============ COVER PAGE ============
function CoverPage({ onStart }: { onStart: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#065F46] via-[#0D9488] to-[#065F46] opacity-90"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Islamic geometric patterns */}
        <div className="absolute top-10 left-10 w-20 h-20 border-4 border-[var(--color-gold)] opacity-30 rotate-45 rounded-sm"></div>
        <div className="absolute top-20 right-20 w-16 h-16 border-4 border-[var(--color-gold)] opacity-20 rotate-12 rounded-sm"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 border-4 border-[var(--color-gold)] opacity-20 -rotate-12 rounded-sm"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 border-4 border-[var(--color-gold)] opacity-30 rotate-45 rounded-sm"></div>
        {/* Stars */}
        <div className="absolute top-16 left-1/4 text-yellow-300 text-2xl animate-float" style={{animationDelay: '0s'}}>✦</div>
        <div className="absolute top-32 right-1/3 text-yellow-300 text-xl animate-float" style={{animationDelay: '0.5s'}}>✦</div>
        <div className="absolute bottom-40 left-1/3 text-yellow-300 text-lg animate-float" style={{animationDelay: '1s'}}>✦</div>
      </div>

      {/* Content */}
      <div className={`relative z-10 text-center max-w-2xl mx-auto transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Badge */}
        <div className="inline-block bg-[var(--color-gold)] text-[var(--color-primary-dark)] px-4 py-1 rounded-full text-sm font-bold mb-4 shadow-lg">
          📚 Pendidikan Agama Islam • Kelas 6 • Fase C
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight" style={{fontFamily: 'var(--font-display)'}}>
          Bab 5
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-gold)] mb-4 leading-tight" style={{fontFamily: 'var(--font-display)'}}>
          Jasa Khulafaurrasyidin<br/>untuk Dunia
        </h2>

        {/* Mascot/Illustration area */}
        <div className="my-6 flex justify-center gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border-2 border-white/30 shadow-xl">
            🕌
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border-2 border-white/30 shadow-xl">
            📜
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl sm:text-5xl border-2 border-white/30 shadow-xl">
            ⭐
          </div>
        </div>

        {/* Subtitle */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
          <p className="text-white/90 text-base sm:text-lg font-semibold">
            <span className="text-[var(--color-gold)]">A.</span> Abu Bakar ash-Shiddiq &nbsp;•&nbsp; 
            <span className="text-[var(--color-gold)]">B.</span> Umar bin Khattab
          </p>
        </div>

        {/* Creator */}
        <p className="text-white/80 text-sm mb-8">
          Oleh: <span className="font-bold text-white">M. Ripani, S.Pd</span>
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] text-white text-xl sm:text-2xl font-bold px-12 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-pulse-glow btn-bounce"
          style={{fontFamily: 'var(--font-display)'}}
        >
          🚀 MULAI BELAJAR
        </button>

        <p className="text-white/60 text-xs mt-6">Bahan Ajar Interaktif • 2 × 35 Menit</p>
      </div>
    </div>
  );
}

// ============ MENU PAGE ============
function MenuPage({ onNavigate, totalStars }: { onNavigate: (page: Page) => void; totalStars: number }) {
  const menuItems = [
    { icon: '📋', label: 'Petunjuk', desc: 'Panduan penggunaan media', page: 'petunjuk' as Page, color: 'from-blue-400 to-blue-600' },
    { icon: '🌟', label: 'Apersepsi', desc: 'Pertanyaan pemantik', page: 'apersepsi' as Page, color: 'from-purple-400 to-purple-600' },
    { icon: '📖', label: 'Materi', desc: 'Pelajari Khulafaurrasyidin', page: 'materi' as Page, color: 'from-teal-400 to-teal-600' },
    { icon: '🎯', label: 'Aktivitas', desc: 'Aktivitas interaktif', page: 'aktivitas' as Page, color: 'from-orange-400 to-orange-600' },
    { icon: '🎮', label: 'Game', desc: 'Permainan edukatif', page: 'game' as Page, color: 'from-pink-400 to-pink-600' },
    { icon: '📝', label: 'Latihan', desc: 'Latihan dengan feedback', page: 'latihan' as Page, color: 'from-green-400 to-green-600' },
    { icon: '❓', label: 'Kuis', desc: 'Evaluasi akhir', page: 'kuis' as Page, color: 'from-red-400 to-red-600' },
    { icon: '🏆', label: 'Hasil', desc: 'Skor & pencapaian', page: 'hasil' as Page, color: 'from-yellow-400 to-yellow-600' },
    { icon: '💭', label: 'Refleksi', desc: 'Refleksi diri', page: 'refleksi' as Page, color: 'from-indigo-400 to-indigo-600' },
  ];

  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full mb-3">
            <span>⭐</span>
            <span className="font-bold">Bintang: {totalStars}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
            Menu Utama
          </h1>
          <p className="text-[var(--color-text-body)] mt-1">Pilih materi yang ingin kamu pelajari!</p>
        </div>

        {/* Mascot */}
        <div className="flex justify-center mb-6">
          <Mascot expression="excited" message="Ayo belajar bersama!" />
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, idx) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`bg-gradient-to-br ${item.color} text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-left btn-bounce animate-slide-up`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-bold text-lg">{item.label}</h3>
              <p className="text-white/80 text-sm">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <NavBar onNavigate={onNavigate} currentPage="menu" />
    </div>
  );
}

// ============ PETUNJUK PAGE ============
function PetunjukPage({ onBack }: { onBack: () => void }) {
  const steps = [
    { icon: '📖', title: 'Baca Materi', desc: 'Pelajari materi tentang Abu Bakar ash-Shiddiq dan Umar bin Khattab dengan seksama.' },
    { icon: '🎯', title: 'Ikuti Aktivitas', desc: 'Kerjakan aktivitas interaktif seperti matching, drag & drop, dan susun kata.' },
    { icon: '🎮', title: 'Main Game', desc: 'Bermain game edukatif untuk menguji pemahamanmu dengan cara yang menyenangkan.' },
    { icon: '📝', title: 'Kerjakan Latihan', desc: 'Latihan soal dengan feedback langsung untuk memperkuat pemahaman.' },
    { icon: '❓', title: 'Kerjakan Kuis', desc: 'Kerjakan 10 soal kuis akhir untuk mengukur pemahamanmu.' },
    { icon: '💭', title: 'Refleksi', desc: 'Renungkan apa yang telah kamu pelajari dan rasakan.' },
  ];

  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
            📋 Petunjuk Penggunaan
          </h1>
          <p className="text-[var(--color-text-body)] mt-2">Ikuti langkah-langkah berikut untuk belajar dengan maksimal!</p>
        </div>

        <div className="flex justify-center mb-6">
          <Mascot expression="happy" message="Ikuti petunjuk ya!" />
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-md border-2 border-[var(--color-bg-light)] flex items-start gap-4 animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
              <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-xl flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-text-dark)]">Langkah {idx + 1}: {step.title}</h3>
                <p className="text-[var(--color-text-body)] text-sm mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-[var(--color-bg-light)] rounded-2xl p-4 border-2 border-[var(--color-primary)]">
          <p className="text-sm font-semibold text-[var(--color-primary-dark)]">💡 Tips:</p>
          <ul className="text-sm text-[var(--color-text-body)] mt-2 space-y-1">
            <li>• Kumpulkan bintang sebanyak-banyaknya!</li>
            <li>• Jangan takut salah, coba lagi sampai benar!</li>
            <li>• Gunakan media ini di HP, tablet, atau komputer</li>
          </ul>
        </div>

        <div className="flex justify-center mt-6">
          <button onClick={onBack} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
            ← Kembali ke Menu
          </button>
        </div>
      </div>
      <NavBar onNavigate={onBack} currentPage="petunjuk" />
    </div>
  );
}

// ============ APERSEPSI PAGE ============
function ApersepsiPage({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
            🌟 Pertanyaan Pemantik
          </h1>
          <p className="text-[var(--color-text-body)] mt-2">Yuk, pikirkan pertanyaan ini sebelum kita mulai!</p>
        </div>

        <div className="flex justify-center mb-8">
          <Mascot expression="thinking" message="Coba pikirkan ya..." size="lg" />
        </div>

        <div className="space-y-6">
          {/* Question 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-secondary)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤔</span>
              <div>
                <p className="font-bold text-[var(--color-text-dark)] text-lg">
                  Pernahkah kamu mendengar nama Abu Bakar dan Umar?
                </p>
                <p className="text-[var(--color-text-body)] mt-2">
                  Mereka adalah pemimpin besar setelah Rasulullah ﷺ wafat. Tahukah kamu apa jasa mereka untuk Islam dan dunia?
                </p>
              </div>
            </div>
          </div>

          {/* Question 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-primary)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🕌</span>
              <div>
                <p className="font-bold text-[var(--color-text-dark)] text-lg">
                  Bagaimana Islam bisa menyebar luas ke seluruh dunia?
                </p>
                <p className="text-[var(--color-text-body)] mt-2">
                  Salah satunya berkat kepemimpinan para Khulafaurrasyidin. Mereka memimpin dengan adil, bijaksana, dan penuh kasih sayang.
                </p>
              </div>
            </div>
          </div>

          {/* Question 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-accent)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold text-[var(--color-text-dark)] text-lg">
                  Sikap apa yang bisa kita teladani dari mereka?
                </p>
                <p className="text-[var(--color-text-body)] mt-2">
                  Mari kita pelajari bersama bagaimana kejujuran Abu Bakar dan keadilan Umar bisa kita terapkan dalam kehidupan sehari-hari!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fun fact */}
        <div className="mt-6 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] rounded-2xl p-5 text-white shadow-lg">
          <p className="font-bold text-lg">🌟 Tahukah Kamu?</p>
          <p className="mt-2">
            Kata "Khulafaurrasyidin" artinya "para pemimpin yang mendapat petunjuk". Mereka adalah 4 khalifah pertama yang memimpin umat Islam setelah Rasulullah ﷺ wafat.
          </p>
          <button 
            onClick={() => setShowAnswer(!showAnswer)}
            className="mt-3 bg-white/20 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/30 transition-all"
          >
            {showAnswer ? 'Tutup' : 'Baca selengkapnya ▼'}
          </button>
          {showAnswer && (
            <div className="mt-3 bg-white/10 rounded-xl p-3 animate-slide-up">
              <p className="text-sm">Keempat Khulafaurrasyidin adalah: Abu Bakar ash-Shiddiq, Umar bin Khattab, Utsman bin Affan, dan Ali bin Abi Thalib. Di bab ini kita akan fokus mempelajari Abu Bakar dan Umar!</p>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <button onClick={onNext} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
            Lanjut ke Materi →
          </button>
        </div>

        <div className="flex justify-center mt-3">
          <button onClick={onBack} className="text-[var(--color-text-body)] px-4 py-2 text-sm hover:text-[var(--color-primary)] transition-all">
            ← Kembali ke Menu
          </button>
        </div>
      </div>
      <NavBar onNavigate={onBack} currentPage="apersepsi" />
    </div>
  );
}

// ============ MATERI PAGE ============
function MateriPage({ sub, setSub, onBack }: { sub: MateriSub; setSub: (s: MateriSub) => void; onBack: () => void }) {
  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Sub navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setSub('intro')} className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${sub === 'intro' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-text-body)] border-2 border-gray-200'}`}>
            📌 Pengantar
          </button>
          <button onClick={() => setSub('abu-bakar')} className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${sub === 'abu-bakar' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-text-body)] border-2 border-gray-200'}`}>
            👤 Abu Bakar
          </button>
          <button onClick={() => setSub('umar')} className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${sub === 'umar' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-[var(--color-text-body)] border-2 border-gray-200'}`}>
            👤 Umar bin Khattab
          </button>
        </div>

        {sub === 'intro' && <MateriIntro onNext={() => setSub('abu-bakar')} />}
        {sub === 'abu-bakar' && <MateriAbuBakar onNext={() => setSub('umar')} onPrev={() => setSub('intro')} />}
        {sub === 'umar' && <MateriUmar onPrev={() => setSub('abu-bakar')} />}

        <div className="flex justify-center mt-4">
          <button onClick={onBack} className="text-[var(--color-text-body)] px-4 py-2 text-sm hover:text-[var(--color-primary)] transition-all">
            ← Kembali ke Menu
          </button>
        </div>
      </div>
      <NavBar onNavigate={onBack} currentPage="materi" />
    </div>
  );
}

function MateriIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="animate-slide-up">
      <div className="flex justify-center mb-4">
        <Mascot expression="happy" message="Ayo belajar!" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-primary)]">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-dark)] mb-4" style={{fontFamily: 'var(--font-display)'}}>
          🕌 Apa itu Khulafaurrasyidin?
        </h2>
        <div className="space-y-4 text-[var(--color-text-body)]">
          <p className="text-base leading-relaxed">
            <strong>Khulafaurrasyidin</strong> artinya <strong>"para pemimpin yang mendapat petunjuk"</strong>. Mereka adalah empat khalifah (pemimpin) pertama yang memimpin umat Islam setelah Rasulullah ﷺ wafat.
          </p>

          <div className="bg-[var(--color-bg-light)] rounded-xl p-4 border border-[var(--color-primary)]">
            <p className="font-bold text-[var(--color-primary-dark)] mb-2">📋 Empat Khulafaurrasyidin:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span className="text-xl">1️⃣</span>
                <span className="font-semibold">Abu Bakar ash-Shiddiq</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span className="text-xl">2️⃣</span>
                <span className="font-semibold">Umar bin Khattab</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span className="text-xl">3️⃣</span>
                <span className="font-semibold">Utsman bin Affan</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span className="text-xl">4️⃣</span>
                <span className="font-semibold">Ali bin Abi Thalib</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-bg-cream)] rounded-xl p-4 border border-[var(--color-secondary)]">
            <p className="font-bold text-[var(--color-secondary-dark)] mb-2">🎯 Di bab ini kita fokus mempelajari:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-secondary)]">⭐</span>
                <span><strong>Abu Bakar ash-Shiddiq</strong> — Khalifah pertama, si jujur yang teguh</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-secondary)]">⭐</span>
                <span><strong>Umar bin Khattab</strong> — Khalifah kedua, si pemberani yang adil</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={onNext} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
          Lanjut: Abu Bakar →
        </button>
      </div>
    </div>
  );
}

function MateriAbuBakar({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  return (
    <div className="animate-slide-up">
      <div className="flex justify-center mb-4">
        <Mascot expression="proud" message="Abu Bakar ash-Shiddiq" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-secondary)]">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-dark)] mb-4" style={{fontFamily: 'var(--font-display)'}}>
          👤 Abu Bakar ash-Shiddiq
        </h2>

        {/* Identity Card */}
        <div className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] rounded-xl p-4 text-white mb-4">
          <h3 className="font-bold text-lg mb-2">📋 Identitas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div><strong>Nama:</strong> Abdullah bin Abu Quhafah</div>
            <div><strong>Gelar:</strong> Ash-Shiddiq (Yang Sangat Jujur)</div>
            <div><strong>Suku:</strong> Quraisy (Bani Taim)</div>
            <div><strong>Masa Khalifah:</strong> 632-634 M (2 tahun 3 bulan)</div>
            <div><strong>Urutan:</strong> Khalifah ke-1</div>
            <div><strong>Julukan:</strong> Atiq (Yang Dimerdekakan dari api neraka)</div>
          </div>
        </div>

        {/* Dakwah */}
        <div className="bg-[var(--color-bg-light)] rounded-xl p-4 mb-4 border border-[var(--color-primary)]">
          <h3 className="font-bold text-[var(--color-primary-dark)] mb-2">📢 Dakwah & Perjuangan</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Termasuk orang pertama yang masuk Islam (Assabiqunal Awwalun)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Menemani Rasulullah ﷺ hijrah ke Madinah (bersama di Gua Tsur)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Memerdekakan budak-budak yang masuk Islam (termasuk Bilal bin Rabah)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Menghabiskan hartanya untuk dakwah Islam</span>
            </li>
          </ul>
        </div>

        {/* Jasa-jasa */}
        <div className="bg-[var(--color-bg-cream)] rounded-xl p-4 border border-[var(--color-secondary)]">
          <h3 className="font-bold text-[var(--color-secondary-dark)] mb-2">🏆 Jasa-Jasa sebagai Khalifah</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">1. Memerangi Orang Murtad</p>
              <p className="text-xs text-[var(--color-text-body)]">Setelah Rasulullah ﷺ wafat, banyak suku Arab yang murtad. Abu Bakar tegas memerangi mereka untuk menjaga keutuhan Islam.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">2. Memerangi Nabi Palsu</p>
              <p className="text-xs text-[var(--color-text-body)]">Melawan nabi-nabi palsu seperti Musailamah Al-Kazzab dalam Perang Yamamah.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">3. Mengumpulkan Al-Quran</p>
              <p className="text-xs text-[var(--color-text-body)]">Atas usulan Umar bin Khattab, Abu Bakar memerintahkan pengumpulan lembaran-lembaran Al-Quran (codex) menjadi satu mushaf.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">4. Memerangi Orang Enggan Bayar Zakat</p>
              <p className="text-xs text-[var(--color-text-body)]">"Demi Allah, jika mereka enggan membayar zakat seekor anak kambing pun, aku akan memerangi mereka!"</p>
            </div>
          </div>
        </div>

        {/* Keteladanan */}
        <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <h3 className="font-bold text-green-800 mb-2">💚 Keteladanan</h3>
          <ul className="space-y-1 text-sm text-green-700">
            <li>• Jujur dan dapat dipercaya</li>
            <li>• Dermawan dan tidak kikir</li>
            <li>• Tegas dalam membela kebenaran</li>
            <li>• Rendah hati dan sederhana</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onPrev} className="bg-gray-200 text-[var(--color-text-body)] px-6 py-3 rounded-full font-bold shadow hover:bg-gray-300 transition-all btn-bounce">
          ← Kembali
        </button>
        <button onClick={onNext} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
          Lanjut: Umar →
        </button>
      </div>
    </div>
  );
}

function MateriUmar({ onPrev }: { onPrev: () => void }) {
  return (
    <div className="animate-slide-up">
      <div className="flex justify-center mb-4">
        <Mascot expression="proud" message="Umar bin Khattab" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-primary)]">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-dark)] mb-4" style={{fontFamily: 'var(--font-display)'}}>
          👤 Umar bin Khattab
        </h2>

        {/* Identity Card */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-xl p-4 text-white mb-4">
          <h3 className="font-bold text-lg mb-2">📋 Identitas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div><strong>Nama:</strong> Umar bin Khattab bin Nufail</div>
            <div><strong>Gelar:</strong> Al-Faruq (Pembeda Hak & Batil)</div>
            <div><strong>Suku:</strong> Quraisy (Bani Adi)</div>
            <div><strong>Masa Khalifah:</strong> 634-644 M (10 tahun)</div>
            <div><strong>Urutan:</strong> Khalifah ke-2</div>
            <div><strong>Julukan:</strong> Amirul Mu'minin</div>
          </div>
        </div>

        {/* Dakwah */}
        <div className="bg-[var(--color-bg-light)] rounded-xl p-4 mb-4 border border-[var(--color-primary)]">
          <h3 className="font-bold text-[var(--color-primary-dark)] mb-2">📢 Dakwah & Perjuangan</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Masuk Islam pada tahun ke-6 kenabian setelah mendengar surat Thaha</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Keislamannya memperkuat posisi umat Islam di Mekkah</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Dikenal sangat pemberani dan tegas dalam membela Islam</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Banyak ayat Al-Quran turun sesuai pendapatnya (Muwafaqat Umar)</span>
            </li>
          </ul>
        </div>

        {/* Jasa-jasa */}
        <div className="bg-[var(--color-bg-cream)] rounded-xl p-4 border border-[var(--color-primary)]">
          <h3 className="font-bold text-[var(--color-primary-dark)] mb-2">🏆 Jasa-Jasa sebagai Khalifah</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">1. Memperluas Wilayah Islam</p>
              <p className="text-xs text-[var(--color-text-body)]">Wilayah Islam meluas hingga Persia, Syam (Suriah), dan Mesir.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">2. Mendirikan Baitul Mal</p>
              <p className="text-xs text-[var(--color-text-body)]">Kas negara untuk mengelola keuangan dan mendistribusikan harta kepada rakyat.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">3. Membuat Sistem Diwan</p>
              <p className="text-xs text-[var(--color-text-body)]">Sistem administrasi pencatatan gaji tentara dan tunjangan rakyat.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">4. Menetapkan Kalender Hijriyah</p>
              <p className="text-xs text-[var(--color-text-body)]">Menetapkan tahun Hijriyah dimulai dari peristiwa hijrahnya Rasulullah ﷺ ke Madinah.</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">5. Membangun Infrastruktur</p>
              <p className="text-xs text-[var(--color-text-body)]">Membangun jalan, jembatan, saluran irigasi, dan kota-kota baru (Kufah, Basrah, Fustat).</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="font-bold text-sm">6. Shalat Tarawih Berjamaah</p>
              <p className="text-xs text-[var(--color-text-body)]">Memerintahkan shalat Tarawih dilakukan berjamaah di masjid.</p>
            </div>
          </div>
        </div>

        {/* Keteladanan */}
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">💙 Keteladanan</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Adil dan tegas dalam mengambil keputusan</li>
            <li>• Sederhana despite being a powerful leader</li>
            <li>• Peduli terhadap rakyat kecil</li>
            <li>• Berani karena benar, bukan karena kuasa</li>
            <li>• Bijaksana dalam mengatur negara</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-start mt-6">
        <button onClick={onPrev} className="bg-gray-200 text-[var(--color-text-body)] px-6 py-3 rounded-full font-bold shadow hover:bg-gray-300 transition-all btn-bounce">
          ← Kembali: Abu Bakar
        </button>
      </div>
    </div>
  );
}

// ============ AKTIVITAS PAGE ============
function AktivitasPage({ onBack, onStarEarn }: { onBack: (p: Page) => void; onStarEarn: (pts: number) => void }) {
  const [activeActivity, setActiveActivity] = useState<'menu' | 'matching' | 'dragdrop' | 'susunKata'>('menu');

  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        {activeActivity === 'menu' && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
                🎯 Aktivitas Interaktif
              </h1>
              <p className="text-[var(--color-text-body)] mt-2">Pilih aktivitas yang ingin kamu kerjakan!</p>
            </div>
            <div className="flex justify-center mb-6">
              <Mascot expression="excited" message="Ayo coba!" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => setActiveActivity('matching')} className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all btn-bounce">
                <div className="text-4xl mb-2">🔗</div>
                <h3 className="font-bold text-lg">Matching</h3>
                <p className="text-sm text-white/80">Pasangkan khalifah dengan jasanya</p>
              </button>
              <button onClick={() => setActiveActivity('dragdrop')} className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all btn-bounce">
                <div className="text-4xl mb-2">🎲</div>
                <h3 className="font-bold text-lg">Kategorikan</h3>
                <p className="text-sm text-white/80">Kelompokkan jasa-jasa khalifah</p>
              </button>
              <button onClick={() => setActiveActivity('susunKata')} className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-all btn-bounce">
                <div className="text-4xl mb-2">🔤</div>
                <h3 className="font-bold text-lg">Susun Kata</h3>
                <p className="text-sm text-white/80">Susun huruf menjadi kata yang benar</p>
              </button>
            </div>
          </>
        )}
        {activeActivity === 'matching' && <MatchingActivity onBack={() => setActiveActivity('menu')} onStarEarn={onStarEarn} />}
        {activeActivity === 'dragdrop' && <DragDropActivity onBack={() => setActiveActivity('menu')} onStarEarn={onStarEarn} />}
        {activeActivity === 'susunKata' && <SusunKataActivity onBack={() => setActiveActivity('menu')} onStarEarn={onStarEarn} />}
      </div>
      <NavBar onNavigate={onBack} currentPage="aktivitas" />
    </div>
  );
}

// Matching Activity
function MatchingActivity({ onBack, onStarEarn }: { onBack: () => void; onStarEarn: (pts: number) => void }) {
  const pairs = [
    { id: 1, left: "Abu Bakar", right: "Ash-Shiddiq" },
    { id: 2, left: "Umar bin Khattab", right: "Al-Faruq" },
    { id: 3, left: "Abu Bakar", right: "Mengumpulkan Al-Quran" },
    { id: 4, left: "Umar bin Khattab", right: "Kalender Hijriyah" },
    { id: 5, left: "Abu Bakar", right: "Memerangi nabi palsu" },
    { id: 6, left: "Umar bin Khattab", right: "Mendirikan Baitul Mal" },
  ];

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<{left: number, right: number} | null>(null);
  const [shuffledRights, setShuffledRights] = useState(() => [...pairs].sort(() => Math.random() - 0.5));

  const handleLeftClick = (id: number) => {
    setSelectedLeft(id);
    setWrongPair(null);
  };

  const handleRightClick = (idx: number) => {
    if (selectedLeft === null) return;
    const rightItem = shuffledRights[idx];
    const leftItem = pairs.find(p => p.id === selectedLeft);
    
    if (leftItem && rightItem.left === leftItem.left && rightItem.right === leftItem.right) {
      setMatched(prev => [...prev, selectedLeft]);
      setSelectedLeft(null);
      if (matched.length + 1 === pairs.length) {
        onStarEarn(3);
      }
    } else {
      setWrongPair({ left: selectedLeft, right: idx });
      setTimeout(() => { setWrongPair(null); setSelectedLeft(null); }, 800);
    }
  };

  const reset = () => {
    setMatched([]);
    setSelectedLeft(null);
    setWrongPair(null);
    setShuffledRights([...pairs].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
          🔗 Matching: Pasangkan!
        </h2>
        <p className="text-sm text-[var(--color-text-body)]">Klik nama di kiri, lalu klik pasangannya di kanan</p>
        <p className="text-xs text-[var(--color-secondary)] font-bold mt-1">⭐ Skor: {matched.length}/{pairs.length}</p>
      </div>

      {matched.length === pairs.length && (
        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mb-4 text-center animate-bounce-in">
          <p className="text-2xl">🎉</p>
          <p className="font-bold text-green-800">Luar Biasa! Semua pasangan benar!</p>
          <p className="text-sm text-green-600">+3 ⭐ bintang didapatkan!</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-2">
          {pairs.map((pair) => (
            <button
              key={pair.id}
              onClick={() => !matched.includes(pair.id) && handleLeftClick(pair.id)}
              disabled={matched.includes(pair.id)}
              className={`w-full p-3 rounded-xl text-sm font-semibold transition-all border-2 min-h-[48px]
                ${matched.includes(pair.id) ? 'bg-green-100 border-green-400 text-green-700' : 
                  selectedLeft === pair.id ? 'bg-[var(--color-secondary)] border-[var(--color-secondary-dark)] text-white scale-105' :
                  wrongPair?.left === pair.id ? 'bg-red-100 border-red-400 animate-shake' :
                  'bg-white border-gray-200 hover:border-[var(--color-primary)]'}`}
            >
              {matched.includes(pair.id) ? '✓ ' : ''}{pair.left}
            </button>
          ))}
        </div>
        {/* Right column */}
        <div className="space-y-2">
          {shuffledRights.map((pair, idx) => {
            const isMatched = pairs.some(p => p.id === pair.id && matched.includes(p.id));
            return (
              <button
                key={idx}
                onClick={() => !isMatched && handleRightClick(idx)}
                disabled={isMatched}
                className={`w-full p-3 rounded-xl text-sm font-semibold transition-all border-2 min-h-[48px]
                  ${isMatched ? 'bg-green-100 border-green-400 text-green-700' :
                    wrongPair?.right === idx ? 'bg-red-100 border-red-400 animate-shake' :
                    'bg-white border-gray-200 hover:border-[var(--color-secondary)]'}`}
              >
                {isMatched ? '✓ ' : ''}{pair.right}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-6">
        <button onClick={reset} className="bg-gray-200 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-300 transition-all">
          🔄 Ulangi
        </button>
        <button onClick={onBack} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-all">
          ← Kembali
        </button>
      </div>
    </div>
  );
}

// Drag & Drop / Categorize Activity
function DragDropActivity({ onBack, onStarEarn }: { onBack: () => void; onStarEarn: (pts: number) => void }) {
  const items = [
    { id: 1, text: "Ash-Shiddiq", category: "abu" },
    { id: 2, text: "Al-Faruq", category: "umar" },
    { id: 3, text: "Mengumpulkan Al-Quran", category: "abu" },
    { id: 4, text: "Kalender Hijriyah", category: "umar" },
    { id: 5, text: "Memerangi nabi palsu", category: "abu" },
    { id: 6, text: "Baitul Mal", category: "umar" },
  ];

  const [unplaced, setUnplaced] = useState(items);
  const [abuPlaced, setAbuPlaced] = useState<typeof items>([]);
  const [umarPlaced, setUmarPlaced] = useState<typeof items>([]);
  const [selectedItem, setSelectedItem] = useState<typeof items[0] | null>(null);
  const [feedback, setFeedback] = useState<{type: 'correct' | 'wrong', text: string} | null>(null);

  const handleItemClick = (item: typeof items[0]) => {
    setSelectedItem(item);
    setFeedback(null);
  };

  const handleCategoryClick = (category: 'abu' | 'umar') => {
    if (!selectedItem) return;
    if (selectedItem.category === category) {
      if (category === 'abu') setAbuPlaced(prev => [...prev, selectedItem]);
      else setUmarPlaced(prev => [...prev, selectedItem]);
      setUnplaced(prev => prev.filter(i => i.id !== selectedItem.id));
      setFeedback({ type: 'correct', text: 'Benar! 🎉' });
      setSelectedItem(null);
      if (unplaced.length === 1) {
        onStarEarn(3);
      }
    } else {
      setFeedback({ type: 'wrong', text: 'Hmm, coba lagi ya! 💪' });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const reset = () => {
    setUnplaced(items);
    setAbuPlaced([]);
    setUmarPlaced([]);
    setSelectedItem(null);
    setFeedback(null);
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
          🎲 Kategorikan Jasa Khalifah!
        </h2>
        <p className="text-sm text-[var(--color-text-body)]">Pilih item, lalu klik kategori yang tepat</p>
      </div>

      {feedback && (
        <div className={`text-center p-2 rounded-lg mb-3 animate-bounce-in ${feedback.type === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <span className="font-bold">{feedback.text}</span>
        </div>
      )}

      {/* Unplaced items */}
      <div className="bg-white rounded-xl p-3 mb-4 border-2 border-dashed border-gray-300">
        <p className="text-xs font-bold text-gray-500 mb-2">📦 Item yang belum dikelompokkan:</p>
        <div className="flex flex-wrap gap-2">
          {unplaced.map(item => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all border-2 min-h-[40px]
                ${selectedItem?.id === item.id ? 'bg-[var(--color-secondary)] border-[var(--color-secondary-dark)] text-white scale-105' : 'bg-[var(--color-bg-cream)] border-gray-200 hover:border-[var(--color-primary)]'}`}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={() => handleCategoryClick('abu')} className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border-2 border-amber-300 min-h-[120px] text-left hover:border-amber-500 transition-all">
          <h3 className="font-bold text-amber-800 mb-2">👤 Abu Bakar ash-Shiddiq</h3>
          <div className="space-y-1">
            {abuPlaced.map(item => (
              <div key={item.id} className="bg-white rounded px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                ✓ {item.text}
              </div>
            ))}
          </div>
        </button>
        <button onClick={() => handleCategoryClick('umar')} className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border-2 border-teal-300 min-h-[120px] text-left hover:border-teal-500 transition-all">
          <h3 className="font-bold text-teal-800 mb-2">👤 Umar bin Khattab</h3>
          <div className="space-y-1">
            {umarPlaced.map(item => (
              <div key={item.id} className="bg-white rounded px-2 py-1 text-xs font-semibold text-teal-700 border border-teal-200">
                ✓ {item.text}
              </div>
            ))}
          </div>
        </button>
      </div>

      {unplaced.length === 0 && (
        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mt-4 text-center animate-bounce-in">
          <p className="text-2xl">🏆</p>
          <p className="font-bold text-green-800">Sempurna! Semua item berhasil dikategorikan!</p>
          <p className="text-sm text-green-600">+3 ⭐ bintang didapatkan!</p>
        </div>
      )}

      <div className="flex justify-center gap-3 mt-6">
        <button onClick={reset} className="bg-gray-200 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-300 transition-all">
          🔄 Ulangi
        </button>
        <button onClick={onBack} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-all">
          ← Kembali
        </button>
      </div>
    </div>
  );
}

// Susun Kata Activity
function SusunKataActivity({ onBack, onStarEarn }: { onBack: () => void; onStarEarn: (pts: number) => void }) {
  const words = [
    { answer: "SHIDDIQ", hint: "Gelar Abu Bakar yang artinya 'sangat jujur'" },
    { answer: "FARUQ", hint: "Gelar Umar yang artinya 'pembeda'" },
    { answer: "BAITULMAL", hint: "Kas negara pada masa Umar" },
    { answer: "HIJRIYAH", hint: "Kalender yang ditetapkan Umar" },
    { answer: "YAMAMAH", hint: "Perang melawan nabi palsu Musailamah" },
  ];

  const [currentWord, setCurrentWord] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (currentWord < words.length) {
      const letters = words[currentWord].answer.split('');
      setScrambled(letters.sort(() => Math.random() - 0.5));
      setUserAnswer([]);
      setShowHint(false);
      setFeedback(null);
    }
  }, [currentWord]);

  const handleLetterClick = (letter: string, idx: number) => {
    if (feedback) return;
    setUserAnswer(prev => [...prev, letter]);
    setScrambled(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveLetter = (idx: number) => {
    if (feedback) return;
    const letter = userAnswer[idx];
    setScrambled(prev => [...prev, letter]);
    setUserAnswer(prev => prev.filter((_, i) => i !== idx));
  };

  const checkAnswer = () => {
    const answer = userAnswer.join('');
    if (answer === words[currentWord].answer) {
      setFeedback('correct');
      setScore(prev => prev + 1);
      setTimeout(() => {
        if (currentWord + 1 >= words.length) {
          setFinished(true);
          onStarEarn(3);
        } else {
          setCurrentWord(prev => prev + 1);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setScrambled(words[currentWord].answer.split('').sort(() => Math.random() - 0.5));
        setUserAnswer([]);
      }, 1000);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
          🔤 Susun Kata!
        </h2>
        <p className="text-sm text-[var(--color-text-body)]">
          Soal {currentWord + 1}/{words.length} • Skor: {score}
        </p>
      </div>

      {!finished ? (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-primary)]">
          {/* Hint */}
          <div className="bg-[var(--color-bg-cream)] rounded-xl p-3 mb-4 text-center">
            <p className="text-sm font-semibold text-[var(--color-text-body)]">💡 Petunjuk:</p>
            <button onClick={() => setShowHint(true)} className="text-xs text-[var(--color-primary)] underline">
              {showHint ? words[currentWord].hint : 'Klik untuk lihat petunjuk'}
            </button>
          </div>

          {/* Answer area */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[50px] bg-gray-50 rounded-xl p-3 border-2 border-dashed border-gray-300">
            {userAnswer.map((letter, idx) => (
              <button
                key={idx}
                onClick={() => handleRemoveLetter(idx)}
                className={`w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center transition-all border-2
                  ${feedback === 'correct' ? 'bg-green-200 border-green-400 text-green-800' :
                    feedback === 'wrong' ? 'bg-red-200 border-red-400 text-red-800 animate-shake' :
                    'bg-[var(--color-primary)] border-[var(--color-primary-dark)] text-white hover:scale-110'}`}
              >
                {letter}
              </button>
            ))}
            {userAnswer.length === 0 && <p className="text-gray-400 text-sm self-center">Klik huruf di bawah</p>}
          </div>

          {/* Scrambled letters */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {scrambled.map((letter, idx) => (
              <button
                key={idx}
                onClick={() => handleLetterClick(letter, idx)}
                className="w-10 h-10 rounded-lg font-bold text-lg flex items-center justify-center bg-[var(--color-secondary)] border-2 border-[var(--color-secondary-dark)] text-white hover:scale-110 transition-all shadow-md"
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback === 'correct' && (
            <div className="text-center text-green-600 font-bold animate-bounce-in">
              <span className="text-2xl">🎉</span> Benar!
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="text-center text-red-600 font-bold animate-shake">
              <span className="text-2xl">😅</span> Coba lagi!
            </div>
          )}

          {/* Check button */}
          {userAnswer.length === words[currentWord].answer.length && !feedback && (
            <div className="text-center mt-4">
              <button onClick={checkAnswer} className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-full font-bold hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
                ✓ Periksa
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-6 text-center animate-bounce-in">
          <p className="text-4xl mb-2">🏆</p>
          <p className="font-bold text-green-800 text-xl">Hebat! Semua kata berhasil disusun!</p>
          <p className="text-green-600">Skor: {score}/{words.length} • +3 ⭐ bintang</p>
        </div>
      )}

      <div className="flex justify-center gap-3 mt-6">
        <button onClick={() => { setCurrentWord(0); setScore(0); setFinished(false); }} className="bg-gray-200 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-300 transition-all">
          🔄 Ulangi
        </button>
        <button onClick={onBack} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-all">
          ← Kembali
        </button>
      </div>
    </div>
  );
}

// ============ GAME PAGE ============
function GamePage({ onBack, onStarEarn }: { onBack: (p: Page) => void; onStarEarn: (pts: number) => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const gameQuestions = [
    { q: "Khalifah pertama Islam adalah...", options: ["Abu Bakar", "Umar", "Utsman", "Ali"], correct: 0 },
    { q: "Gelar Al-Faruq milik...", options: ["Abu Bakar", "Umar", "Utsman", "Ali"], correct: 1 },
    { q: "Abu Bakar mengumpulkan...", options: ["Hadits", "Al-Quran", "Piagam", "Uang"], correct: 1 },
    { q: "Umar mendirikan...", options: ["Masjid", "Baitul Mal", "Sekolah", "Pasar"], correct: 1 },
    { q: "Kalender Islam disebut...", options: ["Masehi", "Hijriyah", "Jawa", "China"], correct: 1 },
    { q: "Perang melawan nabi palsu terjadi di...", options: ["Badar", "Uhud", "Yamamah", "Khandaq"], correct: 2 },
    { q: "Bilal bin Rabah dimerdekakan oleh...", options: ["Umar", "Abu Bakar", "Utsman", "Ali"], correct: 1 },
    { q: "Umar masuk Islam setelah mendengar surat...", options: ["Al-Fatihah", "Thaha", "Al-Ikhlas", "An-Nas"], correct: 1 },
  ];

  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      if (score >= 5) onStarEarn(3);
      else if (score >= 3) onStarEarn(2);
      else onStarEarn(1);
    }
  }, [timeLeft, gameStarted, gameOver]);

  const handleAnswer = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    if (idx === gameQuestions[currentQ].correct) {
      setScore(prev => prev + 1);
    }
    setTimeout(() => {
      setShowFeedback(false);
      setSelected(null);
      if (currentQ + 1 >= gameQuestions.length) {
        setGameOver(true);
        if (score >= 5) onStarEarn(3);
        else if (score >= 3) onStarEarn(2);
        else onStarEarn(1);
      } else {
        setCurrentQ(prev => prev + 1);
      }
    }, 1000);
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQ(0);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen pb-24 pt-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)] mb-4" style={{fontFamily: 'var(--font-display)'}}>
            🎮 Game: Tantangan Khulafaurrasyidin
          </h1>
          <div className="flex justify-center mb-6">
            <Mascot expression="excited" message="Siap bermain?" size="lg" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-secondary)] max-w-md mx-auto">
            <h3 className="font-bold text-lg mb-3">📋 Aturan Game:</h3>
            <ul className="text-left text-sm space-y-2 mb-4">
              <li>• Jawab 8 soal secepat mungkin!</li>
              <li>• Waktu: 30 detik</li>
              <li>• Setiap jawaban benar = 1 poin</li>
              <li>• Kumpulkan bintang sebanyaknya!</li>
            </ul>
            <button onClick={startGame} className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-all btn-bounce">
              🚀 Mulai Game!
            </button>
          </div>
          <div className="mt-4">
            <button onClick={() => onBack('menu')} className="text-[var(--color-text-body)] px-4 py-2 text-sm hover:text-[var(--color-primary)] transition-all">
              ← Kembali ke Menu
            </button>
          </div>
        </div>
        <NavBar onNavigate={onBack} currentPage="game" />
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen pb-24 pt-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[var(--color-primary)] max-w-md mx-auto animate-bounce-in">
            <p className="text-5xl mb-4">
              {score >= 6 ? '🏆' : score >= 4 ? '⭐' : '💪'}
            </p>
            <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-2" style={{fontFamily: 'var(--font-display)'}}>
              {score >= 6 ? 'Luar Biasa!' : score >= 4 ? 'Bagus!' : 'Tetap Semangat!'}
            </h2>
            <p className="text-lg mb-2">Skor: <strong>{score}/{gameQuestions.length}</strong></p>
            <p className="text-sm text-[var(--color-text-body)] mb-4">Waktu tersisa: {timeLeft} detik</p>
            <div className="flex gap-2 justify-center mb-4">
              {Array.from({length: score >= 6 ? 3 : score >= 4 ? 2 : 1}).map((_, i) => (
                <span key={i} className="text-3xl animate-star-spin">⭐</span>
              ))}
            </div>
            <button onClick={startGame} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-bold hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
              🔄 Main Lagi
            </button>
          </div>
          <div className="mt-4">
            <button onClick={() => onBack('menu')} className="text-[var(--color-text-body)] px-4 py-2 text-sm hover:text-[var(--color-primary)] transition-all">
              ← Kembali ke Menu
            </button>
          </div>
        </div>
        <NavBar onNavigate={onBack} currentPage="game" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Timer & Score */}
        <div className="flex justify-between items-center mb-4">
          <div className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full font-bold">
            ⭐ {score}
          </div>
          <div className={`px-4 py-2 rounded-full font-bold ${timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)]'}`}>
            ⏱️ {timeLeft}s
          </div>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div className="bg-[var(--color-primary)] h-3 rounded-full transition-all duration-300" style={{width: `${((currentQ + 1) / gameQuestions.length) * 100}%`}}></div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-primary)]">
          <p className="text-xs text-[var(--color-text-body)] mb-2">Soal {currentQ + 1}/{gameQuestions.length}</p>
          <h3 className="text-lg font-bold text-[var(--color-text-dark)] mb-4">
            {gameQuestions[currentQ].q}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gameQuestions[currentQ].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={`p-3 rounded-xl font-semibold text-left transition-all border-2 min-h-[48px]
                  ${showFeedback && idx === gameQuestions[currentQ].correct ? 'bg-green-100 border-green-400 text-green-800' :
                    showFeedback && selected === idx && idx !== gameQuestions[currentQ].correct ? 'bg-red-100 border-red-400 text-red-800 animate-shake' :
                    'bg-[var(--color-bg-light)] border-gray-200 hover:border-[var(--color-primary)] hover:bg-white'}`}
              >
                {String.fromCharCode(65 + idx)}. {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
      <NavBar onNavigate={onBack} currentPage="game" />
    </div>
  );
}

// ============ LATIHAN PAGE ============
function LatihanPage({ onBack, onStarEarn }: { onBack: (p: Page) => void; onStarEarn: (pts: number) => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    const isCorrect = idx === latihanQuestions[currentQ].correct;
    if (isCorrect) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= latihanQuestions.length) {
      setFinished(true);
      if (score >= 4) onStarEarn(3);
      else if (score >= 3) onStarEarn(2);
      else onStarEarn(1);
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  };

  const retry = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowFeedback(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="min-h-screen pb-24 pt-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[var(--color-primary)] max-w-md mx-auto animate-bounce-in">
            <p className="text-5xl mb-4">{score >= 4 ? '🌟' : score >= 3 ? '⭐' : '💪'}</p>
            <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-2" style={{fontFamily: 'var(--font-display)'}}>
              {score >= 4 ? 'Hebat!' : score >= 3 ? 'Bagus!' : 'Tetap Semangat!'}
            </h2>
            <p className="text-lg">Skor: <strong>{score}/{latihanQuestions.length}</strong></p>
            <div className="mt-4 flex gap-3 justify-center">
              <button onClick={retry} className="bg-[var(--color-secondary)] text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-all btn-bounce">
                🔄 Coba Lagi
              </button>
              <button onClick={() => onBack('menu')} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-bold hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
                ✓ Selesai
              </button>
            </div>
          </div>
        </div>
        <NavBar onNavigate={onBack} currentPage="latihan" />
      </div>
    );
  }

  const q = latihanQuestions[currentQ];

  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
            📝 Latihan Soal
          </h1>
          <p className="text-sm text-[var(--color-text-body)]">Soal {currentQ + 1}/{latihanQuestions.length} • Skor: {score}</p>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div className="bg-[var(--color-primary)] h-3 rounded-full transition-all duration-300" style={{width: `${((currentQ + 1) / latihanQuestions.length) * 100}%`}}></div>
        </div>

        <div className="flex justify-center mb-4">
          <Mascot expression={showFeedback ? (selected === q.correct ? 'happy' : 'thinking') : 'thinking'} size="sm" />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-primary)]">
          <p className="font-bold text-lg text-[var(--color-text-dark)] mb-4">
            {q.question}
          </p>

          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl font-semibold text-left transition-all border-2 min-h-[48px]
                  ${showFeedback && idx === q.correct ? 'bg-green-100 border-green-400 text-green-800' :
                    showFeedback && selected === idx && idx !== q.correct ? 'bg-red-100 border-red-400 text-red-800 animate-shake' :
                    'bg-[var(--color-bg-light)] border-gray-200 hover:border-[var(--color-primary)] hover:bg-white'}`}
              >
                {showFeedback && idx === q.correct && '✓ '}
                {showFeedback && selected === idx && idx !== q.correct && '✗ '}
                {String.fromCharCode(65 + idx)}. {opt}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-4 p-4 rounded-xl animate-slide-up ${selected === q.correct ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`font-bold text-sm ${selected === q.correct ? 'text-green-700' : 'text-amber-700'}`}>
                {selected === q.correct ? '🎉 Benar! Hebat!' : '💡 Belum tepat, ini penjelasannya:'}
              </p>
              <p className="text-sm text-[var(--color-text-body)] mt-1">{q.explanation}</p>
              <button onClick={nextQuestion} className="mt-3 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
                {currentQ + 1 >= latihanQuestions.length ? 'Lihat Hasil →' : 'Soal Berikutnya →'}
              </button>
            </div>
          )}
        </div>
      </div>
      <NavBar onNavigate={onBack} currentPage="latihan" />
    </div>
  );
}

// ============ KUIS PAGE ============
function KuisPage({ answers, setAnswers, onFinish, onBack }: { answers: QuizAnswer[]; setAnswers: (a: QuizAnswer[]) => void; onFinish: (score: number) => void; onBack: (p: Page) => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizStarted, setQuizStarted] = useState(answers.length > 0);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQ(0);
    setSelected(null);
    setShowFeedback(false);
    setAnswers([]);
  };

  const handleAnswer = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    const isCorrect = idx === quizQuestions[currentQ].correct;
    const newAnswers = [...answers, { question: currentQ, selected: idx, correct: isCorrect }];
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= quizQuestions.length) {
      const score = answers.filter(a => a.correct).length + (selected === quizQuestions[currentQ].correct ? 1 : 0);
      onFinish(score);
      onBack('hasil');
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen pb-24 pt-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)] mb-4" style={{fontFamily: 'var(--font-display)'}}>
            ❓ Kuis Akhir
          </h1>
          <div className="flex justify-center mb-6">
            <Mascot expression="thinking" message="Siap mengerjakan kuis?" size="lg" />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-primary)] max-w-md mx-auto">
            <h3 className="font-bold text-lg mb-3">📋 Ketentuan Kuis:</h3>
            <ul className="text-left text-sm space-y-2 mb-4">
              <li>• Terdiri dari 10 soal pilihan ganda</li>
              <li>• Pilih jawaban yang paling tepat</li>
              <li>• Baca pembahasan setelah menjawab</li>
              <li>• Skor akan dihitung otomatis</li>
            </ul>
            <button onClick={startQuiz} className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-all btn-bounce">
              📝 Mulai Kuis!
            </button>
          </div>
          <div className="mt-4">
            <button onClick={() => onBack('menu')} className="text-[var(--color-text-body)] px-4 py-2 text-sm hover:text-[var(--color-primary)] transition-all">
              ← Kembali ke Menu
            </button>
          </div>
        </div>
        <NavBar onNavigate={onBack} currentPage="kuis" />
      </div>
    );
  }

  const q = quizQuestions[currentQ];

  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
            ❓ Kuis Akhir
          </h1>
          <p className="text-sm text-[var(--color-text-body)]">Soal {currentQ + 1}/{quizQuestions.length}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div className="bg-[var(--color-primary)] h-3 rounded-full transition-all duration-300" style={{width: `${((currentQ + 1) / quizQuestions.length) * 100}%`}}></div>
        </div>
        <p className="text-xs text-center text-[var(--color-text-body)] mb-4">
          Benar: {answers.filter(a => a.correct).length} | Salah: {answers.filter(a => !a.correct).length}
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-primary)]">
          <p className="text-xs text-[var(--color-text-body)] mb-1">Soal {currentQ + 1}</p>
          <p className="font-bold text-lg text-[var(--color-text-dark)] mb-4">
            {q.question}
          </p>

          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl font-semibold text-left transition-all border-2 min-h-[48px]
                  ${showFeedback && idx === q.correct ? 'bg-green-100 border-green-400 text-green-800' :
                    showFeedback && selected === idx && idx !== q.correct ? 'bg-red-100 border-red-400 text-red-800 animate-shake' :
                    'bg-[var(--color-bg-light)] border-gray-200 hover:border-[var(--color-primary)] hover:bg-white'}`}
              >
                {showFeedback && idx === q.correct && '✓ '}
                {showFeedback && selected === idx && idx !== q.correct && '✗ '}
                {String.fromCharCode(65 + idx)}. {opt}
              </button>
            ))}
          </div>

          {/* Feedback & Explanation */}
          {showFeedback && (
            <div className={`mt-4 p-4 rounded-xl animate-slide-up ${selected === q.correct ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`font-bold text-sm ${selected === q.correct ? 'text-green-700' : 'text-amber-700'}`}>
                {selected === q.correct ? '🎉 Benar! Hebat!' : '💡 Belum tepat, ini penjelasannya:'}
              </p>
              <p className="text-sm text-[var(--color-text-body)] mt-1">{q.explanation}</p>
              <button onClick={nextQuestion} className="mt-3 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
                {currentQ + 1 >= quizQuestions.length ? '🏆 Lihat Hasil →' : 'Soal Berikutnya →'}
              </button>
            </div>
          )}
        </div>
      </div>
      <NavBar onNavigate={onBack} currentPage="kuis" />
    </div>
  );
}

// ============ HASIL PAGE ============
function HasilPage({ score, totalStars, startTime, onRetry, onBack }: { score: number; totalStars: number; startTime: number; onRetry: () => void; onBack: (p: Page) => void }) {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const getBadge = () => {
    if (score >= 9) return { emoji: '🏆', title: 'Luar Biasa!', desc: 'Kamu menguasai materi dengan sangat baik!', color: 'from-yellow-400 to-amber-500' };
    if (score >= 7) return { emoji: '🌟', title: 'Hebat!', desc: 'Pemahamanmu sangat bagus!', color: 'from-green-400 to-emerald-500' };
    if (score >= 5) return { emoji: '⭐', title: 'Bagus!', desc: 'Terus belajar untuk hasil yang lebih baik!', color: 'from-blue-400 to-cyan-500' };
    return { emoji: '💪', title: 'Tetap Semangat!', desc: 'Ayo ulangi materi dan coba lagi!', color: 'from-orange-400 to-red-500' };
  };

  const badge = getBadge();

  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
            🏆 Hasil Belajar
          </h1>
        </div>

        {/* Badge Card */}
        <div className={`bg-gradient-to-br ${badge.color} rounded-2xl p-8 text-white text-center shadow-xl mb-6 animate-bounce-in`}>
          <p className="text-6xl mb-3">{badge.emoji}</p>
          <h2 className="text-3xl font-bold mb-2" style={{fontFamily: 'var(--font-display)'}}>{badge.title}</h2>
          <p className="text-white/90">{badge.desc}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-md border-2 border-[var(--color-primary)]">
            <p className="text-2xl font-bold text-[var(--color-primary)]">{score}/10</p>
            <p className="text-xs text-[var(--color-text-body)]">Skor Kuis</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md border-2 border-[var(--color-secondary)]">
            <p className="text-2xl font-bold text-[var(--color-secondary)]">{totalStars} ⭐</p>
            <p className="text-xs text-[var(--color-text-body)]">Total Bintang</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md border-2 border-green-400">
            <p className="text-2xl font-bold text-green-600">{score >= 7 ? 'A' : score >= 5 ? 'B' : 'C'}</p>
            <p className="text-xs text-[var(--color-text-body)]">Nilai</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md border-2 border-purple-400">
            <p className="text-2xl font-bold text-purple-600">{minutes}m {seconds}s</p>
            <p className="text-xs text-[var(--color-text-body)]">Waktu</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-[var(--color-bg-light)] mb-6">
          <h3 className="font-bold text-[var(--color-primary-dark)] mb-3">📋 Ringkasan Materi yang Dipelajari:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Nasab dan gelar Khalifah Abu Bakar & Umar</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Dakwah Khalifah Abu Bakar & Umar</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Jasa-jasa Khalifah Abu Bakar & Umar</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Keteladanan dari Khulafaurrasyidin</span>
            </li>
          </ul>
        </div>

        {/* Recommendations */}
        {score < 7 && (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6">
            <p className="font-bold text-amber-800 text-sm">💡 Rekomendasi:</p>
            <p className="text-sm text-amber-700 mt-1">Coba ulangi bagian Materi dan Latihan untuk memperkuat pemahamanmu. Jangan menyerah!</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={onRetry} className="bg-[var(--color-secondary)] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all btn-bounce">
            🔄 Ulangi Kuis
          </button>
          <button onClick={() => onBack('menu')} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
            🏠 Menu Utama
          </button>
          <button onClick={() => onBack('refleksi')} className="bg-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-purple-600 transition-all btn-bounce">
            💭 Refleksi
          </button>
        </div>
      </div>
      <NavBar onNavigate={onBack} currentPage="hasil" />
    </div>
  );
}

// ============ REFLEKSI PAGE ============
function RefleksiPage({ onBack }: { onBack: (p: Page) => void }) {
  const [ratings, setRatings] = useState({ pemahaman: 0, kesenangan: 0, kesulitan: 0 });
  const [favorite, setFavorite] = useState('');
  const [difficult, setDifficult] = useState('');
  const [wantLearn, setWantLearn] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="mb-4">
      <p className="font-semibold text-sm mb-2">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`text-2xl transition-all hover:scale-125 ${star <= value ? 'text-[var(--color-gold)]' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen pb-24 pt-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[var(--color-primary)] max-w-md mx-auto animate-bounce-in">
            <p className="text-5xl mb-4">🌈</p>
            <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-3" style={{fontFamily: 'var(--font-display)'}}>
              Terima Kasih!
            </h2>
            <p className="text-[var(--color-text-body)] mb-4">
              Refleksimu sangat berharga! Terus semangat belajar dan terapkan keteladanan Khulafaurrasyidin dalam kehidupan sehari-hari ya!
            </p>
            <div className="flex justify-center mb-4">
              <Mascot expression="proud" message="Kamu hebat!" />
            </div>
            <button onClick={() => onBack('menu')} className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-bold hover:bg-[var(--color-primary-dark)] transition-all btn-bounce">
              🏠 Kembali ke Menu
            </button>
          </div>
        </div>
        <NavBar onNavigate={onBack} currentPage="refleksi" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)]" style={{fontFamily: 'var(--font-display)'}}>
            💭 Refleksi Diri
          </h1>
          <p className="text-[var(--color-text-body)] mt-2">Renungkan pengalaman belajarmu!</p>
        </div>

        <div className="flex justify-center mb-6">
          <Mascot expression="happy" message="Ceritakan pengalamanmu!" />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[var(--color-primary)]">
          {/* Star Ratings */}
          <StarRating value={ratings.pemahaman} onChange={(v) => setRatings(prev => ({...prev, pemahaman: v}))} label="📚 Seberapa baik kamu memahami materi?" />
          <StarRating value={ratings.kesenangan} onChange={(v) => setRatings(prev => ({...prev, kesenangan: v}))} label="😊 Seberapa menyenangkan media ini?" />
          <StarRating value={ratings.kesulitan} onChange={(v) => setRatings(prev => ({...prev, kesulitan: v}))} label="💪 Seberapa mudah media ini digunakan?" />

          {/* Text Questions */}
          <div className="space-y-4 mt-4">
            <div>
              <label className="font-semibold text-sm block mb-2">🌟 Apa yang paling kamu sukai dari media ini?</label>
              <textarea
                value={favorite}
                onChange={(e) => setFavorite(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none resize-none h-20 text-sm"
                placeholder="Tulis jawabanmu di sini..."
              />
            </div>
            <div>
              <label className="font-semibold text-sm block mb-2">🤔 Bagian mana yang masih sulit bagi kamu?</label>
              <textarea
                value={difficult}
                onChange={(e) => setDifficult(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none resize-none h-20 text-sm"
                placeholder="Tulis jawabanmu di sini..."
              />
            </div>
            <div>
              <label className="font-semibold text-sm block mb-2">🚀 Apa yang ingin kamu pelajari lebih lanjut?</label>
              <textarea
                value={wantLearn}
                onChange={(e) => setWantLearn(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none resize-none h-20 text-sm"
                placeholder="Tulis jawabanmu di sini..."
              />
            </div>
          </div>

          <div className="text-center mt-6">
            <button onClick={handleSubmit} className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-all btn-bounce">
              ✓ Kirim Refleksi
            </button>
          </div>
        </div>
      </div>
      <NavBar onNavigate={onBack} currentPage="refleksi" />
    </div>
  );
}
