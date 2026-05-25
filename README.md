# Eureka OS

`os.eureka.pe.kr`용 레트로 데스크톱 스타일 AI 작업실 MVP입니다.

## Stack

- React
- TypeScript
- Vite
- CSS-only custom retro UI

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Notes

- Microsoft/Windows 및 Molroo와 무관한 독립 프로젝트입니다.
- 타사 로고/아이콘/폰트/효과음을 사용하지 않고 자체 브랜드/아이콘/테마로 구성했습니다.
- 배포 타깃은 정적 산출물 `dist/`입니다.


## Game Lab policy

Eureka OS can host a `Game Lab` app shell for js-dos/DOSBox-style retro games, but this repository intentionally includes **no ROMs, game bundles, copyrighted assets, or molroo files**.

Allowed registration paths:

- User-owned or directly provided `.jsdos` bundles placed under `public/games/` after rights are confirmed.
- Public-license, homebrew, freeware/shareware bundles whose license allows web hosting.
- External shortcuts that open original sites in a new tab without copying, iframe embedding, or rehosting their assets.

Do not copy molroo game bundles into this project unless each asset has explicit redistribution permission.

See also: `docs/GAME_LAB.md` and `public/games/README.md` for the registry/bundle workflow.
