# INDIVIDUAL_REPORT_67543210026-0.md

## ข้อมูลผู้จัดทำ
- ชื่อ-นามสกุล: นายณัฐวิโรจน์ สุทธิธารมงคล
- รหัสนักศึกษา: 67543210026-0
- กลุ่ม: S1-12

---

## ขอบเขตงานที่รับผิดชอบ

- **Auth Service** — เพิ่ม Register API ต่อยอดจาก Set 1 ที่มีแค่ Login
- **Task Service** — ปรับให้ใช้ task-db แยกตาม Database-per-Service Pattern
- **docker-compose.yml** — ออกแบบและเขียน docker-compose สำหรับ 3 services + 3 databases
- **Deploy Auth Service และ Task Service** — Deploy auth-service, task-service พร้อม auth-db, task-db บน Railway

---

## สิ่งที่ได้ดำเนินการด้วยตนเอง

- เพิ่ม `POST /api/auth/register` ใน `auth-service/src/routes/auth.js` ครอบคลุม
  - ตรวจสอบ duplicate username และ email
  - bcrypt.hash password ด้วย salt rounds 10
  - INSERT user ลง auth-db
  - เรียก user-service สร้าง profile อัตโนมัติหลัง register สำเร็จ
  - return JWT token ทันทีเหมือน login
- ปรับ `task-service/src/routes/tasks.js` ให้ลบ JOIN กับ `users` table ออก เพราะ task-db ไม่มี users table แล้ว
- ปรับ `task-service/src/db/db.js` ให้ใช้ `DATABASE_URL` แทนการแยก host/user/password
- เขียน `docker-compose.yml` ใหม่ทั้งหมดสำหรับ Set 2 ประกอบด้วย
  - 3 PostgreSQL databases แยกกัน (auth-db, task-db, user-db)
  - 3 services (auth-service, task-service, user-service)
  - healthcheck สำหรับทุก database
  - frontend service
- เขียน `auth-service/init.sql` และ `task-service/init.sql` แยกตาม service
- รัน init.sql บน Railway ผ่าน `psql` ด้วย Public URL ของแต่ละ database
- Deploy auth-service และ task-service บน Railway พร้อมตั้งค่า Environment Variables และ Root Directory

---

## ปัญหาที่พบและวิธีการแก้ไข

**ปัญหาที่ 1 — auth-service เชื่อมต่อ DB ไม่ได้บน Railway**

หลัง deploy แล้ว log แสดง `ENOTFOUND auth-db` เพราะ `DATABASE_URL` ใน Railway Variables ยังผิดอยู่ ใส่เป็น `postgres://admin:secret@auth-db:5432/authdb` ซึ่งเป็น hostname ของ Docker network ไม่ใช่ Railway

วิธีแก้: เปลี่ยน `DATABASE_URL` ใน Railway Variables ให้อ้างอิงจาก Reference ของ DB service จริง เช่น `${{auth.db.DATABASE_URL}}` หรือใช้ Public URL ชั่วคราวก่อน

**ปัญหาที่ 2 — task-service ได้ 500 หลัง deploy เพราะไม่มี table**

Railway ไม่รัน `init.sql` อัตโนมัติแบบ Docker Compose ทำให้ task-db ไม่มีตาราง `tasks` service จึง error ทุก request

วิธีแก้: รัน init.sql ด้วยตนเองผ่าน `psql` โดยใช้ Public URL ที่ได้จาก Railway → task-db → Variables → `DATABASE_PUBLIC_URL`

**ปัญหาที่ 3 — Register ไม่ทำงานบน Railway ขึ้น 404**

`POST /api/auth/register` ขึ้น 404 เพราะ Root Directory ตั้งผิด Railway จึง build จาก root ของ repo แทนที่จะเป็น `auth-service`

วิธีแก้: ไปที่ Railway → auth-service → Settings → Build → Root Directory แล้วตั้งเป็น `auth-service`

---

## สิ่งที่ได้เรียนรู้จากงานนี้

**เชิงเทคนิค:**
- **Database-per-Service Pattern** — การแยก DB ทำให้แต่ละ service deploy และ scale แยกกันได้ แต่ต้องยอมรับว่าไม่มี Foreign Key ข้าม DB ทำให้ต้องจัดการ consistency ด้วยตัวเอง เช่น การสร้าง profile ใน user-service หลัง register
- **Service Communication** — auth-service ต้องเรียก user-service ผ่าน HTTP เพื่อสร้าง profile แทนการ INSERT ตรงลง DB เดียวกัน ทำให้เข้าใจ pattern การสื่อสารระหว่าง microservices
- **Railway Deployment** — ต่างจาก Docker Compose ตรงที่ต้องตั้งค่า environment variables เองทั้งหมด และต้องรัน DB schema ด้วยตนเอง
- **healthcheck ใน docker-compose** — การเพิ่ม `condition: service_healthy` ทำให้ service รอ DB พร้อมก่อนจึงค่อย start แทนที่จะ retry เอง

**เชิงสถาปัตยกรรม:**
- การออกแบบ Register flow ที่ต้องประสาน 2 services เข้าด้วยกันทำให้เข้าใจว่า Microservices ไม่ใช่แค่แยก code แต่ต้องคิดถึง data ownership และ service dependency ด้วย
- JWT_SECRET ที่ใช้ร่วมกันทุก service คือจุดสำคัญที่ต้องจัดการให้ดี ถ้าผิดแม้แต่ service เดียวจะทำให้ token verify ไม่ผ่าน

---

## แนวทางการพัฒนาต่อไป (สิ่งที่อยากปรับปรุง)

- เพิ่ม **event-driven communication** เช่น message queue แทนการเรียก HTTP ตรงระหว่าง services เพื่อลด coupling
- เพิ่ม **refresh token** ใน auth-service เพื่อให้ user ไม่ต้อง login ใหม่บ่อย
- เพิ่ม **migration tool** เช่น Flyway หรือ node-pg-migrate เพื่อจัดการ DB schema บน Cloud แทนการรัน SQL มือ
- เพิ่ม **CI/CD pipeline** ให้ Railway auto-deploy เมื่อ merge เข้า main branch
