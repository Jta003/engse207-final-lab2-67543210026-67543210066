# TEAM_SPLIT.md

## Team Members
- 67543210066-6 นายศุภโชค แสงจันทร์ (นักศึกษาคนที่ 1)
- 67543210026-0 นายณัฐวิโรจน์ สุทธิธารมงคล (นักศึกษาคนที่ 2)

## Work Allocation

### Student 1: นายศุภโชค แสงจันทร์
- **รับผิดชอบ Frontend ทั้งหมด**: พัฒนาและปรับปรุงหน้า `index.html`, `logs.html`, การจัดการ CSS/UI และ Client-side JavaScript ทั้งหมด
- **รับผิดชอบ Nginx (API Gateway)**: การตั้งค่า Reverse Proxy, HTTPS Termination (SSL), และการจัดการ Route ต่างๆ บน Nginx
- **รับผิดชอบ Integration & Testing**: ดำเนินการทดสอบระบบ T1-T11 แบบ End-to-End และการตรวจสอบความเชื่อมโยงระหว่าง Frontend และ Backend

### Student 2: นายณัฐวิโรจน์ สุทธิธารมงคล
- **รับผิดชอบ Backend ทั้งหมด**: พัฒนาโครงสร้างและ Logic ของ Auth Service, Task Service และ Log Service
- **รับผิดชอบ Database**: ออกแบบ Schema และจัดการ `init.sql` สำหรับการ Seed ข้อมูลเบื้องต้นในฐานข้อมูล
- **รับผิดชอบ Docker Compose**: การตั้งค่า Container และ Network พื้นฐานภายในระบบ

## Shared Responsibilities
- ทดสอบระบบภาพรวมและปรับจูนความเสถียรของ API ร่วมกัน
- จัดทำ README และรวบรวมหลักฐานการทดสอบ (Screenshots) ร่วมกัน

## Reason for Work Split
แบ่งงานตามความเชี่ยวชาญ (Technical Responsibility) โดยแยกฝั่งการพัฒนาอย่างชัดเจนระหว่าง Client-side (Frontend + Nginx) และ Server-side (Backend Services + Database) เพื่อให้สามารถพัฒนาขนานกันได้อย่างมีประสิทธิภาพ

## Integration Notes
Frontend (Student 1) จะส่งสารผ่าน Nginx (Student 1) ไปยัง Backend Services ต่างๆ (Student 2) โดยใช้โปรโตคอล HTTPS และทำการตรวจสอบสิทธิ์ผ่าน JWT Token เป็นสื่อกลางในการเชื่อมโยงข้อมูลระหว่างกัน
