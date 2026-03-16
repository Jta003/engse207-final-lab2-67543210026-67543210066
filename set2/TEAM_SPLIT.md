# TEAM_SPLIT.md

## ข้อมูลกลุ่ม
- รายวิชา: ENGSE207 Software Architecture
- งาน: Final Lab Set 2 — Microservices Scale-Up + Cloud Deployment (Railway)

## รายชื่อสมาชิก
- 67543210026-0 นายณัฐวิโรจน์ สุทธิธารมงคล
- 67543210006-6 นายศุภโชค แสงจันทร์

---

## การแบ่งงานหลัก

### สมาชิกคนที่ 1: นายศุภโชค แสงจันทร์ (67543210006-6)
- **User Service** — พัฒนา user-service ใหม่ทั้งหมด ครอบคลุม profile CRUD, admin จัดการ users, internal endpoint รับจาก auth-service
- **user-db** — ออกแบบ schema ตาราง `user_profiles` และ `logs` และรัน init.sql บน Railway
- **Frontend** — พัฒนา `index.html` (dark theme + Register tab) และ `profile.html` (ดู/แก้ไขโปรไฟล์ + admin panel)
- **config.js** — สร้างไฟล์ config แยก URL ของแต่ละ service ให้ใช้งานได้ทั้ง Local และ Railway Cloud
- **ลบ Nginx** — ถอด nginx และ log-service ออกจากระบบ Set 2 และปรับโครงสร้างให้เหมาะสม
- **Deploy User Service** — Deploy user-service และ user-db บน Railway

### สมาชิกคนที่ 2: นายณัฐวิโรจน์ สุทธิธารมงคล (67543210026-0)
- **Auth Service** — เพิ่ม Register API ใน auth-service พร้อม bcrypt hash และ auto-create profile ใน user-service
- **Task Service** — ปรับ task-service ให้ใช้ task-db แยก และลบ JOIN กับ users table ออก
- **docker-compose.yml** — ออกแบบและเขียน docker-compose สำหรับ Database-per-Service Pattern (3 DB + 3 Services)
- **auth-db และ task-db** — ออกแบบ schema และรัน init.sql บน Railway
- **Deploy Auth Service และ Task Service** — Deploy auth-service, task-service, auth-db, task-db บน Railway

---

## งานที่ดำเนินการร่วมกัน
- ออกแบบ Database-per-Service Architecture และกำหนด schema ของทุก DB
- กำหนด JWT_SECRET ค่าเดียวกันให้ทุก service ใช้ร่วมกัน
- ทดสอบระบบแบบ end-to-end บน Local และ Railway Cloud
- Debug ปัญหา integration ระหว่าง services
- จัดทำ README.md, TEAM_SPLIT.md และ screenshots
- ถ่าย screenshots ตามที่กำหนดในโจทย์

---

## เหตุผลในการแบ่งงาน
แบ่งงานตาม **Service Boundary** ของระบบ โดยคนที่ 1 รับผิดชอบ User Service และ Frontend ซึ่งเป็นส่วนใหม่ทั้งหมดใน Set 2 ส่วนคนที่ 2 รับผิดชอบ Auth Service และ Task Service ซึ่งเป็นการต่อยอดจาก Set 1 รวมถึง docker-compose ที่เชื่อมทุกอย่างเข้าด้วยกัน การแบ่งแบบนี้ทำให้แต่ละคนเป็นเจ้าของ service ของตนเองอย่างชัดเจนและสามารถทำงานแบบ parallel ได้

---

## สรุปการเชื่อมโยงงานของสมาชิก
งานของทั้งสองคนเชื่อมกันที่จุดสำคัญคือ **Register Flow** — เมื่อ auth-service (คนที่ 2) รับ register request แล้ว จะต้องเรียก user-service (คนที่ 1) ให้สร้าง profile อัตโนมัติ ดังนั้นทั้งคู่ต้องตกลง internal endpoint และ data format ให้ตรงกันก่อน นอกจากนี้ต้องใช้ **JWT_SECRET** ค่าเดียวกัน เพื่อให้ทุก service verify token ได้ถูกต้อง
