import React, { PointerEvent, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Theme = 'classic-gray' | 'meadow-blue' | 'atelier';
type AppId = 'agentroom' | 'uniplan' | 'documents' | 'notes' | 'terminal' | 'settings';

type WindowState = { id: AppId; z: number; x: number; y: number; minimized?: boolean };
type DragState = { id: AppId; startX: number; startY: number; originX: number; originY: number };

const apps: Record<AppId, { title: string; icon: string; accent: string; summary: string }> = {
  agentroom: { title: 'AI 동료 작업방', icon: '◇', accent: '#7dd3fc', summary: 'AgentRoom: AI 동료들과 프로젝트를 굴리는 작업방입니다.' },
  uniplan: { title: '계획 보드', icon: '▣', accent: '#a7f3d0', summary: 'UniPlan: 계획, 일정, 아이디어를 한 장의 보드로 모읍니다.' },
  documents: { title: '문서 서랍', icon: '▤', accent: '#fde68a', summary: 'Documents: 프로젝트 문서와 링크를 차곡차곡 넣어두는 서랍입니다.' },
  notes: { title: '작업 노트', icon: '✧', accent: '#f0abfc', summary: 'Notes: 빠른 메모와 오늘의 작업 흔적을 적어두는 노트입니다.' },
  terminal: { title: '시스템 로그', icon: '▸', accent: '#86efac', summary: 'Terminal: Eureka OS 상태와 빌드 로그를 보여줍니다.' },
  settings: { title: '분위기 설정', icon: '◌', accent: '#c4b5fd', summary: 'Settings: 테마와 데스크톱 분위기를 조절합니다.' },
};

const initialWindows: WindowState[] = [
  { id: 'terminal', z: 2, x: 12, y: 16 },
  { id: 'agentroom', z: 1, x: 38, y: 25 },
];

function App() {
  const [theme, setTheme] = useState<Theme>('classic-gray');
  const [windows, setWindows] = useState<WindowState[]>(initialWindows);
  const [startOpen, setStartOpen] = useState(false);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const maxZ = useMemo(() => Math.max(0, ...windows.map((w) => w.z)), [windows]);

  const openApp = (id: AppId) => {
    setWindows((current) => {
      const existing = current.find((w) => w.id === id);
      if (existing) {
        return current.map((w) => (w.id === id ? { ...w, minimized: false, z: maxZ + 1 } : w));
      }
      const offset = current.length * 5;
      return [...current, { id, z: maxZ + 1, x: 18 + offset, y: 18 + offset }];
    });
    setStartOpen(false);
  };

  const focusWindow = (id: AppId) => setWindows((current) => current.map((w) => (w.id === id ? { ...w, z: maxZ + 1 } : w)));
  const closeWindow = (id: AppId) => setWindows((current) => current.filter((w) => w.id !== id));
  const minimizeWindow = (id: AppId) => setWindows((current) => current.map((w) => (w.id === id ? { ...w, minimized: true } : w)));

  const beginDrag = (event: PointerEvent<HTMLElement>, win: WindowState) => {
    if ((event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging({ id: win.id, startX: event.clientX, startY: event.clientY, originX: win.x, originY: win.y });
    focusWindow(win.id);
  };

  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    if (!dragging) return;
    const dx = (event.clientX - dragging.startX) / window.innerWidth * 100;
    const dy = (event.clientY - dragging.startY) / window.innerHeight * 100;
    setWindows((current) => current.map((w) => w.id === dragging.id ? { ...w, x: Math.min(78, Math.max(12, dragging.originX + dx)), y: Math.min(72, Math.max(10, dragging.originY + dy)) } : w));
  };

  const endDrag = () => setDragging(null);

  return (
    <main className={`desktop theme-${theme}`}>
      <div className="wallpaper-grid" />
      <PixelOffice />
      <section className="hero-panel">
        <p className="eyebrow">EUREKA.PE.KR</p>
        <h1>Eureka OS</h1>
        <p>고라니의 프로젝트들을 한 화면에서 여는 레트로 AI 작업실.</p>
      </section>

      <div className="icons" aria-label="desktop apps">
        {(Object.keys(apps) as AppId[]).map((id) => (
          <button className="desktop-icon" key={id} onDoubleClick={() => openApp(id)} onClick={() => openApp(id)}>
            <span style={{ borderColor: apps[id].accent }}>{apps[id].icon}</span>
            <b>{apps[id].title}</b>
          </button>
        ))}
      </div>

      {windows.filter((w) => !w.minimized).map((win) => (
        <article
          className="window"
          key={win.id}
          style={{ zIndex: win.z, left: `${win.x}%`, top: `${win.y}%`, ['--accent' as string]: apps[win.id].accent }}
          onMouseDown={() => focusWindow(win.id)}
        >
          <header className="titlebar" onPointerDown={(event) => beginDrag(event, win)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
            <div><span>{apps[win.id].icon}</span>{apps[win.id].title}</div>
            <nav>
              <button onClick={() => minimizeWindow(win.id)}>_</button>
              <button onClick={() => closeWindow(win.id)}>×</button>
            </nav>
          </header>
          <WindowContent id={win.id} theme={theme} setTheme={setTheme} />
        </article>
      ))}

      <footer className="taskbar">
        <button className="start" onClick={() => setStartOpen((v) => !v)}>◆ Eureka</button>
        {startOpen && <StartMenu openApp={openApp} />}
        <div className="tasks">
          {windows.map((w) => <button key={w.id} onClick={() => openApp(w.id)}>{apps[w.id].title}</button>)}
        </div>
        <time>{new Date().toLocaleString('ko-KR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</time>
      </footer>
    </main>
  );
}


const agents = [
  { name: '과메기', role: 'PM / Boss', state: 'reviewing', avatar: '◆', className: 'pm' },
  { name: '수달', role: 'Builder', state: 'coding', avatar: '◈', className: 'builder' },
  { name: '산양', role: 'Research', state: 'researching', avatar: '△', className: 'research' },
  { name: '공작', role: 'Design', state: 'designing', avatar: '✦', className: 'design' },
  { name: '비버', role: 'Deploy', state: 'deploying', avatar: '▣', className: 'deploy' },
  { name: '고슴도치', role: 'Guard', state: 'guarding', avatar: '⬡', className: 'guard' },
];

function PixelOffice() {
  return <section className="pixel-office" aria-label="Eureka OS AI 작업실 배경">
    <div className="office-wall">
      <span className="neon-sign">Eureka OS · AI 작업실</span>
      <span className="clock">18:34</span>
      <span className="shelf shelf-a" />
      <span className="shelf shelf-b" />
    </div>
    <div className="floor-rug" />
    <div className="meeting-table"><span>sync</span></div>
    <div className="sofa" />
    <div className="plant plant-a" />
    <div className="plant plant-b" />
    <div className="server-rack"><i /><i /><i /><b /></div>
    {agents.map((agent) => <div className={`agent-desk ${agent.className}`} key={agent.name}>
      <div className="desk-top"><span className="monitor" /><span className="keyboard" /></div>
      <div className="agent-avatar">{agent.avatar}</div>
      <div className="agent-label"><strong>{agent.name}</strong><small>{agent.role}</small><em>{agent.state}</em></div>
    </div>)}
  </section>;
}

const launcherActions: Record<AppId, string> = {
  agentroom: '작업방 열기',
  uniplan: '계획 보기',
  documents: '문서 서랍',
  notes: '작업 로그',
  terminal: '시스템 로그',
  settings: '테마 바꾸기',
};

function StartMenu({ openApp }: { openApp: (id: AppId) => void }) {
  return <aside className="start-menu">
    <strong>Eureka Launcher</strong>
    <p>오늘 열 작업을 고르세요</p>
    {(Object.keys(apps) as AppId[]).map((id) => <button key={id} onClick={() => openApp(id)}><span>{apps[id].icon}</span>{launcherActions[id]}</button>)}
  </aside>;
}

function WindowContent({ id, theme, setTheme }: { id: AppId; theme: Theme; setTheme: (theme: Theme) => void }) {
  if (id === 'settings') return <div className="content"><h2>분위기 설정</h2><p>상표/로고 복제 없이 Eureka OS 자체 레트로 작업실 톤으로 구성했습니다.</p><div className="theme-picker">{(['classic-gray','meadow-blue','atelier'] as Theme[]).map((item) => <button className={theme === item ? 'active' : ''} onClick={() => setTheme(item)} key={item}>{item}</button>)}</div></div>;
  if (id === 'terminal') return <div className="content terminal"><p>$ boot eureka-os</p><p>status: local MVP ready</p><p>stack: React + Vite + custom UI</p><p>domain: os.eureka.pe.kr</p><p>note: os 전용 Caddy 호스트로 배포 대기</p></div>;
  if (id === 'documents') return <div className="content"><h2>문서 서랍</h2><ul><li>프로젝트 링크 허브</li><li>릴리즈 노트</li><li>운영 문서</li></ul></div>;
  if (id === 'notes') return <div className="content"><h2>작업 노트</h2><textarea defaultValue={'오늘의 작업\n- Eureka OS MVP 생성\n- GitHub repo 준비\n- os.eureka.pe.kr 배포 확인'} /></div>;
  return <div className="content"><h2>{apps[id].title}</h2><p>{apps[id].summary}</p><div className="card-row"><div>Launch</div><div>Docs</div><div>Status</div></div></div>;
}

createRoot(document.getElementById('root')!).render(<App />);
