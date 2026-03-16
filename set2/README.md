# ENGSE207 Software Architecture
## README — Final Lab Set 2: Microservices Scale-Up + Cloud Deployment (Railway)

> เอกสารฉบับนี้ใช้เป็น `README.md` สำหรับ repository ของ **Final Lab Set 2**

---

## 1. ข้อมูลรายวิชาและสมาชิก

**รายวิชา:** ENGSE207 Software Architecture
**ชื่องาน:** Final Lab — ชุดที่ 2: Microservices Scale-Up + Cloud Deployment (Railway)

**สมาชิกในกลุ่ม**
| ชื่อ-สกุล | รหัสนักศึกษา |
|---|---|
| นายณัฐวิโรจน์ สุทธิธารมงคล | 67543210026-0 |
| นายศุภโชค แสงจันทร์ | 67543210006-6 |

**Repository:** `engse207-final-lab2-67543210026-67543210066`

---

## 2. Railway Cloud URLs

| Service | URL |
|---|---|
| Auth Service | `https://auth-service-production-c304.up.railway.app` |
| Task Service | `https://task-service-production-d91b.up.railway.app` |
| User Service | `https://user-service-production-af05.up.railway.app` |
| Frontend | `https://keen-energy-production-bbfc.up.railway.app` |

---

## 3. ภาพรวมของระบบ

Final Lab Set 2 เป็นการต่อยอดจาก Set 1 โดยมีการเปลี่ยนแปลงหลักดังนี้

| หัวข้อ | Set 1 | Set 2 |
|---|---|---|
| Services | auth, task, log, nginx | auth, task, user |
| Database | Shared DB 1 ก้อน | Database-per-Service (3 DB) |
| Register | ไม่มี | มี Register API |
| Deployment | Local Docker Compose | Railway Cloud |
| Gateway | Nginx (HTTPS) | Direct Service URL |

---

## 4. Architecture Overview

```text
Internet / Browser / Postman
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                   Railway Cloud                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth Service │  │ Task Service │  │ User Service │  │
│  │  PORT: 3001  │  │  PORT: 3002  │  │  PORT: 3003  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         ▼                 ▼                  ▼          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  auth.db   │  │   task.db    │  │   user.db    │    │
│  │  users     │  │   tasks      │  │user_profiles │    │
│  │  logs      │  │   logs       │  │   logs       │    │
│  └────────────┘  └──────────────┘  └──────────────┘    │
│                                                         │
│  JWT_SECRET ใช้ร่วมกันทุก service                        │
└─────────────────────────────────────────────────────────┘
```

### Services ที่ใช้ในระบบ
- **auth-service** — Register, Login, Verify, Me
- **task-service** — CRUD Tasks
- **user-service** — Profile CRUD, Admin จัดการ users
- **frontend** — หน้าเว็บ Task Board และ Profile

---

## 5. โครงสร้าง Repository

```text
engse207-final-lab2-67543210026-67543210066/
├── README.md
├── TEAM_SPLIT.md
├── INDIVIDUAL_REPORT_67543210026-0.md
├── INDIVIDUAL_REPORT_67543210066-6.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── auth-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── init.sql
│   └── src/
│       ├── index.js
│       ├── db/db.js
│       ├── middleware/jwtUtils.js
│       └── routes/auth.js
├── task-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── init.sql
│   └── src/
│       ├── index.js
│       ├── db/db.js
│       ├── middleware/authMiddleware.js
│       ├── middleware/jwtUtils.js
│       └── routes/tasks.js
├── user-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── init.sql
│   └── src/
│       ├── index.js
│       ├── db/db.js
│       ├── middleware/authMiddleware.js
│       ├── middleware/jwtUtils.js
│       └── routes/users.js
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── profile.html
│   └── config.js
└── screenshots/
```

---

## 6. เทคโนโลยีที่ใช้

- Node.js / Express.js
- PostgreSQL
- Docker / Docker Compose
- HTML / CSS / JavaScript
- JWT (jsonwebtoken)
- bcryptjs
- Railway Cloud

---

## 7. Database Schema

### auth.db
```sql
users (id, username, email, password_hash, role, created_at, last_login)
logs  (id, level, event, user_id, message, meta, created_at)
```

### task.db
```sql
tasks (id, user_id, title, description, status, priority, created_at, updated_at)
logs  (id, level, event, user_id, message, meta, created_at)
```

### user.db
```sql
user_profiles (id, user_id, username, email, role, display_name, bio, avatar_url, updated_at)
logs          (id, level, event, user_id, message, meta, created_at)
```

> **หมายเหตุ:** `user_id` ใน task.db และ user.db เป็น logical reference ไปยัง auth.db.users.id ไม่มี Foreign Key ข้าม database

---

## 8. Gateway Strategy

Set 2 ใช้ **Direct Service URL** pattern บน Railway Cloud

**เหตุผล:**
- Railway ให้ public URL ต่อ service อยู่แล้ว
- ลด complexity ไม่ต้องตั้งค่า nginx เพิ่ม
- แต่ละ service scale และ deploy แยกกันได้อิสระ
- ง่ายต่อการ debug แต่ละ service

**ข้อจำกัด:**
- ไม่มี single entry point — client ต้องรู้ URL ของแต่ละ service
- ไม่มี rate limiting กลาง

---

## 9. การตั้งค่าและการรันระบบบน Local

### 9.1 สร้างไฟล์ `.env`
```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:
```env
JWT_SECRET=engse207-super-secret-change-me
JWT_EXPIRES_IN=1h
AUTH_DB_PASSWORD=auth_secret
TASK_DB_PASSWORD=task_secret
USER_DB_PASSWORD=user_secret
```

### 9.2 รันระบบ
```bash
docker compose down -v
docker compose up --build
```

### 9.3 เปิดใช้งาน
- Frontend: `http://localhost:8080`
- Auth Service: `http://localhost:3001`
- Task Service: `http://localhost:3002`
- User Service: `http://localhost:3003`

---

## 10. การ Deploy บน Railway

### ขั้นตอนสำหรับแต่ละ Service

1. Railway → New Project → Deploy from GitHub
2. เลือก Repository และตั้ง **Root Directory** ตามชื่อ service เช่น `auth-service`
3. เพิ่ม PostgreSQL plugin และตั้งชื่อให้ตรงกัน เช่น `auth.db`
4. ตั้ง Environment Variables:

**auth-service:**
```
DATABASE_URL = ${{auth.db.DATABASE_URL}}
JWT_SECRET   = [ค่าเดียวกันทุก service]
JWT_EXPIRES_IN = 1h
PORT         = 3001
NODE_ENV     = production
```

**task-service:**
```
DATABASE_URL = ${{task.db.DATABASE_URL}}
JWT_SECRET   = [ค่าเดียวกันทุก service]
PORT         = 3002
NODE_ENV     = production
```

**user-service:**
```
DATABASE_URL = ${{user.db.DATABASE_URL}}
JWT_SECRET   = [ค่าเดียวกันทุก service]
PORT         = 3003
NODE_ENV     = production
```

5. รัน `init.sql` ของแต่ละ DB ผ่าน `psql` หลัง deploy

---

## 11. Seed Users สำหรับทดสอบ

| Username | Email | Password | Role |
|---|---|---|---|
| alice | alice@lab.local | alice123 | member |
| bob | bob@lab.local | bob456 | member |
| admin | admin@lab.local | adminpass | admin |

---

## 12. API Summary

### Auth Service (port 3001)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | สมัครสมาชิกใหม่ | ❌ |
| POST | `/api/auth/login` | เข้าสู่ระบบ รับ JWT | ❌ |
| GET | `/api/auth/me` | ดูข้อมูลตัวเอง | ✅ |
| GET | `/api/auth/verify` | ตรวจสอบ token | ❌ |
| GET | `/api/auth/health` | Health check | ✅ |

### Task Service (port 3002)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks` | ดู tasks | ✅ |
| POST | `/api/tasks` | สร้าง task | ✅ |
| PUT | `/api/tasks/:id` | แก้ไข task | ✅ |
| DELETE | `/api/tasks/:id` | ลบ task | ✅ |
| GET | `/api/tasks/health` | Health check | ✅ |

### User Service (port 3003)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | ดู profile ตัวเอง | ✅ |
| PUT | `/api/users/me` | แก้ไข profile | ✅ |
| GET | `/api/users` | ดู users ทั้งหมด | ✅ Admin |
| GET | `/api/users/:id` | ดู profile คนอื่น | ✅ Admin |
| PUT | `/api/users/:id` | แก้ไข profile คนอื่น | ✅ Admin |
| GET | `/api/users/health` | Health check | ✅ |

---

## 13. การทดสอบระบบ

### ทดสอบบน Local
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"123456"}'

# Login และเก็บ token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@lab.local","password":"alice123"}' | jq -r '.token')

# Get Profile
curl http://localhost:3003/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Create Task
curl -X POST http://localhost:3002/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","status":"TODO","priority":"high"}'

# Get Tasks
curl http://localhost:3002/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Test 401
curl http://localhost:3002/api/tasks

# Test 403 (member เข้า admin endpoint)
curl http://localhost:3003/api/users \
  -H "Authorization: Bearer $TOKEN"

# Admin token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lab.local","password":"adminpass"}' | jq -r '.token')

# Admin ดู users ทั้งหมด
curl http://localhost:3003/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### ทดสอบบน Railway Cloud
```bash
AUTH="https://auth-service-production-c304.up.railway.app"
TASK="https://task-service-production-d91b.up.railway.app"
USER="https://user-service-production-af05.up.railway.app"

# Register
curl -X POST $AUTH/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"123456"}'

# Login
TOKEN=$(curl -s -X POST $AUTH/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@lab.local","password":"alice123"}' | jq -r '.token')

# Get Profile
curl $USER/api/users/me -H "Authorization: Bearer $TOKEN"

# Get Tasks
curl $TASK/api/tasks -H "Authorization: Bearer $TOKEN"
```

---

## 14. Screenshots ที่แนบในงาน

| หมายเลข | ไฟล์ | คำอธิบาย |
|---|---|---|
| 01 | `01_docker_running.png` | Docker containers ทำงานครบทุก service |
| 02 | `02_register_success.png` | Register สำเร็จ ได้ token กลับมา |
| 03 | `03_login_success.png` | Login สำเร็จ ได้ JWT |
| 04 | `04_login_fail.png` | Login ผิด password ได้ 401 |
| 05 | `05_create_task.png` | สร้าง task สำเร็จ |
| 06 | `06_get_tasks.png` | ดึงรายการ tasks |
| 07 | `07_update_task.png` | แก้ไข task สำเร็จ |
| 08 | `08_delete_task.png` | ลบ task สำเร็จ |
| 09 | `09_no_jwt_401.png` | ไม่มี JWT ได้ 401 |
| 10 | `10_member_forbidden_403.png` | member เข้า admin endpoint ได้ 403 |
| 11 | `11_admin_users_success.png` | admin ดูรายชื่อ users ทั้งหมดได้ |
| 12 | `12_readme_architecture.png` | Architecture diagram |

---

## 15. ปัญหาที่พบและแนวทางแก้ไข

- **DB เชื่อมต่อไม่ได้บน Railway** — ต้องรัน `init.sql` ผ่าน `psql` ด้วย Public URL เนื่องจาก Railway ไม่รัน init.sql อัตโนมัติ
- **DATABASE_URL ผิด** — ต้องใช้ `${{service-name.DATABASE_URL}}` ให้ตรงกับชื่อ DB service จริงใน Railway
- **Root Directory ไม่เจอ** — ต้องตั้งให้ตรงกับชื่อ folder เช่น `auth-service`, `task-service`, `user-service`
- **CORS error** — เพิ่ม `cors({ origin: '*' })` ทุก service
- **config.js ชี้ไป localhost** — ต้องเปลี่ยนเป็น Railway URL จริงก่อน deploy frontend

---

## 16. Known Limitations

- ไม่มี Foreign Key ข้าม database — `user_id` ใน task.db และ user.db เป็น **logical reference** ไปยัง auth.db.users.id
- ถ้าลบ user จาก auth.db, tasks และ profiles ใน DB อื่นจะยังคงอยู่
- ไม่มี single entry point บน Cloud — client ต้องรู้ URL ของแต่ละ service

---

## 17. การแบ่งงานของทีม

รายละเอียดการแบ่งงานของสมาชิกอยู่ในไฟล์ `TEAM_SPLIT.md`
และรายงานรายบุคคลอยู่ในไฟล์ `INDIVIDUAL_REPORT_[studentid].md`

---

> เอกสารฉบับนี้เป็น README สำหรับงาน Final Lab Set 2 ของกลุ่ม
> จัดทำเพื่อประกอบการส่งงานในรายวิชา ENGSE207 Software Architecture
> มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
