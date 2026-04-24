import { useState } from "react";

// ═══════════════════════════════════════════════════════
// GAME DATA: [형사 엘제이 시리즈 - 항로 없는 밤 V6]
// ═══════════════════════════════════════════════════════

const CLUES_DATA = {
  c_key: { title: "원본 열쇠", short: "피해자 주머니에서 발견. 완벽한 밀실 증명." },
  c_threat: { title: "협박 편지", short: "이무역의 필체와 일치하는 구겨진 편지." },
  c_safe_key: { title: "금고 열쇠", short: "권부인의 객실 테이블에서 발견. 금고 해제 가능." },
  c_contract: { title: "이중계약 문서", short: "박동업을 배신하려 한 증거 문서." },
  c_file: { title: "쇠줄과 줄칼", short: "이무역의 매트리스 밑에서 발견된 공구." },
  c_wax_hand: { title: "손톱 밑 밀랍", short: "이무역의 외투에서 발견된 밀랍 가루." },
  c_log: { title: "항해일지", short: "오후 6시 50분 최항해의 서명 확인." },
  c_wax_box: { title: "조종실 밀랍", short: "예비 열쇠함에서 발견된 굳은 밀랍 조각." },
  c_foot: { title: "로비 발자국", short: "1등 선실 쪽으로 이어진 젖은 발자국." },
  c_list: { title: "공연장 명단", short: "이무역과 박동업의 이름이 없음." },
  c_memo: { title: "박동업 메모", short: "'이중계약 사실을 알았다. 용서 못 해'." },
  c_sound: { title: "권부인 증언", short: "갑판에서 '풍덩' 소리 두 번과 이무역을 목격." }
};

// 방 내부(우측 화면) 기준 상대 좌표(%)로 수정
const HOTSPOTS = [
  { id: "c_key", x: 50, y: 60, label: "피해자 시신", icon: "💀", loc: "loc_victim", type: "clue" },
  { id: "c_threat", x: 20, y: 80, label: "구겨진 종이", icon: "📄", loc: "loc_victim", type: "clue" },
  { id: "c_contract", x: 80, y: 30, label: "잠긴 금고", icon: "🔒", loc: "loc_victim", type: "locked", reqItem: "c_safe_key", lockMsg: "굳게 잠겨있다. 열쇠가 필요하다." },
  
  { id: "c_file", x: 70, y: 70, label: "매트리스 밑", icon: "🛏️", loc: "loc_suspect1", type: "clue" },
  { id: "c_wax_hand", x: 30, y: 40, label: "젖은 외투", icon: "🧥", loc: "loc_suspect1", type: "clue" },
  
  { id: "c_log", x: 40, y: 50, label: "조타수 책상", icon: "📔", loc: "loc_control", type: "clue" },
  { id: "c_wax_box", x: 70, y: 30, label: "예비 열쇠함", icon: "🔑", loc: "loc_control", type: "clue" },
  
  { id: "c_foot", x: 30, y: 80, label: "바닥 발자국", icon: "👣", loc: "loc_lobby", type: "clue" },
  { id: "c_list", x: 80, y: 20, label: "게시판 명단", icon: "📋", loc: "loc_lobby", type: "clue" },
  { id: "c_memo", x: 50, y: 50, label: "떨어진 수첩", icon: "📓", loc: "loc_lobby", type: "clue" },
  
  { id: "c_safe_key", x: 50, y: 50, label: "화장대", icon: "🗝️", loc: "loc_wife", type: "clue" },
  { id: "c_sound", x: 50, y: 60, label: "갑판 난간", icon: "🌊", loc: "loc_deck", type: "clue", isTestimony: true }
];

const LOCATIONS_INFO = {
  loc_victim: "1등 선실 (밀실) 내부",
  loc_suspect1: "3등 선실 (이무역) 내부",
  loc_control: "조종실 (선교) 내부",
  loc_wife: "1등실 (권부인) 내부",
  loc_lobby: "로비 및 공연장 내부",
  loc_deck: "바깥 갑판 (투척 지점)"
};

const SUSPECTS = [
  {
    id: "이무역", name: "이무역", role: "몰락한 무역상", avatar: "🧥", isKiller: true,
    profile: "김밀수에게 사기를 당해 모든 것을 잃고, 복수를 위해 3등실 티켓을 쥐고 탑승한 과거 동업자.",
    greet: "3등 선실에서 뱃멀미로 누워있었습니다. 아무도 못 봤어요.",
    greet2: "예전에 잠깐 같이 일한 사이입니다. 오래된 얘기예요.",
    questions: [
      { id: "q1", text: "공연장 관람 명단에 이름이 없더군요.", requires: ["c_list"], answer: "뱃멀미가 심해서 공연은 안 갔습니다.", isCore: false },
      { id: "q2", text: "로비 발자국이 1등 선실로 이어지던데요.", requires: ["c_foot", "c_list"], answer: "저 말고도 승객이 많습니다. 제 것이라는 증거 있습니까?", isCore: false },
      { id: "q3", text: "오른손 손톱 사이 밀랍이 묻어있군요.", requires: ["c_wax_hand"], answer: "배에서 양초를 만지다 보니... 별 게 다 의심스럽군요.", isCore: false },
      { id: "q4", text: "매트리스 밑에서 쇠줄과 줄칼이 나왔습니다.", requires: ["c_file", "c_wax_hand"], answer: "...그건 제 연장입니다. 무역상 출신이라 공구를 갖고 다니죠.", isCore: true },
      { id: "q5", text: "협박편지 필체가 당신 것과 일치합니다.", requires: ["c_threat"], answer: "(당황) 편지를 보낸 건 맞지만 그게 살인의 증거는 아니지 않습니까!", isCore: true },
      { id: "q6", text: "열쇠함 밀랍 흔적, 갑판 풍덩 소리... 복제 열쇠로 밀실을 만들었죠?", requires: ["c_wax_box", "c_sound", "c_key"], answer: "...그 사람이 먼저 제 인생을 바다에 던졌습니다. 돌려준 것뿐이에요.", isCore: true, isConfession: true }
    ]
  },
  {
    id: "최항해", name: "최항해", role: "2등 항해사", avatar: "⚓", isKiller: false,
    profile: "과거 김밀수를 도와 밀수사업을 진행하다가 배신당하여 감옥생활을 한 후 취업.",
    greet: "조종실에서 항해 중이었습니다. 태풍 때문에 자리를 비울 수 없었어요.",
    greet2: "다른 인생을 짓밟은 자의 업보입니다.",
    questions: [
      { id: "q1", text: "항해일지 서명 이후 7시에도 조종실에 계셨습니까?", requires: ["c_log"], answer: "네. 태풍 속에서 조종실을 비우는 건 있을 수 없는 일입니다.", isCore: false },
      { id: "q2", text: "김밀수에게 배신당해 감옥에 갔었죠?", requires: ["c_contract"], answer: "사실입니다. 하지만 저는 이미 죗값을 치렀어요.", isCore: false },
      { id: "q3", text: "예비 열쇠함에서 밀랍이 발견됐습니다. 이무역이 왔었나요?", requires: ["c_wax_box"], answer: "맞습니다, 이무역이 조종실에 왔었어요... 설마 그때...", isCore: true }
    ]
  },
  {
    id: "박동업", name: "박동업", role: "재일교포 2세", avatar: "💼", isKiller: false,
    profile: "김밀수가 이중계약을 맺었다는 사실을 알아채고 분노에 차 해연호에 탑승.",
    greet: "1등 선실에서 혼자 술을 마시고 있었소. 뱃멀미가 심해 저녁도 못 먹었소.",
    greet2: "사업 파트너였소. 배신자가 스스로 벌을 받은 것이오.",
    questions: [
      { id: "q1", text: "이중계약을 맺었다는 걸 어떻게 알았습니까?", requires: ["c_memo"], answer: "다른 조직에서 먼저 연락이 왔소. 양쪽에 팔아먹으려 한 거요.", isCore: false },
      { id: "q2", text: "당신도 죽일 동기가 충분한데요?", requires: ["c_contract", "c_memo"], answer: "나도 피해자요. 하지만 법대로 받아내려 했을 뿐이오.", isCore: true },
      { id: "q3", text: "명단에 없어 증인이 없군요.", requires: ["c_list"], answer: "나도 공연장에 갔어야 했나. 뱃멀미로 죽을 것 같았는데.", isCore: false }
    ]
  },
  {
    id: "권부인", name: "권부인", role: "김밀수의 부인", avatar: "💃", isKiller: false,
    profile: "사이가 좋아 보이지만 남편의 죽음보다 금고 속에 숨겨둔 재산에 더 관심을 가짐.",
    greet: "두통이 심해서 갑판에서 바람을 쐬고 있었어요.",
    greet2: "남편이잖아요. (냉담하게) 상속은 어떻게 되는 거죠?",
    questions: [
      { id: "q1", text: "갑판에서 무언가 목격한 게 있습니까?", requires: ["c_sound"], answer: "풍덩 소리가 두 번. 누군가 바다에 무언가를 던진 것 같았어요.", isCore: false },
      { id: "q2", text: "그때 주변에 사람이 있었습니까?", requires: ["c_sound"], answer: "갑판 어귀 쪽에 등을 보인 남자가 있었어요. 이무역 씨 같았는데...", isCore: true },
      { id: "q3", text: "남편 방 금고 열쇠를 갖고 계시더군요.", requires: ["c_safe_key"], answer: "남편이 만약을 위해 맡겨둔 거예요. 그게 문제입니까?", isCore: true }
    ]
  }
];

// 스타일 (와이어프레임 기반)
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Courier+Prime&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#03080f; color:#e6edf2; font-family:'Courier Prime', 'Noto Serif KR', serif; overflow-x:hidden;}
  
  .app-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
  
  /* Top Section: Split Blueprint and Room Detail */
  .top-section { display: flex; gap: 20px; height: 400px; margin-bottom: 20px; }
  .panel { flex: 1; border: 2px solid #2b5278; background: #050a10; position: relative; display: flex; flex-direction: column; }
  .panel-title { padding: 10px; text-align: center; font-weight: bold; color: #5cb8ff; border-bottom: 1px solid #2b5278; background: rgba(92,184,255,0.1); letter-spacing: 2px; }
  
  /* Blueprint SVG Area */
  .blueprint-area { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; }
  .bp-room { cursor: pointer; transition: 0.2s; }
  .bp-room:hover { fill: rgba(92,184,255,0.3) !important; }
  .bp-room.active { fill: rgba(92,184,255,0.4) !important; stroke: #fff !important; }
  
  /* Room Detail Area */
  .room-area { flex: 1; position: relative; background-image: radial-gradient(circle at center, #101a2a, #050a10); overflow: hidden; }
  
  .hotspot { position:absolute; transform:translate(-50%,-50%); cursor:pointer; z-index:10; text-align:center; }
  .hs-icon { width:50px; height:50px; border:2px solid #2b5278; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; background:rgba(0,0,0,0.8); transition:0.2s; margin:0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.5);}
  .hotspot:hover .hs-icon { border-color:#5cb8ff; background:rgba(92,184,255,0.3); transform:scale(1.1); box-shadow: 0 0 20px rgba(92,184,255,0.5);}
  .hotspot.found .hs-icon { border-color:#444; opacity:0.4; }
  .hs-label { font-size:12px; color:#5cb8ff; margin-top:6px; background:rgba(0,0,0,0.9); padding:4px 8px; border:1px solid #2b5278; white-space:nowrap; }

  /* Middle Briefing */
  .briefing-bar { border: 1px solid #2b5278; padding: 15px 20px; background: rgba(92,184,255,0.05); margin-bottom: 20px; text-align: center; }
  
  /* Suspect Table */
  .suspect-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .suspect-table th, .suspect-table td { border: 1px solid #2b5278; padding: 15px; text-align: left; vertical-align: top; }
  .suspect-table th { background: rgba(92,184,255,0.1); color: #5cb8ff; text-align: center; }
  
  .btn-interrogate { background: transparent; border: 1px solid #5cb8ff; color: #5cb8ff; padding: 8px 15px; cursor: pointer; transition: 0.2s; width: 100%; margin-bottom: 5px; }
  .btn-interrogate:hover { background: rgba(92,184,255,0.2); }
  .btn-accuse { background: rgba(255,68,68,0.1); border: 1px solid #ff4444; color: #ff4444; padding: 8px 15px; cursor: pointer; transition: 0.2s; width: 100%; }
  .btn-accuse:hover { background: #ff4444; color: #fff; }

  /* Notebook */
  .notebook-section { border: 2px solid #2b5278; background: #050a10; display: flex; flex-direction: column; }
  .clue-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; padding: 15px; }
  .clue-card { border-left: 3px solid #5cb8ff; background: rgba(255,255,255,0.05); padding: 10px; }

  /* Modals (Alert, Interrogation, Verdict) */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:100; display:flex; align-items:center; justify-content:center;}
  .modal-box { background:#0a1520; border:2px solid #5cb8ff; padding:30px; width:650px; max-height:85vh; overflow-y:auto; text-align:left;}
  .btn-close { background:transparent; color:#888; border:1px solid #888; padding:8px 20px; margin-top:15px; cursor:pointer; float:right;}
  .btn-close:hover { color:#fff; border-color:#fff;}
  .chat-log { background:#000; padding:15px; border:1px solid #2b5278; max-height:250px; overflow-y:auto; margin-bottom:15px; font-size:14px; line-height:1.7;}
  .q-btn { display:block; width:100%; text-align:left; padding:12px; background:rgba(92,184,255,0.05); border:1px solid #2b5278; color:#e6edf2; margin-bottom:8px; cursor:pointer; font-family:inherit;}
  .q-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .q-btn.asked { opacity:0.5; text-decoration:line-through; }
  
  .fullscreen { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; text-align:center; padding:20px; }
  .btn-main { background:transparent; border:2px solid #5cb8ff; color:#5cb8ff; padding:15px 40px; font-size:20px; cursor:pointer; transition:0.3s;}
  .btn-main:hover { background:#5cb8ff; color:#000; box-shadow: 0 0 20px rgba(92,184,255,0.5); }
`;

export default function SeaNoirGameV6() {
  const [phase, setPhase] = useState("intro");
  const [curLocation, setCurLocation] = useState("loc_victim");
  const [clues, setClues] = useState([]);
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

  const handleAccuse = (suspect) => {
    setAccuseTarget(suspect);
    setPhase("verdict");
  };

  // ── INTRO ──
  if (phase === "intro") return (
    <div className="root"><style>{S}</style>
      <div className="fullscreen">
        <h1 style={{fontSize:'48px', color:'#5cb8ff', marginBottom:'20px'}}>항로 없는 밤</h1>
        <p style={{maxWidth:'600px', lineHeight:1.8, marginBottom:'30px'}}>
          1975년 부산항. 일본 시모노세키로 향하는 소형여객선 해연호.<br/>
          태풍을 만나 무전마저 두절된 가운데, 1등 승객실에서 밀실 살인 사건이 발생했다.<br/>
          형사 엘제이가 되어 진범을 찾아라.
        </p>
        <button className="btn-main" onClick={() => setPhase("game")}>수사 개시</button>
      </div>
    </div>
  );

  // ── VERDICT ──
  if (phase === "verdict") return (
    <div className="root"><style>{S}</style>
      <div className="fullscreen">
        <h1 style={{fontSize:'48px', color: accuseTarget.isKiller ? '#5cb8ff' : '#ff4444', marginBottom:'20px'}}>
          {accuseTarget.isKiller ? "사건 해결 (TRICK SOLVED)" : "수사 실패 (COLD CASE)"}
        </h1>
        <p style={{maxWidth:'600px', lineHeight:1.8, marginBottom:'30px'}}>
          {accuseTarget.isKiller ? 
            "정확합니다. 이무역이 바로 범인이었습니다. 그는 조종실에서 몰래 훔쳐낸 예비 열쇠를 밀랍으로 찍어 쇠줄로 복제했습니다. 밖에서 복제 열쇠로 문을 잠그고, 갑판에서 흉기와 복제 열쇠를 바다에 던져 완벽한 밀실을 완성했습니다." : 
            `${accuseTarget.name}은 진범이 아닙니다. 당신이 알리바이에 속아 헛짚는 사이, 진짜 범인은 유유히 사라졌습니다.`}
        </p>
        <button className="btn-main" onClick={() => { setPhase("intro"); setClues([]); setChatHistory({}); setAskedQ({}); }}>처음부터 다시 수사</button>
      </div>
    </div>
  );

  // ── GAME UI (와이어프레임 완벽 반영) ──
  return (
    <div className="root"><style>{S}</style>
      <div className="app-container">
        
        {/* 상단 2분할 (도면 / 실 내부) */}
        <div className="top-section">
          {/* 좌측: 전체 평면도 */}
          <div className="panel">
            <div className="panel-title">여객선 평면도</div>
            <div className="blueprint-area">
              <svg width="100%" height="100%" viewBox="0 0 1000 600">
                <path d="M 100 300 Q 150 100 500 100 Q 850 100 900 300 Q 850 500 500 500 Q 150 500 100 300 Z" fill="none" stroke="#2b5278" strokeWidth="4" />
                {/* 각 실 클릭 영역 */}
                <rect x="300" y="150" width="150" height="120" className={`bp-room ${curLocation === 'loc_victim' ? 'active' : ''}`} fill="rgba(43,82,120,0.2)" stroke="#5cb8ff" strokeWidth="2" onClick={() => setCurLocation('loc_victim')} />
                <text x="310" y="180" fill="#5cb8ff" fontSize="16" pointerEvents="none">1등 선실(피해자)</text>
                
                <rect x="470" y="150" width="120" height="120" className={`bp-room ${curLocation === 'loc_wife' ? 'active' : ''}`} fill="rgba(43,82,120,0.2)" stroke="#5cb8ff" strokeWidth="2" onClick={() => setCurLocation('loc_wife')} />
                <text x="480" y="180" fill="#5cb8ff" fontSize="16" pointerEvents="none">1등실(부인)</text>

                <rect x="250" y="350" width="180" height="100" className={`bp-room ${curLocation === 'loc_suspect1' ? 'active' : ''}`} fill="rgba(43,82,120,0.2)" stroke="#5cb8ff" strokeWidth="2" onClick={() => setCurLocation('loc_suspect1')} />
                <text x="260" y="380" fill="#5cb8ff" fontSize="16" pointerEvents="none">3등 선실(이무역)</text>

                <rect x="450" y="350" width="200" height="100" className={`bp-room ${curLocation === 'loc_lobby' ? 'active' : ''}`} fill="rgba(43,82,120,0.2)" stroke="#5cb8ff" strokeWidth="2" onClick={() => setCurLocation('loc_lobby')} />
                <text x="460" y="380" fill="#5cb8ff" fontSize="16" pointerEvents="none">로비/공연장</text>

                <rect x="700" y="250" width="120" height="100" className={`bp-room ${curLocation === 'loc_control' ? 'active' : ''}`} fill="rgba(43,82,120,0.2)" stroke="#5cb8ff" strokeWidth="2" onClick={() => setCurLocation('loc_control')} />
                <text x="710" y="280" fill="#5cb8ff" fontSize="16" pointerEvents="none">조종실(선교)</text>

                <path d="M 150 280 L 280 280 M 150 320 L 280 320" stroke="transparent" strokeWidth="40" className={`bp-room ${curLocation === 'loc_deck' ? 'active' : ''}`} onClick={() => setCurLocation('loc_deck')} />
                <path d="M 150 280 L 280 280 M 150 320 L 280 320" stroke="#ff4444" strokeWidth="3" strokeDasharray="5,5" pointerEvents="none" />
                <text x="160" y="270" fill="#ff4444" fontSize="14" pointerEvents="none">갑판 (투척 지점)</text>
              </svg>
            </div>
          </div>

          {/* 우측: 선택된 실 상세 (단서 찾기) */}
          <div className="panel">
            <div className="panel-title">{LOCATIONS_INFO[curLocation]}</div>
            <div className="room-area">
              <div style={{position:'absolute', top:'10px', left:'10px', fontSize:'12px', color:'#888'}}>
                이 공간의 이미지를 추후 배경으로 삽입 예정.<br/>단서를 클릭하여 수첩에 저장하십시오.
              </div>
              {/* 해당 방의 단서만 렌더링 */}
              {HOTSPOTS.filter(h => h.loc === curLocation).map(hs => (
                <div key={hs.id} className={`hotspot ${clues.includes(hs.id) ? 'found' : ''}`} 
                     style={{ left: `${hs.x}%`, top: `${hs.y}%` }} onClick={() => handleHotspotClick(hs)}>
                  <div className="hs-icon">{hs.icon}</div>
                  <div className="hs-label">{hs.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 중단: 현장 설명 */}
        <div className="briefing-bar">
          <strong style={{color:'#5cb8ff', fontSize:'18px'}}>살인현장 설명 (사망자: 김밀수)</strong><br/>
          사망 예정 시간: 오후 7시. 승객실 밖으로 피가 흘러나와 문을 부수고 진입했다. 뒷통수를 둔기에 맞아 출혈과다로 사망. 방 안은 안에서 잠긴 밀실이었다.
        </div>

        {/* 하단: 등장인물 및 심문 테이블 */}
        <table className="suspect-table">
          <thead>
            <tr>
              <th style={{width:'20%'}}>등장인물</th>
              <th style={{width:'55%'}}>인물설명</th>
              <th style={{width:'25%'}}>심문 및 고발</th>
            </tr>
          </thead>
          <tbody>
            {SUSPECTS.map(s => (
              <tr key={s.id}>
                <td style={{textAlign:'center'}}>
                  <div style={{fontSize:'40px', marginBottom:'5px'}}>{s.avatar}</div>
                  <div style={{fontWeight:'bold', color:'#fff'}}>{s.name}</div>
                  <div style={{fontSize:'11px', color:'#888'}}>{s.role}</div>
                </td>
                <td>
                  <div style={{color:'#aaa', lineHeight:1.6}}>{s.profile}</div>
                </td>
                <td>
                  <button className="btn-interrogate" onClick={() => setInterrogating(s)}>심문 시작</button>
                  {clues.length >= 8 ? (
                    <button className="btn-accuse" onClick={() => handleAccuse(s)}>진범 지목</button>
                  ) : (
                    <div style={{fontSize:'10px', color:'#ff4444', textAlign:'center'}}>단서 8개 필요</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 최하단: 탐정 수첩 */}
        <div className="notebook-section">
          <div className="panel-title" style={{borderTop:'none', borderLeft:'none', borderRight:'none'}}>탐정 수첩 (획득 단서: {clues.length} / 12)</div>
          <div className="clue-grid">
            {clues.length === 0 ? <div style={{gridColumn:'1 / -1', textAlign:'center', color:'#888', padding:'20px'}}>단서를 찾아보세요.</div> : null}
            {clues.map(id => (
              <div key={id} className="clue-card">
                <div style={{fontWeight:'bold', color:'#5cb8ff', fontSize:'13px', marginBottom:'5px'}}>✓ {CLUES_DATA[id].title}</div>
                <div style={{fontSize:'11px', color:'#a0b4c8'}}>{CLUES_DATA[id].short}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 모달: 시스템 알림 */}
      {alertMsg && (
        <div className="modal-overlay">
          <div className="modal-box" style={{width:'400px', textAlign:'center'}}>
            <h2 style={{color:'#5cb8ff', marginBottom:'15px'}}>{alertMsg.title}</h2>
            <p style={{color:'#fff', lineHeight:1.6}}>{alertMsg.text}</p>
            <button className="btn-main" style={{marginTop:'20px', padding:'10px 30px', fontSize:'14px'}} onClick={() => setAlertMsg(null)}>확인</button>
          </div>
        </div>
      )}

      {/* 모달: 심문 창 */}
      {interrogating && (
        <div className="modal-overlay" onClick={() => setInterrogating(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#5cb8ff', borderBottom:'1px solid #2b5278', paddingBottom:'15px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'15px'}}>
              <span style={{fontSize:'36px'}}>{interrogating.avatar}</span> {interrogating.name} 심문
            </h2>
            <div className="chat-log">
              <div style={{color:'#aaa', marginBottom:'8px'}}><strong>Q공1) 사망 예상시간 7시에 무엇을 했습니까?</strong><br/>"{interrogating.greet}"</div>
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
              <div style={{fontSize:'12px', color:'#ffaa00', marginBottom:'10px'}}>★ 표시는 핵심 질문입니다.</div>
              {interrogating.questions.map(q => {
                const asked = (askedQ[interrogating.id]||[]).includes(q.id);
                const canAsk = q.requires.every(r => clues.includes(r));
                return (
                  <button key={q.id} className={`q-btn ${asked ? "asked" : ""}`} disabled={asked || !canAsk} onClick={() => askQuestion(interrogating, q)}>
                    {q.isCore && <span style={{color:'#ffaa00', marginRight:'5px', fontWeight:'bold'}}>★</span>}
                    {asked ? "✓ " : canAsk ? "Q. " : "🔒 "}{q.text} 
                    {(!canAsk && !asked) && <span style={{fontSize:'11px', color:'#888', display:'block', marginTop:'4px'}}>(단서 필요: {q.requires.map(r => CLUES_DATA[r].title).join(', ')})</span>}
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
