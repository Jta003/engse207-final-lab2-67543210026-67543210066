# INDIVIDUAL_REPORT_67543210026-0.md

## ข้อมูลผู้จัดทำ
- ชื่อ-นามสกุล: นายศุภโชค แสงจันทร์
- รหัสนักศึกษา: 67543210066-6
- กลุ่ม: S1-12

---

## ขอบเขตงานที่รับผิดชอบ

- **Frontend** — ออกแบบและพัฒนาหน้าเว็บ `index.html` และ `profile.html` ให้รองรับ Register, Login, Task CRUD และการแก้ไขโปรไฟล์
- **User Service** — พัฒนา user-service ใหม่ทั้งหมด สำหรับจัดการโปรไฟล์ผู้ใช้และ admin จัดการ users
- **ลบ Nginx** — ถอด nginx ออกจากระบบ Set 2 เนื่องจากใช้ Railway Direct Service URL แทน
- **config.js** — เพิ่มไฟล์ config สำหรับกำหนด URL ของแต่ละ service ให้ frontend ใช้งานได้ทั้ง Local และ Cloud

---

## สิ่งที่ได้ดำเนินการด้วยตนเอง

- เขียน `user-service/src/routes/users.js` ครอบคลุม endpoint ดังนี้
  - `GET /api/users/me` — ดูโปรไฟล์ตัวเอง พร้อม auto-create ถ้ายังไม่มี
  - `PUT /api/users/me` — แก้ไขโปรไฟล์ตัวเอง
  - `GET /api/users` — admin ดูรายชื่อ users ทั้งหมด
  - `GET /api/users/:id` — admin ดูโปรไฟล์คนอื่น
  - `PUT /api/users/:id` — admin แก้ไขโปรไฟล์คนอื่น รวมถึงเปลี่ยน role ได้
  - `POST /api/users/internal/create-profile` — internal endpoint รับจาก auth-service ตอน register
- ออกแบบ `user-db` schema ตาราง `user_profiles` และ `logs`
- พัฒนา `frontend/index.html` ให้มี dark theme เหมือน Set 1 พร้อมเพิ่ม tab Register ใหม่
- พัฒนา `frontend/profile.html` แสดงโปรไฟล์และฟอร์มแก้ไข โดย admin จะเห็นตารางรายชื่อ users ทั้งหมดพร้อมปุ่มแก้ไข
- สร้าง `frontend/config.js` เพื่อแยก URL configuration ออกจากโค้ดหลัก
- ถอด nginx และ log-service ออกจาก `docker-compose.yml` และปรับโครงสร้างให้เหมาะสมกับ Set 2

---

## ปัญหาที่พบและวิธีการแก้ไข

**ปัญหาที่ 1 — Frontend เรียก API ไม่ได้เพราะ URL ผิด**

เดิม `config.js` ใช้ `window.location.origin` ซึ่งชี้ไปที่ port 8080 ของ frontend แต่ Set 2 ไม่มี nginx คอย route ต่อให้แล้ว ทำให้ทุก request ได้ 404

วิธีแก้: เปลี่ยนให้ชี้ตรงไปแต่ละ service port เลย เช่น `http://localhost:3001` สำหรับ Local และ Railway URL จริงสำหรับ Cloud

**ปัญหาที่ 2 — user-service เชื่อมต่อ DB ผิดตัวบน Railway**

Railway deploy แล้ว `DATABASE_URL` ชี้ไปที่ DB ของ service อื่น เพราะใช้ชื่อ reference ผิด

วิธีแก้: ตรวจสอบชื่อ DB service ใน Railway ให้ตรงก่อนตั้ง `${{user.db.DATABASE_URL}}` และใช้ Public URL ชั่วคราวระหว่างทดสอบ

**ปัญหาที่ 3 — `relation "user_profiles" does not exist` บน Railway**

Railway ไม่รัน `init.sql` อัตโนมัติแบบ Docker Compose ทำให้ไม่มี table เมื่อ service พยายามเข้าถึง

วิธีแก้: รัน `init.sql` ด้วยตนเองผ่าน `psql` โดยใช้ Public URL ของ database

---

## สิ่งที่ได้เรียนรู้จากงานนี้

**เชิงเทคนิค:**
- การออกแบบ **Database-per-Service Pattern** ทำให้แต่ละ service เป็นอิสระจากกัน แต่ต้องระวังเรื่อง data consistency เพราะไม่มี Foreign Key ข้าม DB
- การใช้ **logical reference** แทน Foreign Key จริงใน Microservices — `user_id` ใน task-db และ user-db คือตัวเลขที่อ้างอิงไปยัง auth-db โดยไม่มี constraint บังคับ
- การ Deploy บน **Railway** ต่างจาก Docker Compose ตรงที่ต้องจัดการ DB schema เองและตั้งค่า Environment Variables ให้ถูกต้อง
- **CORS** ต้องเปิดให้ครอบคลุมเมื่อ frontend และ backend อยู่คนละ domain

**เชิงสถาปัตยกรรม:**
- การตัดสินใจลบ nginx ออกและใช้ Direct Service URL แทนคือ **Gateway Strategy** แบบหนึ่ง — เหมาะสมกับการเรียนรู้และทดสอบแต่ละ service อย่างอิสระ แต่ในระบบจริงควรมี API Gateway เพื่อความปลอดภัยและความสะดวก
- การแยก service ทำให้ deploy และ debug ได้อิสระ แต่เพิ่ม complexity ในการบริหารจัดการ

---

## แนวทางการพัฒนาต่อไปใน Set 2 (สิ่งที่อยากปรับปรุง)

- เพิ่ม **API Gateway** เช่น nginx หรือ Kong เพื่อรวม endpoint ไว้ที่จุดเดียวบน Cloud
- เพิ่ม **file upload** สำหรับ avatar แทนการใช้ URL
- เพิ่มการ **sync user data** ระหว่าง auth-db และ user-db เมื่อมีการอัปเดตข้อมูลผู้ใช้
- เพิ่ม **pagination** ในหน้ารายชื่อ users สำหรับ admin
