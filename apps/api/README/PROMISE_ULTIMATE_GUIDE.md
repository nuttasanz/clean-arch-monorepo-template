# คู่มือ Promises ฉบับสมบูรณ์ (Zero to Hero)

> **ป้าย**: คู่มือนี้ถูกเขียนสำหรับนักพัฒนาที่ต้องการเข้าใจ JavaScript Promises อย่างลึกซึ้ง — ตั้งแต่พื้นฐานจนถึง Pattern ระดับ Senior ทั้งหมดในภาษาไทย

---

## บทที่ 1: วิวัฒนาการของ "เวลา" — ทำไมเราถึงต้องมี Promise?

ก่อนจะเข้าใจ Promise ต้องเข้าใจปัญหาที่มันแก้ไขก่อน

### 🐌 Synchronous — พนักงานยืนเฝ้าเตา (Blocking Code)

ลองนึกภาพพนักงานเสิร์ฟที่เดินไปสั่งซุปกับครัว แล้วยืนเฝ้าหน้าเตารอจนซุปพร้อม ในระหว่างนั้น ลูกค้าคนอื่นบนโต๊ะอื่นก็ต้องรอด้วย ไม่มีใครรับออร์เดอร์เพิ่มได้เลย

นี่คือโค้ด Synchronous หรือ **Blocking Code** — คำสั่งต่างๆ รันทีละบรรทัดเรียงกัน และถ้าบรรทัดไหนใช้เวลานาน (เช่น เรียก API, อ่านไฟล์) ทุกอย่างหยุดรอ

```typescript
// ❌ แบบ Synchronous — หน้าจอแข็งค้างไปเลย
const data = fetchDataSync("https://api.example.com/users"); // รอจนเสร็จ
console.log(data); // บรรทัดนี้ต้องรอ
console.log("ทำอย่างอื่นไม่ได้ระหว่างรอ..."); // ไม่ถูกรันจนกว่า fetchData จะเสร็จ
```

---

### 📋 Callbacks — ทิ้งเบอร์โทรไว้ (Non-blocking แบบเก่า)

ทางออกแรกคือ **Callback** — แทนที่จะยืนรอ ให้เขียนชีตโน้ตทิ้งไว้ว่า "เสร็จแล้วโทรมาบอกด้วยนะ"

ฟังดูดี แต่เมื่อ logic ซับซ้อนขึ้น มันกลายเป็น **Callback Hell** (หรือ Pyramid of Doom):

```typescript
// ❌ Callback Hell — ลูกศรชี้ขึ้นไปเรื่อยๆ
getUser(userId, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetails(orders[0].id, (details) => {
      getShippingInfo(details.shipping_id, (shipping) => {
        // ตอนนี้เรากำลังทำอะไรอยู่อีก?
        // โค้ดหายไปในหลุมดำของ callback...
        console.log(shipping.address);
      });
    });
  });
});
```

**ปัญหาของ Callbacks:**

- อ่านยาก, เดบัก ยากมาก
- การจัดการ Error ต้องทำในทุก callback แยกกัน
- ลำดับการรันไม่ชัดเจน

---

### 🔔 Promise — เพจเจอร์ร้านอาหาร (The Modern Solution)

คุณเคยไปร้านอาหารที่ไม่มีที่นั่งไหม? พนักงานจะให้ **เพจเจอร์** (กล่องสั่นสีแดง) กับคุณ แล้วบอกว่า "ไปนั่งรอตรงไหนก็ได้เลย พอโต๊ะว่าง เพจเจอร์จะสั่น"

คุณไม่ต้องยืนเฝ้าหน้าพนักงานต้อนรับ คุณไปนั่งคุยกับเพื่อน เล่นโทรศัพท์ หรือทำอะไรก็ได้ระหว่างรอ

**Promise คือเพจเจอร์นั้น** — เป็น Object ที่แทนค่าของ "ผลลัพธ์ในอนาคต" ที่ยังไม่เกิดขึ้น ณ ตอนนี้

```typescript
// ✅ แบบ Promise — สะอาด, อ่านง่าย
const userPromise = fetchUser(userId); // ได้ Promise กลับมาทันที เหมือนรับเพจเจอร์
// โค้ดตรงนี้ทำงานต่อได้เลย ไม่ต้องรอ fetchUser
console.log("รับเพจเจอร์แล้ว ไปทำอย่างอื่นต่อได้เลย");
```

---

## บทที่ 2: กายวิภาคของ Promise — ชีวิตของเพจเจอร์

Promise มี **3 สถานะ** เหมือนเพจเจอร์:

| สถานะ         | ภาษาร้านอาหาร          | ความหมาย                      |
| ------------- | ---------------------- | ----------------------------- |
| **Pending**   | กำลังรอ                | กำลังประมวลผล ยังไม่มีผลลัพธ์ |
| **Fulfilled** | เพจเจอร์สั่นสีเขียว ✅ | สำเร็จ มีข้อมูลกลับมา         |
| **Rejected**  | เพจเจอร์สั่นสีแดง ❌   | ล้มเหลว มี Error กลับมา       |

**กฎสำคัญ:** Promise เปลี่ยนสถานะได้เพียงครั้งเดียว และไม่มีวันย้อนกลับ

### ⚠️ "Resolved" ≠ "Fulfilled" — ความแตกต่างที่คนมักสับสน

> 📖 **จาก MDN:** คำว่า **"resolved"** ถูกใช้บ่อยจนสับสนกับ "fulfilled" แต่ความหมายจริงๆ ต่างกัน

| คำศัพท์       | ความหมาย                                                   |
| ------------- | ---------------------------------------------------------- |
| **Settled**   | Promise จบแล้ว — ไม่ว่าจะเป็น Fulfilled หรือ Rejected      |
| **Fulfilled** | สำเร็จ มีค่า value กลับมา                                  |
| **Rejected**  | ล้มเหลว มี reason (error) กลับมา                           |
| **Resolved**  | ถูก "ล็อค" ให้ตาม Promise อื่น — อาจยัง Pending อยู่ก็ได้! |

```typescript
// ตัวอย่างจาก MDN: Promise ที่ "resolved" แต่ยัง "pending"
const outer = new Promise((resolveOuter) => {
  resolveOuter(
    // resolve ด้วย Promise อื่น — outer จึง "resolved" แต่ยัง pending!
    new Promise((resolveInner) => {
      setTimeout(resolveInner, 1000); // outer จะ fulfilled ก็ต่อเมื่อ inner fulfilled
    }),
  );
});
// ณ บรรทัดนี้: outer ถูก resolved แล้ว แต่ยังไม่ fulfilled
// จะ fulfilled จริงๆ ใน 1 วินาทีต่อมา
```

**สรุปสั้นๆ:** "Resolved" หมายความว่า Promise ไม่สามารถเปลี่ยนชะตากรรมได้อีกต่อไปแล้ว แต่ผลลัพธ์สุดท้ายอาจยังไม่รู้ (ถ้า resolve ด้วย Promise อื่น) ในทางปฏิบัติ เมื่อ resolve ด้วยค่าธรรมดา (non-Promise) มันจะ fulfilled ทันที

### การสร้าง Promise ด้วย `new Promise()`

```typescript
// กำหนด type สำหรับ response
interface User {
  id: number;
  name: string;
}

// การสร้าง Promise — เหมือนโปรแกรมครัวที่ตัดสินใจว่าจะส่งสัญญาณอะไร
const cookSoupPromise = new Promise<string>((resolve, reject) => {
  const ingredientsAvailable = true; // เปลี่ยนเป็น false เพื่อดูการ reject

  setTimeout(() => {
    if (ingredientsAvailable) {
      // ✅ เพจเจอร์สั่นสีเขียว: ทำซุปเสร็จแล้ว!
      resolve("ซุปต้มยำกุ้ง พร้อมเสิร์ฟ!");
    } else {
      // ❌ เพจเจอร์สั่นสีแดง: วัตถุดิบหมด!
      reject(new Error("วัตถุดิบหมด ทำซุปไม่ได้"));
    }
  }, 2000); // จำลองการทำอาหารที่ใช้เวลา 2 วินาที
});

console.log(cookSoupPromise); // Promise { <pending> } — ยังไม่เสร็จ เพจเจอร์ยังเงียบอยู่
```

**ข้อสังเกต:**

- `resolve(value)` — ทำให้ Promise กลายเป็น **Fulfilled** พร้อมกับ `value` นั้น
- `reject(error)` — ทำให้ Promise กลายเป็น **Rejected** พร้อมกับ `error` นั้น
- ฟังก์ชันใน `new Promise(...)` รันทันที แต่ resolve/reject อาจเกิดขึ้นในอนาคต

---

## บทที่ 3: การรับประทานอาหาร — Consuming a Promise ด้วย `.then()` Chain

เมื่อเพจเจอร์สั่น คุณต้องมีแผนว่าจะทำอะไร ใน Promise เราใช้ `.then()`, `.catch()`, และ `.finally()`

### `.then()` — ทำอะไรเมื่อเพจเจอร์สั่นสีเขียว

```typescript
cookSoupPromise.then((soupName) => {
  // soupName คือค่าที่ถูก resolve มา
  console.log(`ยอดเยี่ยม! ได้รับ: ${soupName}`); // "ซุปต้มยำกุ้ง พร้อมเสิร์ฟ!"
  console.log("นั่งลงที่โต๊ะ เตรียมตะเกียบได้เลย");
});
```

### `.catch()` — ทำอะไรเมื่อเพจเจอร์สั่นสีแดง (Error Handling)

**นี่เป็นส่วนที่สำคัญมาก** ถ้าไม่มี `.catch()` และ Promise ถูก reject โปรแกรมจะมี Unhandled Promise Rejection ซึ่งอาจ crash Node.js process ได้

```typescript
cookSoupPromise
  .then((soupName) => {
    console.log(`ได้รับ: ${soupName}`);
  })
  .catch((error) => {
    // error คือ Error object ที่ถูก reject มา
    console.error(`เกิดข้อผิดพลาด: ${error.message}`); // "วัตถุดิบหมด ทำซุปไม่ได้"
    // จัดการ error ที่นี่ เช่น แจ้ง user, fallback ไปเมนูอื่น
  });
```

### `.finally()` — คืนเพจเจอร์ที่เคาน์เตอร์ ไม่ว่าผลจะเป็นอะไร

`.finally()` รันเสมอ ไม่ว่า Promise จะ Fulfilled หรือ Rejected ใช้สำหรับ cleanup เช่น ปิด loading spinner

```typescript
let isLoading = true;

cookSoupPromise
  .then((soupName) => {
    console.log(`ได้รับ: ${soupName}`);
  })
  .catch((error) => {
    console.error(`เกิดข้อผิดพลาด: ${error.message}`);
  })
  .finally(() => {
    // ✅ รันเสมอ ไม่ว่าจะสำเร็จหรือล้มเหลว — เหมือนคืนเพจเจอร์ที่เคาน์เตอร์
    isLoading = false;
    console.log("ปิด Loading Spinner แล้ว, เพจเจอร์ถูกคืนแล้ว");
  });
```

### การ Chain `.then()` — ส่งอาหารต่อกันเป็นทอดๆ

`.then()` สามารถ chain ต่อกันได้ และค่าที่ return จาก `.then()` หนึ่งจะกลายเป็น input ของ `.then()` ถัดไป:

```typescript
fetchUser(1)
  .then((user) => {
    console.log(`ได้ User: ${user.name}`);
    return fetchOrders(user.id); // return Promise ใหม่ — ส่งต่อให้ .then() ถัดไป
  })
  .then((orders) => {
    console.log(`ได้ ${orders.length} ออร์เดอร์`);
    return orders[0]; // return ค่าธรรมดาก็ได้
  })
  .then((firstOrder) => {
    console.log(`ออร์เดอร์แรก: ${firstOrder.id}`);
  })
  .catch((error) => {
    // .catch() ตัวเดียวจัดการ error จากทุก .then() ข้างบนได้เลย
    console.error(`เกิดข้อผิดพลาดที่ไหนสักที่: ${error.message}`);
  });
```

### 🔬 เบื้องหลัง: Job Queue (Microtask Queue) — ลำดับคิวของเพจเจอร์

> 📖 **จาก MDN:** JavaScript รัน Promise handlers ผ่าน **Job Queue (Microtask Queue)** ซึ่งสำคัญมากในการเข้าใจลำดับการทำงาน

**พฤติกรรมสำคัญ:** แม้ Promise จะ resolve แล้ว ทันที `.then()` handler **ไม่รันทันที** — มันถูกเพิ่มเข้า Job Queue และรันหลัง synchronous code ในปัจจุบันเสร็จก่อน

```typescript
// ตัวอย่างจาก MDN — ลำดับการรันที่น่าแปลกใจ
const promiseA = new Promise((resolve) => {
  resolve(777); // resolve ทันที — แต่ .then() จะยังไม่รัน!
});

promiseA.then((val) => console.log("Async:", val)); // ถูกเพิ่มใน Job Queue
console.log("Sync: immediate"); // รันก่อน!

// Output:
// Sync: immediate        ← รันก่อน (synchronous)
// Async: 777             ← รันหลัง (จาก Job Queue)
```

**Promise หนึ่งตัว สามารถมีหลาย .then() ได้:**

```typescript
const promiseA = new Promise(myExecutor);

// promiseA มี 2 branches — ทั้งคู่รันเมื่อ promiseA settle
const promiseB = promiseA.then(handleFulfilled1, handleRejected1);
const promiseC = promiseA.then(handleFulfilled2, handleRejected2);
// handleFulfilled1 จะถูกเรียกก่อน (ลงทะเบียนก่อน)
```

---

## บทที่ 4: ยุคสมัยใหม่ — `async` / `await` (เขียน Async ให้เหมือน Sync)

`async/await` คือ **"น้ำตาลเคลือบยา" (Syntactic Sugar)** ที่ทำให้โค้ด Promise อ่านง่ายขึ้นมาก มันไม่ใช่ feature ใหม่ มันแค่เป็น shorthand สวยๆ บน `.then()` chain เดิมนั่นเอง

### เปรียบเทียบแบบ Side-by-Side

**โจทย์:** ดึงข้อมูล User แล้วดึงออร์เดอร์ของ User นั้น

```typescript
// --- แบบ .then().catch() ---
function getUserOrdersThen(userId: number) {
  fetchUser(userId)
    .then((user) => {
      return fetchOrders(user.id);
    })
    .then((orders) => {
      console.log(orders);
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
}

// --- แบบ async/await --- (Logic เดิม แต่อ่านง่ายกว่ามาก)
async function getUserOrdersAsync(userId: number) {
  try {
    const user = await fetchUser(userId); // รอจนได้ user
    const orders = await fetchOrders(user.id); // รอจนได้ orders
    console.log(orders);
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
}
```

โค้ดแบบ `async/await` อ่านเหมือน Synchronous ทั่วไป แต่ทำงานแบบ Asynchronous จริงๆ

### 🔑 กฎทอง: `await` ต้องอยู่ใน `async` เสมอ

`await` ไม่สามารถใช้นอก `async function` ได้ (ยกเว้น Top-level await ใน ES Modules บางรูปแบบ)

```typescript
// ❌ Syntax Error — ใช้ await นอก async function ไม่ได้
function badExample() {
  const user = await fetchUser(1); // SyntaxError!
}

// ✅ ถูกต้อง
async function goodExample() {
  const user = await fetchUser(1); // ทำได้ เพราะ function เป็น async
}
```

**เบื้องหลัง:** ฟังก์ชันที่ถูกประกาศด้วย `async` จะ **return Promise เสมอ** แม้ว่าคุณจะ return ค่าธรรมดา

```typescript
async function getName(): Promise<string> {
  return "Nutta"; // ถูก wrap เป็น Promise.resolve('Nutta') อัตโนมัติ
}
// เหมือนกับ: function getName() { return Promise.resolve('Nutta'); }
```

---

## บทที่ 5: เวทมนตร์ระดับ Senior — Advanced Concurrency

เมื่อคุณต้องรัน Promise หลายตัวพร้อมกัน JavaScript มี **Promise Combinators** 4 ตัวที่ทรงพลังมาก เปรียบเหมือนการสั่งอาหารหลายจานพร้อมกัน

---

### 1. `Promise.all` — กฎต้องได้ทั้งหมด (Fail-Fast)

> "สั่งซุป, สเต็ก, และสลัด — ถ้าสลัดตก ยกเลิกทั้งโต๊ะเลย"

รอให้ **ทุก** Promise สำเร็จ รับ Array ของผลลัพธ์กลับมา **แต่ถ้า Promise ตัวใดตัวหนึ่ง reject ทั้งหมดจะ reject ทันที (Fail-fast)**

```typescript
async function getFullMeal() {
  try {
    // รัน 3 Promise พร้อมกัน — ไม่รอทีละตัว!
    const [soup, steak, salad] = await Promise.all([
      cookSoup(), // ใช้เวลา 3 วินาที
      cookSteak(), // ใช้เวลา 5 วินาที
      prepSalad(), // ใช้เวลา 1 วินาที
    ]);
    // ✅ รอแค่ 5 วินาที (เท่ากับตัวที่นานที่สุด) ไม่ใช่ 9 วินาที (3+5+1)
    return { soup, steak, salad };
  } catch (error) {
    // ❌ ถ้า cookSteak() ล้มเหลว — ทั้งหมดจะ reject ทันที
    console.error("ออร์เดอร์ถูกยกเลิก:", error.message);
  }
}
```

**ใช้เมื่อ:** ผลลัพธ์ทุกตัว "ต้องใช้ด้วยกัน" — ขาดอันใดอันหนึ่งไม่ได้

---

### 2. `Promise.allSettled` — ได้แค่ไหน เอาแค่นั้น

> "สั่ง 3 จาน ถ้าสลัดตก ก็เอาซุปกับสเต็กมาก่อนเลย"

รอให้ **ทุก** Promise จบ ไม่ว่าจะ fulfilled หรือ rejected ได้ผลลัพธ์เป็น Array ของ **status objects** เสมอ ไม่มี reject

```typescript
async function dashboardData() {
  const results = await Promise.allSettled([
    fetchUserProfile(), // อาจล้มเหลว
    fetchUserStats(), // อาจล้มเหลว
    fetchUserPosts(), // อาจล้มเหลว
  ]);

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`Task ${index} สำเร็จ:`, result.value);
    } else {
      // result.status === 'rejected'
      console.warn(`Task ${index} ล้มเหลว:`, result.reason.message);
    }
  });
}
```

**ใช้เมื่อ:** Tasks เป็นอิสระต่อกัน และต้องการรู้ผลลัพธ์ทุกตัว แม้บางตัวจะล้มเหลว — เหมาะมากสำหรับ Dashboard ที่รวมข้อมูลจากหลาย API

---

### 3. `Promise.race` — ใครเสร็จก่อน ชนะ

> "ส่งน้ำจาก 3 เส้นทาง ใครมาถึงก่อน ใช้น้ำนั้น"

Return ผลลัพธ์ของ Promise **ตัวแรก** ที่ settle (ไม่ว่าจะ fulfilled หรือ rejected) ตัวอื่นๆ ถูกละเว้น

```typescript
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`หมดเวลา ${timeoutMs}ms`)), timeoutMs),
  );

  // ใครเสร็จก่อนระหว่าง fetch จริง กับ timeout จำลอง?
  return Promise.race([promise, timeoutPromise]);
}

// ใช้งาน: ถ้า API ช้ากว่า 3 วินาที จะได้ Error ทันที
const data = await fetchWithTimeout(fetchUser(1), 3000);
```

**ใช้เมื่อ:** ต้องการ Timeout mechanism หรือ race condition จริงๆ ระหว่าง data sources

---

### 4. `Promise.any` — ขอแค่สำเร็จสักอันก็พอ

> "ส่งข้อความจาก 3 ช่องทาง ช่องแรกที่ส่งสำเร็จก็พอแล้ว"

เหมือน `race` แต่ **ละเว้น rejection** — จะ reject ก็ต่อเมื่อ **ทุก** Promise reject หมด

```typescript
async function fetchFromFastestServer(url: string) {
  try {
    const data = await Promise.any([
      fetchFromServerA(url), // Primary server
      fetchFromServerB(url), // Backup server 1
      fetchFromServerC(url), // Backup server 2
    ]);
    // ✅ ได้ข้อมูลจาก server แรกที่ตอบสนอง แม้อีก 2 ตัวจะล้มเหลว
    return data;
  } catch (error) {
    // ❌ AggregateError — ทุก server ล้มเหลว
    console.error("ทุก Server ไม่ตอบสนอง");
  }
}
```

**ใช้เมื่อ:** มี redundant services/endpoints และต้องการ response ที่เร็วที่สุดและสำเร็จ

---

### 🧵 Concurrency ≠ Parallelism — ข้อเท็จจริงจากใจ MDN

> 📖 **จาก MDN:** JavaScript เป็น **Single-threaded** โดยธรรมชาติ — ณ เวลาใดเวลาหนึ่ง มีแค่ task เดียวที่ทำงาน

`Promise.all()` ไม่ได้ทำให้โค้ดรันพร้อมกัน (Parallel) จริงๆ มันแค่ **interleave** การทำงานระหว่างรอ I/O — เหมือนพนักงานเสิร์ฟคนเดียวที่วิ่งรับออร์เดอร์จากหลายโต๊ะ ไม่ใช่มีพนักงานหลายคน

**ถ้าต้องการ Parallel จริงๆ** → ใช้ [Worker Threads](https://nodejs.org/api/worker_threads.html) ใน Node.js

---

### สรุปตาราง Combinators

| Combinator           | สำเร็จเมื่อ                       | ล้มเหลวเมื่อ           | Use Case                         |
| -------------------- | --------------------------------- | ---------------------- | -------------------------------- |
| `Promise.all`        | ทุกตัว fulfilled                  | มีตัวใดตัวหนึ่ง reject | ต้องการทุกผลลัพธ์                |
| `Promise.allSettled` | ทุกตัว settle แล้ว (ไม่มี reject) | ไม่มีวัน reject        | ต้องการทุกผลลัพธ์ แม้บางตัว fail |
| `Promise.race`       | มีตัวใดตัวหนึ่ง settle            | มีตัวใดตัวหนึ่ง settle | Timeout, Racing                  |
| `Promise.any`        | มีตัวใดตัวหนึ่ง fulfilled         | ทุกตัว reject          | Redundant services               |

---

## บทที่ 6: Static Methods ครบชุด — Utilities ที่ขาดไปจาก Toolbox

> 📖 **จาก MDN:** นอกจาก 4 Combinators แล้ว Promise ยัง มี Static Methods อีกหลายตัวที่มีประโยชน์มาก

### `Promise.resolve()` — สร้าง Promise ที่ Fulfilled ทันที

ใช้เมื่อต้องการ wrap ค่าธรรมดาให้เป็น Promise หรือ "normalize" input ที่อาจเป็น Promise หรือไม่ก็ได้

```typescript
// Wrap ค่าธรรมดาให้เป็น Promise
const p1 = Promise.resolve(42);
p1.then((val) => console.log(val)); // 42

// ถ้า resolve ด้วย Promise อีกตัว — จะ "ตาม" Promise นั้น
const p2 = Promise.resolve(fetchUser(1)); // เหมือนกับ fetchUser(1) เลย

// Use case: Normalize function ที่รับทั้ง sync value และ Promise
async function processInput(input: string | Promise<string>) {
  const value = await Promise.resolve(input); // ทำงานได้ทั้ง 2 กรณี
  return value.toUpperCase();
}
```

---

### `Promise.reject()` — สร้าง Promise ที่ Rejected ทันที

```typescript
// สร้าง rejected Promise ทันที
const failed = Promise.reject(new Error("ไม่พบผู้ใช้"));
failed.catch((err) => console.error(err.message)); // 'ไม่พบผู้ใช้'

// Use case: Early return ในฟังก์ชัน async
async function getAdminUser(userId: number) {
  const user = await fetchUser(userId);
  if (!user.isAdmin) {
    // แทน throw new Error(...) ก็ได้ — แต่ Promise.reject ชัดเจนกว่าในบางบริบท
    return Promise.reject(new Error("ผู้ใช้ไม่มีสิทธิ์ Admin"));
  }
  return user;
}
```

---

### `Promise.withResolvers()` — แยก resolve/reject ออกมาข้างนอก

> 📖 **จาก MDN:** Returns an object containing a new Promise and two functions to resolve or reject it.

ก่อนหน้านี้ ถ้าต้องการ resolve/reject Promise จากข้างนอก executor ต้องทำแบบนี้ (Deferred Pattern):

```typescript
// ❌ แบบเก่า — Boilerplate เยอะ
let resolve!: (value: string) => void;
let reject!: (reason: Error) => void;

const promise = new Promise<string>((res, rej) => {
  resolve = res;
  reject = rej;
});

// ✅ แบบใหม่ด้วย Promise.withResolvers() (ES2024)
const { promise, resolve, reject } = Promise.withResolvers<string>();

// ตัวอย่าง Use case: ผูก Promise กับ Event Listener
function waitForButtonClick(button: HTMLButtonElement): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  button.addEventListener("click", () => resolve(), { once: true });
  return promise;
}

// รอให้ผู้ใช้กดปุ่มก่อนค่อยดำเนินการต่อ
await waitForButtonClick(submitButton);
console.log("ผู้ใช้กดปุ่มแล้ว!");
```

---

### `Promise.try()` — Wrap โค้ดที่อาจ sync หรือ async ให้เป็น Promise เสมอ

> 📖 **จาก MDN:** Takes a callback of any kind (returns or throws, synchronously or asynchronously) and wraps its result in a Promise.

```typescript
// ❌ ปัญหา: ไม่รู้ว่า getConfig() sync หรือ async — จัดการ error ต่างกัน
function processConfig(getConfig: () => Config | Promise<Config>) {
  // ถ้า getConfig() throw synchronously, .catch() ไม่จับได้!
  return getConfig().then(validate).catch(handleError); // 💥 อาจพลาด sync error
}

// ✅ แก้ด้วย Promise.try()
function processConfig(getConfig: () => Config | Promise<Config>) {
  return Promise.try(getConfig) // wrap ทุกอย่าง — sync throw กลายเป็น rejection
    .then(validate)
    .catch(handleError); // ✅ จับได้ทั้ง sync และ async error
}
```

---

### สรุป Static Methods ทั้งหมด

| Method                    | ทำอะไร                  | ใช้เมื่อ                        |
| ------------------------- | ----------------------- | ------------------------------- |
| `Promise.resolve(v)`      | สร้าง fulfilled Promise | Normalize input, wrap ค่าธรรมดา |
| `Promise.reject(e)`       | สร้าง rejected Promise  | Early return, test error paths  |
| `Promise.all(arr)`        | รอทุกตัว, fail-fast     | Tasks ที่ต้องการทุกผลลัพธ์      |
| `Promise.allSettled(arr)` | รอทุกตัว, ไม่ fail      | Independent tasks, Dashboard    |
| `Promise.race(arr)`       | ตัวแรกที่ settle        | Timeout mechanism               |
| `Promise.any(arr)`        | ตัวแรกที่ fulfilled     | Redundant servers               |
| `Promise.withResolvers()` | แยก resolve/reject      | Event-driven, Deferred pattern  |
| `Promise.try(fn)`         | Wrap sync/async safely  | Unknown function types          |

---

## บทที่ 7: หลุมพรางที่ Junior มักพลาด — Anti-Patterns

### ❌ Anti-Pattern 1: ลืม `await` — เสิร์ฟเพจเจอร์แทนอาหาร

```typescript
// ❌ BAD — ฟังก์ชันนี้รับ Promise แต่ไม่ได้รอผลลัพธ์
async function createUser(name: string) {
  const user = saveUser(name); // ลืม await! user เป็น Promise ไม่ใช่ User object
  console.log(user.id); // 💥 undefined — Promise ไม่มี property .id
  return user; // return Promise แทนที่จะ return User
}

// ✅ GOOD
async function createUser(name: string) {
  const user = await saveUser(name); // ✅ รอจนได้ User object จริงๆ
  console.log(user.id); // ✅ ได้ id จริงๆ
  return user;
}
```

---

### ❌ Anti-Pattern 2: ผสม `async/await` กับ `.then()` โดยไม่จำเป็น

```typescript
// ❌ BAD — สับสน, อ่านยาก, ไม่จำเป็น
async function getData() {
  const result = await fetchData().then((data) => {
    return processData(data);
  });
  return result;
}

// ✅ GOOD — เลือกใช้แบบใดแบบหนึ่งให้สม่ำเสมอ (แนะนำ async/await)
async function getData() {
  const data = await fetchData();
  const result = await processData(data);
  return result;
}
```

---

### ❌ Anti-Pattern 3: Unhandled Promise Rejection — เพจเจอร์สั่นสีแดง แต่ไม่มีใครสนใจ

```typescript
// ❌ BAD — ถ้า fetchUser() reject, Error จะหายไปในอากาศ
//    และใน Node.js รุ่นใหม่ Process อาจจะ crash!
async function loadPage() {
  const user = await fetchUser(userId); // ถ้า reject แล้วไม่มี try/catch...
  renderPage(user); // บรรทัดนี้ไม่รันด้วย
}
// ไม่มีใคร catch error จาก loadPage()

// ✅ GOOD — จัดการ error เสมอ
async function loadPage() {
  try {
    const user = await fetchUser(userId);
    renderPage(user);
  } catch (error) {
    // จัดการ error ที่นี่
    showErrorPage((error as Error).message);
  }
}

// ✅ GOOD — อีกวิธีคือ .catch() ตอน call function
loadPage().catch((error) => {
  console.error("loadPage ล้มเหลว:", error.message);
});
```

---

### ❌ Anti-Pattern 4: Sequential await เมื่อควรใช้ `Promise.all`

```typescript
// ❌ BAD — รวมเวลา 6 วินาที (รอ 1 ตัวเสร็จแล้วค่อยรันตัวถัดไป)
async function slowDashboard(userId: number) {
  const profile = await fetchProfile(userId); // รอ 2 วินาที
  const stats = await fetchStats(userId); // รอ 2 วินาที อีกที
  const posts = await fetchPosts(userId); // รอ 2 วินาที อีกที
  return { profile, stats, posts };
}

// ✅ GOOD — รวมเวลาแค่ 2 วินาที (รันพร้อมกัน)
async function fastDashboard(userId: number) {
  const [profile, stats, posts] = await Promise.all([
    fetchProfile(userId),
    fetchStats(userId),
    fetchPosts(userId),
  ]);
  return { profile, stats, posts };
}
```

---

## สรุป — Checklist ของ Promise Master

**พื้นฐาน (Foundation)**

- [ ] **เข้าใจ 4 คำศัพท์**: Pending, Fulfilled, Rejected, Settled — และความต่างของ "Resolved" vs "Fulfilled"
- [ ] **จัดการ error เสมอ**: ใช้ `.catch()` หรือ `try/catch` กับทุก Promise
- [ ] **ใช้ `async/await`** เป็นหลักเพื่อความอ่านง่าย
- [ ] **อย่าลืม `await`** เวลาเรียก async function

**Concurrency (การรันพร้อมกัน)**

- [ ] **ใช้ `Promise.all`** เมื่อ tasks เป็นอิสระต่อกันและต้องการทุกผลลัพธ์
- [ ] **ใช้ `Promise.allSettled`** เมื่อต้องการรายงานผลทุกตัวแม้บางตัว fail
- [ ] **ใช้ `Promise.race`** สำหรับ Timeout mechanism
- [ ] **ใช้ `Promise.any`** สำหรับ Redundant servers / fallback
- [ ] **เข้าใจว่า JS เป็น Single-threaded** — Concurrency ≠ Parallelism

**Utilities & Patterns (ระดับ Senior)**

- [ ] **รู้จัก `Promise.resolve/reject`** สำหรับ normalize และ wrap values
- [ ] **รู้จัก `Promise.withResolvers()`** สำหรับ Event-driven และ Deferred patterns
- [ ] **รู้จัก `Promise.try()`** สำหรับ wrap code ที่ไม่รู้ว่า sync หรือ async
- [ ] **เข้าใจ Job Queue (Microtask)** — `.then()` handler ไม่รันทันที แม้ Promise resolve แล้ว
- [ ] **อย่าผสม `.then()` กับ `async/await`** โดยไม่จำเป็น

---

> 🎯 **จำไว้:** Promise คือสัญญา ไม่ใช่ค่า — และการเขียน Async code ที่ดีคือการจัดการกับความไม่แน่นอนอย่างมีระเบียบ
>
> 📖 **อ้างอิง:** [MDN — Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [States and Fates](https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md) | [Promises/A+ Spec](https://promisesaplus.com/)
