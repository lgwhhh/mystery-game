import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// 설화장: 백색의 밀실 V5.0
// 단서 14개 | 미니게임 3종 | 아이템 2개 | 심문 연계 시스템
// ═══════════════════════════════════════════════════════

const SUSPECTS = [
  {
    id: "박관리인", name: "박 씨", role: "산장 관리인 · 60대", avatar: "🧔", isKiller: true,
    profile: "1996년 산장 공사 중 아들을 잃었다. 20년간 이 산장을 지키며 복수의 날을 기다려왔다. 산악 로프와 도르래 조작에 누구보다 능숙하다.",
    greet: "어르신이 돌아가시다니... 저는 밤새 거실 난로 옆에만 있었습니다. 신께 맹세코.",
    questions: [
      { id: "q_rope", text: "창문 밖에서 젖은 밧줄이 발견됐습니다. 설명해보시죠.", requires: ["rope"], answer: "창고에 밧줄이야 수십 개 있지요. 바람에 날렸나 봅니다." },
      { id: "q_glass", text: "유리가 '안에서 밖으로' 깨졌습니다. 탈출한 흔적 아닌가요?", requires: ["glass", "rope"], answer: "...그건 바람이 세서...", contradiction: "snow", contradictionAnswer: "(손이 떨린다) 눈밭에 발자국이 없다고요? 그, 그건..." },
      { id: "q_ice", text: "[녹은 얼음 흔적]이 창틀에서 발견됐습니다. 얼음 닻 트릭을 쓴 거죠?", requires: ["ice_trace", "rope", "heater"], answer: "...(긴 침묵)...물과 밧줄, 그리고 온풍기. 완벽한 밀실이죠. 20년을 기다렸습니다." },
      { id: "q_1996", text: "금고 비밀번호가 1996년, 당신 아들이 죽은 해더군요.", requires: ["safe", "photo"], answer: "그 분이 제 아들 죽인 거 알고 있었습니다. 공사 비용 아끼려다 안전장치 제거했죠." }
    ]
  },
  {
    id: "최동업", name: "최 대표", role: "동업자 · 40대", avatar: "🕴", isKiller: false,
    profile: "피해자의 20년 파트너. 최근 회사 공금 3억을 횡령한 정황이 포착되었다. 이번 주말 감사가 예정되어 있었다.",
    greet: "불편하군요, 형사. 내 방에서 자고 있었소. 증인도 있소이다.",
    questions: [
      { id: "q_safe", text: "금고에서 횡령 증거 장부를 찾았습니다.", requires: ["safe"], answer: "...오해입니다. 하지만 내가 죽이진 않았소!" },
      { id: "q_fire", text: "난로에서 절반 탄 장부를 발견했습니다.", requires: ["fireplace"], answer: "맞소. 서재에서 훔쳐 태우려 했소. 하지만 들어갔을 때 이미 죽어있었단 말이오!" },
      { id: "q_alibi", text: "당신 방에서 수면제 빈 병이 나왔습니다.", requires: ["pill_bottle"], answer: "스트레스로 못 잔 것뿐이오. 자정부터 새벽 5시까지 방에 있었소." }
    ]
  },
  {
    id: "이지윤", name: "이 양", role: "의붓딸 · 20대", avatar: "👩", isKiller: false,
    profile: "피해자의 의붓딸. 산장 매각이 완료되면 유산에서 완전히 배제되는 조항이 있다. 독립적이고 충동적인 성격.",
    greet: "그 영감이 죽든 말든 내 알 바 아니에요. 근데 진짜 죽었네요.",
    questions: [
      { id: "q_drawer", text: "잠긴 서랍에서 매각 계약서를 발견했습니다.", requires: ["drawer"], answer: "맞아요. 그 영감이 날 빈털터리로 만들려 했죠." },
      { id: "q_hate", text: "난로에서 '다 부숴버리겠어'라는 당신 필체의 메모가 나왔습니다.", requires: ["fireplace", "handwriting"], answer: "화가 나서 적었을 뿐이에요! 진짜로 죽일 용기 같은 건 없었다고요!" },
      { id: "q_camera", text: "서재 복도 CCTV에 새벽 1시 당신이 찍혔습니다.", requires: ["cctv_footage"], answer: "...인정해요. 계약서 훔치러 갔어요. 하지만 문 앞까지만 갔고, 이미 안에서 소리가 났어요." }
    ]
  },
  {
    id: "김태혁", name: "김태혁", role: "불청객 등산객 · 30대", avatar: "🎒", isKiller: false,
    profile: "폭설로 산장에 긴급 대피했다고 주장하는 등산객. 그러나 그의 배낭에는 설명하기 힘든 물건들이 있다.",
    greet: "전 그냥 길을 잃은 등산객입니다. 재수 없게 말려든 것뿐이에요.",
    questions: [
      { id: "q_bag", text: "배낭에서 피해자의 사진과 독극물 병이 나왔습니다.", requires: ["bag"], answer: "...그래요. 복수하러 왔습니다. 하지만 누군가 먼저 선수를 쳤더군요." },
      { id: "q_poison", text: "독극물인데, 왜 사용하지 않았죠?", requires: ["bag", "toxin_report"], answer: "망설이다가 시기를 놓쳤습니다. 부검 결과 보셨죠? 독살 흔적 없잖아요." }
    ]
  }
];

// 단서 14개
const CLUES_DATA = {
  snow:        { title: "발자국 없는 눈밭",     short: "눈밭에 탈출한 사람의 발자국이 전혀 없다. 탈출 경로가 불분명하다." },
  glass:       { title: "외부로 흩어진 유리 파편", short: "창문 유리가 '안에서 밖으로' 깨졌다. 내부에서 충격이 가해졌다는 증거." },
  rope:        { title: "젖은 나일론 밧줄",     short: "창고 소속의 날카롭게 끊어진 밧줄. 끝이 물에 젖어있다." },
  body:        { title: "밀실 속 시신",         short: "방문 열쇠는 시신 주머니에 있었다. 외상 없는 전형적인 밀실." },
  heater:      { title: "MAX 온풍기",           short: "실내 온도 34도. 한겨울에 비정상적으로 높다. 무언가를 녹이려 한 것인가?" },
  ice_trace:   { title: "창틀의 녹은 얼음 흔적", short: "창틀 홈에서 물기가 발견됐다. 얼음이 있다가 녹아 사라진 흔적 같다." },
  safe:        { title: "금고 속 횡령 장부",    short: "최 대표가 3억을 횡령한 완벽한 증거 서류. 그리고 사진 한 장." },
  photo:       { title: "금고 속 낡은 사진",    short: "박 씨의 아들로 추정되는 청년 사진. 뒷면에 '1996.07.14 너는 기억하느냐'라고 적혀있다." },
  drawer:      { title: "산장 매각 계약서",      short: "피해자가 서명한 산장 매각 계약서. 이지윤은 이 순간부터 무일푼." },
  fireplace:   { title: "타다만 서류들",         short: "난로에서 최 대표의 장부 조각과 이지윤의 메모가 뒤섞여 나왔다." },
  handwriting: { title: "협박 필체 감정 결과",   short: "필체 감정 결과, 난로 속 메모는 이지윤의 것. 하지만 내용은 협박이 아닌 일기 수준." },
  bag:         { title: "복수자의 가방",         short: "독극물 병과 피해자 사진이 든 배낭. 독극물은 개봉 흔적 없음." },
  toxin_report:{ title: "부검 독물 검사 결과",   short: "피해자의 혈액에서 독성 물질이 검출되지 않았다. 김태혁의 독살설 기각." },
  cctv_footage:{ title: "복도 CCTV 영상",       short: "새벽 1시 이지윤이 복도를 걸어가는 모습. 서재 앞에서 멈췄다가 발길을 돌린다." },
  pill_bottle: { title: "수면제 빈 병",          short: "최 대표 방 쓰레기통에서 발견. 처방전 없이 구매한 강력 수면제." },
};

// 핫스팟 (아이템 2개: 은열쇠, 회중전등)
const HOTSPOTS = [
  // 외부/눈밭
  { id: "snow",     x: 22, y: 16, label: "발자국 없는 눈밭", icon: "⛄", type: "clue", zone: "exterior" },
  { id: "rope",     x: 72, y: 18, label: "젖은 밧줄",        icon: "🌿", type: "clue", zone: "exterior" },
  // 서재 (왼쪽)
  { id: "body",     x: 20, y: 72, label: "피해자 시신",       icon: "💀", type: "clue",   zone: "study" },
  { id: "heater",   x: 10, y: 52, label: "MAX 온풍기",        icon: "♨️", type: "clue",   zone: "study" },
  { id: "glass",    x: 30, y: 28, label: "외부로 깨진 유리",  icon: "💎", type: "clue",   zone: "study" },
  { id: "ice_trace",x: 35, y: 22, label: "창틀 얼음 흔적",   icon: "🧊", type: "clue",   zone: "study" },
  { id: "safe",     x: 12, y: 88, label: "다이얼 금고",       icon: "🔒", type: "puzzle", zone: "study", puzzleType: "dial", puzzleAnswer: "1996", hint: "'내 아들이 이 산장 공사 중 목숨을 잃은 해'" },
  { id: "fireplace",x: 38, y: 60, label: "타다만 서류",       icon: "🔥", type: "clue",   zone: "study" },
  // 아이템: 박씨 외투 → 은열쇠
  { id: "coat",     x: 55, y: 52, label: "박씨의 외투",       icon: "🧥", type: "item",   zone: "lobby", itemGranted: "은열쇠", itemMsg: "외투 안쪽 주머니에서 [은열쇠]를 찾았다!" },
  // 거실 (오른쪽)
  { id: "handwriting",x:65,y:58, label: "필체 감정 메모",    icon: "📝", type: "clue",   zone: "lobby" },
  { id: "pill_bottle",x:80,y:72, label: "수면제 빈 병",       icon: "💊", type: "clue",   zone: "lobby" },
  { id: "cctv",     x: 88, y: 40, label: "복도 CCTV",         icon: "📷", type: "minigame", zone: "lobby", minigameId: "cctv" },
  // 아이템: 창고 → 회중전등
  { id: "storage",  x: 90, y: 20, label: "창고 문",           icon: "🚪", type: "minigame", zone: "exterior", minigameId: "lock" },
  // 잠긴 서랍 (은열쇠 필요)
  { id: "drawer",   x: 42, y: 75, label: "잠긴 서랍",         icon: "🗄️", type: "locked",  zone: "study", reqItem: "은열쇠" },
  // 가방 (회중전등 필요)
  { id: "bag",      x: 78, y: 88, label: "등산객 가방",        icon: "🎒", type: "locked",  zone: "lobby", reqItem: "회중전등" },
  // 부검 보고서 - 암호 미니게임
  { id: "toxin_report", x:52, y:85, label: "부검 보고서",     icon: "🔬", type: "minigame", zone: "lobby", minigameId: "cipher" },
  { id: "photo",    x: 15, y: 92, label: "금고 속 사진",       icon: "🖼️", type: "clue",   zone: "study" },
];

// 잠금 장치 해제 미니게임 - 자물쇠 (창고 → 회중전등)
function LockMinigame({ onSuccess, onClose }) {
  const [combo, setCombo] = useState([null, null, null]);
  const symbols = ["△","○","□","✕","★"];
  const answer = [2, 0, 3]; // □ △ ✕
  const [shake, setShake] = useState(false);
  const [solved, setSolved] = useState(false);

  const cycle = (i, dir) => {
    setCombo(prev => {
      const next = [...prev];
      next[i] = ((next[i] ?? 0) + dir + symbols.length) % symbols.length;
      return next;
    });
  };

  const check = () => {
    if (combo[0] === answer[0] && combo[1] === answer[1] && combo[2] === answer[2]) {
      setSolved(true);
      setTimeout(() => onSuccess("회중전등"), 900);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:"#aaa",fontSize:"13px",marginBottom:"20px"}}>
        창고 자물쇠. 벽에 긁힌 세 개의 기호 메모가 있다: <span style={{color:"#ff9944",fontWeight:"bold"}}>□ · △ · ✕</span>
      </p>
      <div style={{display:"flex",gap:"20px",justifyContent:"center",marginBottom:"25px"}}>
        {[0,1,2].map(i => (
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
            <button onClick={() => cycle(i,1)} style={btnS}>▲</button>
            <div style={{fontSize:"36px",width:"60px",height:"60px",border:"2px solid #5cb8ff",display:"flex",alignItems:"center",justifyContent:"center",background:"#000",color:solved?"#44ff88":"#fff",transition:"0.3s"}}>{symbols[combo[i]??0]}</div>
            <button onClick={() => cycle(i,-1)} style={btnS}>▼</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
        <button onClick={check} style={{...primaryBtn,animation:shake?"shake 0.4s":"none"}}>확인</button>
        <button onClick={onClose} style={closeBtn}>취소</button>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// CCTV 재생 미니게임
function CctvMinigame({ onSuccess, onClose }) {
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const [found, setFound] = useState(false);
  const timerRef = useRef(null);
  const TOTAL = 60;
  const KEY_FRAME = 38;

  const frames = Array.from({length: TOTAL}, (_, i) => {
    if (i < 20) return { scene: "복도 정적", brightness: 0.3, figure: false };
    if (i < KEY_FRAME) return { scene: "복도 정적", brightness: 0.25, figure: false };
    if (i < KEY_FRAME + 8) return { scene: "인물 감지", brightness: 0.5, figure: true };
    return { scene: "복도 정적", brightness: 0.28, figure: false };
  });

  const play = () => {
    setPlaying(true);
    setFound(false);
  };

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setFrame(f => {
        if (f >= TOTAL - 1) { setPlaying(false); clearInterval(timerRef.current); return f; }
        return f + 1;
      });
    }, 80);
    return () => clearInterval(timerRef.current);
  }, [playing]);

  const capture = () => {
    if (frames[frame].figure) { setFound(true); setPlaying(false); clearInterval(timerRef.current); }
  };

  const submit = () => { if (found) setTimeout(() => onSuccess("cctv_footage"), 500); };

  const cur = frames[Math.min(frame, TOTAL-1)];

  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:"#aaa",fontSize:"13px",marginBottom:"15px"}}>재생 중 인물이 나타나면 [캡처]하세요.</p>
      <div style={{position:"relative",width:"100%",height:"160px",background:"#000",border:"1px solid #2b5278",marginBottom:"15px",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",filter:`brightness(${cur.brightness + (found?0.4:0)})`}}>
          <div style={{fontSize:"11px",color:"#44ff44",fontFamily:"monospace",position:"absolute",top:"8px",left:"8px"}}>
            CAM-01 | 00:0{Math.floor(frame/10)}{frame%10} | ●REC
          </div>
          {/* 복도 배경 */}
          <svg width="100%" height="100%" viewBox="0 0 400 160" style={{position:"absolute"}}>
            <rect width="400" height="160" fill="#050a0f"/>
            <line x1="0" y1="80" x2="400" y2="80" stroke="#0a1a2a" strokeWidth="30"/>
            <rect x="0" y="0" width="400" height="40" fill="#0a1520"/>
            <rect x="0" y="120" width="400" height="40" fill="#0a1520"/>
            {[60,160,260,360].map(x=>(
              <ellipse key={x} cx={x} cy="0" rx="20" ry="8" fill="#1a3a5a"/>
            ))}
          </svg>
          {cur.figure && (
            <div style={{position:"absolute",bottom:"25px",left:"45%",fontSize:"40px",opacity:found?1:0.7,filter:found?"drop-shadow(0 0 10px #ff4444)":"none"}}>🚶</div>
          )}
          {found && <div style={{position:"absolute",border:"2px solid #ff4444",width:"60px",height:"80px",bottom:"18px",left:"calc(45% - 8px)"}}/>}
        </div>
        <div style={{position:"absolute",bottom:"8px",left:"8px",right:"8px",height:"4px",background:"#1a2a3a"}}>
          <div style={{height:"100%",width:`${(frame/TOTAL)*100}%`,background:"#5cb8ff",transition:"width 0.08s"}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={play} disabled={playing} style={primaryBtn}>{playing?"재생중...":"▶ 재생"}</button>
        <button onClick={capture} disabled={!playing} style={{...primaryBtn,background:"rgba(255,68,68,0.2)",borderColor:"#ff4444",color:"#ff4444"}}>📸 캡처</button>
        {found && <button onClick={submit} style={{...primaryBtn,borderColor:"#44ff88",color:"#44ff88"}}>✓ 증거 확보</button>}
        <button onClick={onClose} style={closeBtn}>닫기</button>
      </div>
      {found && <p style={{color:"#44ff88",marginTop:"10px",fontSize:"13px"}}>인물 캡처 성공! '증거 확보'를 눌러 기록하세요.</p>}
    </div>
  );
}

// 암호 해독 미니게임 (부검 보고서 - 글자 치환 퍼즐)
function CipherMinigame({ onSuccess, onClose }) {
  // 암호문: 각 글자를 +3 shift
  // 원문: NO TOXIN (독물 없음)
  const encoded = "QR WRAVQ";
  const decoded = "NO TOXIN";
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);
  const [hint, setHint] = useState(false);

  const check = () => {
    if (input.trim().toUpperCase() === decoded) {
      setTimeout(() => onSuccess("toxin_report"), 600);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 600);
    }
  };

  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:"#aaa",fontSize:"13px",marginBottom:"12px"}}>
        부검 보고서 일부가 암호화되어 있다. 의사의 메모: <em style={{color:"#ff9944"}}>"카이사르 -3"</em>
      </p>
      <div style={{background:"#000",border:"1px solid #5cb8ff",padding:"20px",marginBottom:"15px",fontFamily:"monospace",letterSpacing:"8px",fontSize:"24px",color:"#5cb8ff"}}>
        {encoded}
      </div>
      <input
        style={{width:"100%",padding:"12px",fontSize:"20px",textAlign:"center",background:"#000",border:`2px solid ${wrong?"#ff4444":"#2b5278"}`,color:"#fff",letterSpacing:"6px",marginBottom:"15px",textTransform:"uppercase",fontFamily:"monospace",transition:"border-color 0.3s"}}
        placeholder="해독 결과 입력"
        value={input}
        onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&check()}
      />
      <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={check} style={primaryBtn}>해독 확인</button>
        <button onClick={() => setHint(!hint)} style={{...closeBtn,borderColor:"#ff9944",color:"#ff9944"}}>힌트</button>
        <button onClick={onClose} style={closeBtn}>취소</button>
      </div>
      {hint && <p style={{color:"#ff9944",fontSize:"12px",marginTop:"10px"}}>알파벳을 3칸 앞으로 밀면 된다. Q→N, R→O ...</p>}
    </div>
  );
}

// 도면 SVG
const BlueprintMap = ({ clues }) => (
  <svg width="100%" height="100%" viewBox="0 0 1000 620" preserveAspectRatio="none" style={{position:"absolute",inset:0,pointerEvents:"none"}}>
    {/* 외부 */}
    <rect x="40" y="20" width="920" height="175" fill="#03090f" stroke="#1e3d5c" strokeWidth="1.5" strokeDasharray="12,5"/>
    <text x="60" y="50" fill="#1e3d5c" fontSize="18" fontFamily="monospace">EXTERIOR · BLIZZARD ZONE</text>
    {/* 서재 */}
    <rect x="40" y="235" width="430" height="350" fill="#050f1a" stroke="#5cb8ff" strokeWidth="3"/>
    <text x="60" y="268" fill="#5cb8ff" fontSize="22" fontWeight="bold" fontFamily="monospace">서재 (LOCKED ROOM)</text>
    {/* 거실 */}
    <rect x="520" y="235" width="440" height="350" fill="#050f1a" stroke="#3a7ab5" strokeWidth="1.5"/>
    <text x="540" y="268" fill="#3a7ab5" fontSize="22" fontWeight="bold" fontFamily="monospace">거실 (LOBBY)</text>
    {/* 복도 연결 */}
    <line x1="470" y1="350" x2="520" y2="350" stroke="#ff4444" strokeWidth="5"/>
    {/* 창문 */}
    <rect x="250" y="228" width="90" height="14" fill="#5cb8ff" opacity="0.5"/>
    <text x="255" y="222" fill="#5cb8ff" fontSize="11" fontFamily="monospace">깨진 창문</text>
    {/* 트릭 경로 점선 */}
    <path d="M 295 228 Q 420 130 700 110" fill="none" stroke="#ff4444" strokeWidth="2" strokeDasharray="8,6" opacity="0.7"/>
    <circle cx="700" cy="110" r="5" fill="#ff4444" opacity="0.7"/>
    <text x="400" y="100" fill="#ff4444" fontSize="13" fontFamily="monospace" opacity="0.7">추정 밀실 트릭 경로 →</text>
    {/* 구역 레이블 */}
    {clues.length >= 5 && (
      <text x="60" y="580" fill="#ff4444" fontSize="12" fontFamily="monospace" opacity="0.6">! 단서 연결 분석 중...</text>
    )}
  </svg>
);

// 스타일 상수
const primaryBtn = {background:"transparent",border:"2px solid #5cb8ff",color:"#5cb8ff",padding:"10px 22px",cursor:"pointer",fontFamily:"'Courier Prime', monospace",fontSize:"14px",transition:"0.2s"};
const closeBtn = {background:"transparent",border:"1px solid #555",color:"#888",padding:"8px 18px",cursor:"pointer",fontFamily:"'Courier Prime', monospace",fontSize:"13px"};

const S = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#020a12;color:#d0dde8;font-family:'Courier Prime','Noto Serif KR',serif;overflow:hidden;}
::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#000;} ::-webkit-scrollbar-thumb{background:#2b5278;}

.root{width:100vw;height:100vh;overflow:hidden;}
.fullscreen{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:30px;background:#020a12;position:relative;overflow:hidden;}
.title{font-size:52px;color:#5cb8ff;margin-bottom:10px;letter-spacing:4px;text-shadow:0 0 30px rgba(92,184,255,0.4);}
.subtitle{font-size:14px;color:#3a7ab5;letter-spacing:8px;margin-bottom:35px;}
.briefing{max-width:640px;background:rgba(0,0,0,0.7);padding:28px 35px;border:1px solid #1e3d5c;line-height:2;margin-bottom:32px;font-size:15px;text-align:left;border-left:3px solid #5cb8ff;}
.btn-main{background:transparent;border:2px solid #5cb8ff;color:#5cb8ff;padding:16px 45px;font-size:20px;cursor:pointer;transition:0.3s;font-family:inherit;letter-spacing:2px;}
.btn-main:hover{background:#5cb8ff;color:#000;box-shadow:0 0 25px rgba(92,184,255,0.5);}
.btn-secondary{background:transparent;border:1px solid #3a7ab5;color:#3a7ab5;padding:10px 30px;font-size:15px;cursor:pointer;transition:0.3s;font-family:inherit;margin-top:12px;}
.btn-secondary:hover{border-color:#5cb8ff;color:#5cb8ff;}

.suspect-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:820px;width:100%;margin-bottom:35px;}
.suspect-card{background:rgba(5,15,25,0.9);border:1px solid #1e3d5c;padding:20px;text-align:left;display:flex;gap:14px;transition:0.2s;}
.suspect-card:hover{border-color:#5cb8ff;background:rgba(10,25,40,0.9);}

.game-layout{display:flex;height:100vh;}
.map-area{flex:3;position:relative;background:#020a12;background-image:linear-gradient(rgba(92,184,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(92,184,255,0.03) 1px,transparent 1px);background-size:28px 28px;}

.hotspot{position:absolute;transform:translate(-50%,-50%);cursor:pointer;z-index:10;text-align:center;}
.hs-icon{width:46px;height:46px;border:2px solid #1e3d5c;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;background:rgba(0,0,0,0.85);transition:0.2s;margin:0 auto;}
.hotspot:hover .hs-icon{border-color:#5cb8ff;background:rgba(92,184,255,0.15);transform:scale(1.12);}
.hotspot.found .hs-icon{border-color:#333;opacity:0.35;}
.hotspot.found:hover .hs-icon{transform:none;background:rgba(0,0,0,0.85);}
.hs-label{font-size:10px;color:#5cb8ff;margin-top:5px;background:rgba(0,0,0,0.95);padding:3px 7px;border:1px solid #1e3d5c;white-space:nowrap;}
.hs-locked .hs-icon{border-color:#ff9944;opacity:0.7;}
.hs-locked .hs-label{color:#ff9944;}

.inventory-bar{position:absolute;top:18px;left:18px;display:flex;gap:8px;z-index:20;flex-wrap:wrap;}
.inv-item{background:rgba(92,184,255,0.08);border:1px solid #5cb8ff;padding:7px 13px;font-size:12px;color:#5cb8ff;font-weight:bold;}

.side-panel{flex:1.2;background:rgba(2,10,18,0.98);border-left:2px solid #1e3d5c;display:flex;flex-direction:column;z-index:20;max-width:400px;}
.tab-header{display:flex;border-bottom:2px solid #1e3d5c;}
.tab-btn{flex:1;background:none;border:none;color:#556;padding:14px 8px;font-size:14px;cursor:pointer;font-family:inherit;letter-spacing:1px;transition:0.2s;}
.tab-btn.active{color:#5cb8ff;border-bottom:3px solid #5cb8ff;background:rgba(92,184,255,0.04);font-weight:bold;}
.progress-bar{height:3px;background:#1e3d5c;} .progress-fill{height:100%;background:#5cb8ff;transition:width 0.5s;}

.tab-content{flex:1;overflow-y:auto;padding:18px;}
.clue-card{border-left:3px solid #5cb8ff;background:rgba(255,255,255,0.02);padding:11px 14px;margin-bottom:12px;animation:fadeIn 0.4s ease;}
.clue-title{font-weight:bold;color:#d0dde8;font-size:13px;margin-bottom:4px;}
.clue-body{font-size:11px;color:#7a9ab8;line-height:1.5;}
@keyframes fadeIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}

.btn-interrogate{width:100%;padding:9px;background:transparent;border:1px solid #5cb8ff;color:#5cb8ff;cursor:pointer;margin-top:8px;font-family:inherit;font-size:13px;transition:0.2s;}
.btn-interrogate:hover{background:rgba(92,184,255,0.15);}
.btn-accuse{width:100%;padding:9px;background:rgba(255,68,68,0.08);border:1px solid #ff4444;color:#ff4444;cursor:pointer;margin-top:6px;font-family:inherit;font-size:13px;transition:0.2s;}
.btn-accuse:hover{background:#ff4444;color:#fff;}
.s-card{background:rgba(0,0,0,0.6);padding:14px;margin-bottom:12px;border:1px solid #1a2a3a;transition:0.2s;}
.s-card:hover{border-color:#2b5278;}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:100;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);}
.modal-box{background:#040d18;border:2px solid #5cb8ff;padding:32px;width:520px;max-height:85vh;overflow-y:auto;text-align:center;box-shadow:0 0 40px rgba(92,184,255,0.15);}
.modal-box.red{border-color:#ff4444;box-shadow:0 0 40px rgba(255,68,68,0.15);}
.modal-box.green{border-color:#44ff88;box-shadow:0 0 40px rgba(68,255,136,0.1);}
.puzzle-input{width:100%;padding:14px;font-size:26px;text-align:center;background:#000;border:1px solid #5cb8ff;color:#fff;margin:18px 0;letter-spacing:12px;font-family:monospace;}

.chat-log{text-align:left;background:#000;padding:14px;border:1px solid #1e3d5c;height:190px;overflow-y:auto;margin-bottom:14px;font-size:12px;line-height:1.7;}
.q-btn{display:block;width:100%;text-align:left;padding:9px 12px;background:rgba(92,184,255,0.04);border:1px solid #1e3d5c;color:#d0dde8;margin-bottom:7px;cursor:pointer;font-family:inherit;font-size:12px;transition:0.2s;}
.q-btn:hover:not(:disabled){background:rgba(92,184,255,0.1);border-color:#5cb8ff;}
.q-btn:disabled{opacity:0.3;cursor:not-allowed;}

.noise{position:absolute;inset:0;opacity:0.04;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:120px;}
`;

export default function MysteryGameV5() {
  const [phase, setPhase] = useState("intro");
  const [inventory, setInventory] = useState([]);
  const [clues, setClues] = useState([]);
  const [activeTab, setActiveTab] = useState("notebook");

  const [alertMsg, setAlertMsg] = useState(null);
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [puzzleValue, setPuzzleValue] = useState("");
  const [activeMinigame, setActiveMinigame] = useState(null);

  const [interrogating, setInterrogating] = useState(null);
  const [askedQ, setAskedQ] = useState({});
  const [chatHistory, setChatHistory] = useState({});
  const [accuseTarget, setAccuseTarget] = useState(null);

  const totalClues = Object.keys(CLUES_DATA).length;
  const ACCUSE_THRESHOLD = 9;

  const addClue = useCallback((id) => {
    setClues(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const handleHotspotClick = (hs) => {
    if (hs.type === "item") {
      if (!inventory.includes(hs.itemGranted)) {
        setInventory(p => [...p, hs.itemGranted]);
        setAlertMsg({ title: "🔑 아이템 획득!", text: hs.itemMsg, color: "#44ff88" });
      } else {
        setAlertMsg({ title: "이미 획득", text: `[${hs.itemGranted}]는 이미 보유 중입니다.`, color: "#5cb8ff" });
      }
      return;
    }
    if (hs.type === "locked") {
      if (clues.includes(hs.id)) return;
      if (inventory.includes(hs.reqItem)) {
        addClue(hs.id);
        const msgs = {
          drawer: "[은열쇠]로 서랍을 열었다. 안에서 산장 매각 계약서가 나왔다.",
          bag: "[회중전등]으로 가방 안을 비췄다. 독극물 병과 사진이 보인다.",
        };
        setAlertMsg({ title: "🔓 잠금 해제!", text: msgs[hs.id] || "열렸다.", color: "#44ff88" });
      } else {
        const hints = {
          drawer: `열쇠가 없다. 누군가의 주머니를 뒤져봐야 할 것 같다.`,
          bag: `어두워서 잘 보이지 않는다. 불빛이 필요하다.`,
        };
        setAlertMsg({ title: "🔒 잠겨 있음", text: hints[hs.id] || `[${hs.reqItem}]이 필요하다.`, color: "#ff9944" });
      }
      return;
    }
    if (hs.type === "puzzle") {
      if (clues.includes(hs.id)) { setAlertMsg({ title: "이미 해결", text: "금고는 이미 열려 있다.", color: "#5cb8ff" }); return; }
      setActivePuzzle(hs); setPuzzleValue(""); return;
    }
    if (hs.type === "minigame") {
      if (clues.includes(hs.id === "cctv" ? "cctv_footage" : hs.id === "storage" ? "회중전등_obtained" : "toxin_report")) { return; }
      setActiveMinigame(hs.minigameId);
      return;
    }
    if (hs.type === "clue" && !clues.includes(hs.id)) {
      addClue(hs.id);
    }
  };

  const handlePuzzleSubmit = () => {
    if (puzzleValue === activePuzzle.puzzleAnswer) {
      addClue(activePuzzle.id);
      if (activePuzzle.id === "safe") { addClue("photo"); }
      setActivePuzzle(null);
      setAlertMsg({ title: "✓ 정답!", text: "철컥- 금고가 열렸다. 안에서 서류와 낡은 사진이 나왔다.", color: "#44ff88" });
    } else {
      setAlertMsg({ title: "✗ 오류", text: "비밀번호가 틀렸다.", color: "#ff4444" });
    }
  };

  const handleMinigameSuccess = (rewardId) => {
    setActiveMinigame(null);
    if (rewardId === "회중전등") {
      setInventory(p => [...p, "회중전등"]);
      setAlertMsg({ title: "🔦 아이템 획득!", text: "창고 자물쇠를 열었다. [회중전등]을 찾았다!", color: "#44ff88" });
    } else {
      addClue(rewardId);
      const msgs = {
        cctv_footage: "CCTV 영상에서 이지윤의 모습을 캡처했다. 새벽 1시, 서재 복도.",
        toxin_report: "부검 보고서 해독 완료: 'NO TOXIN' - 독살 흔적 없음.",
      };
      setAlertMsg({ title: "✓ 증거 확보!", text: msgs[rewardId] || "단서를 획득했다.", color: "#44ff88" });
    }
  };

  const askQuestion = (suspect, q) => {
    const sid = suspect.id;
    setAskedQ(p => ({ ...p, [sid]: [...(p[sid] || []), q.id] }));
    const hasContra = q.contradiction && clues.includes(q.contradiction);
    const ans = hasContra ? q.contradictionAnswer : q.answer;
    setChatHistory(p => ({ ...p, [sid]: [...(p[sid] || []), { q: q.text, a: ans, isContra: hasContra }] }));
  };

  const handleAccuse = (suspect) => {
    setAccuseTarget(suspect);
    setPhase("verdict");
  };

  // 인트로
  if (phase === "intro") return (
    <div className="root"><style>{S}</style>
      <div className="fullscreen">
        <div className="noise"/>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 40%, rgba(92,184,255,0.04) 0%, transparent 70%)"}}/>
        <h1 className="title">설화장</h1>
        <div className="subtitle">백색의 밀실 · 사건 파일 #0147</div>
        <div className="briefing">
          1월 14일 새벽, 폭설로 고립된 산장 '설화장'.<br/>
          이튿날 아침 산장 주인이 <strong style={{color:"#5cb8ff"}}>안에서 잠긴 서재</strong>에서 주검으로 발견되었다.<br/><br/>
          방문 열쇠는 시신 주머니에. 창문 밖 눈밭에는 <strong style={{color:"#ff4444"}}>아무 발자국도 없다.</strong><br/>
          완벽한 밀실. 하지만 이 산장엔 당신 외에도 세 명의 용의자가 고립되어 있다.
        </div>
        <button className="btn-main" onClick={() => setPhase("suspects")}>수사 개시</button>
      </div>
    </div>
  );

  // 용의자 소개
  if (phase === "suspects") return (
    <div className="root"><style>{S}</style>
      <div className="fullscreen">
        <div className="noise"/>
        <h2 style={{color:"#5cb8ff",marginBottom:"6px",letterSpacing:"3px"}}>용의자 파일</h2>
        <p style={{color:"#3a7ab5",fontSize:"12px",marginBottom:"25px",letterSpacing:"5px"}}>4 PERSONS OF INTEREST</p>
        <div className="suspect-grid">
          {SUSPECTS.map(s => (
            <div key={s.id} className="suspect-card">
              <div style={{fontSize:"38px",flexShrink:0}}>{s.avatar}</div>
              <div>
                <div style={{color:"#fff",fontWeight:"bold",fontSize:"17px"}}>{s.name}</div>
                <div style={{color:"#5cb8ff",fontSize:"10px",letterSpacing:"2px",marginBottom:"6px"}}>{s.role}</div>
                <div style={{color:"#7a9ab8",fontSize:"12px",lineHeight:"1.6"}}>{s.profile}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-main" onClick={() => setPhase("game")}>산장으로 들어가기</button>
        <button className="btn-secondary" onClick={() => setPhase("intro")}>← 돌아가기</button>
      </div>
    </div>
  );

  // 엔딩
  if (phase === "verdict") return (
    <div className="root"><style>{S}</style>
      <div className="fullscreen">
        <div className="noise"/>
        <h1 className="title" style={{color:accuseTarget.isKiller?"#5cb8ff":"#ff4444",fontSize:"38px"}}>
          {accuseTarget.isKiller ? "― 사건 해결 ―" : "― 수사 실패 ―"}
        </h1>
        <div style={{color:accuseTarget.isKiller?"#3a7ab5":"#aa2222",letterSpacing:"6px",fontSize:"12px",marginBottom:"30px"}}>
          {accuseTarget.isKiller ? "CASE CLOSED · TRICK SOLVED" : "COLD CASE · TRUE CULPRIT ESCAPED"}
        </div>
        <div className="briefing" style={{borderColor:accuseTarget.isKiller?"#5cb8ff":"#ff4444",maxWidth:"660px"}}>
          {accuseTarget.isKiller ? <>
            <strong style={{color:"#5cb8ff"}}>박 씨가 바로 범인이었습니다.</strong><br/><br/>
            그는 '얼음 닻 트릭'을 이용해 완벽한 밀실을 만들어냈습니다. 창문에 얼음 덩어리를 닻처럼 걸어 밧줄을 고정하고 창밖으로 내려간 뒤, 시간이 지나 얼음이 녹으면 밧줄이 저절로 떨어지는 구조였습니다. MAX로 켜진 온풍기는 얼음을 빠르게 녹이기 위한 장치였죠.<br/><br/>
            1996년, 산장 공사 중 안전장치 부실로 아들을 잃은 박 씨의 20년 복수극. 이렇게 막을 내렸습니다.
          </> : <>
            <strong style={{color:"#ff4444"}}>{accuseTarget.name}은(는) 범인이 아닙니다.</strong><br/><br/>
            당신이 헛짚는 사이, 진짜 범인 <strong style={{color:"#ff9944"}}>박 씨</strong>는 태연히 거실 난로 옆에 앉아 당신을 바라보고 있습니다. 얼음이 녹듯, 진실도 당신의 손에서 흘러내렸습니다.
          </>}
        </div>
        <button className="btn-main" onClick={() => {
          setPhase("intro"); setClues([]); setInventory([]); setChatHistory({}); setAskedQ({});
        }}>처음부터 다시</button>
      </div>
    </div>
  );

  // 메인 게임
  const isHotspotDone = (hs) => {
    if (hs.type === "item") return inventory.includes(hs.itemGranted);
    if (hs.type === "minigame") {
      const reward = {cctv:"cctv_footage", lock:"회중전등", cipher:"toxin_report"};
      return clues.includes(reward[hs.minigameId]) || (hs.minigameId==="lock" && inventory.includes("회중전등"));
    }
    return clues.includes(hs.id);
  };

  const isLocked = (hs) => hs.type === "locked" && !clues.includes(hs.id) && !inventory.includes(hs.reqItem);

  return (
    <div className="root"><style>{S}</style>
      <div className="game-layout">
        {/* 맵 */}
        <div className="map-area">
          <BlueprintMap clues={clues}/>
          {inventory.length > 0 && (
            <div className="inventory-bar">
              <div style={{color:"#556",lineHeight:"32px",fontSize:"11px",letterSpacing:"1px"}}>보유:</div>
              {inventory.map((item,i) => <div key={i} className="inv-item">{item === "은열쇠" ? "🗝️" : "🔦"} {item}</div>)}
            </div>
          )}
          {HOTSPOTS.map(hs => {
            const done = isHotspotDone(hs);
            const locked = isLocked(hs);
            return (
              <div key={hs.id}
                className={`hotspot ${done ? "found" : ""} ${locked ? "hs-locked" : ""}`}
                style={{left:`${hs.x}%`, top:`${hs.y}%`}}
                onClick={() => handleHotspotClick(hs)}>
                <div className="hs-icon">
                  {done ? <span style={{opacity:0.4}}>{hs.icon}</span> : hs.icon}
                </div>
                <div className="hs-label">
                  {hs.type === "minigame" ? `⚙ ${hs.label}` : locked ? `🔒 ${hs.label}` : hs.label}
                </div>
              </div>
            );
          })}
          {/* 진행 힌트 */}
          <div style={{position:"absolute",bottom:"16px",left:"16px",fontSize:"11px",color:"#2b5278",fontFamily:"monospace"}}>
            단서 {clues.length}/{totalClues} · 범인 지목 {ACCUSE_THRESHOLD}개 이상 필요
          </div>
        </div>

        {/* 사이드 패널 */}
        <div className="side-panel">
          <div className="progress-bar"><div className="progress-fill" style={{width:`${(clues.length/totalClues)*100}%`}}/></div>
          <div className="tab-header">
            <button className={`tab-btn ${activeTab==="notebook"?"active":""}`} onClick={()=>setActiveTab("notebook")}>
              수첩 ({clues.length}/{totalClues})
            </button>
            <button className={`tab-btn ${activeTab==="interrogate"?"active":""}`} onClick={()=>setActiveTab("interrogate")}>
              심문 / 고발
            </button>
          </div>
          <div className="tab-content">
            {activeTab === "notebook" && (<>
              {clues.length === 0 && <p style={{color:"#334",fontSize:"12px",textAlign:"center",marginTop:"30px",lineHeight:1.8}}>도면을 탐색하여<br/>단서를 수집하십시오.</p>}
              {clues.map(id => CLUES_DATA[id] && (
                <div key={id} className="clue-card">
                  <div className="clue-title">✓ {CLUES_DATA[id].title}</div>
                  <div className="clue-body">{CLUES_DATA[id].short}</div>
                </div>
              ))}
            </>)}

            {activeTab === "interrogate" && (<>
              {SUSPECTS.map(s => (
                <div key={s.id} className="s-card">
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <span style={{fontSize:"26px"}}>{s.avatar}</span>
                    <div>
                      <div style={{color:"#fff",fontWeight:"bold",fontSize:"15px"}}>{s.name}</div>
                      <div style={{color:"#556",fontSize:"10px",letterSpacing:"1px"}}>{s.role}</div>
                    </div>
                  </div>
                  <button className="btn-interrogate" onClick={()=>setInterrogating(s)}>심문하기</button>
                  {clues.length >= ACCUSE_THRESHOLD && (
                    <button className="btn-accuse" onClick={()=>handleAccuse(s)}>이 자를 범인으로 지목</button>
                  )}
                </div>
              ))}
              {clues.length < ACCUSE_THRESHOLD && (
                <p style={{color:"#ff4444",fontSize:"11px",textAlign:"center",marginTop:"10px",lineHeight:1.6}}>
                  단서 {ACCUSE_THRESHOLD}개 이상 수집 시<br/>범인 지목이 가능합니다.<br/>
                  <span style={{color:"#556"}}>현재 {clues.length}개</span>
                </p>
              )}
            </>)}
          </div>
        </div>
      </div>

      {/* 알림 모달 */}
      {alertMsg && (
        <div className="modal-overlay" onClick={()=>setAlertMsg(null)}>
          <div className="modal-box" style={{borderColor:alertMsg.color||"#5cb8ff"}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:alertMsg.color||"#5cb8ff",marginBottom:"15px",fontSize:"18px"}}>{alertMsg.title}</h2>
            <p style={{color:"#d0dde8",lineHeight:1.8,fontSize:"14px"}}>{alertMsg.text}</p>
            <button style={{...closeBtn,marginTop:"20px"}} onClick={()=>setAlertMsg(null)}>확인</button>
          </div>
        </div>
      )}

      {/* 금고 퍼즐 */}
      {activePuzzle && (
        <div className="modal-overlay">
          <div className="modal-box red">
            <h2 style={{color:"#ff9944",marginBottom:"8px"}}>🔒 {activePuzzle.label}</h2>
            <p style={{color:"#7a9ab8",fontSize:"13px",marginBottom:"5px"}}>{activePuzzle.hint}</p>
            <p style={{color:"#556",fontSize:"11px",marginBottom:"5px"}}>4자리 숫자를 입력하시오.</p>
            <input type="text" className="puzzle-input" maxLength={4} placeholder="0000"
              value={puzzleValue} onChange={e=>setPuzzleValue(e.target.value.replace(/[^0-9]/g,""))}
              onKeyDown={e=>e.key==="Enter"&&handlePuzzleSubmit()}/>
            <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
              <button style={{...primaryBtn,borderColor:"#ff9944",color:"#ff9944"}} onClick={handlePuzzleSubmit}>입력</button>
              <button style={closeBtn} onClick={()=>setActivePuzzle(null)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 미니게임 모달 */}
      {activeMinigame && (
        <div className="modal-overlay" onClick={()=>setActiveMinigame(null)}>
          <div className="modal-box" style={{width:"560px"}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:"#5cb8ff",borderBottom:"1px solid #1e3d5c",paddingBottom:"12px",marginBottom:"20px",fontSize:"17px"}}>
              {activeMinigame==="lock" && "⚙ 창고 자물쇠 해제"}
              {activeMinigame==="cctv" && "📷 CCTV 영상 분석"}
              {activeMinigame==="cipher" && "🔬 부검 보고서 암호 해독"}
            </h2>
            {activeMinigame==="lock" && <LockMinigame onSuccess={handleMinigameSuccess} onClose={()=>setActiveMinigame(null)}/>}
            {activeMinigame==="cctv" && <CctvMinigame onSuccess={handleMinigameSuccess} onClose={()=>setActiveMinigame(null)}/>}
            {activeMinigame==="cipher" && <CipherMinigame onSuccess={handleMinigameSuccess} onClose={()=>setActiveMinigame(null)}/>}
          </div>
        </div>
      )}

      {/* 심문 모달 */}
      {interrogating && (
        <div className="modal-overlay" onClick={()=>setInterrogating(null)}>
          <div className="modal-box" style={{width:"600px",textAlign:"left"}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:"#5cb8ff",borderBottom:"1px solid #1e3d5c",paddingBottom:"12px",marginBottom:"16px",fontSize:"16px"}}>
              {interrogating.avatar} {interrogating.name} · 심문 기록
            </h2>
            <div className="chat-log">
              <div style={{color:"#556",marginBottom:"10px",fontSize:"11px",fontStyle:"italic"}}>첫 진술:</div>
              <div style={{color:"#aaa",marginBottom:"12px"}}>"{interrogating.greet}"</div>
              {(chatHistory[interrogating.id]||[]).map((c,i) => (
                <div key={i} style={{marginBottom:"12px"}}>
                  <div style={{color:"#5cb8ff",fontSize:"11px"}}>▶ {c.q}</div>
                  <div style={{color:c.isContra?"#ff4444":"#d0dde8",marginLeft:"12px",marginTop:"3px",fontSize:"12px",fontStyle:"italic"}}>
                    {c.isContra && <span style={{color:"#ff4444",fontSize:"10px"}}>[모순 발각] </span>}
                    "{c.a}"
                  </div>
                </div>
              ))}
            </div>
            <div>
              {interrogating.questions.map(q => {
                const asked = (askedQ[interrogating.id]||[]).includes(q.id);
                const canAsk = q.requires.every(r => clues.includes(r));
                return (
                  <button key={q.id} className="q-btn" disabled={asked||!canAsk} onClick={()=>askQuestion(interrogating,q)}>
                    <span style={{color:asked?"#44ff88":canAsk?"#5cb8ff":"#334"}}>
                      {asked?"✓ ":canAsk?"Q. ":"🔒 "}
                    </span>
                    {q.text}
                    {!canAsk&&!asked&&<span style={{fontSize:"10px",color:"#334",float:"right"}}>(관련 단서 부족)</span>}
                  </button>
                );
              })}
            </div>
            <div style={{textAlign:"right",marginTop:"10px"}}>
              <button style={closeBtn} onClick={()=>setInterrogating(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
