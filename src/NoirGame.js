import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
// GAME DATA: 백색의 밀실 (설화장)
// ═══════════════════════════════════════════════════════

const LOCATIONS = {
  study: {
    id: "study",
    name: "산장 주인의 서재",
    icon: "📖",
    desc: "안에서 굳게 잠겨 있던 밀실. 펄펄 끓는 온풍기 열기와 시신의 피비린내가 섞여 있다.",
    bg: "#101620", // 차가운 네이비톤
    hotspots: [
      { id: "body", x: 45, y: 55, label: "주인의 시신", icon: "💀" },
      { id: "heater", x: 20, y: 40, label: "온풍기", icon: "♨️" },
      { id: "window", x: 80, y: 35, label: "깨진 창문", icon: "🪟" },
      { id: "desk", x: 60, y: 65, label: "서재 책상", icon: "📜" },
    ],
  },
  living_room: {
    id: "living_room",
    name: "산장 거실",
    icon: "🛋️",
    desc: "용의자들이 모여 있는 1층 거실. 벽난로가 켜져 있지만 냉기가 감돈다.",
    bg: "#1a1f29",
    hotspots: [
      { id: "fireplace", x: 50, y: 40, label: "벽난로", icon: "🔥" },
      { id: "coat_rack", x: 25, y: 50, label: "외투 걸이", icon: "🧥" },
      { id: "table", x: 70, y: 65, label: "응접 테이블", icon: "☕" },
    ],
  },
  outside: {
    id: "outside",
    name: "서재 밖 눈밭",
    icon: "❄️",
    desc: "폭설이 내린 산장 외부. 서재 창문 바로 아래쪽 눈밭이다.",
    bg: "#0d1821",
    hotspots: [
      { id: "snow", x: 50, y: 70, label: "새하얀 눈밭", icon: "⛄" },
      { id: "glass_shards", x: 40, y: 45, label: "유리 파편", icon: "💎" },
      { id: "rope_scrap", x: 65, y: 50, label: "창틀 밑 나뭇가지", icon: "🌿" },
    ],
  },
};

const CLUES = {
  // 서재
  body: {
    id: "body", location: "study",
    title: "열쇠와 시신", icon: "💀",
    short: "방문 열쇠는 주머니에. 외상은 없고 독살 혹은 질식 추정.",
    detail: "방은 안에서 잠겨 있었고 열쇠는 피해자 주머니에 있다. 전형적인 밀실.",
    weight: { 박관리인: 0, 최동업: 0, 이딸: 0 },
    unlocks: [],
  },
  heater: {
    id: "heater", location: "study",
    title: "MAX로 켜진 온풍기", icon: "♨️",
    short: "실내 온도가 비정상적으로 높다.",
    detail: "겨울 산장임을 감안해도 숨이 턱 막힐 정도로 온도가 높게 설정되어 있다. 무언가를 빨리 '녹이거나' 증발시키려 했던 흔적일까?",
    weight: { 박관리인: 2, 최동업: 0, 이딸: 0 },
    unlocks: ["q_heater"],
  },
  window: {
    id: "window", location: "study",
    title: "창문의 상태", icon: "🪟",
    short: "창문이 깨져 찬바람이 들어온다.",
    detail: "유일하게 외부와 통하는 창문. 하지만 바깥 눈밭에는 발자국이 없다. 사람이 드나들지 않았다면 왜 깨진 것일까?",
    weight: { 박관리인: 1, 최동업: 0, 이딸: 0 },
    unlocks: ["q_window"],
  },
  desk: {
    id: "desk", location: "study",
    title: "찢어진 매각 계약서", icon: "📜",
    short: "산장 매각 계약서가 찢겨 있다.",
    detail: "피해자가 최근 이 산장을 처분하려 했다는 서류. 누군가는 이 산장이 넘어가는 것을 극도로 꺼렸다.",
    weight: { 박관리인: 3, 최동업: 1, 이딸: 2 },
    unlocks: ["q_motive"],
  },
  
  // 외부 눈밭
  snow: {
    id: "snow", location: "outside",
    title: "발자국 없는 눈밭", icon: "⛄",
    short: "서재 창문 밖 눈밭에는 어떠한 발자국도 없다.",
    detail: "어젯밤 10시 이후로 눈이 그쳤다. 사망 추정 시간은 자정. 창문으로 탈출했다면 반드시 발자국이 남아야 한다.",
    weight: { 박관리인: 0, 최동업: 0, 이딸: 0 },
    unlocks: [],
  },
  glass_shards: {
    id: "glass_shards", location: "outside",
    title: "외부로 흩어진 파편", icon: "💎",
    short: "창문의 유리 파편이 방 안이 아닌 바깥 눈밭에 떨어져 있다.",
    detail: "이것은 결정적 모순이다. 외부 침입자가 유리를 깨고 들어왔다면 파편은 방 안에 있어야 한다. 안에서 밖으로 강한 충격이 가해졌다.",
    weight: { 박관리인: 2, 최동업: 0, 이딸: 0 },
    unlocks: [],
  },
  rope_scrap: {
    id: "rope_scrap", location: "outside",
    title: "젖은 밧줄 조각", icon: "🌿",
    short: "창틀 밑 나뭇가지에 걸린 짧고 젖은 나일론 밧줄.",
    detail: "날카로운 창틀 유리에 쓸려 끊어진 듯한 고강도 나일론 밧줄이다. 이상하게도 물기를 흠뻑 머금고 있다. 산악용 로프로 보인다.",
    weight: { 박관리인: 4, 최동업: 0, 이딸: 0 },
    unlocks: ["q_rope"],
  },
  
  // 거실
  coat_rack: {
    id: "coat_rack", location: "living_room",
    title: "젖은 등산화", icon: "🧥",
    short: "현관에 놓인 박 관리인의 등산화가 젖어 있다.",
    detail: "눈이 그친 뒤 누군가 밖을 돌아다녔다는 증거. 박 관리인은 실내에만 있었다고 증언했다.",
    weight: { 박관리인: 3, 최동업: 0, 이딸: 0 },
    unlocks: ["q_shoes"],
  }
};

const SUSPECTS = [
  {
    id: "박관리인", name: "박 씨", role: "산장 관리인, 60대", avatar: "🧔",
    bg: "rgba(40,60,80,0.15)", border: "rgba(100,150,200,0.4)",
    isKiller: true,
    profile: "30년 전 산장 공사 때 아들을 잃고 이 산장을 관리하며 살아왔다. 산악 구조대 출신.",
    baseDialogue: { greet: "주인 어르신이 돌아가시다니... 저는 어젯밤 내내 거실 난로 앞을 지켰습니다." },
    questions: [
      {
        id: "q_motive", text: "산장 매각 계약서에 대해 알고 계셨습니까?", requires: ["desk"],
        answer: "네... 어르신이 도시에 나가신다고 하더군요. 섭섭하지만 어쩌겠습니까.",
        contradiction: null, weight: { 박관리인: 1 }
      },
      {
        id: "q_shoes", text: "밤새 거실에 있었다면서 등산화는 왜 젖어 있죠?", requires: ["coat_rack"],
        answer: "아... 새벽에 장작을 가지러 잠시 나갔다 왔습니다.",
        contradiction: "snow", contradictionAnswer: "장작을 가지러 갔다면 발자국이 있어야 하는데... (당황하며 말을 잃는다)", weight: { 박관리인: 2 }
      },
      {
        id: "q_rope", text: "창문 밖에서 산악용 밧줄 조각이 발견되었습니다.", requires: ["rope_scrap"],
        answer: "산장 창고에 밧줄은 많습니다. 누군가 썼나 보죠.",
        contradiction: "glass_shards", contradictionAnswer: "유리가 밖으로 깨졌다고요? ...그건... 폭설로 인한 바람결에...", weight: { 박관리인: 3 }
      },
      {
        id: "q_heater", text: "서재 온풍기가 최대 온도로 켜져 있었습니다. '얼음'을 녹이기 위해서였나요?", requires: ["heater", "glass_shards", "rope_scrap"],
        answer: "...무슨 말씀을 하시는지 모르겠군요.",
        contradiction: "body", contradictionAnswer: "(체념한 듯) ...물과 밧줄, 그리고 차가운 바람. 그것만 있으면 완벽한 밀실을 만들 수 있죠.", weight: { 박관리인: 4 }
      }
    ]
  },
  {
    id: "최동업", name: "최 대표", role: "동업자, 40대", avatar: "🕴",
    bg: "rgba(80,40,40,0.15)", border: "rgba(200,100,100,0.4)",
    isKiller: false,
    profile: "피해자의 오랜 사업 파트너. 최근 공금 횡령 문제로 피해자와 다투는 소리가 들렸다.",
    baseDialogue: { greet: "나 참, 골치 아프게 됐군. 난 2층 내 방에서 자고 있었소." },
    questions: [
      {
        id: "q_motive2", text: "매각 계약서 건으로 피해자와 다투셨죠?", requires: ["desk"],
        answer: "사업 방향이 안 맞아서 언쟁이 있었던 건 사실이오. 하지만 죽이진 않았어.",
        contradiction: null, weight: { 최동업: 1 }
      }
    ]
  }
];

// 스타일 정의 (설화장 테마의 차가운 CSS)
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Courier+Prime&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#0b111a; --paper:#e6edf2; --ice:#8bb3d4; --ice-dark:#4a6b8c;
    --blood:#992222; --dim:#6b7b8c; --panel:#121a24;
    --border:rgba(139,179,212,0.2); --text:rgba(230,237,242,0.85);
  }
  html,body{background:var(--bg);height:100%;}
  .root{min-height:100vh;background:var(--bg);font-family:'Courier Prime',monospace;color:var(--paper);overflow-x:hidden;}
  
  /* 눈 내리는 애니메이션 */
  .snow{position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image: 
    radial-gradient(4px 4px at 20px 30px, #fff, rgba(0,0,0,0)),
    radial-gradient(3px 3px at 40px 70px, #fff, rgba(0,0,0,0)),
    radial-gradient(5px 5px at 90px 40px, #fff, rgba(0,0,0,0));
    background-repeat: repeat;
    background-size: 150px 150px;
    animation: snowfall 4s linear infinite; opacity: 0.3;}
  @keyframes snowfall{from{background-position:0 0;}to{background-position: 20px 150px;}}

  /* 레이아웃 및 UI (원안 기반 색상 변경) */
  .game{display:grid;grid-template-columns:220px 1fr 260px;min-height:100vh; position:relative; z-index:1;}
  .left-panel, .right-panel{background:rgba(10,15,25,0.8); border-color:var(--border); padding:16px;}
  .panel-title{font-size:11px; color:var(--ice); border-bottom:1px solid var(--border); margin-bottom:10px; padding-bottom:5px; font-weight:bold;}
  
  .loc-btn{display:flex; gap:10px; padding:10px; background:transparent; border:1px solid transparent; color:var(--dim); cursor:pointer; width:100%; text-align:left;}
  .loc-btn:hover{color:var(--paper); background:rgba(255,255,255,0.05);}
  .loc-btn.active{border-color:var(--ice); color:var(--ice); background:rgba(139,179,212,0.1);}
  
  .scene-canvas{position:relative;flex:1;min-height:400px;background:#000;overflow:hidden;}
  .hotspot{position:absolute;transform:translate(-50%,-50%);cursor:pointer;z-index:10;}
  .hotspot-inner{width:40px;height:40px;border:1px solid var(--ice-dark);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;background:rgba(0,0,0,0.6); transition:0.2s;}
  .hotspot:hover .hotspot-inner{border-color:var(--ice); background:rgba(139,179,212,0.2); transform:scale(1.1);}
  .hotspot.found .hotspot-inner{opacity:0.4;}
  
  .tabs{display:flex; border-bottom:1px solid var(--border);}
  .tab{padding:10px 20px; color:var(--dim); cursor:pointer; background:none; border:none;}
  .tab.on{color:var(--ice); border-bottom:2px solid var(--ice);}
  
  .susp-card{border:1px solid rgba(255,255,255,0.1); padding:15px; margin-bottom:10px;}
  .btn-sm{padding:5px 15px; background:transparent; border:1px solid var(--dim); color:var(--paper); cursor:pointer;}
  .btn-sm:hover{border-color:var(--ice); color:var(--ice);}
  
  .note-entry{margin-bottom:15px; border-bottom:1px dashed var(--border); padding-bottom:10px;}
  .note-head{color:var(--ice); font-weight:bold; font-size:13px; margin-bottom:5px;}
  .note-body{font-size:11px; color:var(--text); line-height:1.5;}
  
  .modal-overlay{position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:100; display:flex; align-items:center; justify-content:center;}
  .modal-content{background:var(--panel); border:1px solid var(--ice); padding:30px; width:400px; position:relative;}
  .close-btn{position:absolute; top:10px; right:10px; background:none; border:none; color:white; cursor:pointer;}
  
  .q-btn{display:block; width:100%; text-align:left; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border); color:var(--paper); margin-bottom:5px; cursor:pointer;}
  .q-btn:disabled{opacity:0.4; cursor:not-allowed;}
  .chat-box{height:150px; overflow-y:auto; border:1px solid var(--border); padding:10px; margin-bottom:10px; font-size:12px; line-height:1.6;}
`;

export default function SnowCabinGame() {
  const [curLocation, setCurLocation] = useState("study");
  const [foundClues, setFoundClues] = useState([]);
  const [activeTab, setActiveTab] = useState("suspects");
  const [selectedClue, setSelectedClue] = useState(null);
  const [interrogating, setInterrogating] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const [askedQ, setAskedQ] = useState({});

  const loc = LOCATIONS[curLocation];

  const handleHotspot = (id) => {
    setSelectedClue(CLUES[id]);
    if (!foundClues.includes(id)) setFoundClues(p => [...p, id]);
  };

  const askQuestion = (suspect, q) => {
    const sid = suspect.id;
    setAskedQ(p => ({ ...p, [sid]: [...(p[sid] || []), q.id] }));
    const hasContra = q.contradiction && foundClues.includes(q.contradiction);
    const ans = hasContra ? q.contradictionAnswer : q.answer;
    
    setChatHistory(p => ({
      ...p,
      [sid]: [...(p[sid] || []), { q: q.text, a: ans }]
    }));
  };

  return (
    <div className="root"><style>{S}</style>
      <div className="snow" />
      <div className="game">
        
        {/* 왼쪽 패널: 장소 이동 */}
        <div className="left-panel">
          <div className="panel-title">수사 장소 (설화장)</div>
          {Object.values(LOCATIONS).map(l => (
            <button key={l.id} className={`loc-btn ${curLocation === l.id ? 'active' : ''}`} onClick={() => setCurLocation(l.id)}>
              {l.icon} {l.name}
            </button>
          ))}
        </div>

        {/* 중앙 패널: 씬 탐색 및 용의자 */}
        <div style={{display:'flex', flexDirection:'column'}}>
          <div style={{padding:'20px', borderBottom:'1px solid var(--border)'}}>
            <h2 style={{color:'var(--ice)'}}>{loc.icon} {loc.name}</h2>
            <p style={{fontSize:'12px', color:'var(--dim)'}}>{loc.desc}</p>
          </div>
          
          <div className="scene-canvas">
            <div style={{position:'absolute', inset:0, background:loc.bg}} />
            {loc.hotspots.map(hs => (
              <div key={hs.id} className={`hotspot ${foundClues.includes(hs.id)?'found':''}`} style={{left:\`\${hs.x}%\`, top:\`\${hs.y}%\`}} onClick={()=>handleHotspot(hs.id)}>
                <div className="hotspot-inner">{hs.icon}</div>
              </div>
            ))}
          </div>

          <div className="tabs">
            <button className={`tab on`}>용의자 심문</button>
          </div>
          
          <div style={{padding:'20px', overflowY:'auto'}}>
            {SUSPECTS.map(s => (
              <div key={s.id} className="susp-card" style={{background:s.bg, borderColor:s.border}}>
                <h3>{s.avatar} {s.name} <span style={{fontSize:'11px', color:'var(--dim)'}}>{s.role}</span></h3>
                <p style={{fontSize:'12px', margin:'10px 0', color:'var(--text)'}}>{s.profile}</p>
                <button className="btn-sm" onClick={()=>setInterrogating(s)}>심문하기</button>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 패널: 수첩 (단서) */}
        <div className="right-panel">
          <div className="panel-title">탐정 수첩 ({foundClues.length}개 확보)</div>
          {foundClues.map(id => {
            const c = CLUES[id];
            return (
              <div key={id} className="note-entry">
                <div className="note-head">{c.icon} {c.title}</div>
                <div className="note-body">{c.short}</div>
              </div>
            );
          })}
          {foundClues.length === 0 && <p style={{fontSize:'12px', color:'var(--dim)'}}>단서를 찾아보세요.</p>}
        </div>

      </div>

      {/* 모달: 단서 상세 */}
      {selectedClue && (
        <div className="modal-overlay" onClick={()=>setSelectedClue(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setSelectedClue(null)}>✕</button>
            <h2 style={{color:'var(--ice)', marginBottom:'10px'}}>{selectedClue.icon} {selectedClue.title}</h2>
            <p style={{fontSize:'13px', color:'var(--paper)', lineHeight:1.6}}>{selectedClue.detail}</p>
          </div>
        </div>
      )}

      {/* 모달: 심문 창 */}
      {interrogating && (
        <div className="modal-overlay" onClick={()=>setInterrogating(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()} style={{width:'500px'}}>
            <button className="close-btn" onClick={()=>setInterrogating(null)}>✕</button>
            <h2 style={{color:'var(--ice)', marginBottom:'15px'}}>{interrogating.avatar} {interrogating.name} 심문</h2>
            
            <div className="chat-box">
              <p style={{color:'var(--dim)'}}>{interrogating.baseDialogue.greet}</p>
              {(chatHistory[interrogating.id]||[]).map((c, i) => (
                <div key={i} style={{marginTop:'10px'}}>
                  <div style={{color:'var(--ice)'}}>▶ {c.q}</div>
                  <div style={{color:'var(--paper)', marginLeft:'15px'}}>"{c.a}"</div>
                </div>
              ))}
            </div>

            <div>
              {interrogating.questions.map(q => {
                const asked = (askedQ[interrogating.id]||[]).includes(q.id);
                const canAsk = q.requires.every(r => foundClues.includes(r));
                return (
                  <button key={q.id} className="q-btn" disabled={asked || !canAsk} onClick={()=>askQuestion(interrogating, q)}>
                    {asked ? "✓ " : canAsk ? "Q. " : "🔒 "}{q.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
