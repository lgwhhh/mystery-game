import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════
// GAME DATA: 백색의 밀실 (설화장)
// ═══════════════════════════════════════════════════════

const LOCATIONS = {
  study: {
    id: "study", name: "산장 주인의 서재", icon: "📖",
    desc: "안에서 굳게 잠겨 있던 밀실. 펄펄 끓는 온풍기 열기와 피비린내가 섞여 있다.",
    bg: "#0d131c",
    hotspots: [
      { id: "body", x: 45, y: 55, label: "주인의 시신", icon: "💀" },
      { id: "heater", x: 20, y: 40, label: "온풍기", icon: "♨️" },
      { id: "window", x: 80, y: 35, label: "깨진 창문", icon: "🪟" },
      { id: "desk", x: 60, y: 65, label: "서재 책상", icon: "📜" },
    ],
  },
  living_room: {
    id: "living_room", name: "산장 거실", icon: "🛋️",
    desc: "용의자들이 모여 있는 1층 거실. 벽난로가 켜져 있지만 냉기가 감돈다.",
    bg: "#121824",
    hotspots: [
      { id: "fireplace", x: 50, y: 25, label: "벽난로", icon: "🔥" },
      { id: "coat_rack", x: 25, y: 50, label: "외투 걸이", icon: "🧥" },
      { id: "table", x: 70, y: 65, label: "응접 테이블", icon: "☕" },
    ],
  },
  outside: {
    id: "outside", name: "서재 밖 눈밭", icon: "❄️",
    desc: "폭설이 내린 산장 외부. 서재 창문 바로 아래쪽 눈밭이다.",
    bg: "#0a0f17",
    hotspots: [
      { id: "snow", x: 50, y: 75, label: "새하얀 눈밭", icon: "⛄" },
      { id: "glass_shards", x: 40, y: 45, label: "유리 파편", icon: "💎" },
      { id: "rope_scrap", x: 65, y: 50, label: "나뭇가지", icon: "🌿" },
    ],
  },
};

const CLUES = {
  // 서재
  body: {
    id: "body", location: "study", title: "열쇠와 시신", icon: "💀",
    short: "방문 열쇠는 주머니에. 전형적인 밀실.",
    detail: "방은 안에서 잠겨 있었고 열쇠는 피해자 주머니에 있다. 외상은 없고 독살 혹은 질식으로 추정된다.",
    weight: { 박관리인: 0, 최동업: 0 },
  },
  heater: {
    id: "heater", location: "study", title: "최대치로 켜진 온풍기", icon: "♨️",
    short: "실내 온도가 비정상적으로 높다.",
    detail: "겨울 산장임을 감안해도 숨이 막힐 정도다. 무언가를 빨리 '녹이거나' 증발시키려 했던 흔적일까?",
    weight: { 박관리인: 2, 최동업: 0 },
  },
  window: {
    id: "window", location: "study", title: "깨진 창문", icon: "🪟",
    short: "창문이 깨져 찬바람이 들어온다.",
    detail: "유일하게 외부와 통하는 창문. 외부 침입의 흔적처럼 보이지만 어색한 점이 있다.",
    weight: { 박관리인: 1, 최동업: 0 },
  },
  desk: {
    id: "desk", location: "study", title: "찢어진 매각 계약서", icon: "📜",
    short: "산장 매각 계약서가 찢겨 있다.",
    detail: "피해자가 최근 이 산장을 처분하려 했다는 서류. 누군가는 이 산장이 넘어가는 것을 극도로 꺼렸다.",
    weight: { 박관리인: 3, 최동업: 2 },
  },
  // 외부
  snow: {
    id: "snow", location: "outside", title: "발자국 없는 눈밭", icon: "⛄",
    short: "서재 창문 밖 눈밭에는 발자국이 전혀 없다.",
    detail: "어젯밤 10시 이후로 눈이 그쳤다. 범인이 창문으로 탈출했다면 반드시 눈밭에 발자국이 남아야만 한다.",
    weight: { 박관리인: 0, 최동업: 0 },
  },
  glass_shards: {
    id: "glass_shards", location: "outside", title: "외부로 흩어진 파편", icon: "💎",
    short: "유리 파편이 방 안이 아닌 바깥에 떨어져 있다.",
    detail: "결정적 모순이다. 외부 침입자가 유리를 깨고 들어왔다면 파편은 방 안에 있어야 한다. 창문은 '안에서 밖으로' 깨졌다.",
    weight: { 박관리인: 2, 최동업: 0 },
  },
  rope_scrap: {
    id: "rope_scrap", location: "outside", title: "젖은 밧줄 조각", icon: "🌿",
    short: "창틀 밖 나뭇가지에 걸린 젖은 나일론 밧줄.",
    detail: "날카로운 유리에 쓸려 끊어진 듯한 고강도 산악용 로프. 이상하게도 얼음물이 흠뻑 배어 있다.",
    weight: { 박관리인: 4, 최동업: 0 },
  },
  // 거실 (누락되었던 버그 수정 부분)
  coat_rack: {
    id: "coat_rack", location: "living_room", title: "젖은 등산화", icon: "🧥",
    short: "박 관리인의 등산화가 젖어 있다.",
    detail: "눈이 그친 뒤 누군가 밖을 돌아다녔다는 증거. 박 관리인은 실내에만 있었다고 증언했다.",
    weight: { 박관리인: 3, 최동업: 0 },
  },
  fireplace: {
    id: "fireplace", location: "living_room", title: "타다 남은 종이", icon: "🔥",
    short: "벽난로에서 발견된 횡령 관련 장부 조각.",
    detail: "누군가 증거를 급하게 태우려 했다. 피해자와 다투던 동업자 최 대표의 서명란이 살짝 보인다.",
    weight: { 박관리인: 0, 최동업: 4 },
  },
  table: {
    id: "table", location: "living_room", title: "빈 찻잔 두 개", icon: "☕",
    short: "간밤에 두 사람이 마주 앉아 차를 마신 흔적.",
    detail: "관리인 박씨와 피해자가 늦은 밤까지 대화를 나눴다는 증거. 관리인은 밤새 혼자 있었다고 했다.",
    weight: { 박관리인: 2, 최동업: 0 },
  }
};

const SUSPECTS = [
  {
    id: "박관리인", name: "박 씨", role: "산장 관리인, 60대", avatar: "🧔",
    bg: "rgba(40,60,80,0.15)", border: "rgba(100,150,200,0.4)",
    isKiller: true,
    profile: "30년 전 산장 공사 때 아들을 잃고 이 산장을 관리해왔다. 로프를 다루는 산악 구조대 출신.",
  },
  {
    id: "최동업", name: "최 대표", role: "동업자, 40대", avatar: "🕴",
    bg: "rgba(80,40,40,0.15)", border: "rgba(200,100,100,0.4)",
    isKiller: false,
    profile: "피해자의 사업 파트너. 최근 거액의 공금 횡령 문제로 피해자와 격렬하게 다투었다.",
  }
];

// 평면도(Blueprint)를 그려주는 컴포넌트
const FloorPlan = ({ locationId }) => {
  if (locationId === "study") {
    return (
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
        {/* 방 테두리 */}
        <rect x="15%" y="15%" width="70%" height="70%" fill="none" stroke="#8bb3d4" strokeWidth="2" strokeDasharray="5,5" />
        {/* 책상 */}
        <rect x="55%" y="55%" width="15%" height="20%" fill="none" stroke="#8bb3d4" strokeWidth="1" />
        {/* 온풍기 */}
        <rect x="15%" y="35%" width="10%" height="10%" fill="none" stroke="#8bb3d4" strokeWidth="1" />
        {/* 창문 */}
        <line x1="85%" y1="25%" x2="85%" y2="45%" stroke="#8bb3d4" strokeWidth="4" />
        {/* 문 */}
        <line x1="15%" y1="80%" x2="25%" y2="85%" stroke="#992222" strokeWidth="2" />
        <text x="18%" y="22%" fill="#8bb3d4" fontSize="12" fontFamily="monospace">STUDY ROOM</text>
      </svg>
    );
  }
  if (locationId === "living_room") {
    return (
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
        <rect x="10%" y="10%" width="80%" height="80%" fill="none" stroke="#8bb3d4" strokeWidth="2" />
        {/* 벽난로 */}
        <rect x="40%" y="10%" width="20%" height="10%" fill="none" stroke="#ffaa00" strokeWidth="2" />
        {/* 테이블 */}
        <circle cx="70%" cy="65%" r="8%" fill="none" stroke="#8bb3d4" strokeWidth="1" />
        {/* 외투 걸이 구역 */}
        <rect x="10%" y="40%" width="10%" height="20%" fill="none" stroke="#8bb3d4" strokeWidth="1" />
        <text x="15%" y="18%" fill="#8bb3d4" fontSize="12" fontFamily="monospace">LIVING ROOM / LOBBY</text>
      </svg>
    );
  }
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
      {/* 산장 외벽 */}
      <line x1="20%" y1="0%" x2="20%" y2="100%" stroke="#8bb3d4" strokeWidth="3" />
      {/* 나무들 */}
      <circle cx="65%" cy="50%" r="5%" fill="none" stroke="#8bb3d4" strokeWidth="1" strokeDasharray="3,3" />
      <circle cx="50%" cy="75%" r="4%" fill="none" stroke="#8bb3d4" strokeWidth="1" strokeDasharray="3,3" />
      <text x="25%" y="10%" fill="#8bb3d4" fontSize="12" fontFamily="monospace">OUTSIDE (BLIZZARD)</text>
    </svg>
  );
};

// CSS 스타일링
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Courier+Prime&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#070b12; --paper:#e6edf2; --ice:#8bb3d4; --ice-dark:#4a6b8c;
    --blood:#b22222; --dim:#6b7b8c; --panel:#0d141e;
    --border:rgba(139,179,212,0.2); --text:rgba(230,237,242,0.85);
  }
  html,body{background:var(--bg);height:100%; font-family:'Courier Prime', 'Noto Serif KR', serif; color:var(--paper);}
  
  /* 눈 내리는 배경 */
  .snow-bg{position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image: radial-gradient(3px 3px at 20px 30px, #fff, transparent), radial-gradient(4px 4px at 80px 70px, #fff, transparent);
    background-size: 150px 150px; animation: snowfall 5s linear infinite; opacity: 0.15;}
  @keyframes snowfall{from{background-position:0 0;}to{background-position: 20px 150px;}}

  /* 인트로 & 엔딩 화면 */
  .fullscreen-panel { position:relative; z-index:10; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; }
  .title { font-size:42px; color:var(--ice); margin-bottom:20px; text-shadow: 0 0 20px rgba(139,179,212,0.3); letter-spacing: 2px;}
  .briefing { max-width:600px; font-size:15px; line-height:1.8; color:var(--text); background:rgba(0,0,0,0.5); padding:30px; border:1px solid var(--border); border-left:3px solid var(--ice); margin-bottom:30px; text-align:left;}
  .btn-main { padding:15px 40px; font-size:16px; background:transparent; border:1px solid var(--ice); color:var(--ice); cursor:pointer; transition:0.3s; font-family:inherit;}
  .btn-main:hover { background:var(--ice); color:#000; box-shadow:0 0 15px rgba(139,179,212,0.4);}
  .btn-accuse { padding:8px 20px; font-size:12px; background:rgba(178,34,34,0.2); border:1px solid var(--blood); color:#ff6666; cursor:pointer; transition:0.3s; width:100%; margin-top:10px;}
  .btn-accuse:hover { background:var(--blood); color:#fff; }

  /* 게임 화면 레이아웃 */
  .game-container { display:grid; grid-template-columns:220px 1fr 280px; min-height:100vh; position:relative; z-index:1; }
  .side-panel { background:rgba(10,15,25,0.9); border-right:1px solid var(--border); padding:20px; overflow-y:auto;}
  .right-panel { background:rgba(10,15,25,0.9); border-left:1px solid var(--border); padding:20px; overflow-y:auto;}
  
  .panel-title { font-size:12px; color:var(--ice); border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:15px; font-weight:bold; letter-spacing:1px;}
  .loc-btn { display:block; width:100%; text-align:left; padding:12px; margin-bottom:5px; background:none; border:1px solid transparent; color:var(--dim); cursor:pointer; font-family:inherit;}
  .loc-btn:hover { color:var(--paper); background:rgba(255,255,255,0.03);}
  .loc-btn.active { border-color:var(--ice); color:var(--ice); background:rgba(139,179,212,0.1);}

  /* 중앙 씬(도면) */
  .center-view { display:flex; flex-direction:column; background:#000;}
  .scene-canvas { position:relative; flex:1; min-height:450px; background-color:#0b111a; 
    background-image: linear-gradient(rgba(139,179,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,179,212,0.05) 1px, transparent 1px);
    background-size: 20px 20px; overflow:hidden;}
  
  .hotspot { position:absolute; transform:translate(-50%,-50%); cursor:pointer; z-index:10; text-align:center;}
  .hotspot-inner { width:44px; height:44px; border:1px solid var(--ice-dark); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; background:rgba(0,0,0,0.7); transition:0.2s; margin:0 auto;}
  .hotspot:hover .hotspot-inner { border-color:var(--ice); background:rgba(139,179,212,0.3); transform:scale(1.15);}
  .hotspot.found .hotspot-inner { opacity:0.3; border-color:var(--dim);}
  .hotspot-label { font-size:10px; color:var(--ice); margin-top:5px; opacity:0; transition:0.2s; background:rgba(0,0,0,0.8); padding:2px 5px;}
  .hotspot:hover .hotspot-label { opacity:1; }

  /* 수첩 및 용의자 카드 */
  .susp-card { border:1px solid rgba(255,255,255,0.1); padding:15px; margin-bottom:15px;}
  .note-entry { border-bottom:1px dashed var(--border); padding-bottom:12px; margin-bottom:12px;}
  .note-head { color:var(--ice); font-weight:bold; font-size:13px; margin-bottom:5px;}
  .note-body { font-size:11px; color:var(--text); line-height:1.6;}

  /* 모달 */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px;}
  .modal-content { background:var(--panel); border:1px solid var(--ice); padding:30px; width:100%; max-width:400px; position:relative;}
  .close-btn { position:absolute; top:10px; right:15px; background:none; border:none; color:var(--dim); font-size:20px; cursor:pointer;}
  .close-btn:hover { color:var(--paper);}
`;

export default function SnowCabinGameV2() {
  const [phase, setPhase] = useState("intro"); // intro, game, verdict
  const [curLocation, setCurLocation] = useState("study");
  const [foundClues, setFoundClues] = useState([]);
  const [selectedClue, setSelectedClue] = useState(null);
  const [accuseTarget, setAccuseTarget] = useState(null);
  const [isWin, setIsWin] = useState(false);

  const totalClues = Object.keys(CLUES).length;
  const loc = LOCATIONS[curLocation];

  const handleHotspot = (id) => {
    const clueData = CLUES[id];
    if (clueData) {
      setSelectedClue(clueData);
      if (!foundClues.includes(id)) setFoundClues(p => [...p, id]);
    }
  };

  const handleAccuse = (suspect) => {
    if (suspect.isKiller) {
      setIsWin(true);
    } else {
      setIsWin(false);
    }
    setPhase("verdict");
    setAccuseTarget(suspect);
    setSelectedClue(null);
  };

  // ── 1. 인트로 화면 ──
  if (phase === "intro") {
    return (
      <div className="root"><style>{S}</style>
        <div className="snow-bg" />
        <div className="fullscreen-panel">
          <p style={{color:'var(--dim)', letterSpacing:'3px', fontSize:'12px', marginBottom:'10px'}}>INTERACTIVE MYSTERY GAME</p>
          <h1 className="title">설화장: 백색의 밀실</h1>
          <div className="briefing">
            폭설로 고립된 산장 '설화장'.<br/><br/>
            다음 날 아침, 산장 주인이 안에서 굳게 잠긴 서재에서 싸늘한 주검으로 발견되었다.<br/>
            방문은 잠겨 있었고, 유일한 창문 밖 눈밭에는 그 누구의 발자국도 남아있지 않다.<br/><br/>
            용의자는 1층 거실에 머물던 두 사람.<br/>
            현장의 물리적 단서를 수집하고 모순을 찾아내 진짜 범인을 고발하라.
          </div>
          <button className="btn-main" onClick={() => setPhase("game")}>수사 시작 (ENTER)</button>
        </div>
      </div>
    );
  }

  // ── 2. 엔딩(판결) 화면 ──
  if (phase === "verdict") {
    return (
      <div className="root"><style>{S}</style>
        <div className="snow-bg" />
        <div className="fullscreen-panel">
          <h1 className="title" style={{color: isWin ? 'var(--ice)' : 'var(--blood)'}}>
            {isWin ? "사건 해결 (TRICK SOLVED)" : "수사 실패 (COLD CASE)"}
          </h1>
          <div className="briefing" style={{borderColor: isWin ? 'var(--ice)' : 'var(--blood)'}}>
            {isWin ? (
              <>
                <strong>김실장의 브리핑:</strong> 사장님, 완벽한 추리입니다.<br/><br/>
                범인은 바로 <strong>박 관리인</strong>이었습니다. 그는 창문 밖 나뭇가지에 물을 묻힌 밧줄을 걸어 얼린 뒤(얼음 닻), 이를 타고 눈밭에 발자국을 남기지 않고 탈출했습니다.<br/>
                이후 서재 안의 온풍기 열기로 얼음이 녹자, 밖에서 밧줄을 강하게 잡아당겨 회수하며 창문을 박살낸 것입니다.<br/>
                산장을 매각하여 아들의 흔적을 지우려는 주인에게 앙심을 품은 슬픈 복수극이었습니다.
              </>
            ) : (
              <>
                <strong>김실장의 브리핑:</strong> 사장님... 안타깝지만 진범을 놓쳤습니다.<br/><br/>
                <strong>{accuseTarget?.name}</strong>은 범인이 아닙니다. 우리가 헛짚는 사이, 진짜 범인은 교묘하게 만들어둔 밀실 트릭 뒤로 숨어버렸습니다.<br/>
                온풍기의 열기, 바깥으로 깨진 유리, 젖은 밧줄... 물리적 증거들이 가리키는 모순을 다시 한번 살펴봐야 합니다.
              </>
            )}
          </div>
          <button className="btn-main" onClick={() => {
            setFoundClues([]);
            setCurLocation("study");
            setPhase("intro");
          }}>처음부터 다시 수사하기</button>
        </div>
      </div>
    );
  }

  // ── 3. 메인 게임 화면 ──
  return (
    <div className="root"><style>{S}</style>
      <div className="snow-bg" />
      <div className="game-container">
        
        {/* 왼쪽 패널: 장소 이동 */}
        <div className="side-panel">
          <div className="panel-title">수사 구역 이동</div>
          {Object.values(LOCATIONS).map(l => (
            <button key={l.id} className={`loc-btn ${curLocation === l.id ? 'active' : ''}`} onClick={() => setCurLocation(l.id)}>
              {l.icon} {l.name}
            </button>
          ))}
          
          <div style={{marginTop:'40px'}}>
            <div className="panel-title">용의자 목록 (고발)</div>
            {SUSPECTS.map(s => (
              <div key={s.id} className="susp-card" style={{background:s.bg, borderColor:s.border}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                  <span style={{fontSize:'24px'}}>{s.avatar}</span>
                  <div>
                    <div style={{color:'var(--paper)', fontWeight:'bold'}}>{s.name}</div>
                    <div style={{fontSize:'10px', color:'var(--dim)'}}>{s.role}</div>
                  </div>
                </div>
                <p style={{fontSize:'11px', color:'var(--text)', lineHeight:1.5}}>{s.profile}</p>
                {/* 단서를 절반 이상 모았을 때 고발 버튼 활성화 */}
                {foundClues.length >= 3 ? (
                  <button className="btn-accuse" onClick={() => handleAccuse(s)}>이 자를 범인으로 지목</button>
                ) : (
                  <div style={{fontSize:'10px', color:'var(--dim)', marginTop:'10px', textAlign:'center'}}>단서 추가 확보 필요</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 중앙 패널: 평면도 탐색 */}
        <div className="center-view">
          <div style={{padding:'20px', borderBottom:'1px solid var(--border)'}}>
            <h2 style={{color:'var(--ice)'}}>{loc.icon} {loc.name}</h2>
            <p style={{fontSize:'12px', color:'var(--dim)', marginTop:'5px'}}>{loc.desc}</p>
          </div>
          
          <div className="scene-canvas">
            {/* SVG 도면(Blueprint) 렌더링 */}
            <FloorPlan locationId={curLocation} />

            {/* 클릭 가능한 핫스팟 */}
            {loc.hotspots.map(hs => (
              <div key={hs.id} className={`hotspot ${foundClues.includes(hs.id)?'found':''}`} style={{left: `${hs.x}%`, top: `${hs.y}%`}} onClick={()=>handleHotspot(hs.id)}>
                <div className="hotspot-inner">{hs.icon}</div>
                <div className="hotspot-label">{hs.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 패널: 탐정 수첩 */}
        <div className="right-panel">
          <div className="panel-title">탐정 수첩 ({foundClues.length} / {totalClues} 확보)</div>
          {foundClues.length === 0 ? (
            <p style={{fontSize:'12px', color:'var(--dim)', fontStyle:'italic'}}>도면 위의 아이콘을 클릭하여 단서를 수집하십시오.</p>
          ) : (
            foundClues.map(id => {
              const c = CLUES[id];
              if(!c) return null; // 안전 장치
              return (
                <div key={id} className="note-entry">
                  <div className="note-head">{c.icon} {c.title}</div>
                  <div className="note-body">{c.short}</div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 모달창: 단서 상세 정보 */}
      {selectedClue && (
        <div className="modal-overlay" onClick={()=>setSelectedClue(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setSelectedClue(null)}>✕</button>
            <h2 style={{color:'var(--ice)', marginBottom:'15px', borderBottom:'1px solid var(--border)', paddingBottom:'10px'}}>
              {selectedClue.icon} {selectedClue.title}
            </h2>
            <p style={{fontSize:'13px', color:'var(--paper)', lineHeight:1.7}}>{selectedClue.detail}</p>
            <div style={{marginTop:'20px', fontSize:'11px', color:'var(--dim)', fontStyle:'italic'}}>
              * 이 단서는 수첩에 자동 기록되었습니다.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
