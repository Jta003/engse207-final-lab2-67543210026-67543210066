# INDIVIDUAL_REPORT_67543210066-6.md

## ข้อมูลผู้จัดทำ
**ชื่อ-นามสกุล:** นายศุภโชค แสงจันทร์
**รหัสนักศึกษา:** 67543210066-6
**กลุ่ม:** S1-12

## ขอบเขตงานที่รับผิดชอบ
รับผิดชอบความเรียบร้อยของระบบในภาพรวม โดยเน้นหนักที่ส่วนของ **Frontend**, **Nginx (API Gateway)** และการทำ **Integration Debugging** เพื่อเชื่อมต่อ Services ต่างๆ เข้าด้วยกัน

## สิ่งที่ได้ดำเนินการด้วยตนเอง
1. **Frontend Development & Refactoring**:
   - ปรับปรุงหน้า `index.html` โดยลบฟีเจอร์ที่ไม่จำเป็นออก (Register Tab, Users Page) ตามข้อกำหนดของ Task Board Security
   - อัปเดต API Endpoint ให้รองรับ HTTPS และเพิ่มลิงก์เชื่อมต่อไปยัง Log Dashboard
   - แก้ไข Logic การ Login โดยเพิ่ม Error Handling (`try-catch`) เพื่อป้องกันปุ่มค้าง (Infinite Spinner) เมื่อเกิดข้อผิดพลาดในการเชื่อมต่อ
   - จัดการข้อมูลทดสอบ (Hints) ให้ตรงกับฐานข้อมูลจริงเพื่อรองรับการทดสอบระบบ
2. **Nginx & HTTPS Configuration**:
   - ตรวจสอบและจัดการ Nginx ให้ทำหน้าที่เป็น Reverse Proxy และจัดการ HTTPS Termination อย่างถูกต้อง
   - จัดการปัญหาการ Redirect จาก HTTP ไปยัง HTTPS
3. **Internal Module & Database Cleanup**:
   - แก้ไข Bug ใน `auth-service` ที่มีการเรียกใช้โมดูลที่ไม่มีอยู่จริง (`seed.js`, `init.sql` ภายในโฟลเดอร์ src) โดยปรับให้ไปใช้ฐานข้อมูลหลักเพียงจุดเดียว (Centralized Database)
   - ปรับปรุงการเชื่อมต่อ Database ใน `db.js` และ `index.js` ของ Auth Service ให้ทำงานได้อย่างถูกต้องโดยไม่ต้องพึ่งพาไฟล์ Seed ภายใน
4. **System Verification (T1-T11)**:
   - ตรวจสอบสถานะและ Health Check ของทุก Container ให้ทำงานปกติ (T1)
   - ทดสอบการเข้าถึงหน้าเว็บผ่าน HTTPS และการทำ HTTP → HTTPS Redirect (T2)
   - ทดสอบ Login (T3-T4), การจัดการ Task CRUD (T5-T8), ความปลอดภัยของ API (T9)
   - ตรวจสอบสิทธิ์การใช้งาน (RBAC) ของ Member และ Admin (T10A-T10B) และ Rate Limiting (T11)


## ปัญหาที่พบและวิธีการแก้ไข
1. **ปัญหา Login ค้าง (Infinite Spinning)**: เมื่อระบบ Backend มีปัญหาหรือเกิด Network Error ตัว Frontend ไม่ได้จัดการข้อผิดพลาดทำให้ปุ่มหมุนค้าง
   - **วิธีแก้ไข:** เพิ่มบล็อก `try-catch` ในฟังก์ชัน `doLogin` เพื่อให้ในกรณีที่ `fetch` ล้มเหลว ระบบจะทำการ Reset ปุ่มเข้าสู่ระบบให้กลับมาใช้งานได้และแสดงข้อความแจ้งเตือนผู้ใช้
2. **ปัญหา 502 Bad Gateway ของ Auth Service**: หลังจากมีการ Rebuild ระบบ Nginx ไม่สามารถเชื่อมต่อไปยัง Service ได้เนื่องจาก IP ภายในเปลี่ยนแปลง หรือโมดูลภายใน Service Crash
   - **วิธีแก้ไข:** ตรวจสอบ docker logs เพื่อหาจุดที่ Code Crash และลบคำสั่งเรียกโมดูลที่ไม่ได้ใช้งานออก พร้อมทั้งสั่ง Restart Nginx เพื่อให้ Refresh การทำ Upstream DNS Resolution ใหม่



## สิ่งที่ได้เรียนรู้จากงานนี้
- **Security Architecture**: เข้าใจกระบวนการทำ HTTPS Termination บน Nginx และการส่งต่อ Request ไปยัง Backend Services ภายในเครือข่าย Docker
- **JWT Authentication Flow**: ได้เรียนรู้การจัดการ Token ตั้งแต่การรับจาก API การเก็บใน LocalStorage และการแนบไปกับ Header สำหรับการเรียกใช้ Service อื่นๆ (Task/Log Service)
- **Integration & Debugging**: ฝึกทักษะการอ่าน Logs จากหลายแหล่ง (Container logs, Browser Console, Nginx logs) เพื่อนำมาวิเคราะห์ปัญหาความเชื่อมโยงระหว่าง Service ในสถาปัตยกรรม Microservices

## แนวทางการพัฒนาต่อไปใน Set 2
หากต้องต่อยอดไปยัง Set 2 ควรพิจารณาเรื่อง **Database Separation** โดยแยกฐานข้อมูลออกตามเขตุความรับผิดชอบของ Service (เช่นแยก Auth DB ออกจาก Task DB) เพื่อลดการพึ่งพากันระหว่าง Service (Loose Coupling) และเพิ่มระบบ **Refresh Token** เพื่อความปลอดภัยในการจัดการ Session ของผู้ใช้งานที่ดียิ่งขึ้น
