# คู่มือการเชื่อมต่อระบบประเมินทักษะชีวิตกับ Google Sheets (Database)

เอกสารนี้จะอธิบายขั้นตอนการสร้างฐานข้อมูล Google Sheets และการเชื่อมต่อกับ Web App โดยใช้ Google Apps Script (GAS) เพื่อให้ระบบสามารถบันทึกข้อมูลลง Cloud ได้แทนการเก็บในเครื่อง (Local Storage)

---

## ขั้นตอนที่ 1: สร้าง Google Sheets และ Apps Script

1. ไปที่ [Google Sheets](https://sheets.google.com) และสร้างสเปรดชีตใหม่
2. ตั้งชื่อไฟล์ เช่น **"DB_Student_Life_Skills"**
3. ที่เมนูด้านบน คลิกที่ **Extensions (ส่วนขยาย)** > **Apps Script**
4. จะปรากฏหน้าต่างเขียนโค้ด ให้ลบโค้ดเดิม (`function myFunction() {...}`) ออกทั้งหมด

---

## ขั้นตอนที่ 2: วางโค้ด Google Apps Script (Backend)

คัดลอกโค้ดด้านล่างไปวางในหน้าต่าง Apps Script (ไฟล์ `Code.gs`):

```javascript
/**
 * ตั้งค่าหัวตาราง (Headers)
 */
const HEADERS = [
  "studentId", "name", "classLevel", "room", "evaluatorName", "date", "timestamp",
  "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10",
  "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19", "q20",
  "q21", "q22", "q23", "q24", "q25", "q26", "q27", "q28", "q29", "q30",
  "totalScore", "percentage", "quality", "strengths", "improvements"
];

/**
 * ฟังก์ชันรับข้อมูล (POST) - สำหรับบันทึกข้อมูล
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheetName; // เช่น "M.4-A"
    const payload = data.payload;

    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(sheetName);

    // ถ้ายังไม่มีชีต ให้สร้างใหม่และใส่หัวตาราง
    if (!sheet) {
      sheet = doc.insertSheet(sheetName);
      sheet.appendRow(HEADERS);
      // จัดรูปแบบหัวตารางให้สวยงาม
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#e2e8f0");
      sheet.setFrozenRows(1);
    }

    // แปลงข้อมูลคะแนน (Object) เป็น Array ตามลำดับ Q1-Q30
    const scoresArr = [];
    let totalScore = 0;
    for (let i = 1; i <= 30; i++) {
      const s = payload.scores[i] || 0;
      scoresArr.push(s);
      totalScore += s;
    }

    const percentage = ((totalScore / 90) * 100).toFixed(2);
    let quality = '';
    if (percentage >= 75) quality = 'ดีเยี่ยม';
    else if (percentage >= 50) quality = 'ดี';
    else if (percentage >= 25) quality = 'พอใช้';
    else quality = 'ปรับปรุง';

    // เตรียมแถวข้อมูล
    const newRow = [
      payload.studentId,
      payload.studentName || "", // ต้องส่งชื่อมาด้วยถ้าต้องการเก็บ
      payload.classLevel,
      payload.room,
      payload.evaluatorName,
      payload.date,
      new Date(), // Timestamp การบันทึกจริง
      ...scoresArr,
      totalScore,
      percentage,
      quality,
      payload.strengths || "",
      payload.improvements || ""
    ];

    // ตรวจสอบว่ามีข้อมูลเดิมไหม (Update) หรือเพิ่มใหม่ (Insert)
    // ใช้ Student ID เป็น Key (Column 1 คือ Index 0)
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // เริ่มหาตั้งแต่แถวที่ 2 (ข้าม Header)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == payload.studentId) {
        rowIndex = i + 1; // แถวใน Sheet เริ่มที่ 1
        break;
      }
    }

    if (rowIndex > 0) {
      // อัปเดตข้อมูลเดิม
      sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
    } else {
      // เพิ่มข้อมูลใหม่
      sheet.appendRow(newRow);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", row: rowIndex > 0 ? rowIndex : sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * ฟังก์ชันดึงข้อมูล (GET) - สำหรับโหลดข้อมูลมาแสดง
 */
function doGet(e) {
  try {
    const sheetName = e.parameter.sheetName; // รับค่า parameter ?sheetName=M.4-A
    
    if (!sheetName) {
       return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: "Missing sheetName parameter" }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(sheetName);

    if (!sheet) {
      // ถ้าไม่มีชีต แสดงว่ายังไม่มีข้อมูลเลย
      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", data: {} }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const evaluations = {};

    // วนลูปเริ่มจากแถวที่ 2
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentId = row[0];
      
      // แปลงกลับเป็น Format ของ App (EvaluationData)
      const scores = {};
      // Q1 อยู่ที่ index 7 (ตาม HEADERS array ด้านบน)
      for (let q = 1; q <= 30; q++) {
        scores[q] = parseInt(row[6 + q]) || 0;
      }

      evaluations[studentId] = {
        studentId: studentId,
        scores: scores,
        strengths: row[headers.indexOf('strengths')],
        improvements: row[headers.indexOf('improvements')],
        evaluatorName: row[headers.indexOf('evaluatorName')],
        date: row[headers.indexOf('date')]
      };
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", data: evaluations }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## ขั้นตอนที่ 3: การ Deploy (สำคัญมาก)

1. ที่หน้า Apps Script คลิกปุ่ม **Deploy** (สีน้ำเงิน มุมขวาบน) > **New deployment**.
2. คลิกรูปเฟือง (Select type) เลือก **Web app**.
3. ตั้งค่าดังนี้:
   - **Description:** ใส่ชื่ออะไรก็ได้ เช่น "API v1"
   - **Execute as:** เลือก **Me (อีเมลของคุณ)**
   - **Who has access:** เลือก **Anyone (ทุกคน)** *จำเป็นต้องเลือกข้อนี้เพื่อให้ App เข้าถึงได้*
4. คลิก **Deploy**.
5. ระบบจะขอสิทธิ์ (Authorize access) ให้กด Review permissions > เลือกบัญชี Google > Advanced > Go to ... (unsafe) > Allow.
6. คัดลอก **Web App URL** ที่ได้ (จะขึ้นต้นด้วย `https://script.google.com/macros/s/.../exec`)
7. นำ URL นี้ไปใส่ในไฟล์โค้ดของ React

---

## ขั้นตอนที่ 4: การใช้งานใน React

ดูตัวอย่างโค้ดในไฟล์ `services/googleSheetsService.ts` ที่สร้างให้ในโปรเจกต์
ท่านต้องนำ **Web App URL** จากขั้นตอนที่ 3 มาแทนที่ในตัวแปร `SCRIPT_URL`
