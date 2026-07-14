import type { AgentCard, AgentRoomDecision, AgentRoomFileTrigger, AgentRoomLock, AgentRoomMessage, AgentRoomPrompt, AgentRoomRoom, AgentRoomTask, AppId, AppMeta, LinkTarget, WindowState, WorkCard } from './types';

// Static product metadata for the desktop shell. Dynamic/runtime state should stay in components.
export const apps: Record<AppId, AppMeta> = {
  agentroom: { title: 'AgentRoom', icon: '◇', accent: '#7dd3fc', summary: 'AgentRoom: 고라니와 AI 작업자들이 한 방에서 지시·분담·락·승인·완료보고를 보고, 최종 요약/TODO/결정까지 남기는 팀 전용 작업 콘솔입니다.' },
  uniplan: { title: '계획 보드', icon: '▣', accent: '#a7f3d0', summary: 'UniPlan: 계획, 일정, 아이디어를 한 장의 보드로 모읍니다.' },
  documents: { title: '문서 서랍', icon: '▤', accent: '#fde68a', summary: 'Documents: 프로젝트 문서와 운영 링크를 차곡차곡 넣어두는 서랍입니다.' },
  notes: { title: '작업 노트', icon: '✧', accent: '#f0abfc', summary: 'Notes: 빠른 메모와 오늘의 작업 흔적을 브라우저에 저장합니다.' },
  gamelab: { title: 'Game Lab', icon: '▦', accent: '#fb7185', summary: '권리 확인된 js-dos 번들만 등록해 실행하는 레트로 게임 연구실입니다.' },
  terminal: { title: '시스템 로그', icon: '▸', accent: '#86efac', summary: 'Terminal: Eureka OS 상태와 빌드 로그를 보여줍니다.' },
  settings: { title: '분위기 설정', icon: '◌', accent: '#c4b5fd', summary: 'Settings: 테마와 데스크톱 분위기를 조절합니다.' },
  usage: { title: '모델 사용량', icon: '◴', accent: '#67e8f9', summary: 'AI 사용량 관제: 저장된 토큰 기록과 필요할 때 확인하는 업체 잔여량을 분리해서 봅니다.' },
};

export const appOrder = Object.keys(apps) as AppId[];

// Boot to an uncluttered desktop; apps are intentionally opened by the user.
export const initialWindows: WindowState[] = [];

export const defaultNote = '오늘의 작업\n- AgentRoom: 방/작업/락/승인/인계 UI 검증\n- UniPlan: ERP 업무 흐름을 새 구조로 재해석\n- Eureka OS: os.eureka.pe.kr 배포 상태 확인';

// External links are opened with noopener/noreferrer in main.tsx; do not put secrets here.
export const projectLinks: LinkTarget[] = [
  { label: 'Eureka OS', url: 'https://os.eureka.pe.kr/', description: '레트로 AI 작업실 메인' },
  { label: 'Eureka Growth', url: 'https://eureka.pe.kr/', description: '메인 랜딩 페이지' },
  { label: 'UniPlan Demo', url: 'https://uniplan.eureka.pe.kr/demo', description: '안정 배포된 AI DB 조회 데모' },
  { label: 'UniPlan Test', url: 'https://test.eureka.pe.kr/demo', description: '진행 중인 개발/검수용 데모' },
  { label: 'ERP1 easiErp', url: 'https://erp1.eureka.pe.kr/', description: 'easiErp 참조/분석 환경' },
  { label: 'ERP2 gootzERP', url: 'https://erp2.eureka.pe.kr/', description: 'gootzERP 제조·렌탈 흐름 참조 환경' },
];

export const agentCards: AgentCard[] = [
  { name: '과메기', role: 'PM / 오케스트레이터', status: '클로징 담당', next: '최대 10라운드 안에서 결론·액션 정리', capability: '분해·배정·최종판단', accent: '#7dd3fc' },
  { name: '니은', role: '구현 / 패치', status: 'AgentRoom 배포 확인', next: '웹 MVP 검증 결과와 후속 Gateway/실기기 작업 인계', capability: '코드 수정·테스트', accent: '#a7f3d0' },
  { name: '사다새', role: '서버 / 리서치', status: 'os.eureka.pe.kr 반영 완료', next: 'Gateway/Android 실기기 연결 확인 준비', capability: '운영·문서·서버', accent: '#fde68a' },
  { name: '공작', role: 'UI / 브랜드', status: '디자인 감각 보정', next: '레트로 감성은 살리고 가독성 유지', capability: '디자인 리뷰', accent: '#f0abfc' },
  { name: '고슴도치', role: '보안 / 승인', status: '위험 작업 감시', next: '삭제·권한·외부전송·비용 작업 승인 게이트', capability: '리스크 체크', accent: '#fb7185' },
];

export const workCards: WorkCard[] = [
  { title: '안정 Demo', status: 'public', description: '말로 DB를 조회하는 UniPlan 공개 데모.', linkLabel: 'demo 열기', url: 'https://uniplan.eureka.pe.kr/demo' },
  { title: '입력 화면', status: 'public', description: '거래처/품목/청구 입력 MVP.', linkLabel: 'input 열기', url: 'https://uniplan.eureka.pe.kr/input' },
  { title: '개발 Test', status: 'dev', description: '진행 중인 변경은 이쪽에서 먼저 검수.', linkLabel: 'test 열기', url: 'https://test.eureka.pe.kr/demo' },
  { title: 'ERP 참조', status: 'analysis', description: 'easiERP/erpGOOTZ는 운영 복제가 아니라 UniPlan 설계 참조용.', linkLabel: 'ERP1 열기', url: 'https://erp1.eureka.pe.kr/' },
];

// Agent Room preview data mirrors the intended app workflow without requiring backend wiring yet.
export const agentRoomRooms: AgentRoomRoom[] = [
  { id: 'team', name: 'AgentRoom 전략실', meta: '단체방 · 10라운드 프로토콜', purpose: '고라니가 짧게 지시하면 AI들이 작업으로 바꾸고 맡아 처리하는 기본 방', health: 'active' },
  { id: 'agentroom-dev', name: 'AgentRoom 개발방', meta: 'Eureka OS · MVP', purpose: '앱 화면, 빌드, 배포, 동기화 방식을 검증하는 개발방', health: 'review' },
  { id: 'uniplan', name: 'UniPlan 사업방', meta: 'AI ERP/AX', purpose: 'ERP 업무 흐름을 새 이름·새 구조·새 UX로 재해석하는 방', health: 'quiet' },
  { id: 'ops', name: '서버/배포 상황실', meta: '사다새 · 비버', purpose: '도메인, 컨테이너, GitHub, 배포 체크를 모으는 방', health: 'active' },
];

export const agentRoomMessages: AgentRoomMessage[] = [
  { roomId: 'team', author: '고라니', role: 'Owner', tone: 'user', body: '텔레그램 대신 우리가 쓸 AI 작업 콘솔을 만들자.' },
  { roomId: 'team', author: '과메기', role: 'PM · R1', tone: 'agent', body: '의제 설정: 채팅을 입구로 두되, 작업 카드가 결론과 승인 상태를 항상 드러내게 간다.' },
  { roomId: 'team', author: '니은', role: '구현 · R2', tone: 'agent', body: '방 목록, 채팅, 작업 상태, 파일 락, 승인 대기, 완료 보고를 한 화면에 묶고 R10 클로징은 작업 요약으로 승격합니다.' },
  { roomId: 'team', author: '사다새', role: '서버 · R2', tone: 'agent', body: 'Telegram은 알림/호출용, 실제 기준은 AgentRoom 상태판과 Git 이력으로 두고 Gateway/배포 인증 상태는 별도로 보여주는 편이 안전합니다.' },
  { roomId: 'team', author: '과메기', role: 'PM · R10', tone: 'decision', body: '클로징: chat-first는 유지하되 Summary, TODO, Decision, Approval을 방 상세의 1급 정보로 올린다.' },
  { roomId: 'agentroom-dev', author: '니은', role: '구현', tone: 'agent', body: 'GitHub shockowolf/eureka-os 안에 AgentRoom 화면이 있음을 확인. 웹 MVP를 완성형으로 보강 중입니다.' },
  { roomId: 'agentroom-dev', author: '사다새', role: '서버', tone: 'system', body: '이전 Oracle 검색에서는 앱 소스가 미발견이었고, GitHub 확인 후 eureka-os 경로가 기준 후보가 되었습니다.' },
  { roomId: 'agentroom-dev', author: '니은', role: '배포', tone: 'system', body: 'os.eureka.pe.kr에는 GitHub main 최신 AgentRoom 빌드가 반영되었고, 정적 파일 백업과 공개 URL 검증까지 완료했습니다.' },
  { roomId: 'uniplan', author: '고라니', role: 'Owner', tone: 'user', body: 'easiERP/erpGOOTZ는 복제 운영이 아니라 UniPlan 설계를 위한 업무 흐름 참고 자료다.' },
  { roomId: 'uniplan', author: '니은', role: '정리', tone: 'decision', body: '명칭·코드·표현을 그대로 가져오지 않고 새 기능명/새 구조/AI ERP UX로 변환한다.' },
  { roomId: 'ops', author: '사다새', role: '서버', tone: 'system', body: 'm1max SSH는 현재 키 권한이 없어 직접 접근 불가. GitHub 공개 저장소 기준으로 작업한다.' },
];

export const agentRoomTasks: AgentRoomTask[] = [
  { id: 'AR-001', title: 'AgentRoom MVP 화면 완성', assignee: '니은', status: 'done', priority: 'high', resource: 'eureka-os/src/*', next: '웹 MVP UI와 공개 배포는 완료. 실기기/Gateway 연결은 후속 검증', finalSummary: 'chat-first 작업방을 유지하면서 R10 최종 요약, TODO, 최근 결정, 승인 CTA를 방 안에서 바로 보이게 만든다.', approvalState: 'approved', todos: ['S25 실기기에서 키보드/스크롤/Gateway 연결 확인', 'Android 권한과 Tailscale/Gateway 기본값 분리', '승인 이벤트를 모바일 승인 큐와 연결'], decisions: ['AgentRoom은 상시 회의실이 아니라 필요할 때 켜지는 AI 작업 콘솔로 간다.', '고정 멤버보다 capability 기반 담당자 라우팅을 우선한다.'] },
  { id: 'AR-002', title: 'GitHub 원본 위치 확인', assignee: '니은+사다새', status: 'done', priority: 'normal', resource: 'shockowolf/eureka-os', next: '로컬 작업본 기준으로 검증' },
  { id: 'AR-003', title: 'GitHub 커밋/푸시', assignee: '사다새+니은', status: 'done', priority: 'high', resource: 'github main', next: 'AgentRoom 리뷰 수정까지 main 반영 완료. 이후 변경은 새 작업 카드로 진행' },
  { id: 'AR-004', title: 'm1max 작업본 확인', assignee: '사다새', status: 'blocked', priority: 'normal', resource: 'tailscale:ssh m1max', next: 'SSH 키 또는 저장소 위치 필요' },
  { id: 'AR-005', title: '실서비스 배포', assignee: '니은', status: 'done', priority: 'high', resource: 'os.eureka.pe.kr deploy', next: '배포 완료. 롤백 백업 보관 중, 다음은 Android 실기기/Gateway 검증' },
];

export const agentRoomLocks: AgentRoomLock[] = [
  { resource: 'eureka-os/src/*', holder: '사다새', mode: 'shared', until: '다음 UI 변경 전까지', reason: 'AgentRoom 변경분 리뷰 기준' },
  { resource: 'bot-collab/status.md,outbox.md', holder: '니은+사다새', mode: 'shared', until: '작업 종료', reason: '새 협업 로그만 추가' },
  { resource: 'github main', holder: 'released', mode: 'shared', until: '다음 변경 전까지', reason: 'GitHub 반영 완료 이력과 후속 변경 기준' },
  { resource: 'os.eureka.pe.kr static dist', holder: 'released', mode: 'shared', until: '다음 배포 전까지', reason: 'AgentRoom 공개 배포 완료 및 롤백 백업 확보' },
];

export const agentRoomDecisions: AgentRoomDecision[] = [
  { id: 'D-001', label: 'Chat-first UI', owner: '과메기', status: 'decided', detail: '첫 화면은 PMS가 아니라 방 대화이며, 작업판은 대화 옆 오버레이로 붙인다.' },
  { id: 'D-002', label: 'Bot-only workspace', owner: '고라니', status: 'decided', detail: '사람끼리 메신저가 아니라 고라니와 AI 작업자들이 쓰는 작업방이다.' },
  { id: 'D-003', label: '승인 게이트', owner: '고슴도치', status: 'decided', detail: '삭제/권한/외부전송/비용/배포는 승인 카드가 필요하다.' },
  { id: 'D-004', label: '실시간 sync 연결', owner: '사다새', status: 'pending', detail: 'BOT_COLLAB_SYNC.md 또는 API를 읽어 앱 상태판에 연결한다.' },
  { id: 'D-005', label: '웹 MVP 공개 배포', owner: '니은', status: 'decided', detail: 'Eureka OS의 AgentRoom 최신 정적 빌드를 os.eureka.pe.kr에 반영하고 공개 URL/asset smoke check를 통과했다.' },
];

export const agentRoomPrompts: AgentRoomPrompt[] = [
  { label: '팀 모드 시작', text: '팀 모드 시작: 과메기는 작업을 쪼개고, 니은은 구현, 사다새는 서버/배포 확인, 마지막에 검증 결과까지 정리해줘.' },
  { label: '승인 요청', text: '승인 요청: 외부 반영이 필요한 작업입니다. 대상, 위험도, 롤백 방법, 검증 결과를 먼저 정리해줘.' },
  { label: '완료 보고', text: '완료 보고: 한 일, 검증 결과, 변경 파일, 남은 블로커, 다음 액션을 5줄로 정리해줘. 완료된 큐 항목은 status를 done으로 바꿔줘.' },
];

export const agentRoomFileTriggers: AgentRoomFileTrigger[] = [
  {
    id: 'queue-updated',
    patterns: ['04_Backlog/Bot Collaboration Queue.md'],
    bots: ['니은', '사다새', '과메기'],
    reason: '공용 큐가 바뀌면 각자 자기 담당 active 항목을 확인한다.',
    status: 'ready',
    command: 'python3 scripts/check-bot-queue.py list --bot <BOT> --include-unassigned',
  },
  {
    id: 'bot-protocol-updated',
    patterns: ['02_Systems/공용 봇 협업 큐 운영.md', 'scripts/check-*.py'],
    bots: ['니은', '사다새', '과메기'],
    reason: '협업 프로토콜이나 helper가 바뀌면 로컬 트리거 설정을 재확인한다.',
    status: 'ready',
    command: 'python3 scripts/check-file-triggers.py check --bot <BOT>',
  },
  {
    id: 'idkbi-updated',
    patterns: ['01_Projects/idkbi.md', '07_References/*도깨비*'],
    bots: ['과메기', '니은'],
    reason: 'idkbi/도깨비 컨셉 변경 시 Starweave와 섞이지 않았는지 확인한다.',
    status: 'needs_hook',
    command: 'python3 scripts/check-file-triggers.py changed --bot <BOT> --files <FILE>',
  },
  {
    id: 'starweave-updated',
    patterns: ['01_Projects/Starweave.md', '07_References/브랜드와 문구 가이드.md'],
    bots: ['니은'],
    reason: '성연당 변경 시 도깨비/idkbi가 섞이지 않았는지 확인한다.',
    status: 'needs_hook',
    command: 'python3 scripts/check-file-triggers.py changed --bot 니은 --files <FILE>',
  },
];

export const launcherActions: Record<AppId, string> = {
  agentroom: 'Agent Room 열기',
  uniplan: '계획 보기',
  documents: '문서 서랍',
  notes: '작업 로그',
  gamelab: '게임 연구실',
  terminal: '시스템 로그',
  settings: '테마 바꾸기',
  usage: '모델 사용량 보기',
};

