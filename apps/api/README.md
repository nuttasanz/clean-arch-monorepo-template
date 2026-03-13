# badminton-nexus-api
# Badminton Nexus - Exploring Under the Hood 🚀

โปรเจคนี้ถูกออกแบบมาเพื่อเป็นสื่อการเรียนรู้พื้นฐานของ Backend Development โดยเน้นไปที่ **SOLID Principles**, **Clean Architecture**, และการใช้ **Raw SQL** เพื่อให้เข้าใจสิ่งที่ซ่อนอยู่ภายใต้ Framework หรือ ORM ต่างๆ

---

## 1. Clean Architecture: The Layered Mental Model

เพื่อให้เห็นภาพง่ายที่สุด ให้มองว่าโปรเจคของเราคือ **"หอมหัวใหญ่" (Onion Architecture)** ที่มีชั้นต่าง ๆ ห่อหุ้มกันอยู่:

### 🔵 Inner Layer: Domain & entities

- **ไฟล์:** `src/modules/user/domain/User.ts`
- **เป้าหมาย:** เก็บ "กฎของธุรกิจ" (Business Rules) ที่ไม่มีวันเปลี่ยน ไม่ว่าคุณจะใช้ Database อะไร หรือใช้ Web Framework ไหนก็ตาม
  Entity: คือ "สิ่งที่ระบบเรามองว่าเป็น User" (ใช้ใน Business Logic)
  Schema: คือ "วิธีที่เราเก็บ User ลงในแผ่นดิสก์" (ใช้ใน Database)

### 🟢 Middle Layer: Use Cases (Application Logic)

- **ไฟล์:** `src/modules/auth/useCases/RegisterUser/RegisterUserUseCase.ts`
- **เป้าหมาย:** เป็นส่วนที่บอกว่า "ระบบต้องทำอะไรบ้าง" เช่น สมัครสมาชิกต้องเช็คเมล์ซ้ำ -> Hash รหัสผ่าน -> บันทึกลง DB
- **สำคัญ:** ชั้นนี้จะคุยกับ Database ผ่าน Interface เท่านั้น ไม่สนใจว่าข้างหลังจะเป็น SQL หรือ NoSQL

### 🔴 Outer Layer: Infrastructure (Drivers & Tools)

- **ไฟล์:** `src/infra/`, `src/shared/middlewares/`
- **เป้าหมาย:** ส่วนเชื่อมต่อกับโลกภายนอก เช่น HTTP (Express), SQL (Postgres), JWT
- **ทำไมต้องแยก?** เพราะเทคโนโลยีพวกนี้เปลี่ยนบ่อยที่สุด การแยกไว้ชั้นนอกสุดทำให้เราเปลี่ยน Library ได้โดยไม่กระทบ Logic หลักในชั้นใน

---

## 2. Request Lifecycle: เมื่อ User ส่งข้อมูลมา เกิดอะไรขึ้น?

1.  **Route:** `auth.routes.ts` รับ Request -> ส่งต่อให้ Controller
2.  **Controller:** `RegisterUserController.ts` สกัดข้อมูลจาก `req.body` -> ตรวจสอบความถูกต้องเบื้องต้นด้วย **Zod** -> เรียกใช้ Use Case
3.  **Dependency Injection (DI):** `tsyringe` จะทำการฉีด `SqlUserRepository` เข้าไปใน Use Case โดยอัตโนมัติ
4.  **Use Case:** `RegisterUserUseCase.ts` รัน Business Logic -> สั่งบันทึกข้อมูลผ่าน Repository
5.  **Repository:** `SqlUserRepository.ts` เขียนคำสั่ง **Raw SQL** ส่งไปที่ Postgres จริงๆ
6.  **Response:** ข้อมูลไหลย้อนกลับจาก Repository -> Use Case -> Controller -> ส่ง JSON กลับให้ User

---

## 3. SOLID Principles: ทำไปเพื่ออะไร? (Deep Dive)

### D: Dependency Inversion (หัวใจของความยืดหยุ่น)

ปกติแล้ว Junior มักจะเขียนแบบนี้:
`const repo = new SqlUserRepository();` (ผูกติดกับ SQL ทันที)

แต่เราเขียนแบบนี้:
`@inject('UserRepository') private userRepository: IUserRepository`
**Mental Model:** เหมือนคุณสร้างเต้ารับปลั๊กไฟ (Interface) ไว้บนกำแพง คุณไม่สนว่าใครจะเอาพัดลมหรือทีวีมาเสียบ ขอแค่ปลั๊กมันเข้ากันได้ก็พอ (Substitution)

### S: Single Responsibility (ลดความสับสน)

ทำไมต้องมี Controller และ Use Case แยกกัน?

- **Controller:** สนใจเรื่อง HTTP (Status Code, JSON, Cookies)
- **Use Case:** สนใจเรื่อง Business (Validation, Password Hashing, DB Logic)
  ถ้าวันหนึ่งคุณอยากทำ "สมัครสมาชิกผ่าน CMD (Terminal)" คุณแค่สร้าง Command Handler ใหม่มาเรียก Use Case เดิมได้ทันที!

---

## 4. Why Raw SQL? (Fundamental Mastery)

ในโลกการทำงานจริง ORM (เช่น Prisma, TypeORM) ช่วยให้เราทำงานไว แต่ **Raw SQL** ช่วยให้เรา "เก่ง":

1.  **Query Optimization:** คุณจะเห็นชัดเจนว่า `SELECT *` ต่างจาก `SELECT id, name` อย่างไรในแง่ Performance
2.  **Index Understanding:** คุณจะเข้าใจว่าทำไมเราต้องสร้าง `CREATE INDEX idx_users_email` เพราะคุณเป็นคนเขียนคำสั่งนั้นเอง
3.  **Database Agnostic:** ถ้าคุณแม่น SQL คุณจะย้ายไปเขียนภาษาไหนก็ได้ (Go, Python, Rust) โดยไม่ต้องเริ่มเรียน ORM ใหม่ทุกครั้ง

---

## 6. Error Handling & ApiResponse: การจัดการข้อผิดพลาดให้ "งามๆ"

ในโปรเจคนี้เราให้ความสำคัญกับการตอบกลับ (Response) ที่มีโครงสร้างชัดเจน ไม่ว่าจะเป็น Success หรือ Error:

### 🟢 ApiResponse Utility

- **ไฟล์:** `src/shared/utils/ApiResponse.ts`
- เราใช้ Class นี้เพื่อควบคุมหน้าตาของ JSON ที่ส่งกลับไปหา User ให้เหมือนกันทั้งระบบ:
  - `{ status: "success", message: "...", data: { ... } }`
  - `{ status: "error", message: "...", errors: [ ... ] }`

### 🔴 Global Error Handler

- **ไฟล์:** `src/shared/middlewares/ErrorHandler.ts`
- เมื่อเกิด Error ขึ้นในชั้นไหนก็ตาม (Controller, Use Case, หรือ Repository) เราจะไม่ `try-catch` ซ้ำซ้อน แต่จะปล่อยให้ Error พุ่งออกมาที่ **Global Middleware** ตัวนี้
- **Zod Validation:** เราดักจับ `ZodError` แยกออกมาเป็นพิเศษ เพื่อแปลงจาก Error Message ดิบๆ ของ Library ให้กลายเป็นรายการ `field` และ `message` ที่อ่านง่าย (งามๆ) และส่งกลับไปพร้อม **Status 400 (Bad Request)** ทันที

---

## 7. Directory Structure at a Glance

```text
src
 ├── @types          # ขยายความสามารถของ Library (เช่น เพิ่ม .user ใน Request)
 ├── infra           # ส่วนเชื่อมต่อภายนอก (HTTP, Database Connection)
 ├── modules         # แบ่งตาม Feature (User, Auth, Booking)
 │    └── useCases   # Logic ของแต่ละ Feature (แยกโฟลเดอร์ละ 1 งาน)
 ├── shared          # ของที่ใช้ร่วมกัน (Errors, Middlewares, DI Container)
 └── scripts         # Utility scripts (เช่น init-db)
```

---

## How to Run (Updated)

1.  **Docker:** `docker-compose up -d` (เพื่อรัน Postgres)
2.  **Install:** `pnpm install`
3.  **Schema:** `pnpm exec ts-node -r tsconfig-paths/register src/scripts/init-db.ts` (สร้าง Table)
4.  **New Table** หากมี table ใหม่ ให้ไปแก้ที่ `src/infra/database/schema.sql` แล้วรัน `pnpm exec ts-node -r tsconfig-paths/register src/scripts/init-db.ts` อีกครั้ง
5.  **Dev:** `pnpm run dev` (เริ่มเขียนโค้ด!)

> [!TIP]
> ลองพยายามเพิ่มฟิลด์ใหม่ใน User ดูครับ (เช่น `avatar_url`) แล้วไล่แก้ตั้งแต่ `schema.sql` -> `User.ts` -> `SqlUserRepository.ts` -> `RegisterUserDTO.ts` คุณจะเห็นภาพ Flow ทั้งหมดอย่างชัดเจน!
