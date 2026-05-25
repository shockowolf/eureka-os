import React, { ChangeEvent, PointerEvent, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Theme = 'classic-gray' | 'meadow-blue' | 'atelier';
type AppId = 'agentroom' | 'uniplan' | 'documents' | 'notes' | 'gamelab' | 'terminal' | 'settings';

type WindowState = { id: AppId; z: number; x: number; y: number; minimized?: boolean; maximized?: boolean };
type DragState = { id: AppId; startX: number; startY: number; originX: number; originY: number };
type GameRegistryItem = { id: string; title: string; license: string; status: string; bundlePath?: string; notes?: string };

const apps: Record<AppId, { title: string; icon: string; accent: string; summary: string }> = {
  agentroom: { title: 'AI 동료 작업방', icon: '◇', accent: '#7dd3fc', summary: 'AgentRoom: 과메기, 수달, 산양과 프로젝트를 굴리는 작업방입니다.' },
  uniplan: { title: '계획 보드', icon: '▣', accent: '#a7f3d0', summary: 'UniPlan: 계획, 일정, 아이디어를 한 장의 보드로 모읍니다.' },
  documents: { title: '문서 서랍', icon: '▤', accent: '#fde68a', summary: 'Documents: 프로젝트 문서와 운영 링크를 차곡차곡 넣어두는 서랍입니다.' },
  notes: { title: '작업 노트', icon: '✧', accent: '#f0abfc', summary: 'Notes: 빠른 메모와 오늘의 작업 흔적을 브라우저에 저장합니다.' },
  gamelab: { title: 'Game Lab', icon: '▦', accent: '#fb7185', summary: '권리 확인된 js-dos 번들만 등록해 실행하는 레트로 게임 연구실입니다.' },
  terminal: { title: '시스템 로그', icon: '▸', accent: '#86efac', summary: 'Terminal: Eureka OS 상태와 빌드 로그를 보여줍니다.' },
  settings: { title: '분위기 설정', icon: '◌', accent: '#c4b5fd', summary: 'Settings: 테마와 데스크톱 분위기를 조절합니다.' },
};

const initialWindows: WindowState[] = [
  { id: 'terminal', z: 2, x: 12, y: 16 },
  { id: 'agentroom', z: 1, x: 38, y: 25 },
];

const defaultNote = '오늘의 작업\n- Eureka OS 반응형 정리\n- Game Lab 안전 구조 보강\n- os.eureka.pe.kr 배포 상태 확인';

function App() {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('eureka-theme') as Theme) || 'classic-gray');
  const [windows, setWindows] = useState<WindowState[]>(initialWindows);
  const [startOpen, setStartOpen] = useState(false);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [now, setNow] = useState(() => new Date());
  const maxZ = useMemo(() => Math.max(0, ...windows.map((w) => w.z)), [windows]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem('eureka-theme', next);
  };

  const openApp = (id: AppId) => {
    setWindows((current) => {
      const top = Math.max(0, ...current.map((w) => w.z));
      const existing = current.find((w) => w.id === id);
      if (existing) return current.map((w) => (w.id === id ? { ...w, minimized: false, z: top + 1 } : w));
      const offset = current.length * 5;
      return [...current, { id, z: top + 1, x: 18 + offset, y: 18 + offset }];
    });
    setStartOpen(false);
  };

  const focusWindow = (id: AppId) => setWindows((current) => {
    const top = Math.max(0, ...current.map((w) => w.z));
    return current.map((w) => (w.id === id ? { ...w, z: top + 1 } : w));
  });
  const closeWindow = (id: AppId) => setWindows((current) => current.filter((w) => w.id !== id));
  const minimizeWindow = (id: AppId) => setWindows((current) => current.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  const toggleMaximize = (id: AppId) => setWindows((current) => current.map((w) => (w.id === id ? { ...w, maximized: !w.maximized, minimized: false, z: maxZ + 1 } : w)));

  const beginDrag = (event: PointerEvent<HTMLElement>, win: WindowState) => {
    if (win.maximized || (event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging({ id: win.id, startX: event.clientX, startY: event.clientY, originX: win.x, originY: win.y });
    focusWindow(win.id);
  };

  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    if (!dragging) return;
    const dx = ((event.clientX - dragging.startX) / window.innerWidth) * 100;
    const dy = ((event.clientY - dragging.startY) / window.innerHeight) * 100;
    setWindows((current) => current.map((w) => w.id === dragging.id ? { ...w, x: Math.min(78, Math.max(8, dragging.originX + dx)), y: Math.min(72, Math.max(8, dragging.originY + dy)) } : w));
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
          className={`window ${win.maximized ? 'maximized' : ''}`}
          key={win.id}
          style={{ zIndex: win.z, left: `${win.x}%`, top: `${win.y}%`, ['--accent' as string]: apps[win.id].accent }}
          onMouseDown={() => focusWindow(win.id)}
        >
          <header className="titlebar" onPointerDown={(event) => beginDrag(event, win)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
            <div><span>{apps[win.id].icon}</span>{apps[win.id].title}</div>
            <nav>
              <button aria-label="minimize" onClick={() => minimizeWindow(win.id)}>_</button>
              <button aria-label="maximize" onClick={() => toggleMaximize(win.id)}>□</button>
              <button aria-label="close" onClick={() => closeWindow(win.id)}>×</button>
            </nav>
          </header>
          <WindowContent id={win.id} theme={theme} setTheme={setTheme} openApp={openApp} />
        </article>
      ))}

      <footer className="taskbar">
        <button className="start" onClick={() => setStartOpen((v) => !v)}>◆ Eureka</button>
        {startOpen && <StartMenu openApp={openApp} />}
        <div className="tasks">
          {windows.map((w) => <button className={w.minimized ? 'is-minimized' : ''} key={w.id} onClick={() => openApp(w.id)}>{apps[w.id].title}</button>)}
        </div>
        <time>{now.toLocaleString('ko-KR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</time>
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
      <span className="clock">LIVE</span>
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
  gamelab: '게임 연구실',
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

function WindowContent({ id, theme, setTheme, openApp }: { id: AppId; theme: Theme; setTheme: (theme: Theme) => void; openApp: (id: AppId) => void }) {
  if (id === 'settings') return <Settings theme={theme} setTheme={setTheme} />;
  if (id === 'terminal') return <Terminal />;
  if (id === 'documents') return <Documents openApp={openApp} />;
  if (id === 'notes') return <Notes />;
  if (id === 'gamelab') return <GameLab />;
  if (id === 'agentroom') return <WorkspaceApp id={id} openApp={openApp} actions={[['계획 보드 열기', 'uniplan'], ['작업 노트 열기', 'notes'], ['시스템 로그 보기', 'terminal']]} />;
  if (id === 'uniplan') return <WorkspaceApp id={id} openApp={openApp} actions={[['문서 서랍 열기', 'documents'], ['작업 노트 열기', 'notes'], ['분위기 설정', 'settings']]} />;
  return null;
}

function Settings({ theme, setTheme }: { theme: Theme; setTheme: (theme: Theme) => void }) {
  return <div className="content"><h2>분위기 설정</h2><p>상표/로고 복제 없이 Eureka OS 자체 레트로 작업실 톤으로 구성했습니다. 선택한 테마는 이 브라우저에 저장됩니다.</p><div className="theme-picker">{(['classic-gray','meadow-blue','atelier'] as Theme[]).map((item) => <button className={theme === item ? 'active' : ''} onClick={() => setTheme(item)} key={item}>{item}</button>)}</div></div>;
}

type SystemLog = { updatedAt: string; status: string; entries: { time: string; level: string; message: string }[]; nextActions: string[] };

function Terminal() {
  const [log, setLog] = useState<SystemLog | null>(null);
  useEffect(() => {
    fetch('/system-log.json')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setLog(data))
      .catch(() => setLog(null));
  }, []);

  return <div className="content terminal"><p>$ boot eureka-os</p><p>status: responsive workspace ready</p><p>stack: React + Vite + custom UI</p><p>domain: os.eureka.pe.kr</p><p>github: shockowolf/eureka-os</p><p>game-lab: safe registry shell enabled</p><hr />{log ? <><p>system-log: {log.updatedAt} · {log.status}</p>{log.entries.map((entry) => <p key={entry.time + entry.message}>[{entry.level}] {entry.time} — {entry.message}</p>)}<p>next: {log.nextActions.join(' / ')}</p></> : <p>system-log: loading or unavailable</p>}</div>;
}

function Documents({ openApp }: { openApp: (id: AppId) => void }) {
  return <div className="content"><h2>문서 서랍</h2><ul><li>README: 프로젝트 개요와 독립 브랜드 고지</li><li>DEPLOYMENT: os.eureka.pe.kr 전용 배포 절차</li><li>GAME_LAB: 게임 번들 등록 정책</li></ul><div className="card-row"><button onClick={() => openApp('gamelab')}>Game Lab 정책</button><button onClick={() => openApp('terminal')}>상태 확인</button><button onClick={() => openApp('notes')}>작업 노트</button></div></div>;
}

function Notes() {
  const [note, setNote] = useState(() => localStorage.getItem('eureka-notes') || defaultNote);
  const [saved, setSaved] = useState('저장됨');
  const save = (next: string) => {
    setNote(next);
    localStorage.setItem('eureka-notes', next);
    setSaved('저장됨');
  };
  const reset = () => save(defaultNote);
  return <div className="content"><h2>작업 노트</h2><p className="fine-print">브라우저 localStorage에 저장됩니다.</p><textarea value={note} onChange={(event) => { setSaved('수정 중'); save(event.target.value); }} /><div className="note-actions"><span>{saved}</span><button onClick={reset}>기본 노트로 초기화</button></div></div>;
}

function WorkspaceApp({ id, openApp, actions }: { id: AppId; openApp: (id: AppId) => void; actions: [string, AppId][] }) {
  return <div className="content"><h2>{apps[id].title}</h2><p>{apps[id].summary}</p><div className="card-row">{actions.map(([label, target]) => <button key={label} onClick={() => openApp(target)}>{label}</button>)}</div></div>;
}

function GameLab() {
  const [registry, setRegistry] = useState<GameRegistryItem[]>([]);
  const [bundleName, setBundleName] = useState('선택된 번들 없음');

  useEffect(() => {
    fetch('/games/registry.json')
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setRegistry(Array.isArray(data) ? data : data.games || []))
      .catch(() => setRegistry([]));
  }, []);

  const onBundle = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setBundleName(file ? `${file.name} · 로컬 선택 완료` : '선택된 번들 없음');
  };

  return <div className="content game-lab">
    <h2>Game Lab</h2>
    <p>권리 확인된 DOS/js-dos 번들만 안전하게 등록하는 Eureka OS 자체 레트로 게임 연구실입니다.</p>
    <div className="game-toolbar">
      <label className="file-slot">내 js-dos 번들 선택<input type="file" accept=".jsdos,.zip" onChange={onBundle} /></label>
      <span>{bundleName}</span>
    </div>
    <div className="game-slots">
      <article><strong>Owned Bundle Slot</strong><span>/public/games/my-game.jsdos</span><em>사용자 보유/직접 제공 파일</em></article>
      <article><strong>Registry JSON</strong><span>/public/games/registry.json</span><em>public-license · homebrew · shareware</em></article>
      <article><strong>Runner Status</strong><span>실행기는 검증된 번들 추가 시 연결</span><em>safe shell ready</em></article>
    </div>
    <h3>Registry</h3>
    <div className="registry-list">
      {registry.length ? registry.map((game) => <article key={game.id}><strong>{game.title}</strong><span>{game.license} · {game.status}</span><small>{game.bundlePath || game.notes || 'bundle pending'}</small></article>) : <p className="fine-print">registry를 불러올 항목이 아직 없습니다.</p>}
    </div>
    <p className="fine-print">ROM/상용 게임 번들은 repo에 포함하지 않습니다. 직접 권리를 가진 번들만 연결하세요.</p>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App />);
