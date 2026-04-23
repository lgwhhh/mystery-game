import { useState, useEffect, useRef } from "react";

const CASE = {
  title: "항구의 밤",
  subtitle: "NOIR MYSTERY — CASE FILE #07",
  briefing: `1947년 11월. 부산 남항 창고 지구.\n새벽 2시, 무역상 강철수의 시체가 3번 창고에서 발견됐다.\n뒷통수에 둔기 흔적. 문은 안에서 잠겨 있었다.\n\n당신은 이 도시 최후의 탐정, 이무영.\n세 명의 용의자가 있다. 단 한 명이 거짓말을 하고 있다.`,
  victim: "강철수 (무역상, 54세)",
  solution: "김도윤",
  clues: [
    { id: "c1", icon: "🔑", title: "예비 열쇠", short: "창고 예비 열쇠 — 지문이 닦여 있다", detail: "3번 창고 예비 열쇠. 표면이 깨끗하게 닦여 있어 지문이 전혀 없다. 원래 이 열쇠는 회계 담당 김도윤이 보관하던 것이었다.", unlocks: "김도윤" },
    { id: "c2", icon: "🥃", title: "위스키 잔", short: "바닥에 깨진 위스키 잔 — 두 사람분의 입술 자국", detail: "현장에 위스키 잔 두 개. 하나는 피해자 것. 다른 하나엔 립스틱 흔적이 남아 있다. 박수진은 '그날 밤 집에 있었다'고 했지만...", unlocks: "박수진" },
    { id: "c3", icon: "📒", title: "장부", short: "숨겨진 비밀 장부 — 횡령 기록", detail: "창고 바닥 틈에서 발견된 장부. 지난 6개월간 회사 자금 800만 환이 빠져나간 기록. 서명은 '김도윤'. 피해자가 이를 알고 있었다면?", unlocks: "김도윤" },
    { id: "c4", icon: "🩸", title: "혈흔 발자국", short: "창고 뒷문 — 남성 신발 11호 혈흔", detail: "창고 뒷문 밖에서 발견된 혈흔 발자국. 남성 신발 약 275mm. 오최진은 키 185cm, 발 사이즈 280mm. 김도윤은 170cm, 발 사이즈 270mm. 누가 더 가깝나?", unlocks: "김도윤" },
    { id: "c5", icon: "📱", title: "메모 쪽지", short: "피해자 주머니 — '내일 밤 다 말할게'", detail: "피해자 주머니에서 나온 구겨진 메모. '내일 밤 다 말할게 — 수진'. 박수진은 이 메모의 존재를 알고 있었을까? 그녀의 눈빛이 흔들렸다.", unlocks: "박수진" },
  ],
  suspects: [
    { id: "김도윤", name: "김도윤", role: "피해자의 회계 담당, 30세", avatar: "🕴", alibi: "그날 밤 야근 후 회사 근처 여관에서 잠들었다고 주장.", motive: "횡령이 들통날 위기. 피해자가 장부를 발견했다.", lie: "예비 열쇠를 '잃어버렸다'고 했으나, 지문이 닦인 채 현장에서 발견.", isKiller: true, color: "#c0392b" },
    { id: "박수진", name: "박수진", role: "피해자의 내연녀, 28세", avatar: "👩", alibi: "집에서 혼자 있었다고 주장. 아무도 보지 못했다.", motive: "피해자와 관계 청산 요구로 다툼.", lie: "집에 있었다고 했으나, 현장에서 그녀의 립스틱 잔이 발견됨.", isKiller: false, color: "#8e44ad" },
    { id: "오최진", name: "오최진", role: "경쟁 무역회사 대표, 47세", avatar: "🧔", alibi: "부산 시내 요정에서 접대 중. 목격자 3명.", motive: "피해자와 계약 분쟁 진행 중.", lie: "알리바이는 완벽하다. 그러나 부하 직원을 시킨 것 아닐까? — 결정적 증거 없음.", isKiller: false, color: "#2c3e50" },
  ],
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Playfair+Display:ital,wght@0,700;1,400&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --noir: #0a0a0a; --paper: #f0e8d0; --gold: #c9a84c; --blood: #8b1a1a; --dim: #6b6b6b; }
  body { background: var(--noir); }
  .game-root { min-height: 100vh; background: var(--noir); font-family: 'Courier Prime', monospace; color: var(--paper); overflow-x: hidden; }
  .intro-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 40px 20px; text-align: center; position: relative; }
  .intro-rain { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; background: repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(150,150,200,0.015) 3px, rgba(150,150,200,0.015) 4px); animation: rain 0.4s linear infinite; }
  @keyframes rain { 0% { background-position: 0 0; } 100% { background-position: 0 80px; } }
  .case-badge { font-family: 'Special Elite', cursive; font-size: 11px; letter-spacing: 6px; color: var(--gold); border: 1px solid rgba(201,168,76,0.4); padding: 6px 20px; margin-bottom: 30px; position: relative; z-index: 1; }
  .case-title { font-family: 'Playfair Display', serif; font-size: clamp(42px, 8vw, 80px); font-weight: 700; color: var(--paper); line-height: 1; margin-bottom: 8px; position: relative; z-index: 1; text-shadow: 2px 2px 0 rgba(0,0,0,0.8); }
  .case-title span { color: var(--gold); font-style: italic; }
  .divider { width: 120px; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); margin: 24px auto; position: relative; z-index: 1; }
  .briefing-box { max-width: 540px; background: rgba(240,232,208,0.04); border: 1px solid rgba(240,232,208,0.1); border-left: 3px solid var(--gold); padding: 24px 28px; text-align: left; line-height: 1.9; font-size: 14px; color: rgba(240,232,208,0.8); white-space: pre-line; position: relative; z-index: 1; font-style: italic; }
  .cursor { display: inline-block; width: 8px; height: 14px; background: var(--gold); animation: blink 0.8s steps(1) infinite; vertical-align: middle; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .start-btn { margin-top: 36px; padding: 14px 48px; background: transparent; border: 1px solid var(--gold); color: var(--gold); font-family: 'Special Elite', cursive; font-size: 13px; letter-spacing: 4px; cursor: pointer; position: relative; z-index: 1; transition: all 0.3s; text-transform: uppercase; }
  .start-btn:hover { background: var(--gold); color: var(--noir); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(201,168,76,0.3); }
  .game-layout { max-width: 980px; margin: 0 auto; padding: 20px 16px 60px; }
  .game-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid rgba(240,232,208,0.1); margin-bottom: 28px; }
  .game-title-sm { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--gold); }
  .lives { display: flex; gap: 6px; }
  .life { font-size: 18px; transition: all 0.3s; }
  .life.dead { filter: grayscale(1); opacity: 0.25; }
  .phase-label { font-size: 11px; letter-spacing: 3px; color: var(--dim); text-transform: uppercase; }
  .tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(240,232,208,0.1); margin-bottom: 28px; }
  .tab { padding: 10px 20px; font-family: 'Special Elite', cursive; font-size: 12px; letter-spacing: 2px; color: var(--dim); cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; transition: all 0.2s; text-transform: uppercase; }
  .tab:hover { color: var(--paper); }
  .tab.active { color: var(--gold); border-bottom-color: var(--gold); }
  .tab-badge { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; background: var(--blood); font-size: 9px; color: white; margin-left: 6px; font-family: monospace; font-style: normal; }
  .clues-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
  .clue-card { background: rgba(240,232,208,0.03); border: 1px solid rgba(240,232,208,0.08); padding: 18px; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden; }
  .clue-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 0; background: var(--gold); transition: height 0.3s; }
  .clue-card:hover::before, .clue-card.found::before { height: 100%; }
  .clue-card:hover { border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.05); transform: translateY(-2px); }
  .clue-card.found { border-color: rgba(201,168,76,0.25); background: rgba(201,168,76,0.04); }
  .clue-icon { font-size: 28px; margin-bottom: 10px; }
  .clue-title { font-family: 'Playfair Display', serif; font-size: 15px; color: var(--paper); margin-bottom: 6px; }
  .clue-short { font-size: 12px; color: var(--dim); font-style: italic; line-height: 1.6; }
  .clue-new { position: absolute; top: 12px; right: 12px; background: var(--blood); color: white; font-size: 9px; padding: 2px 6px; letter-spacing: 2px; font-family: 'Special Elite', cursive; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal-box { background: #111; border: 1px solid rgba(201,168,76,0.3); max-width: 480px; width: 100%; padding: 32px; position: relative; animation: slideUp 0.25s ease-out; }
  @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  .modal-icon { font-size: 40px; margin-bottom: 16px; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--gold); margin-bottom: 14px; }
  .modal-text { font-size: 14px; line-height: 1.8; color: rgba(240,232,208,0.8); font-style: italic; border-left: 2px solid var(--gold); padding-left: 16px; }
  .modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--dim); font-size: 20px; cursor: pointer; transition: color 0.2s; }
  .modal-close:hover { color: var(--paper); }
  .modal-note { margin-top: 20px; font-size: 11px; letter-spacing: 2px; color: var(--gold); text-transform: uppercase; }
  .suspects-list { display: flex; flex-direction: column; gap: 16px; }
  .suspect-card { background: rgba(240,232,208,0.03); border: 1px solid rgba(240,232,208,0.08); padding: 20px; transition: all 0.2s; position: relative; }
  .suspect-card:hover { border-color: rgba(240,232,208,0.15); }
  .suspect-header { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
  .suspect-avatar { font-size: 36px; }
  .suspect-name { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--paper); }
  .suspect-role { font-size: 11px; color: var(--dim); letter-spacing: 1px; margin-top: 2px; }
  .suspect-info { font-size: 13px; color: rgba(240,232,208,0.7); line-height: 1.7; margin-bottom: 12px; }
  .suspect-info strong { color: var(--gold); }
  .interrogate-btn { padding: 9px 22px; background: transparent; border: 1px solid rgba(240,232,208,0.2); color: var(--paper); font-family: 'Special Elite', cursive; font-size: 11px; letter-spacing: 3px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
  .interrogate-btn:hover { border-color: var(--gold); color: var(--gold); }
  .accuse-btn { padding: 9px 22px; background: rgba(139,26,26,0.15); border: 1px solid var(--blood); color: #e88; font-family: 'Special Elite', cursive; font-size: 11px; letter-spacing: 3px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; margin-left: 10px; }
  .accuse-btn:hover { background: var(--blood); color: white; }
  .suspect-clue-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
  .s-clue-tag { font-size: 10px; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2); color: var(--gold); padding: 2px 8px; }
  .interrogation-modal { max-width: 560px; background: #0e0e0e; border: 1px solid rgba(201,168,76,0.25); }
  .interro-header { border-bottom: 1px solid rgba(240,232,208,0.08); padding-bottom: 16px; margin-bottom: 20px; }
  .interro-name { font-family: 'Playfair Display', serif; font-size: 24px; color: var(--gold); }
  .interro-role { font-size: 11px; color: var(--dim); letter-spacing: 2px; }
  .chat-area { min-height: 160px; max-height: 260px; overflow-y: auto; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
  .chat-msg { padding: 12px 14px; font-size: 13px; line-height: 1.7; border-radius: 2px; }
  .chat-msg.detective { background: rgba(201,168,76,0.08); border-left: 2px solid var(--gold); color: rgba(240,232,208,0.9); font-style: italic; }
  .chat-msg.suspect { background: rgba(240,232,208,0.03); border-left: 2px solid rgba(240,232,208,0.2); color: rgba(240,232,208,0.75); }
  .chat-msg.loading { color: var(--dim); font-style: italic; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
  .question-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .q-btn { text-align: left; padding: 10px 14px; background: rgba(240,232,208,0.02); border: 1px solid rgba(240,232,208,0.08); color: rgba(240,232,208,0.7); font-family: 'Courier Prime', monospace; font-size: 12px; cursor: pointer; transition: all 0.2s; line-height: 1.5; }
  .q-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); background: rgba(201,168,76,0.04); }
  .q-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .q-btn.asked { opacity: 0.35; text-decoration: line-through; cursor: not-allowed; }
  .notes-panel { background: rgba(240,232,208,0.02); border: 1px solid rgba(240,232,208,0.07); padding: 20px; }
  .notes-title { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--gold); margin-bottom: 16px; letter-spacing: 1px; }
  .note-entry { border-bottom: 1px solid rgba(240,232,208,0.06); padding: 10px 0; }
  .note-entry:last-child { border-bottom: none; }
  .note-clue { font-size: 12px; color: var(--gold); font-family: 'Special Elite', cursive; letter-spacing: 1px; margin-bottom: 4px; }
  .note-detail { font-size: 12px; color: rgba(240,232,208,0.65); line-height: 1.7; font-style: italic; }
  .note-empty { font-size: 13px; color: var(--dim); font-style: italic; text-align: center; padding: 20px 0; }
  .verdict-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; padding: 40px 20px; }
  .verdict-badge { font-size: 64px; margin-bottom: 24px; animation: verdict-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
  @keyframes verdict-pop { from{transform:scale(0) rotate(-10deg)} to{transform:scale(1) rotate(0)} }
  .verdict-title { font-family: 'Playfair Display', serif; font-size: clamp(28px,5vw,52px); font-weight: 700; margin-bottom: 12px; }
  .verdict-title.win { color: var(--gold); }
  .verdict-title.lose { color: var(--blood); }
  .verdict-sub { font-size: 14px; color: var(--dim); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 28px; font-family: 'Special Elite', cursive; }
  .verdict-text { max-width: 480px; font-size: 14px; line-height: 1.9; color: rgba(240,232,208,0.75); font-style: italic; margin-bottom: 32px; }
  .replay-btn { padding: 14px 40px; background: transparent; border: 1px solid var(--gold); color: var(--gold); font-family: 'Special Elite', cursive; font-size: 12px; letter-spacing: 4px; cursor: pointer; transition: all 0.3s; text-transform: uppercase; }
  .replay-btn:hover { background: var(--gold); color: var(--noir); }
  .confirm-modal { max-width: 420px; text-align: center; }
  .confirm-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--blood); margin-bottom: 12px; }
  .confirm-name { font-size: 28px; color: var(--paper); font-family: 'Playfair Display', serif; font-style: italic; margin: 16px 0; }
  .confirm-text { font-size: 13px; color: var(--dim); line-height: 1.7; margin-bottom: 24px; }
  .confirm-btns { display: flex; gap: 12px; justify-content: center; }
  .btn-yes { padding: 11px 32px; background: var(--blood); border: none; color: white; font-family: 'Special Elite', cursive; font-size: 12px; letter-spacing: 3px; cursor: pointer; transition: all 0.2s; }
  .btn-yes:hover { background: #a01a1a; }
  .btn-no { padding: 11px 32px; background: transparent; border: 1px solid rgba(240,232,208,0.2); color: var(--dim); font-family: 'Special Elite', cursive; font-size: 12px; letter-spacing: 3px; cursor: pointer; transition: all 0.2s; }
  .btn-no:hover { color: var(--paper); border-color: rgba(240,232,208,0.4); }
  .scrollbar-custom::-webkit-scrollbar { width: 4px; }
  .scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); }
`;

const QUESTIONS = {
  김도윤: ["그날 밤 몇 시에 퇴근했습니까?", "예비 열쇠는 어디 있습니까?", "강철수 씨와 마지막으로 나눈 대화는?", "회사 장부에 대해 아는 바가 있습니까?"],
  박수진: ["강철수 씨와 마지막으로 만난 게 언제입니까?", "그날 밤 집에만 있었다고요?", "이 메모 쪽지를 본 적 있습니까?", "창고에 간 적이 있습니까?"],
  오최진: ["강철수 씨와 계약 분쟁이 있었죠?", "그날 밤 요정에서 몇 시까지 있었습니까?", "부하 직원들 중 창고 근처에 있던 사람이 있습니까?", "강철수 씨 사망으로 누가 이익을 봅니까?"],
};

export default function NoirGame() {
  const [phase, setPhase] = useState("intro");
  const [activeTab, setActiveTab] = useState("clues");
  const [foundClues, setFoundClues] = useState([]);
  const [selectedClue, setSelectedClue] = useState(null);
  const [lives, setLives] = useState(3);
  const [win, setWin] = useState(null);
  const [accuseTarget, setAccuseTarget] = useState(null);
  const [interrogating, setInterrogating] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const [askedQuestions, setAskedQuestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [typeText, setTypeText] = useState("");
  const [typeIdx, setTypeIdx] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (phase !== "intro") return;
    if (typeIdx < CASE.briefing.length) {
      const t = setTimeout(() => { setTypeText((p) => p + CASE.briefing[typeIdx]); setTypeIdx((i) => i + 1); }, 28);
      return () => clearTimeout(t);
    }
  }, [phase, typeIdx]);

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, interrogating]);

  const handleClueClick = (clue) => { setSelectedClue(clue); if (!foundClues.includes(clue.id)) setFoundClues((p) => [...p, clue.id]); };
  const handleAccuse = (suspect) => setAccuseTarget(suspect);
  const confirmAccuse = () => {
    if (!accuseTarget) return;
    if (accuseTarget.isKiller) { setWin(true); setPhase("verdict"); }
    else { const nl = lives - 1; setLives(nl); if (nl <= 0) { setWin(false); setPhase("verdict"); } }
    setAccuseTarget(null);
  };

  const handleQuestion = async (suspect, question) => {
    const sId = suspect.id;
    if ((askedQuestions[sId] || []).includes(question) || loading) return;
    setAskedQuestions((p) => ({ ...p, [sId]: [...(p[sId] || []), question] }));
    setChatHistory((p) => ({ ...p, [sId]: [...(p[sId] || []), { role: "detective", text: question }] }));
    setLoading(true);
    const systemPrompt = `당신은 1947년 부산 누아르 세계의 인물입니다.\n이름: ${suspect.name} (${suspect.role})\n알리바이: ${suspect.alibi}\n동기: ${suspect.motive}\n거짓말: ${suspect.lie}\n범인 여부: ${suspect.isKiller ? "예 — 범인입니다. 교묘하게 숨기세요." : "아니오 — 무고합니다."}\n규칙:\n- 반드시 한국어로 답변하세요.\n- 누아르 소설 속 인물처럼 짧고 날카롭게 말하세요.\n- 3~5문장 이내로 답하세요.\n- 현대적 표현이나 마크다운을 사용하지 마세요.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 200, system: systemPrompt, messages: [{ role: "user", content: question }] }) });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || "...침묵이 흐른다.";
      setChatHistory((p) => ({ ...p, [sId]: [...(p[sId] || []), { role: "suspect", text: reply }] }));
    } catch { setChatHistory((p) => ({ ...p, [sId]: [...(p[sId] || []), { role: "suspect", text: "...말을 잇지 못한다." }] })); }
    setLoading(false);
  };

  const resetGame = () => { setPhase("intro"); setActiveTab("clues"); setFoundClues([]); setSelectedClue(null); setLives(3); setWin(null); setAccuseTarget(null); setInterrogating(null); setChatHistory({}); setAskedQuestions({}); setTypeText(""); setTypeIdx(0); };

  if (phase === "intro") return (
    <div className="game-root"><style>{styles}</style>
      <div className="intro-screen">
        <div className="intro-rain" />
        <div className="case-badge">DETECTIVE BUREAU — 1947 BUSAN</div>
        <h1 className="case-title">항구의 <span>밤</span></h1>
        <div className="case-badge" style={{fontSize:'10px',letterSpacing:'4px',marginBottom:0,marginTop:4}}>NOIR MYSTERY CASE FILE #07</div>
        <div className="divider" />
        <div className="briefing-box">{typeText}{typeIdx < CASE.briefing.length && <span className="cursor" />}</div>
        {typeIdx >= CASE.briefing.length && <button className="start-btn" onClick={() => setPhase("game")}>수사 개시</button>}
      </div>
    </div>
  );

  if (phase === "verdict") return (
    <div className="game-root"><style>{styles}</style>
      <div className="verdict-screen">
        <div className="verdict-badge">{win ? "🏆" : "💀"}</div>
        <h2 className={`verdict-title ${win ? "win" : "lose"}`}>{win ? "사건 해결" : "수사 실패"}</h2>
        <p className="verdict-sub">{win ? "정의는 어둠 속에서도 빛을 찾는다" : "범인은 안개 속으로 사라졌다"}</p>
        <p className="verdict-text">{win ? "이무영 탐정은 회계 담당 김도윤을 지목했다. 횡령이 발각될 위기에 처한 그는 강철수를 창고로 불러내 범행을 저질렀다. 발자국과 장부가 그를 배신했다. 부두에서 체포될 때 그는 아무 말도 하지 않았다." : "기회를 모두 소진했다. 김도윤은 도시를 빠져나갔다. 항구의 밤은 다시 침묵으로 돌아갔다."}</p>
        <button className="replay-btn" onClick={resetGame}>다시 수사하기</button>
      </div>
    </div>
  );

  return (
    <div className="game-root"><style>{styles}</style>
      <div className="game-layout">
        <div className="game-header">
          <div><div className="game-title-sm">항구의 밤</div><div className="phase-label" style={{marginTop:2}}>피해자: {CASE.victim}</div></div>
          <div style={{textAlign:'center'}}><div className="phase-label" style={{marginBottom:6}}>남은 기회</div><div className="lives">{[0,1,2].map(i => <span key={i} className={`life ${i >= lives ? "dead" : ""}`}>🕯</span>)}</div></div>
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab==="clues"?"active":""}`} onClick={() => setActiveTab("clues")}>증거{foundClues.length > 0 && <span className="tab-badge">{foundClues.length}</span>}</button>
          <button className={`tab ${activeTab==="suspects"?"active":""}`} onClick={() => setActiveTab("suspects")}>용의자</button>
          <button className={`tab ${activeTab==="notes"?"active":""}`} onClick={() => setActiveTab("notes")}>수첩{foundClues.length > 0 && <span className="tab-badge">{foundClues.length}</span>}</button>
        </div>
        {activeTab === "clues" && (
          <div>
            <p style={{fontSize:12,color:'var(--dim)',fontStyle:'italic',marginBottom:20}}>— 현장 증거를 클릭하여 단서를 수집하십시오. 총 {CASE.clues.length}개의 증거물이 있습니다.</p>
            <div className="clues-grid">{CASE.clues.map(clue => (<div key={clue.id} className={`clue-card ${foundClues.includes(clue.id) ? "found" : ""}`} onClick={() => handleClueClick(clue)}>{!foundClues.includes(clue.id) && <div className="clue-new">NEW</div>}<div className="clue-icon">{clue.icon}</div><div className="clue-title">{clue.title}</div><div className="clue-short">{clue.short}</div></div>))}</div>
          </div>
        )}
        {activeTab === "suspects" && (
          <div>
            <p style={{fontSize:12,color:'var(--dim)',fontStyle:'italic',marginBottom:20}}>— 심문하여 알리바이를 추궁하십시오. 확인된 단서가 많을수록 고발이 유리합니다.</p>
            <div className="suspects-list">{CASE.suspects.map(s => { const relClues = CASE.clues.filter(c => c.unlocks === s.id && foundClues.includes(c.id)); return (<div key={s.id} className="suspect-card"><div className="suspect-header"><div className="suspect-avatar">{s.avatar}</div><div><div className="suspect-name">{s.name}</div><div className="suspect-role">{s.role}</div></div></div><div className="suspect-info"><strong>알리바이:</strong> {s.alibi}</div>{relClues.length > 0 && (<div><div className="phase-label" style={{marginBottom:6}}>확보된 관련 단서</div><div className="suspect-clue-tags">{relClues.map(c => <span key={c.id} className="s-clue-tag">{c.icon} {c.title}</span>)}</div></div>)}<div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="interrogate-btn" onClick={() => setInterrogating(s)}>심문하기</button><button className="accuse-btn" onClick={() => handleAccuse(s)}>고발하기</button></div></div>); })}</div>
          </div>
        )}
        {activeTab === "notes" && (
          <div className="notes-panel"><div className="notes-title">📓 탐정 수첩</div>{foundClues.length === 0 ? <div className="note-empty">아직 수집된 단서가 없습니다.</div> : CASE.clues.filter(c => foundClues.includes(c.id)).map(c => (<div key={c.id} className="note-entry"><div className="note-clue">{c.icon} {c.title}</div><div className="note-detail">{c.detail}</div></div>))}</div>
        )}
      </div>
      {selectedClue && (<div className="modal-overlay" onClick={() => setSelectedClue(null)}><div className="modal-box" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedClue(null)}>✕</button><div className="modal-icon">{selectedClue.icon}</div><div className="modal-title">{selectedClue.title}</div><div className="modal-text">{selectedClue.detail}</div><div className="modal-note">✓ 수첩에 기록됨</div></div></div>)}
      {accuseTarget && (<div className="modal-overlay" onClick={() => setAccuseTarget(null)}><div className="modal-box confirm-modal" onClick={e => e.stopPropagation()}><div className="confirm-title">최종 고발</div><div style={{fontSize:13,color:'var(--dim)'}}>당신은 범인으로 지목합니다:</div><div className="confirm-name">{accuseTarget.avatar} {accuseTarget.name}</div><div className="confirm-text">틀릴 경우 기회가 차감됩니다. ({lives}회 남음)<br/>확신합니까?</div><div className="confirm-btns"><button className="btn-yes" onClick={confirmAccuse}>고발한다</button><button className="btn-no" onClick={() => setAccuseTarget(null)}>취소</button></div></div></div>)}
      {interrogating && (<div className="modal-overlay" onClick={() => setInterrogating(null)}><div className="modal-box interrogation-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setInterrogating(null)}>✕</button><div className="interro-header"><div style={{fontSize:32,marginBottom:8}}>{interrogating.avatar}</div><div className="interro-name">{interrogating.name}</div><div className="interro-role">{interrogating.role}</div></div><div className="chat-area scrollbar-custom">{(chatHistory[interrogating.id] || []).length === 0 && <div className="chat-msg" style={{color:'var(--dim)',fontStyle:'italic',fontSize:12}}>심문을 시작하십시오. 아래 질문을 선택하세요.</div>}{(chatHistory[interrogating.id] || []).map((m, i) => <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>)}{loading && <div className="chat-msg loading">...생각하는 중</div>}<div ref={chatEndRef} /></div><div className="question-list">{QUESTIONS[interrogating.id]?.map((q, i) => { const asked = (askedQuestions[interrogating.id] || []).includes(q); return (<button key={i} className={`q-btn ${asked ? "asked" : ""}`} disabled={asked || loading} onClick={() => handleQuestion(interrogating, q)}>{asked ? "✓ " : "▶ "}{q}</button>); })}</div></div></div>)}
    </div>
  );
}
