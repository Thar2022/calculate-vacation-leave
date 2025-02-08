document.addEventListener("DOMContentLoaded", function () {
    // ค้นหาปุ่มที่มี id="summit"
    const summitButton = document.getElementById("summit");
  
    // ค้นหาฟอร์มทั้งหมด
    const form = document.querySelector("form");
  
    // ตั้ง listener ให้กับปุ่มคำนวณ
    summitButton.addEventListener("click", function (event) {
      event.preventDefault(); // หยุดการส่งฟอร์มเพื่อไม่ให้เพจรีเฟรช
  
      // ใช้ FormData เพื่อดึงค่าทั้งหมดจากฟอร์ม
      const formData = new FormData(form);
  
      // แปลง FormData เป็น Object
      const formObject = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
      });
  
      // ถ้าต้องการผลลัพธ์เป็น Array ของ key-value
      const formArray = Array.from(formData.entries());
  
      // แสดงผลใน Console
      console.log(formObject); // แสดงข้อมูลในรูปแบบ Object
      console.log(formArray);   // แสดงข้อมูลในรูปแบบ Array
 
  
      // แสดงผลลัพธ์ในช่อง result
      const resultField = form.querySelector("input[name='result']");
      resultField.value = `ผลลัพธ์: วันที่เริ่มงาน: ${formObject["date-start-work"]}, สัญญาจ้าง: ${formObject["employee-contact"]}, วันที่ลา: ${formObject["date-amont-leave"]}, ชั่วโมงลา: ${formObject["hour-amont-leave"]}`;
    });
  });
   