import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Theme = 'atelier' | 'retro95' | 'glass';
type AppId = 'agentroom' | 'uniplan' | 'documents' | 'notes' | 'terminal' | 'settings';

type WindowState = { id: AppId; z: number; x: number; y: number; minimized?: boolean };

const apps: Record<AppId, { title: string; icon: string; accent: string; summary: string }> = {
  agentroom: { title: 'AgentRoom', icon: '◇', accent: '#7dd3fc', summary: 'AI 동료들과 프로젝트를 굴리는 작업방입니다.' },
  uniplan: { title: 'UniPlan', icon: '▣', accent: '#a7f3d0', summary: '계획, 일정, 아이디어를 하나의 보드로 모읍니다.' },
  documents: { title: 'Documents', icon: '▤', accent: '#fde68a', summary: '프로젝트 문서와 링크를 정리하는 서랍입니다.' },
  notes: { title: 'Notes', icon: '✧', accent: '#f0abfc', summary: '빠른 메모와 작업 로그를 적어두는 노트입니다.' },
  terminal: { title: 'About Terminal', icon: '▸', accent: '#86efac', summary: 'Eureka OS 상태와 빌드 정보를 보여줍니다.' },
  settings: { title: 'Settings', icon: '◌', accent: '#c4b5fd', summary: '테마와 데스크톱 분위기를 조절합니다.' },
};

const initialWindows: WindowState[] = [
  { id: 'terminal', z: 2, x: 12, y: 16 },
  { id: 'agentroom', z: 1, x: 38, y: 25 },
];

function App() {
  const [theme, setTheme] = useState<Theme>('atelier');
  const [windows, setWindows] = useState<WindowState[]>(initialWindows);
  const [startOpen, setStartOpen] = useState(false);
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

  return (
    <main className={`desktop theme-${theme}`}>
      <div className="wallpaper-grid" />
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
          <header className="titlebar">
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
        <time>{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</time>
      </footer>
    </main>
  );
}

function StartMenu({ openApp }: { openApp: (id: AppId) => void }) {
  return <aside className="start-menu">
    <strong>Eureka Launcher</strong>
    {(Object.keys(apps) as AppId[]).map((id) => <button key={id} onClick={() => openApp(id)}><span>{apps[id].icon}</span>{apps[id].title}</button>)}
  </aside>;
}

function WindowContent({ id, theme, setTheme }: { id: AppId; theme: Theme; setTheme: (theme: Theme) => void }) {
  if (id === 'settings') return <div className="content"><h2>Theme Lab</h2><p>상표/로고 복제 없이 자체 레트로 톤으로 구성했습니다.</p><div className="theme-picker">{(['atelier','retro95','glass'] as Theme[]).map((item) => <button className={theme === item ? 'active' : ''} onClick={() => setTheme(item)} key={item}>{item}</button>)}</div></div>;
  if (id === 'terminal') return <div className="content terminal"><p>$ boot eureka-os</p><p>status: local MVP ready</p><p>stack: React + Vite + CSS windows</p><p>domain: os.eureka.pe.kr</p><p>note: HTTPS host 설정 확인 필요</p></div>;
  if (id === 'documents') return <div className="content"><h2>Documents</h2><ul><li>프로젝트 링크 허브</li><li>릴리즈 노트</li><li>운영 문서</li></ul></div>;
  if (id === 'notes') return <div className="content"><h2>Scratchpad</h2><textarea defaultValue={'오늘의 작업\n- Eureka OS MVP 생성\n- GitHub repo 준비\n- Caddy 배포 확인'} /></div>;
  return <div className="content"><h2>{apps[id].title}</h2><p>{apps[id].summary}</p><div className="card-row"><div>Launch</div><div>Docs</div><div>Status</div></div></div>;
}

createRoot(document.getElementById('root')!).render(<App />);
