import React, { ChangeEvent, PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

import type { AppId, DosLauncher, DosPlayer, DragState, GameRegistryItem, Theme, WindowState } from './types';
import {
  agentCards,
  agentRoomMessages,
  agentRoomRooms,
  appOrder,
  apps,
  defaultNote,
  initialWindows,
  launcherActions,
  projectLinks,
  workCards,
} from './data';

declare global {
  interface Window { Dos?: DosLauncher }
}

const openExternal = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

function App() {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('eureka-theme') as Theme) || 'classic-gray');
  const [windows, setWindows] = useState<WindowState[]>(initialWindows);
  const [startOpen, setStartOpen] = useState(false);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [now, setNow] = useState(() => new Date());
  const maxZ = useMemo(() => Math.max(0, ...windows.map((w) => w.z)), [windows]);
  const focusedWindow = useMemo(() => windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0], [windows]);

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

  // Global shortcuts keep the retro desktop usable without relying only on pointer interactions.
  // Editable controls are ignored so notes/file inputs do not lose normal keyboard behavior.
  useEffect(() => {
    const isEditable = (target: EventTarget | null) => target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (isEditable(event.target)) return;
      const modifier = event.metaKey || event.ctrlKey;

      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setStartOpen((value) => !value);
        return;
      }

      if (event.key === 'Escape') {
        if (startOpen) {
          event.preventDefault();
          setStartOpen(false);
        }
        return;
      }

      if (event.altKey && /^[1-7]$/.test(event.key)) {
        event.preventDefault();
        openApp(appOrder[Number(event.key) - 1]);
        return;
      }

      if (!focusedWindow || !modifier) return;
      if (event.key.toLowerCase() === 'w') {
        event.preventDefault();
        closeWindow(focusedWindow.id);
      } else if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        minimizeWindow(focusedWindow.id);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        toggleMaximize(focusedWindow.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusedWindow, startOpen, maxZ]);

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
        {appOrder.map((id, index) => (
          <button className="desktop-icon" key={id} aria-label={`${apps[id].title} 열기, Alt+${index + 1}`} title={`Alt+${index + 1}`} onDoubleClick={() => openApp(id)} onClick={() => openApp(id)}>
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
        <button className="start" aria-expanded={startOpen} aria-haspopup="menu" title="Ctrl/⌘+K" onClick={() => setStartOpen((v) => !v)}>◆ Eureka</button>
        {startOpen && <StartMenu openApp={openApp} />}
        <div className="tasks">
          {windows.map((w) => <button className={w.minimized ? 'is-minimized' : ''} key={w.id} aria-label={`${apps[w.id].title} ${w.minimized ? '복원' : '앞으로 가져오기'}`} onClick={() => openApp(w.id)}>{apps[w.id].title}</button>)}
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

function StartMenu({ openApp }: { openApp: (id: AppId) => void }) {
  return <aside className="start-menu" role="menu">
    <strong>Eureka Launcher</strong>
    <p>오늘 열 작업을 고르세요 · Alt+1~7</p>
    {appOrder.map((id, index) => <button role="menuitem" key={id} onClick={() => openApp(id)}><span>{apps[id].icon}</span>{launcherActions[id]}<small>Alt+{index + 1}</small></button>)}
  </aside>;
}

function WindowContent({ id, theme, setTheme, openApp }: { id: AppId; theme: Theme; setTheme: (theme: Theme) => void; openApp: (id: AppId) => void }) {
  if (id === 'settings') return <Settings theme={theme} setTheme={setTheme} />;
  if (id === 'terminal') return <Terminal />;
  if (id === 'documents') return <Documents openApp={openApp} />;
  if (id === 'notes') return <Notes />;
  if (id === 'gamelab') return <GameLab />;
  if (id === 'agentroom') return <AgentRoomApp openApp={openApp} />;
  if (id === 'uniplan') return <UniPlanApp openApp={openApp} />;
  return null;
}

function Settings({ theme, setTheme }: { theme: Theme; setTheme: (theme: Theme) => void }) {
  return <div className="content"><h2>분위기 설정</h2><p>상표/로고 복제 없이 Eureka OS 자체 레트로 작업실 톤으로 구성했습니다. 선택한 테마는 이 브라우저에 저장됩니다.</p><div className="theme-picker">{(['classic-gray','meadow-blue','atelier'] as Theme[]).map((item) => <button className={theme === item ? 'active' : ''} onClick={() => setTheme(item)} key={item}>{item}</button>)}</div></div>;
}

function Terminal() {
  return <div className="content terminal"><p>$ boot eureka-os</p><p>status: responsive workspace ready</p><p>stack: React + Vite + custom UI</p><p>domain: os.eureka.pe.kr</p><p>github: shockowolf/eureka-os</p><p>game-lab: safe registry shell enabled</p><hr /><p>shortcuts: Ctrl/⌘+K launcher · Alt+1~7 apps</p><p>window: Ctrl/⌘+Enter maximize · Ctrl/⌘+M minimize · Ctrl/⌘+W close</p><p>session-log: disabled</p><p>notes: Telegram/session workaround artifacts were removed.</p></div>;
}

function Documents({ openApp }: { openApp: (id: AppId) => void }) {
  return <div className="content"><h2>문서 서랍</h2><ul><li>README: 프로젝트 개요와 독립 브랜드 고지</li><li>DEPLOYMENT: os.eureka.pe.kr 전용 배포 절차</li><li>GAME_LAB: 게임 번들 등록 정책</li></ul><QuickLinks /><div className="card-row"><button onClick={() => openApp('gamelab')}>Game Lab 정책</button><button onClick={() => openApp('terminal')}>상태 확인</button><button onClick={() => openApp('notes')}>작업 노트</button></div></div>;
}

function QuickLinks() {
  return <section className="quick-links" aria-label="project quick links">
    <h3>바로가기</h3>
    <div className="quick-link-grid">
      {projectLinks.map((link) => <button key={link.url} onClick={() => openExternal(link.url)}>
        <strong>{link.label}</strong>
        <span>{link.description}</span>
        <small>{link.url.replace('https://', '')}</small>
      </button>)}
    </div>
  </section>;
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

function AgentRoomApp({ openApp }: { openApp: (id: AppId) => void }) {
  const [roomId, setRoomId] = useState('team');
  const currentRoom = agentRoomRooms.find((room) => room.id === roomId) || agentRoomRooms[0];

  return <div className="content agentroom-app"><h2>{apps.agentroom.title}</h2><p>{apps.agentroom.summary}</p>
    <section className="agentroom-shell">
      <aside className="agentroom-rooms" aria-label="Agent Room rooms">
        {agentRoomRooms.map((room) => <button className={room.id === roomId ? 'active' : ''} key={room.id} onClick={() => setRoomId(room.id)}><strong>{room.name}</strong><span>{room.meta}</span></button>)}
      </aside>
      <main className="agentroom-chat">
        <header><strong>{currentRoom.name}</strong><span>{currentRoom.meta}</span></header>
        <div className="agentroom-messages">
          {agentRoomMessages.map((message, index) => <article className={message.author === '고라니' ? 'from-user' : ''} key={index}><b>{message.author}</b><em>{message.role}</em><p>{message.body}</p></article>)}
        </div>
        <div className="agentroom-composer"><span>팀 모드 안건 입력</span><button onClick={() => openApp('notes')}>작업 노트로 보내기</button></div>
      </main>
      <aside className="agentroom-agents" aria-label="active agents">
        {agentCards.map((agent) => <article key={agent.name} style={{ ['--card-accent' as string]: agent.accent }}><strong>{agent.name}</strong><span>{agent.role}</span><em>{agent.status}</em></article>)}
      </aside>
    </section>
    <div className="handoff-strip"><b>운영 방식</b><span>긴 대화는 3000자 전후로 문맥 분할 · 긴 작업은 파일 인계 · 공개 전송은 확인 후 진행</span></div>
    <div className="card-row"><button onClick={() => openApp('uniplan')}>계획 보드 열기</button><button onClick={() => openApp('notes')}>작업 노트 열기</button><button onClick={() => openApp('terminal')}>시스템 상태 보기</button></div></div>;
}

function UniPlanApp({ openApp }: { openApp: (id: AppId) => void }) {
  return <div className="content"><h2>{apps.uniplan.title}</h2><p>UniPlan과 ERP 복구/데모 환경을 한 번에 여는 작업 보드입니다.</p><div className="work-grid">{workCards.map((card) => <article key={card.title}><div><strong>{card.title}</strong><em>{card.status}</em></div><p>{card.description}</p><button onClick={() => openExternal(card.url)}>{card.linkLabel}</button></article>)}</div><div className="card-row"><button onClick={() => openApp('documents')}>문서 서랍 열기</button><button onClick={() => openApp('notes')}>작업 노트 열기</button><button onClick={() => openApp('settings')}>분위기 설정</button></div></div>;
}

function GameLab() {
  const [registry, setRegistry] = useState<GameRegistryItem[]>([]);
  const [bundleFile, setBundleFile] = useState<File | null>(null);
  const [dosReady, setDosReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [runnerMessage, setRunnerMessage] = useState('js-dos 실행기를 준비 중입니다.');
  const dosRootRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<DosPlayer | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Stop the running emulator and release the object URL so local game files never linger in memory.
  const stopGame = useCallback(async () => {
    if (playerRef.current?.stop) await playerRef.current.stop();
    playerRef.current = null;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    fetch('/games/registry.json')
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setRegistry(Array.isArray(data) ? data : data.bundles || data.games || []))
      .catch(() => setRegistry([]));
  }, []);

  // js-dos is shipped as static browser assets under /public.
  // That keeps Vite bundling simple and makes the WASM/emulator paths explicit for Caddy/static hosting.
  useEffect(() => {
    const cssId = 'js-dos-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = '/js-dos/js-dos.css';
      document.head.appendChild(link);
    }

    if (window.Dos) {
      setDosReady(true);
      setRunnerMessage('js-dos 실행기 준비 완료. 로컬 .jsdos 파일을 선택하세요.');
      return () => { void stopGame(); };
    }

    const script = document.createElement('script');
    script.src = '/js-dos/js-dos.js';
    script.async = true;
    script.onload = () => {
      setDosReady(Boolean(window.Dos));
      setRunnerMessage(window.Dos ? 'js-dos 실행기 준비 완료. 로컬 .jsdos 파일을 선택하세요.' : 'js-dos 실행기를 찾지 못했습니다.');
    };
    script.onerror = () => setRunnerMessage('js-dos 실행기 로드에 실패했습니다.');
    document.body.appendChild(script);

    return () => { void stopGame(); };
  }, [stopGame]);

  const onBundleSelect = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    void stopGame();
    setBundleFile(file);
    setRunnerMessage(file ? `${file.name} 선택됨. 서버 업로드 없이 이 브라우저에서만 실행합니다.` : '선택된 번들이 없습니다.');
  }, [stopGame]);

  // Local-only execution: createObjectURL lets js-dos read the selected bundle without uploading it.
  // IndexedDB persistence can be added later, but the first MVP intentionally requires explicit selection.
  const startGame = useCallback(async () => {
    if (!bundleFile || !dosRootRef.current || !window.Dos) return;
    await stopGame();
    dosRootRef.current.innerHTML = '';
    const objectUrl = URL.createObjectURL(bundleFile);
    objectUrlRef.current = objectUrl;
    setIsPlaying(true);
    setRunnerMessage('로컬 번들을 실행 중입니다. 파일은 서버로 업로드되지 않습니다.');
    playerRef.current = window.Dos(dosRootRef.current, {
      url: objectUrl,
      pathPrefix: '/emulators/',
      noCloud: true,
      noNetworking: true,
      autoStart: true,
    });
  }, [bundleFile, stopGame]);

  return <div className="content game-lab">
    <h2>Game Lab</h2>
    <p>사용자가 직접 고른 js-dos 번들을 서버 업로드 없이 브라우저에서 실행하는 로컬 게임 런처입니다.</p>

    <div className="local-runner-note"><b>Local-only mode</b><span> 게임 파일은 파일 선택창으로만 읽고, Eureka OS 서버에는 저장하지 않습니다.</span></div>

    <div className="game-toolbar">
      <label className="file-slot">로컬 js-dos 번들 선택<input type="file" accept=".jsdos,.zip" onChange={onBundleSelect} /></label>
      <span>{bundleFile ? `${bundleFile.name} · 로컬 선택 완료` : '선택된 번들 없음'}</span>
      <button disabled={!bundleFile || !dosReady || isPlaying} onClick={startGame}>로컬 실행</button>
      <button disabled={!isPlaying} onClick={stopGame}>종료</button>
    </div>

    <div className="dos-container" ref={dosRootRef}>
      {!isPlaying && <div className="dos-placeholder"><strong>js-dos player</strong><span>{runnerMessage}</span></div>}
    </div>

    <div className="game-slots">
      <article><strong>File source</strong><span>브라우저 파일 선택</span><em>no upload</em></article>
      <article><strong>Storage</strong><span>현재 MVP는 매번 선택 방식</span><em>IndexedDB next</em></article>
      <article><strong>Runner</strong><span>{dosReady ? 'js-dos ready' : 'loading js-dos'}</span><em>{dosReady ? 'ready' : 'loading'}</em></article>
    </div>

    <h3>Registry</h3>
    <div className="registry-list">
      {registry.length ? registry.map((game) => <article key={game.id}><strong>{game.title}</strong><span>{game.license} · {game.status}</span><small>{game.bundlePath || game.notes || 'bundle pending'}</small></article>) : <p className="fine-print">registry를 불러올 항목이 아직 없습니다.</p>}
    </div>
    <p className="fine-print">ROM/상용 게임 번들은 repo에 포함하지 않습니다. 직접 권리를 가진 번들만 연결하세요.</p>
  </div>;
}

createRoot(document.getElementById('root')!).render(<App />);
