# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page Angular 19 app ("Bruno's") that collects lunch orders for the restaurant *Da Bruno*. The UI is in Italian. The frontend is useless without its backend (REST + Socket.IO server): https://github.com/midthegap/brunos-backend.

## Commands

- `npm start` — dev server (default `ng serve`, development configuration)
- `npm run serve:prod` — dev server against production environment file
- `npm run build` / `npm run build:prod` — output to `dist/brunos/`
- `npm run watch` — incremental dev build
- `npm test` — Karma + Jasmine; run a single spec via `ng test --include='src/app/order.service.spec.ts'`

Note: the Angular CLI project key in `angular.json` is `Counter` (legacy name) — use it as-is for any `ng` subcommand that needs a project (e.g. `ng test Counter`). The repo/package/output directory are all `brunos`.

## Architecture

The app is bootstrapped as a standalone-components Angular app (no `NgModule`s except for `SocketIoModule.forRoot`). Bootstrap happens in `src/main.ts` where `HttpClient`, the router, and Socket.IO are wired in. `src/app/app.config.ts` is **not** used by `main.ts` — keep providers in sync with `main.ts`, not `app.config.ts`, when adding global providers.

**Routes** (`src/app/app.routes.ts`):
- `/` → `MenuComponent` (shows daily menu image + embeds `BrunoListComponent` for ordering and chat)
- `/admin` → `AdminComponent` (upload menu image, reset orders, "close" the restaurant by uploading `closed.png`)

**Realtime + state flow.** There is no central store. Services hold streams that components subscribe to; the backend pushes events over Socket.IO and the services re-emit them as RxJS `Subject`s:

- `OrderService` — REST for create/delete/report/reset; sockets `order`, `delete`, `reset` re-emitted as `newOrder$`, `deleteOrder$`, `reset$`. The socket `init` event (and the initial service construction) triggers a `GET /api/order` and the resulting snapshot is pushed to `init$` so subscribers can replace their list with the current server state. `BrunoListComponent` mutates its local `orders[]` array purely from these streams (its own `create()` call does *not* optimistically push — it waits for the server to echo back via socket).
- `UserService` — plain REST wrapper for `/api/user` (no sockets). The `BrunoListComponent` calls `getAll()` once to populate its user dropdown; `AdminComponent` uses it for the user-management panel.
- `MenuService` — listens for `menu-updated`, re-emits `menuUpdated$`; also exposes `menuReset$` triggered locally from admin.
- `ChatService` — bidirectional `post` socket event for the in-page chat panel.

This means: any UI change to an order/menu/message must round-trip through the backend; do not update local state directly on user action. The single exception is the chat component, which optimistically appends the sender's own message before the socket echo.

**User selection.** Orders are tied to a `User` (entity with `id`, `name`, `active`). The order form in `BrunoListComponent` is a `<select>` of active users, and the user's chosen id is persisted in a cookie named `bruno-user-id`. The chat `sender` input is fed the selected user's name. On the wire, orders are created/deleted with `OrderDto = {userId, article}`; received orders have the full user object nested (`{id, article, user: {id, name, active}}`).

**Environments.** `src/environments/environment.ts` (dev) points to `http://nemo.local:8080` (REST) and `:9090` (Socket.IO). `environment.production.ts` points both to `https://brunos.magentalab.it/` (same origin). The production file is swapped in via `fileReplacements` in `angular.json`.

**Backend API surface used by the frontend** (useful when reading the code without backend access):
- `GET /api/order` → `Order[]` · `POST /api/order` `{userId, article}` · `DELETE /api/order` (body: `{userId, article}`) · `DELETE /api/order/all` · `GET /api/order/report` (text)
- `GET /api/user` → `User[]` (includes inactive — frontend filters) · `POST /api/user` `{name}` · `DELETE /api/user/{id}` · `PUT /api/user/{id}/active` (body: raw boolean)
- `GET /api/menu/image` (blob) · `GET /api/menu/date` · `POST /api/menu/upload` (multipart `image`)
- Socket.IO events: server→client `order` (full Order with nested user), `delete` (same shape), `reset`, `init` (signal — triggers a REST refetch), `menu-updated`, `post`; client→server `post`

**Conventions.**
- Standalone components only — declare dependencies in the component's `imports: []`.
- User-facing strings are Italian; keep new ones consistent.
- Static assets live in `public/` and are served under `/assets/` (see `angular.json` assets mapping). `admin.reset()` and `admin.close()` rely on `waiting.jpg` and `closed.png` being present there.
- TypeScript uses single quotes (`.editorconfig`), 2-space indent.
