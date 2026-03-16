# INDIVIDUAL_REPORT_6754321006-0.md

## ข้อมูลผู้จัดทำ
- ชื่อ-นามสกุล: นายณัฐวิโรจน์ สุทธิธารมงคล
- รหัสนักศึกษา: 67543210026-0
- กลุ่ม: S1-12

## ขอบเขตงานที่รับผิดชอบ
รับผิดชอบความเรียบร้อยของระบบในภาพรวม โดยเน้นหนักที่ส่วนของ Backend พัฒนาโครงสร้างและ Logic ของ Auth Service, Task Service และ Log Service ,Database,Docker Compose

## สิ่งที่ได้ดำเนินการด้วยตนเอง
1. **Frontend Development & Refactoring**:
   -พัฒนาโครงสร้างและ Logic ของ Auth Service, Task Service และ Log Service
   -ออกแบบ Schema และจัดการ init.sql สำหรับการ Seed ข้อมูลเบื้องต้นในฐานข้อมูล
2. **Database**
   -สร้าง bcrypt hash จริงแล้วแทนค่าลงในส่วน INSERT INTO users
3. **Internal Module & Database Cleanup**:
   -- แก้ไข Bug ใน `auth-service` ที่มีการเรียกใช้โมดูลที่ไม่มีอยู่จริง (`seed.js`, `init.sql` ภายในโฟลเดอร์ src) โดยปรับให้ไปใช้ฐานข้อมูลหลักเพียงจุดเดียว (Centralized Database)
## ปัญหาที่พบและวิธีการแก้ไข
- ปัญหา npm ci ล้มเหลวเพราะ package.json กับ package-lock.json ที่ install มีเวอร์ชั่นไม่ตรงกันแก้โดยลบ package-lock.json กับ node module แล้วรัน npm install ใหม่
- Browser แจ้งเตือน Your connection is not private เกิดจากใช้ self-signed certificate ซึ่ง browser ไม่ไว้วางใจ แก้โดยกด Advanced → Proceed to localhost (unsafe) เพราะในงานนี้เป็น development environment ไม่ใช่ production
## สิ่งที่ได้เรียนรู้จากงานนี้
- Security Architecture: เข้าใจกระบวนการทำ HTTPS Termination บน Nginx และการส่งต่อ Request ไปยัง Backend Services ภายในเครือข่าย Docker
- JWT Authentication Flow: ได้เรียนรู้การจัดการ Token ตั้งแต่การรับจาก API การเก็บใน LocalStorage และการแนบไปกับ Header สำหรับการเรียกใช้ Service อื่นๆ (Task/Log Service)
## แนวทางการพัฒนาต่อไปใน Set 2
อธิบายว่าหากต้องต่อยอดงานนี้ไปยัง Set 2 ควรปรับหรือแยกองค์ประกอบใดเพิ่มเติม
