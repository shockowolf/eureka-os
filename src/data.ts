import type { AgentCard, AgentRoomMessage, AgentRoomRoom, AppId, AppMeta, LinkTarget, WindowState, WorkCard } from './types';

// Static product metadata for the desktop shell. Dynamic/runtime state should stay in components.
export const apps: Record<AppId, AppMeta> = {
  agentroom: { title: 'Agent Room', icon: '◇', accent: '#7dd3fc', summary: 'Agent Room: 과메기, 수달, 산양과 프로젝트를 굴리는 작업방입니다.' },
  uniplan: { title: '계획 보드', icon: '▣', accent: '#a7f3d0', summary: 'UniPlan: 계획, 일정, 아이디어를 한 장의 보드로 모읍니다.' },
  documents: { title: '문서 서랍', icon: '▤', accent: '#fde68a', summary: 'Documents: 프로젝트 문서와 운영 링크를 차곡차곡 넣어두는 서랍입니다.' },
  notes: { title: '작업 노트', icon: '✧', accent: '#f0abfc', summary: 'Notes: 빠른 메모와 오늘의 작업 흔적을 브라우저에 저장합니다.' },
  gamelab: { title: 'Game Lab', icon: '▦', accent: '#fb7185', summary: '권리 확인된 js-dos 번들만 등록해 실행하는 레트로 게임 연구실입니다.' },
  terminal: { title: '시스템 로그', icon: '▸', accent: '#86efac', summary: 'Terminal: Eureka OS 상태와 빌드 로그를 보여줍니다.' },
  settings: { title: '분위기 설정', icon: '◌', accent: '#c4b5fd', summary: 'Settings: 테마와 데스크톱 분위기를 조절합니다.' },
};

export const appOrder = Object.keys(apps) as AppId[];

// Initial boot layout: open status + Agent Room so the page immediately feels alive.
export const initialWindows: WindowState[] = [
  { id: 'terminal', z: 2, x: 12, y: 16 },
  { id: 'agentroom', z: 1, x: 38, y: 25 },
];

export const defaultNote = '오늘의 작업\n- Eureka OS 반응형 정리\n- Game Lab 안전 구조 보강\n- os.eureka.pe.kr 배포 상태 확인';

// External links are opened with noopener/noreferrer in main.tsx; do not put secrets here.
export const projectLinks: LinkTarget[] = [
  { label: 'Eureka OS', url: 'https://os.eureka.pe.kr/', description: '레트로 AI 작업실 메인' },
  { label: 'Eureka Growth', url: 'https://eureka.pe.kr/', description: '메인 랜딩 페이지' },
  { label: 'UniPlan Demo', url: 'https://uniplan.eureka.pe.kr/demo', description: '안정 배포된 AI DB 조회 데모' },
  { label: 'UniPlan Test', url: 'https://test.eureka.pe.kr/demo', description: '진행 중인 개발/검수용 데모' },
  { label: 'ERP1 easiErp', url: 'https://erp1.eureka.pe.kr/', description: 'easiErp 복구/테스트 환경' },
  { label: 'ERP2 gootzERP', url: 'https://erp2.eureka.pe.kr/', description: 'gootzERP 복구/테스트 환경' },
];

export const agentCards: AgentCard[] = [
  { name: '과메기', role: 'PM / 통합', status: '작업 흐름 정리', next: '큰 작업은 짧은 인계와 검증 결과로 묶기', accent: '#7dd3fc' },
  { name: '수달', role: '코딩 / 패치', status: '구현 대기', next: 'UI 기능·버그수정·빌드 검증', accent: '#a7f3d0' },
  { name: '산양', role: '리서치 / 검토', status: '조사 대기', next: '시장/정책/기술 근거 확인', accent: '#fde68a' },
  { name: '공작', role: 'UI / 브랜드', status: '디자인 감각 보정', next: '레트로 감성은 살리고 가독성 유지', accent: '#f0abfc' },
];

export const workCards: WorkCard[] = [
  { title: '안정 Demo', status: 'public', description: '말로 DB를 조회하는 UniPlan 공개 데모.', linkLabel: 'demo 열기', url: 'https://uniplan.eureka.pe.kr/demo' },
  { title: '입력 화면', status: 'public', description: '거래처/품목/청구 입력 MVP.', linkLabel: 'input 열기', url: 'https://uniplan.eureka.pe.kr/input' },
  { title: '개발 Test', status: 'dev', description: '진행 중인 변경은 이쪽에서 먼저 검수.', linkLabel: 'test 열기', url: 'https://test.eureka.pe.kr/demo' },
  { title: 'ERP 복구', status: 'ops', description: 'ERP1/ERP2 운영 복구 상태 확인용.', linkLabel: 'ERP1 열기', url: 'https://erp1.eureka.pe.kr/' },
];

// Agent Room preview data mirrors the real mobile AgentRoom concept without requiring backend wiring yet.
export const agentRoomRooms: AgentRoomRoom[] = [
  { id: 'team', name: 'AgentRoom 전략실', meta: '단체방 · 10라운드 프로토콜' },
  { id: 'gwamegi', name: '과메기', meta: '1:1 · PM / 통합' },
  { id: 'sudal', name: '수달', meta: '1:1 · Dev / 구현' },
  { id: 'sanyang', name: '산양', meta: '1:1 · Research / 근거' },
];

export const agentRoomMessages: AgentRoomMessage[] = [
  { author: '고라니', role: 'Owner', body: '텔레그램 대신 우리가 쓸 AI 작업 콘솔을 만들자.' },
  { author: '과메기', role: 'PM · 1R', body: '의제 설정: 상시 회의가 아니라 필요할 때 켜지는 전략실로 간다.' },
  { author: '수달', role: 'Dev · 2R', body: '방, 메시지, 작업 상태부터 잡으면 되겠구먼. 실제 연결 전에도 UX를 검증할 수 있소.' },
  { author: '산양', role: 'Research · 2R', body: '메에. 사용자는 회의 로그보다 결론을 원해. 과메기 클로징을 기본으로 보여줘.' },
  { author: '과메기', role: 'PM · 10R', body: '클로징: capability 기반 라우팅, 히스토리 보존, 최대 10라운드 안에서 닫는다.' },
];

export const launcherActions: Record<AppId, string> = {
  agentroom: 'Agent Room 열기',
  uniplan: '계획 보기',
  documents: '문서 서랍',
  notes: '작업 로그',
  gamelab: '게임 연구실',
  terminal: '시스템 로그',
  settings: '테마 바꾸기',
};
