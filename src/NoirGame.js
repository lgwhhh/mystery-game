import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════
// GAME DATA: 백색의 밀실 V3.0 (퍼즐 & 인벤토리 시스템 도입)
// ═══════════════════════════════════════════════════════

const SUSPECTS = [
  { id: "박관리인", name: "박 씨", role: "산장 관리인, 60대", avatar: "🧔", profile: "1996년, 산장 공사 때 아들을 잃고 이 산장을 관리해왔다. 산악용 로프를 다루는 기술이 뛰어나다." },
  { id: "최동업", name: "최 대표", role: "동업자, 40대", avatar: "🕴", profile: "피해자의 오랜 파트너. 최근 회사의 거액 공금을 빼돌린 혐의를 받고 있다." },
  { id: "이지윤", name: "이 양", role: "의붓딸, 20대", avatar: "👩", profile: "피해자와 사이가 극도로 나빴으며, 산장이 매각되면 유산을 한 푼도 받지 못할 위기였다." },
  { id: "조난객", name: "김태혁", role: "불청객, 30대", avatar: "🎒", profile: "폭설로 우연히 산장에 들어왔다고 주장하는 등산객. 하지만 그의 배낭엔 피해자의 젊은 시절 사진이 있다." }
];

const HOTSPOTS = [
  // 외부 눈밭
  { id: "snow", x: 25, y: 15, label: "발자국 없는 눈밭", icon: "⛄", type: "clue" },
  { id: "glass", x: 45, y: 25, label: "외부로 흩어진 유리", icon: "💎", type: "clue" },
  { id: "rope", x: 75, y: 20, label: "젖은 밧줄 (동선 끝)", icon: "🌿", type: "clue" },
  
  // 서재 (밀실)
  { id: "body", x: 25, y: 75, label: "피해자 시신", icon: "💀", type: "clue" },
  { id: "heater", x: 15, y: 55, label: "MAX 온풍기", icon: "♨️", type: "clue" },
  { id: "safe", x: 12, y: 90, label: "다이얼 금고", icon: "🔒", type: "puzzle", puzzleAnswer: "1996", hint: "금고에 힌트가 적혀있다: '내 아들이 죽고, 이 슬픈 산장이 세워진 해'" },
  { id: "drawer", x: 40, y: 65, label: "잠긴 서랍", icon: "🗄️", type: "locked", reqItem: "은열쇠", lockMsg: "서랍이 굳게 잠겨있다. 작은 열쇠구멍이 보인다." },
  
  // 거실
  { id: "coat", x: 60, y: 55, label: "박씨의 외투", icon: "🧥", type: "item", itemGranted: "은열쇠", itemMsg: "주머니를 뒤져 [은열쇠]를 획득했다!" },
  { id: "fireplace", x: 75, y: 45, label: "타다만 종이", icon: "🔥", type: "clue" },
  { id: "bag", x: 90, y: 85, label: "등산객의 가방", icon: "🎒", type: "clue" },
];

const CLUES_DATA = {
  snow: { title: "발자국 없는 눈밭", short: "서재 창문 밖 눈밭에는 탈출한 발자국이 없다." },
  glass: { title: "외부로 흩어진 파편", short: "창문 유리가 '안에서 밖으로' 깨졌다." },
  rope: { title: "젖은 밧줄 조각", short: "나무에 걸려있던 날카롭게 끊어진 젖은 나일론 로프." },
  body: { title: "밀실 속 시신", short: "방문 열쇠는 주머니에. 외상 없는 전형적 밀실." },
  heater: { title: "펄펄 끓는 온풍기", short: "실내 온도가 비정상적으로 높다. 무언가 녹이려 한 흔적." },
  safe: { title: "금고 속 횡령 장부", short: "최 대표가 회삿돈을 빼돌린 완벽한 증거 서류." },
  drawer: { title: "매각 계약서", short: "피해자가 산장을 팔려던 서류. 누군가의 강한 원한 동기." },
  fireplace: { title: "태우려던 유서", short: "벽난로에서 발견된 의붓딸의 필적. '다 부숴버리겠어'." },
  bag: { title: "복수자의 가방", short: "등산객 배낭에서 발견된 독극물 병 (사용되진 않음)." }
};

// SVG 원뷰 도면 컴포넌트
const BlueprintMap = () => (
  <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    {/* 외부 눈밭 */}
    <rect x="50" y="30" width="900" height="180" fill="#05101a" stroke="#2b5278" strokeWidth="2" strokeDasharray="10,5" />
    <text x="70" y="60" fill="#2b5278" fontSize="24" fontFamily="monospace" fontWeight="bold">EXTERIOR / BLIZZARD</text>
    
    {/* 서재 (밀실) */}
    <rect x="50" y="250" width="400" height="320" fill="#081424" stroke="#5cb8ff" strokeWidth="4" />
    <text x="70" y="290" fill="#5cb8ff" fontSize="28" fontWeight="bold">서재 (LOCKED ROOM)</text>
    <path d="M 450 350 L 450 450" stroke="#ff4444" strokeWidth="6" /> {/* 잠긴 문 표시 */}
    
    {/* 거실 */}
    <rect x="500" y="250" width="450" height="320" fill="#081424" stroke="#5cb8ff" strokeWidth="2" />
    <text x="520" y="290" fill="#5cb8ff" fontSize="28" fontWeight="bold">거실 (LOBBY)</text>
    
    {/* 창문과 탈출 동선 (가설) */}
    <rect x="250" y="240" width="100" height="20" fill="#5cb8ff" />
    <text x="260" y="230" fill="#5cb8ff" fontSize="14">깨진 창문</text>
    
    {/* 붉은색 점선 동선 */}
    <path d="M 300 240 Q 400 120 750 120" fill="none" stroke="#ff4444" strokeWidth="3" strokeDasharray="8,8" />
    <circle cx="750" cy="120" r="6" fill="#ff4444" />
    <text x="450" y="100" fill="#ff4444" fontSize="16" fontWeight="bold">트릭을 이용한 추정 탈출 경로 ➔</text>
  </svg>
);

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Courier+Prime&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#03080f; color:#e6edf2; font-family:'Courier Prime', 'Noto Serif KR', serif; overflow:hidden;}
  
  .game-layout { display:flex; height:100vh; }
  
  /* 메인 맵 영역 (75%) */
  .map-area { flex:3; position:relative; background:#03080f; 
    background-image: linear-gradient(rgba(92,184,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(92,184,255,0.05) 1px, transparent 1px); background-size: 30px 30px; }
  
  /* 핫스팟 (단서 버튼) */
  .hotspot { position:absolute; transform:translate(-50%,-50%); cursor:pointer; z-index:10; text-align:center; }
  .hs-icon { width:48px; height:48px; border:2px solid #2b5278; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; background:rgba(0,0,0,0.8); transition:0.2s; margin:0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
  .hotspot:hover .hs-icon { border-color:#5cb8ff; background:rgba(92,184,255,0.2); transform:scale(1.1); box-shadow: 0 0 20px rgba(92,184,255,0.4); }
  .hotspot.found .hs-icon { border-color:#444; opacity:0.4; }
  .hs-label { font-size:12px; color:#5cb8ff; margin-top:6px; background:rgba(0,0,0,0.9); padding:4px 8px; border:1px solid #2b5278; white-space:nowrap; }

  /* 인벤토리 (상단 맵 위) */
  .inventory-bar { position:absolute; top:20px; left:20px; display:flex; gap:10px; z-index:20;}
  .inv-item { background:rgba(92,184,255,0.1); border:1px solid #5cb8ff; padding:8px 15px; font-size:14px; color:#5cb8ff; font-weight:bold; box-shadow: 0 0 10px rgba(92,184,255,0.2);}

  /* 우측 패널 (25%) */
  .side-panel { flex:1; background:rgba(5,15,25,0.95); border-left:2px solid #2b5278; display:flex; flex-direction:column; z-index:20;}
  .panel-header { padding:20px; border-bottom:1px solid #2b5278; font-size:16px; color:#5cb8ff; font-weight:bold; letter-spacing:2px; text-align:center;}
  .notebook { flex:1; overflow-y:auto; padding:20px; }
  .clue-card { border-left:3px solid #5cb8ff; background:rgba(255,255,255,0.02); padding:12px; margin-bottom:15px; }
  .clue-title { font-weight:bold; color:#e6edf2; font-size:14px; margin-bottom:6px; }
  .clue-desc { font-size:12px; color:#a0b4c8; line-height:1.5; }
  
  .suspect-section { height:40%; border-top:2px solid #2b5278; overflow-y:auto; padding:20px;}
  .susp-item { display:flex; align-items:center; gap:12px; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:10px; border:1px solid #1a2a3a;}
  .susp-av { font-size:28px; }

  /* 모달 (퍼즐 & 알림) */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:100; display:flex; align-items:center; justify-content:center;}
  .modal-box { background:#0a1520; border:2px solid #5cb8ff; padding:30px; width:450px; text-align:center; box-shadow: 0 0 30px rgba(92,184,255,0.15);}
  .modal-title { font-size:22px; color:#5cb8ff; margin-bottom:15px; }
  .puzzle-input { width:100%; padding:15px; font-size:24px; text-align:center; background:#000; border:1px solid #5cb8ff; color:#fff; margin:20px 0; letter-spacing:10px; font-family:monospace;}
  .btn-submit { background:#5cb8ff; color:#000; border:none; padding:12px 30px; font-size:16px; font-weight:bold; cursor:pointer; transition:0.2s;}
  .btn-submit:hover { background:#fff; }
  .btn-close { background:transparent; color:#888; border:1px solid #888; padding:8px 20px; margin-top:15px; cursor:pointer;}
`;

export default function MasterpieceGameV3() {
  const [inventory, setInventory] = useState([]);
  const [clues, setClues] = useState([]);
  const [alertMsg, setAlertMsg] = useState(null);
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [puzzleValue, setPuzzleValue] = useState("");

  const handleHotspotClick = (hs) => {
    // 1. 단순 아이템 획득
    if (hs.type === "item") {
      if (!inventory.includes(hs.itemGranted)) {
        setInventory([...inventory, hs.itemGranted]);
        setAlertMsg({ title: "아이템 획득", text: hs.itemMsg });
      } else {
        setAlertMsg({ title: "확인 완료", text: "이미 챙긴 물건이다." });
      }
      return;
    }

    // 2. 잠긴 단서 (인벤토리 검사)
    if (hs.type === "locked") {
      if (clues.includes(hs.id)) return; // 이미 풀었음
      if (inventory.includes(hs.reqItem)) {
        setClues([...clues, hs.id]);
        setAlertMsg({ title: "잠금 해제!", text: `[${hs.reqItem}]을(를) 사용하여 서랍을 열었다! 새로운 단서를 발견했다.` });
      } else {
        setAlertMsg({ title: "잠겨 있음", text: hs.lockMsg });
      }
      return;
    }

    // 3. 퍼즐 (미니 게임)
    if (hs.type === "puzzle") {
      if (clues.includes(hs.id)) {
        setAlertMsg({ title: "금고 개방됨", text: "이미 안의 서류를 확보했다." });
        return;
      }
      setActivePuzzle(hs);
      setPuzzleValue("");
      return;
    }

    // 4. 일반 단서
    if (hs.type === "clue") {
      if (!clues.includes(hs.id)) {
        setClues([...clues, hs.id]);
      }
    }
  };

  const handlePuzzleSubmit = () => {
    if (puzzleValue === activePuzzle.puzzleAnswer) {
      setClues([...clues, activePuzzle.id]);
      setActivePuzzle(null);
      setAlertMsg({ title: "정답입니다!", text: "철컥 소리와 함께 금고가 열렸다. 결정적인 횡령 증거를 입수했다." });
    } else {
      setAlertMsg({ title: "오류", text: "비밀번호가 틀렸습니다. 다이얼이 움직이지 않습니다." });
    }
  };

  return (
    <div className="root"><style>{S}</style>
      <div className="game-layout">
        
        {/* 중앙: 대형 원뷰 맵 */}
        <div className="map-area">
          <BlueprintMap />
          
          {/* 인벤토리 UI */}
          {inventory.length > 0 && (
            <div className="inventory-bar">
              <div style={{color:'#fff', lineHeight:'35px', fontSize:'12px'}}>보유 아이템:</div>
              {inventory.map((item, idx) => (
                <div key={idx} className="inv-item">🗝️ {item}</div>
              ))}
            </div>
          )}

          {/* 핫스팟 아이콘 배치 */}
          {HOTSPOTS.map(hs => (
            <div key={hs.id} className={`hotspot ${(clues.includes(hs.id) || inventory.includes(hs.itemGranted)) ? 'found' : ''}`} 
                 style={{ left: `${hs.x}%`, top: `${hs.y}%` }} onClick={() => handleHotspotClick(hs)}>
              <div className="hs-icon">{hs.icon}</div>
              <div className="hs-label">{hs.label}</div>
            </div>
          ))}
        </div>

        {/* 우측: 수첩 & 용의자 */}
        <div className="side-panel">
          <div className="panel-header">탐정 수첩 ({clues.length} / 8)</div>
          
          <div className="notebook">
            {clues.length === 0 && <p style={{color:'#888', fontSize:'12px', textAlign:'center'}}>도면을 탐색하여 단서를 모으십시오.</p>}
            {clues.map(id => (
              <div key={id} className="clue-card">
                <div className="clue-title">✓ {CLUES_DATA[id].title}</div>
                <div className="clue-desc">{CLUES_DATA[id].short}</div>
              </div>
            ))}
          </div>

          <div className="suspect-section">
            <div style={{fontSize:'14px', color:'#5cb8ff', marginBottom:'15px', fontWeight:'bold'}}>용의자 파일</div>
            {SUSPECTS.map(s => (
              <div key={s.id} className="susp-item">
                <div className="susp-av">{s.avatar}</div>
                <div>
                  <div style={{color:'#fff', fontSize:'14px', fontWeight:'bold'}}>{s.name} <span style={{fontSize:'10px', color:'#888'}}>{s.role}</span></div>
                  <div style={{fontSize:'11px', color:'#aaa', marginTop:'4px', lineHeight:1.4}}>{s.profile}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 알림창 모달 */}
      {alertMsg && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-title">{alertMsg.title}</div>
            <p style={{color:'#fff', fontSize:'14px', lineHeight:1.6}}>{alertMsg.text}</p>
            <button className="btn-close" onClick={() => setAlertMsg(null)}>확인</button>
          </div>
        </div>
      )}

      {/* 퍼즐 모달 (금고) */}
      {activePuzzle && (
        <div className="modal-overlay">
          <div className="modal-box" style={{border:'2px solid #ff4444'}}>
            <div className="modal-title" style={{color:'#ff4444'}}>🔒 {activePuzzle.label} 해제</div>
            <p style={{color:'#aaa', fontSize:'12px', fontStyle:'italic'}}>{activePuzzle.hint}</p>
            
            <input type="text" className="puzzle-input" maxLength={4} placeholder="****"
                   value={puzzleValue} onChange={(e) => setPuzzleValue(e.target.value.replace(/[^0-9]/g, ''))} />
            
            <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
              <button className="btn-submit" onClick={handlePuzzleSubmit}>입력</button>
              <button className="btn-close" style={{marginTop:0}} onClick={() => setActivePuzzle(null)}>취소</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
