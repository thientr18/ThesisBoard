# Ghi chú kiến trúc ThesisBoard

Tài liệu này tóm tắt cấu trúc và nguyên tắc code cho dự án ThesisBoard ở cả frontend (React + TypeScript + Vite) và backend (Express + TypeScript), kèm sơ đồ flow và ví dụ CRUD Users.

## 1️⃣ Frontend – React + TS + Vite

### a) Nguyên tắc

- Components: chỉ lo UI, nhận props từ cha hoặc context.
- Pages: mỗi route → một page, fetch data qua API service hoặc react-query.
- Contexts: lưu global state (user auth, theme, notification).
- Hooks: tách logic tái sử dụng (reusable), dễ test.
- Utils: helper functions dùng chung.
- Types: TypeScript types/interfaces cho API, models.
- Layouts: định nghĩa layout (Dashboard, Auth, Public).
- Routes: định nghĩa toàn bộ routes, gắn layout + page.

### b) Gợi ý folder structure

```text
frontend/src/
 ├─ api/
 │   ├─ axiosInstance.ts      # base axios
 │   └─ userApi.ts
 ├─ assets/
 ├─ components/
 │   └─ ui/                   # Button, Table, Modal...
 ├─ contexts/
 │   └─ AuthContext.tsx
 ├─ hooks/
 │   ├─ useUsers.ts           # logic fetch users
 │   └─ useAuth.ts
 ├─ layouts/
 │   ├─ DashboardLayout.tsx
 │   └─ AuthLayout.tsx
 ├─ pages/
 │   └─ Users.tsx
 ├─ routes/
 │   └─ AppRoutes.tsx
 ├─ types/
 │   └─ user.ts
 ├─ utils/
 │   └─ helpers.ts
 ├─ App.tsx
 └─ main.tsx
```

### c) Nguyên tắc code

- API layer: gọi axios qua service (ví dụ `userApi.ts`) → trả data có type rõ ràng.
- Page: gọi API bằng react-query hoặc custom hook (ví dụ `useUsers`) → render component.
- Component: tập trung hiển thị UI, nhận props.
- Context: lưu data dùng chung (vd: auth user) → tránh call API lặp lại ở Navbar/Sidebar.
- Hooks: tách logic phức tạp → tái sử dụng, dễ test.

---

## 2️⃣ Backend – Express + TS

### a) Nguyên tắc

- Routes: chỉ định nghĩa URL + middleware (auth, validation) + gọi controller.
- Controllers: nhận request, gọi service, trả response.
- Services: chứa business logic (validation, check, gọi repository).
- Repositories / Models: truy vấn database.
- Middlewares: auth, error handler, validation.

### b) Gợi ý folder structure

```text
backend/src/
 ├─ index.ts                  # khởi tạo Express, cors, json, mount routes
 ├─ routes/
 │   └─ user.routes.ts        # /api/users
 ├─ controllers/
 │   └─ user.controller.ts    # getUsers, createUser
 ├─ services/
 │   └─ user.service.ts       # logic: getAllUsers, createUser
 ├─ repositories/
 │   └─ user.repository.ts    # DB query (sequelize, prisma)
 ├─ models/                   # DB models (Sequelize/TypeORM)
 ├─ middlewares/
 │   ├─ authMiddleware.ts
 │   └─ errorHandler.ts
 └─ utils/
     └─ helpers.ts
```

### c) Nguyên tắc code

Controller:

```ts
export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err); // error middleware xử lý
  }
};
```

Service:

```ts
export const getAllUsers = async () => {
  return await userRepository.findAllUsers(); // logic/validation nếu cần
};
```

Repository:

```ts
export const findAllUsers = async () => {
  return await models.User.findAll();
};
```

Middleware:

- Auth check, role check, validation input, error handler.

### ✅ Lợi ích

- Frontend: Component chỉ render, API gọi qua service, context lưu state chung → không call API nhiều lần.
- Backend: Controller ngắn gọn, Service tách logic → testable, dễ maintain.
- Dễ scale: thêm feature → tạo service/controller/repo mới → không phá cấu trúc.
- Tái sử dụng (reusability): logic, helpers, middleware dùng được cho nhiều route.

---

## 3️⃣ Sơ đồ flow + ví dụ CRUD Users

### 3.1 Sơ đồ flow request

Frontend (React)
 ├─ Pages / Hooks / Components
 │    └─ Users.tsx  (call useUsers / userApi)
 │
 └─ API Layer (userApi.ts)
       |
       v
Backend (Express)
 ├─ Routes (user.routes.ts)          ← định tuyến /api/users
 ├─ Controller (user.controller.ts)  ← nhận req, gọi service
 ├─ Service (user.service.ts)        ← logic nghiệp vụ
 ├─ Repository (user.repository.ts)  ← truy vấn DB
 └─ Models (User model)              ← Sequelize / Prisma / TypeORM
       |
       v
Database

- Frontend: call API qua axios (hoặc react-query)
- Backend: controller → service → repository → trả data
- Lỗi/validation → middleware xử lý

### 3.2 Frontend example

File liên quan:

- `frontend/src/api/userApi.ts`
- `frontend/src/hooks/useUsers.ts`
- `frontend/src/pages/Users.tsx`
- `frontend/src/types/user.ts`
- `frontend/src/components/ui/UserCard.tsx`

`userApi.ts`:

```ts
import axios from "./axiosInstance";
import { User } from "@/types/user";

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const res = await axios.get("/users");
    return res.data;
  },
  create: async (data: Omit<User, "id">): Promise<User> => {
    const res = await axios.post("/users", data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/users/${id}`);
  },
};
```

`useUsers.ts` (custom hook + react-query):

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { User } from "@/types/user";

export const useUsers = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<User[]>(["users"], userApi.getAll);

  const createUser = useMutation(userApi.create, {
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  const deleteUser = useMutation(userApi.delete, {
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  return { data, isLoading, createUser, deleteUser };
};
```

`Users.tsx` (page):

```tsx
import { useUsers } from "@/hooks/useUsers";
import UserCard from "@/components/ui/UserCard";

export default function Users() {
  const { data, isLoading, createUser, deleteUser } = useUsers();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Users</h1>
      <button onClick={() => createUser.mutate({ name: "New User", email: "a@b.com" })}>Add User</button>
      {data?.map((user) => (
        <UserCard key={user.id} user={user} onDelete={() => deleteUser.mutate(user.id)} />
      ))}
    </div>
  );
}
```

`UserCard.tsx` (UI component):

```tsx
import { User } from "@/types/user";

interface Props {
  user: User;
  onDelete: () => void;
}

export default function UserCard({ user, onDelete }: Props) {
  return (
    <div className="border p-2 my-2 flex justify-between">
      <span>{user.name} ({user.email})</span>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}
```

### 3.3 Backend example

File liên quan:

- `backend/src/routes/user.routes.ts`
- `backend/src/controllers/user.controller.ts`
- `backend/src/services/user.service.ts`
- `backend/src/repositories/user.repository.ts`
- `backend/src/models/User.ts`

`user.routes.ts`:

```ts
import express from "express";
import { getUsers, createUser, deleteUser } from "@/controllers/user.controller";

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.delete("/:id", deleteUser);

export default router;
```

`user.controller.ts`:

```ts
import * as userService from "@/services/user.service";

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
```

`user.service.ts`:

```ts
import * as userRepo from "@/repositories/user.repository";

export const getAllUsers = async () => userRepo.findAllUsers();
export const createUser = async (data) => userRepo.createUser(data);
export const deleteUser = async (id) => userRepo.deleteUser(id);
```

`user.repository.ts`:

```ts
import { User } from "@/models";

export const findAllUsers = async () => User.findAll();
export const createUser = async (data) => User.create(data);
export const deleteUser = async (id) => User.destroy({ where: { id } });
```

---

## 4️⃣ Gợi ý tiếp theo

- Thêm `axiosInstance.ts` cấu hình baseURL + interceptors và cấu hình Vite proxy tới backend.
- Thêm error boundary và cơ chế toast thông báo lỗi toàn cục.
- Implement auth (login, refresh token) ở `AuthContext` và `authMiddleware` phía backend.
- Thêm validation schema (zod/yup) cho input ở cả frontend và backend.
