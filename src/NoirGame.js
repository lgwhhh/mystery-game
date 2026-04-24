import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════
// GAME DATA: [형사 엘제이 시리즈 - 항로 없는 밤]
// ═══════════════════════════════════════════════════════

const CLUES_DATA = {
  c_key: { title: "원본 열쇠", short: "피해자 주머니에서 발견. 외상 없는 완벽한 밀실 증명." },
  c_threat: { title: "협박 편지", short: "피해자 방에서 발견된 찢긴 편지. 이무역의 필체와 일치함." },
  c_safe_key: { title: "금고 열쇠", short: "권부인의 객실 테이블에서 발견. 김밀수의 금고를 열 수 있다." },
  c_contract: { title: "이중계약 문서", short: "금고 안에서 발견. 박동업을 배신하고 다른 조직에 물건을 넘기려 한 증거." },
  c_file: { title: "쇠줄과 줄칼", short: "이무역의 3등 선실 매트리스 밑에서 발견된 공구." },
  c_wax_hand: { title: "손톱 밑 밀랍", short: "이무역의 외투를 조사하던 중 소매와 장갑에서 발견된 밀랍 가루." },
  c_log: { title: "항해일지", short: "조종실 책상 위. 오후 6시 50분 최항해의 서명이 있다." },
  c_wax_box: { title: "조종실 밀랍 흔적", short: "조종실 예비 열쇠함에서 발견된 굳은 밀랍 조각." },
  c_foot: { title: "로비 발자국", short: "3등 선실에서 1등 선실 쪽으로 이어진 젖은 발자국." },
  c_list: { title: "공연장 명단", short: "저녁 7시 로비 공연장 출입 명단. 이무역과 박동업의 이름은 없다." },
  c_memo: { title: "박동업 메모", short: "박동업이 흘린 메모. '이중계약 사실을 알았다. 용서 못 해'." },
  c_sound: { title: "권부인 증언", short: "7시 10분경 갑판에서 '풍덩' 소리 두 번과 이무역을 목격했다는 증언." }
};

const HOTSPOTS = [
  { id: "c_key", x: 45, y: 70, label: "피해자 시신", icon: "💀", loc: "loc_victim", type: "clue" },
  { id: "c_threat", x: 25, y: 30, label: "구겨진 종이", icon: "📄", loc: "loc_victim", type: "clue" },
  { id: "c_contract", x: 70, y: 40, label: "잠긴 금고", icon: "🔒", loc: "loc_victim", type: "locked", reqItem: "c_safe_key", lockMsg: "굳게 잠겨있다. 열쇠가 필요하다." },
  { id: "c_file", x: 50, y: 60, label: "매트리스 밑", icon: "🛏️", loc: "loc_suspect1", type: "clue" },
  { id: "c_wax_hand", x: 20, y: 40, label: "젖은 외투", icon: "🧥", loc: "loc_suspect1", type: "clue" },
  { id: "c_log", x: 60, y: 50, label: "조타수 책상", icon: "📔", loc: "loc_control", type: "clue" },
  { id: "c_wax_box", x: 30, y: 30, label: "예비 열쇠함", icon: "🔑", loc: "loc_control", type: "clue" },
  { id: "c_foot", x: 40, y: 75, label: "바닥 발자국", icon: "👣", loc: "loc_lobby", type: "clue" },
  { id: "c_list", x: 70, y: 30, label: "게시판 명단", icon: "📋", loc: "loc_lobby", type: "clue" },
  { id: "c_memo", x: 20, y: 60, label: "떨어진 수첩", icon: "📓", loc: "loc_lobby", type: "clue" },
  { id: "c_safe_key", x: 50, y: 50, label: "화장대", icon: "🗝️", loc: "loc_wife", type: "clue" },
  { id: "c_sound", x: 80, y: 40, label: "갑판 난간", icon: "🌊", loc: "loc_deck", type: "clue", isTestimony: true }
];

const SUSPECTS = [
  {
    id: "이무역", name: "이무역", role: "몰락한 무역상, 3등실", avatar: "🧥", isKiller: true,
    profile: "김밀수에게 사기를 당해 모든 것을 잃고, 복수를 위해 탑승한 과거의 동업자.",
    greet: "3등 선실에서 뱃멀미로 누워있었습니다. 아무도 못 봤어요.",
    greet2: "예전에 잠깐 같이 일한 사이입니다. 오래된 얘기예요.",
    questions: [
      { id: "q1", text: "공연장 관람 명단에 당신 이름이 없더군요.", requires: ["c_list"], answer: "뱃멀미가 심해서 공연은 안 갔습니다.", isCore: false },
      { id: "q2", text: "로비 발자국이 3등 선실에서 1등 선실로 이어지던데요.", requires: ["c_foot", "c_list"], answer: "저 말고도 3등 선실 승객이 많습니다. 제 발자국이라는 증거가 있습니까?", isCore: false },
      { id: "q3", text: "오른손 손톱 사이 밀랍이 묻어있군요.", requires: ["c_wax_hand"], answer: "배에서 양초를 만지다 보니... 별 게 다 의심스럽군요.", isCore: false },
      { id: "q4", text: "매트리스 밑에서 쇠줄과 줄칼이 나왔습니다. 열쇠를 직접 깎은 것 아닙니까?", requires: ["c_file", "c_wax_hand"], answer: "...(침묵)... 그건 제 연장입니다. 무역상 출신이라 공구를 갖고 다니죠.", isCore: true },
      { id: "q5", text: "피해자 객실에서 발견된 협박편지 필체가 당신 것과 일치합니다.", requires: ["c_threat"], answer: "(당황) 그, 그건... 편지를 보낸 건 맞지만 그게 살인의 증거는 아니지 않습니까!", isCore: true },
      { id: "q6", text: "조종실 열쇠함의 밀랍 흔적, 그리고 갑판에서 들린 두 번의 풍덩 소리. 복제 열쇠로 밀실을 만들었죠?", requires: ["c_wax_box", "c_sound", "c_key"], answer: "...(긴 침묵)... 그 사람이 먼저 제 인생을 바다에 던졌습니다. 저는 그냥 돌려준 것뿐이에요.", isCore: true, isConfession: true }
    ]
  },
  {
    id: "최항해", name: "최항해", role: "해연호 2등 항해사", avatar: "⚓", isKiller: false,
    profile: "과거 김밀수를 도와 밀수사업을 하다 배신당해 감옥생활을 했다. 복수심을 품고 있다.",
    greet: "조종실에서 항해 중이었습니다. 태풍 때문에 자리를 비울 수 없었어요.",
    greet2: "예전에 알던 사이입니다. 다른 인생을 짓밟은 자의 업보입니다.",
    questions: [
      { id: "q1", text: "항해일지 6시 50분 서명 이후, 7시에도 계속 조종실에 계셨습니까?", requires: ["c_log"], answer: "네. 태풍 속에서 조종실을 비우는 건 있을 수 없는 일입니다.", isCore: false },
      { id: "q2", text: "과거에 김밀수와 함께 밀수를 했다가 배신당했죠?", requires: ["c_contract"], answer: "...숨기지 않겠습니다. 사실입니다. 하지만 저는 이미 죗값을 치렀어요.", isCore: false },
      { id: "q3", text: "조종실 예비 열쇠함에서 밀랍 흔적이 발견됐습니다. 이무역을 만난 적 있습니까?", requires: ["c_wax_box"], answer: "맞습니다, 이무역이 조종실에 왔었어요. 배 구조가 궁금하다며 잠깐 들어왔는데... 설마 그때...", isCore: true }
    ]
  },
  {
    id: "박동업", name: "박동업", role: "재일교포 바이어", avatar: "💼", isKiller: false,
    profile: "김밀수에게 선금을 지급했으나 이중계약을 맺었다는 사실을 알고 분노하여 탑승.",
    greet: "1등 선실에서 혼자 술을 마시고 있었소. 뱃멀미가 심해 저녁도 못 먹었소.",
    greet2: "사업 파트너였소. 배신자가 스스로 벌을 받은 것이오.",
    questions: [
      { id: "q1", text: "선금을 지급했는데 이중계약을 맺었다는 걸 어떻게 알았습니까?", requires: ["c_memo"], answer: "일본 내 다른 조직에서 먼저 연락이 왔소. 김밀수가 양쪽에 팔아먹으려 한 거요.", isCore: false },
      { id: "q2", text: "금고에서 이중계약 문서가 나왔습니다. 당신도 죽일 동기가 충분한데요?", requires: ["c_contract", "c_memo"], answer: "맞소. 나도 피해자요. 하지만 나는 죽이지 않았소. 법대로 받아내려 했을 뿐이오.", isCore: true },
      { id: "q3", text: "오후 7시에 혼자 선실에 있었다고 하셨는데 명단에 없어 증인이 없군요.", requires: ["c_list"], answer: "나도 공연장에 갔어야 했나. 뱃멀미로 죽을 것 같았는데.", isCore: false }
    ]
  },
  {
    id: "권부인", name: "권부인", role: "김밀수의 부인", avatar: "💃", isKiller: false,
    profile: "남편의 죽음보다 금고 속에 숨겨둔 재산에 더 관심을 가지고 있다.",
    greet: "두통이 심해서 갑판에서 바람을 쐬고 있었어요.",
    greet2: "남편이잖아요. (냉담하게) 상속은 어떻게 되는 거죠?",
    questions: [
      { id: "q1", text: "갑판에 계셨다면 무언가 목격한 게 있습니까?", requires: ["c_sound"], answer: "...사실 이상한 소리를 들었어요. 풍덩 소리가 두 번. 누군가 바다에 무언가를 던진 것 같았어요.", isCore: false },
      { id: "q2", text: "풍덩 소리를 들었을 때 주변에 사람이 있었습니까?", requires: ["c_sound"], answer: "갑판 어귀 쪽에 등을 보인 남자가 있었어요. 초라한 차림... 이무역 씨 같기도 했는데 확신은...", isCore: true },
      { id: "q3", text: "남편 방 금고 열쇠를 갖고 계시더군요.", requires: ["c_safe_key"], answer: "남편이 만약을 위해 맡겨둔 거예요. 그게 문제입니까?", isCore: true }
    ]
  }
];

// SVG 배 평면도 (Blueprint)
const ShipBlueprint = ({ currentLoc }) => (
  <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: 'none' }}>
    <path d="M 100 300 Q 150 100 500 100 Q 850 100 900 300 Q 850 500 500 500 Q 150 500 100 300 Z" fill="none" stroke="#2b5278" strokeWidth="4" />
    <text x="450" y="70" fill="#2b5278" fontSize="24" fontFamily="monospace" fontWeight="bold">여객선 '해연호' 평면도</text>
    
    <rect x="300" y="150" width="150" height="120" fill={currentLoc === 'loc_victim' ? "rgba(92,184,255,0.2)" : "transparent"} stroke="#5cb8ff" strokeWidth="2" />
    <text x="310" y="180" fill="#5cb8ff" fontSize="16">1등 선실 (밀실)</text>
    
    <rect x="470" y="150" width="120" height="120" fill={currentLoc === 'loc_wife' ? "rgba(92,184,255,0.2)" : "transparent"} stroke="#5cb8ff" strokeWidth="2" />
    <text x="480" y="180" fill="#5cb8ff" fontSize="16">1등실 (부인)</text>

    <rect x="250" y="350" width="180" height="100" fill={currentLoc === 'loc_suspect1' ? "rgba(92,184,255,0.2)" : "transparent"} stroke="#5cb8ff" strokeWidth="2" />
    <text x="260" y="380" fill="#5cb8ff" fontSize="16">3등 선실 (이무역)</text>

    <rect x="450" y="350" width="200" height="100" fill={currentLoc === 'loc_lobby' ? "rgba(92,184,255,0.2)" : "transparent"} stroke="#5cb8ff" strokeWidth="2" />
    <text x="460" y="380" fill="#5cb8ff" fontSize="16">로비 / 공연장</text>

    <rect x="700" y="250" width="120" height="100" fill={currentLoc === 'loc_control' ? "rgba(92,184,255,0.2)" : "transparent"} stroke="#5cb8ff" strokeWidth="2" />
    <text x="710" y="280" fill="#5cb8ff" fontSize="16">조종실 (선교)</text>

    <path d="M 150 280 L 280 280 M 150 320 L 280 320" stroke="#ff4444" strokeWidth="3" strokeDasharray="5,5" />
    <text x="160" y="270" fill="#ff4444" fontSize="14">갑판 (투척 지점)</text>
  </svg>
);

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Courier+Prime&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#03080f; color:#e6edf2; font-family:'Courier Prime', 'Noto Serif KR', serif; overflow-x:hidden;}
  .storm-bg { position:absolute; inset:0; background: url('/bg_storm.png') center/cover no-repeat; z-index:1; pointer-events:none; opacity: 0.35;}
  .fullscreen { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; text-align:center; padding:20px; background:#03080f; position:relative; overflow:hidden;}
  .storm-bg { position:absolute; inset:0; background: radial-gradient(circle at 50% 50%, transparent, #000 80%); z-index:1; pointer-events:none;}
  .lightning { position:absolute; inset:0; background:white; opacity:0; z-index:0; animation: flash 8s infinite; pointer-events:none;}
  @keyframes flash { 0%, 95%, 98%, 100% {opacity:0;} 96%, 99% {opacity:0.3;} }
  
  .title { font-size:52px; color:#5cb8ff; margin-bottom:20px; text-shadow: 0 0 20px rgba(92,184,255,0.4); z-index:2; position:relative;}
  .briefing { max-width:650px; background:rgba(0,0,0,0.7); padding:30px; border:1px solid #2b5278; border-left:4px solid #5cb8ff; line-height:1.9; margin-bottom:30px; font-size:16px; text-align:left; z-index:2; position:relative;}
  .btn-main { background:transparent; border:2px solid #5cb8ff; color:#5cb8ff; padding:15px 40px; font-size:20px; cursor:pointer; transition:0.3s; font-family:inherit; z-index:2; position:relative;}
  .btn-main:hover { background:#5cb8ff; color:#000; box-shadow: 0 0 20px rgba(92,184,255,0.5); }

  .suspect-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:900px; margin-bottom:40px; z-index:2; position:relative;}
  .suspect-card { background:rgba(10,20,30,0.8); border:1px solid #2b5278; padding:20px; text-align:left; display:flex; gap:15px;}
  
  .game-layout { display:flex; height:100vh; }
  .nav-panel { width:200px; background:rgba(5,15,25,0.95); border-right:1px solid #2b5278; display:flex; flex-direction:column;}
  .nav-btn { background:none; border:none; color:#888; padding:15px; text-align:left; cursor:pointer; font-size:14px; border-bottom:1px solid #1a2a3a; font-family:inherit;}
  .nav-btn.active { color:#5cb8ff; background:rgba(92,184,255,0.1); border-left:3px solid #5cb8ff; }
  .nav-btn:hover { color:#fff; }

  .map-area { flex:1; position:relative; background:#03080f; background-image: linear-gradient(rgba(92,184,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(92,184,255,0.05) 1px, transparent 1px); background-size: 30px 30px; display:flex; align-items:center; justify-content:center;}
  
  .hotspot { position:absolute; transform:translate(-50%,-50%); cursor:pointer; z-index:10; text-align:center; }
  .hs-icon { width:48px; height:48px; border:2px solid #2b5278; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; background:rgba(0,0,0,0.8); transition:0.2s; margin:0 auto;}
  .hotspot:hover .hs-icon { border-color:#5cb8ff; background:rgba(92,184,255,0.2); transform:scale(1.1); }
  .hotspot.found .hs-icon { border-color:#444; opacity:0.4; }
  .hs-label { font-size:12px; color:#5cb8ff; margin-top:6px; background:rgba(0,0,0,0.9); padding:4px 8px; border:1px solid #2b5278; white-space:nowrap; }

  .side-panel { width:380px; background:rgba(5,15,25,0.95); border-left:2px solid #2b5278; display:flex; flex-direction:column; z-index:20;}
  .tab-header { display:flex; border-bottom:2px solid #2b5278; }
  .tab-btn { flex:1; background:none; border:none; color:#888; padding:15px; font-size:15px; cursor:pointer; font-family:inherit;}
  .tab-btn.active { color:#5cb8ff; border-bottom:3px solid #5cb8ff; background:rgba(92,184,255,0.05); font-weight:bold;}
  
  .tab-content { flex:1; overflow-y:auto; padding:20px; }
  .clue-card { border-left:3px solid #5cb8ff; background:rgba(255,255,255,0.02); padding:12px; margin-bottom:15px; }
  .clue-title { font-weight:bold; color:#e6edf2; font-size:14px; margin-bottom:6px; }
  
  .btn-interrogate { width:100%; padding:10px; background:transparent; border:1px solid #5cb8ff; color:#5cb8ff; cursor:pointer; margin-top:10px;}
  .btn-interrogate:hover { background:rgba(92,184,255,0.2); }
  .btn-accuse { width:100%; padding:10px; background:rgba(255,68,68,0.1); border:1px solid #ff4444; color:#ff4444; cursor:pointer; margin-top:10px;}
  .btn-accuse:hover { background:#ff4444; color:#fff; }

  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:100; display:flex; align-items:center; justify-content:center;}
  .modal-box { background:#0a1520; border:2px solid #5cb8ff; padding:30px; width:650px; max-height:85vh; overflow-y:auto; text-align:left;}
  .btn-close { background:transparent; color:#888; border:1px solid #888; padding:8px 20px; margin-top:15px; cursor:pointer; float:right;}
  .btn-close:hover { color:#fff; border-color:#fff;}
  
  .chat-log { background:#000; padding:15px; border:1px solid #2b5278; max-height:250px; overflow-y:auto; margin-bottom:15px; font-size:14px; line-height:1.7;}
  .q-btn { display:block; width:100%; text-align:left; padding:12px; background:rgba(92,184,255,0.05); border:1px solid #2b5278; color:#e6edf2; margin-bottom:8px; cursor:pointer; font-family:inherit;}
  .q-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .q-btn.asked { opacity:0.5; text-decoration:line-through; }
  .q-btn .core-mark { color:#ffaa00; margin-right:5px; font-weight:bold;}
`;

export default function SeaNoirGameV5() {
  const [phase, setPhase] = useState("intro");
  const [curLocation, setCurLocation] = useState("loc_victim");
  const [clues, setClues] = useState([]);
  const [activeTab, setActiveTab] = useState("notebook");
  const [alertMsg, setAlertMsg] = useState(null);
  
  const [interrogating, setInterrogating] = useState(null);
  const [askedQ, setAskedQ] = useState({});
  const [chatHistory, setChatHistory] = useState({});
  const [accuseTarget, setAccuseTarget] = useState(null);

  const handleHotspotClick = (hs) => {
    if (hs.isTestimony) {
      if (!clues.includes(hs.id)) {
        setClues([...clues, hs.id]);
        setAlertMsg({ title: "증언 확보", text: "권부인으로부터 사건 당일 풍덩 소리와 갑판 어귀에 있던 남자에 대한 증언을 얻어냈다." });
      }
      return;
    }
    if (hs.type === "locked") {
      if (clues.includes(hs.id)) return;
      if (clues.includes(hs.reqItem)) {
        setClues([...clues, hs.id]);
        setAlertMsg({ title: "금고 개방", text: "권부인에게서 얻은 열쇠로 금고를 열었다. 안에서 '이중계약 문서'가 발견되었다!" });
      } else {
        setAlertMsg({ title: "잠겨 있음", text: hs.lockMsg });
      }
      return;
    }
    if (hs.type === "clue" && !clues.includes(hs.id)) {
      setClues([...clues, hs.id]);
      setAlertMsg({ title: "단서 발견", text: CLUES_DATA[hs.id].title + "을(를) 수첩에 기록했다." });
    }
  };

  const askQuestion = (suspect, q) => {
    const sid = suspect.id;
    setAskedQ(p => ({ ...p, [sid]: [...(p[sid] || []), q.id] }));
    const isConfess = q.isConfession;
    setChatHistory(p => ({ ...p, [sid]: [...(p[sid] || []), { q: q.text, a: q.answer, isConfess }] }));
  };

  // 💡 [버그 수정 완료]: 고발 시 타겟 지정 후 바로 'verdict' 페이즈로 전환
  const handleAccuse = (suspect) => {
    setAccuseTarget(suspect);
    setPhase("verdict");
  };

  if (phase === "intro") return (
    <div className="root"><style>{S}</style>
      <div className="fullscreen">
        <div className="lightning" /><div className="storm-bg" />
        <h1 className="title">항로 없는 밤</h1>
        <div className="briefing">
          1975년 부산항. 일본 시모노세키로 향하는 밤바다의 소형여객선 해연호.<br/><br/>
          출항 직후 거대한 태풍을 만나 항로를 이탈하고 무전마저 두절되어버렸다. 뱃멀미와 불안감에 휩싸인 승객들 사이에서, 1등 승객실 문이 안에서 굳게 잠긴 채 밀실 살인 사건이 발생했다.<br/><br/>
          당신은 형사 엘제이가 되어 이 고립된 배 안에서 진범을 찾아내야 한다.
        </div>
        <button className="btn-main" onClick={() => setPhase("suspects")}>사건 브리핑 보기</button>
      </div>
    </div>
  );

  if (phase === "suspects") return (
    <div className="root"><style>{S}</style>
      <div className="fullscreen">
        <div className="lightning" /><div className="storm-bg" />
        <h2 style={{color:'#5cb8ff', marginBottom:'30px', zIndex:2, position:'relative'}}>용의자 파일 및 현장 브리핑</h2>
        <div className="briefing" style={{marginBottom:'20px'}}>
          <strong>사망자: 김밀수 (오후 7시 사망 추정)</strong><br/>
          승객실 밖으로 피가 흘러나와 문을 부수고 진입. 머리 뒤쪽을 둔기에 맞아 출혈과다로 사망했다. 방 안은 완벽한 밀실이었다.
        </div>
        <div className="suspect-grid">
          {SUSPECTS.map(s => (
            <div key={s.id} className="suspect-card">
              <div style={{fontSize:'45px'}}>{s.avatar}</div>
              <div>
                <div style={{color:'#fff', fontWeight:'bold', fontSize:'18px'}}>{s.name} <span style={{fontSize:'12px', color:'#888'}}>{s.role}</span></div>
                <div style={{color:'#aaa', fontSize:'13px', marginTop:'8px', lineHeight:1.5}}>{s.profile}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-main" onClick={() => setPhase("game")}>살인 사건 현장으로 진입</button>
      </div>
    </div>
  );

  if (phase === "verdict") return (
    <div className="root"><style>{S}</style>
      <div className="fullscreen">
        <h1 className="title" style={{color: accuseTarget.isKiller ? '#5cb8ff' : '#ff4444'}}>
          {accuseTarget.isKiller ? "사건 해결 (TRICK SOLVED)" : "수사 실패 (COLD CASE)"}
        </h1>
        <div className="briefing" style={{borderColor: accuseTarget.isKiller ? '#5cb8ff' : '#ff4444'}}>
          {accuseTarget.isKiller ? 
            "정확합니다. 이무역이 바로 범인이었습니다. 그는 조종실에서 몰래 훔쳐낸 예비 열쇠를 밀랍으로 찍어 쇠줄로 복제했습니다. 7시, 두통으로 권부인이 바람을 쐬러 나간 사이 김밀수의 방에 들어가 재떨이로 살해한 뒤, 밖에서 복제 열쇠로 문을 잠갔습니다. 그리고 갑판으로 가 흉기와 복제 열쇠를 바다에 던져 완벽한 밀실을 완성했습니다." : 
            `${accuseTarget.name}은 진범이 아닙니다. 당신이 알리바이에 속아 헛짚는 사이, 배는 일본 항구에 도착했고 진짜 범인은 인파 속으로 유유히 사라졌습니다.`}
        </div>
        <button className="btn-main" onClick={() => { setPhase("intro"); setClues([]); setChatHistory({}); setAskedQ({}); }}>처음부터 다시 수사</button>
      </div>
    </div>
  );

  return (
    <div className="root"><style>{S}</style>
      <div className="game-layout">
        
        <div className="nav-panel">
          <div style={{padding:'20px', color:'#5cb8ff', fontWeight:'bold', borderBottom:'1px solid #2b5278', fontSize:'12px', letterSpacing:'2px'}}>탐색 구역 이동</div>
          <button className={`nav-btn ${curLocation === 'loc_victim' ? 'active' : ''}`} onClick={() => setCurLocation('loc_victim')}>1등 선실 (피해자)</button>
          <button className={`nav-btn ${curLocation === 'loc_suspect1' ? 'active' : ''}`} onClick={() => setCurLocation('loc_suspect1')}>3등 선실 (이무역)</button>
          <button className={`nav-btn ${curLocation === 'loc_control' ? 'active' : ''}`} onClick={() => setCurLocation('loc_control')}>조종실 (최항해)</button>
          <button className={`nav-btn ${curLocation === 'loc_wife' ? 'active' : ''}`} onClick={() => setCurLocation('loc_wife')}>권부인 객실</button>
          <button className={`nav-btn ${curLocation === 'loc_lobby' ? 'active' : ''}`} onClick={() => setCurLocation('loc_lobby')}>로비 및 공연장</button>
          <button className={`nav-btn ${curLocation === 'loc_deck' ? 'active' : ''}`} onClick={() => setCurLocation('loc_deck')}>바깥 갑판</button>
        </div>

        <div className="map-area">
          <div style={{position:'absolute', inset:'20px'}}>
            <ShipBlueprint currentLoc={curLocation} />
            {HOTSPOTS.filter(h => h.loc === curLocation).map(hs => (
              <div key={hs.id} className={`hotspot ${clues.includes(hs.id) ? 'found' : ''}`} 
                   style={{ left: `${hs.x}%`, top: `${hs.y}%` }} onClick={() => handleHotspotClick(hs)}>
                <div className="hs-icon">{hs.icon}</div>
                <div className="hs-label">{hs.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="side-panel">
          <div className="tab-header">
            <button className={`tab-btn ${activeTab === 'notebook' ? 'active' : ''}`} onClick={() => setActiveTab('notebook')}>탐정 수첩 ({clues.length}/12)</button>
            <button className={`tab-btn ${activeTab === 'interrogate' ? 'active' : ''}`} onClick={() => setActiveTab('interrogate')}>심문 및 고발</button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'notebook' && (
              <>
                {clues.length === 0 && <p style={{color:'#888', fontSize:'13px', textAlign:'center', marginTop:'20px'}}>좌측 도면의 아이콘을 클릭하여 단서를 찾으십시오.</p>}
                {clues.map(id => (
                  <div key={id} className="clue-card">
                    <div className="clue-title">✓ {CLUES_DATA[id].title}</div>
                    <div style={{fontSize:'12px', color:'#a0b4c8'}}>{CLUES_DATA[id].short}</div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'interrogate' && (
              <>
                {SUSPECTS.map(s => (
                  <div key={s.id} style={{background:'rgba(0,0,0,0.5)', padding:'15px', marginBottom:'15px', border:'1px solid #1a2a3a'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <span style={{fontSize:'32px'}}>{s.avatar}</span>
                      <div>
                        <div style={{color:'#fff', fontWeight:'bold', fontSize:'16px'}}>{s.name}</div>
                        <div style={{color:'#888', fontSize:'11px'}}>{s.role}</div>
                      </div>
                    </div>
                    <button className="btn-interrogate" onClick={() => setInterrogating(s)}>심문 시작</button>
                    {/* 💡 [버그 수정 완료]: 클릭 시 handleAccuse 함수를 호출하여 화면 전환! */}
                    {clues.length >= 8 && <button className="btn-accuse" onClick={() => handleAccuse(s)}>이 자를 진범으로 고발</button>}
                  </div>
                ))}
                {clues.length < 8 && <p style={{color:'#ff4444', fontSize:'12px', textAlign:'center', marginTop:'10px'}}>단서를 8개 이상 모아야 범인 고발이 가능합니다.</p>}
              </>
            )}
          </div>
        </div>
      </div>

      {alertMsg && (
        <div className="modal-overlay">
          <div className="modal-box" style={{width:'400px', textAlign:'center'}}>
            <h2 style={{color:'#5cb8ff', marginBottom:'15px'}}>{alertMsg.title}</h2>
            <p style={{color:'#fff', lineHeight:1.6}}>{alertMsg.text}</p>
            <button className="btn-main" style={{marginTop:'20px', padding:'10px 30px', fontSize:'14px'}} onClick={() => setAlertMsg(null)}>확인</button>
          </div>
        </div>
      )}

      {interrogating && (
        <div className="modal-overlay" onClick={() => setInterrogating(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#5cb8ff', borderBottom:'1px solid #2b5278', paddingBottom:'15px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'15px'}}>
              <span style={{fontSize:'36px'}}>{interrogating.avatar}</span> {interrogating.name} 심문
            </h2>
            
            <div className="chat-log">
              <div style={{color:'#aaa', marginBottom:'8px'}}><strong>Q공1) 사망 예상시간 오후 7시에 무엇을 하고 있었습니까?</strong><br/>"{interrogating.greet}"</div>
              <div style={{color:'#aaa', marginBottom:'15px'}}><strong>Q공2) 피해자와의 관계는 어떻습니까?</strong><br/>"{interrogating.greet2}"</div>
              <div style={{borderBottom:'1px dashed #2b5278', margin:'10px 0'}}></div>

              {(chatHistory[interrogating.id]||[]).map((c, i) => (
                <div key={i} style={{marginBottom:'15px'}}>
                  <div style={{color:'#5cb8ff', fontWeight:'bold'}}>▶ {c.q}</div>
                  <div style={{color: c.isConfess ? '#ff4444' : '#fff', marginLeft:'15px', marginTop:'5px', fontStyle:'italic'}}>"{c.a}"</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{fontSize:'12px', color:'#ffaa00', marginBottom:'10px'}}>★ 표시는 범인 특정에 직결되는 핵심 질문입니다.</div>
              {interrogating.questions.map(q => {
                const asked = (askedQ[interrogating.id]||[]).includes(q.id);
                const canAsk = q.requires.every(r => clues.includes(r));
                return (
                  <button key={q.id} className={`q-btn ${asked ? "asked" : ""}`} disabled={asked || !canAsk} onClick={() => askQuestion(interrogating, q)}>
                    {q.isCore && <span className="core-mark">★</span>}
                    {asked ? "✓ " : canAsk ? "Q. " : "🔒 "}{q.text} 
                    {(!canAsk && !asked) && <span style={{fontSize:'11px', color:'#888', display:'block', marginTop:'4px'}}>(필요 단서: {q.requires.map(r => CLUES_DATA[r].title).join(', ')})</span>}
                  </button>
                );
              })}
            </div>
            <button className="btn-close" onClick={() => setInterrogating(null)}>닫기</button>
          </div>
        </div>
      )}

    </div>
  );
}
