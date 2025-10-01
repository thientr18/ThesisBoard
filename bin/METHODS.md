
## 1️⃣ Backend – Node.js + Express + TS

### Step 1: Init project

- `npm init -y` → setup TS (`tsconfig.json`)
- Install packages: `express`, `cors`, `dotenv`, `sequelize`, `bcrypt`, `jsonwebtoken`
- Folder: `src/` + subfolder `routes/`, `controllers/`, `services/`, - `repositories/`, `models/`, `middlewares/`

### Step 2: Setup DB models

- User, Student, Teacher, Thesis, Topic, PreThesisRegistration, Semester
- Use Sequelize, định nghĩa associations (hasMany, belongsTo, etc.)

### Step 3: Setup middleware

- `authMiddleware` → check token, attach `req.user`
- `roleMiddleware` → check user roles
- `errorHandler` → catch error, return `{ status, message }`

### Step 4: Build User CRUD

- Repository: query DB
- Service: logic create/get/delete user
- Controller: gọi service, trả JSON
- Routes: `/api/users` → GET/POST/DELETE
- Test bằng Postman

### Step 5: Build Auth

- `POST /api/auth/login` → trả token
- `GET /api/auth/me` → trả user info + roles
- Context: lưu roles cho frontend

### Step 6: Build Thesis & Topic modules

- Repository: query thesis/topic, semester
- Service: apply logic (student status, GPA, credits, topic availability)
- Controller: gọi service → trả JSON
- Route protection: middleware auth + role
- Test full flow: student apply → teacher approve

### Step 7: Notification

- Service tạo notification khi student apply
- Repository lưu notification → frontend pull hoặc socket

### Step 8: Refactor & cleanup

- Đảm bảo controller ngắn (<20 dòng)
- Service chứa toàn bộ business logic
- Repository chỉ query DB
- Middleware xử lý auth/role/error

## 2️⃣ Frontend – React + TS + Vite

### Step 1: Init project

- `npm create vite@latest thesisboard-frontend --template react-ts`
- Folder: `src/` + subfolder `api/`, `components/`, `hooks/`, `contexts/`, `layouts/`, `pages/`, `types/`, `utils/`, `routes/`

### Step 2: Setup API layer

- `axiosInstance.ts` → base URL, attach token
- `userApi.ts`, `thesisApi.ts`, `topicApi.ts` → call backend

### Step 3: Setup Context

- `AuthContext.tsx` → user + roles
- Mount `AuthProvider` tại `App.tsx`
- Hook: `useAuth()` → access user & roles

### Step 4: Build Pages & Hooks

- `Users.tsx` + `useUsers.ts` → fetch + create + delete
- `Theses.tsx` + `useTheses.ts` → list thesis, apply thesis
- `Topics.tsx` + `useTopics.ts` → list topics, apply topic

### Step 5: Build Components

- UI reusable: `UserCard`, `ThesisCard`, `TopicCard`
- Layout: `DashboardLayout`, `AuthLayout`
- Navbar đọc user info từ context → show name + role-specific links

### Step 6: Setup Routing

- `AppRoutes.tsx` → define route, attach layout, attach protected route logic

```tsx
<Route path="/users" element={<Protected roles={['admin']}><Users /></Protected>} />
```

- `Protected` component → check roles từ context → redirect nếu không đủ quyền

### Step 7: State management / react-query

- Fetch data → react-query → cache, invalidate, refetch
- Mutation → create/update/delete → invalidate query

### Step 8: Error & Notification handling

- Axios interceptor: catch errors globally
- Toast / Modal → show message từ backend
- Hook `useNotify()` → reusable

### Step 9: Final polish

- Global styles / tailwind / css modules
- Responsive layout + table / cards
- Form validation (Yup / React Hook Form)
- Test full flow: login → view topics → apply → view status → notification

## 3️⃣ Test & Deploy

- Backend: Postman test all endpoints
- Frontend: run dev → check flow, role-based UI
- CI/CD: Vercel (frontend), Render/Railway (backend)
- Docker optional

## 💡 Nguyên tắc chung

- Tách rõ <b>Controller → Service → Repository</b>
- Frontend <b>Page → Hook → Component → API → Context</b>
- Role check <b>Frontend + Backend</b>
- Global state: <b>AuthContext</b>, không call API liên tục
- Validation & error: middleware + hook