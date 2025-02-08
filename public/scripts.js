let x = "hell o";
const dom = document.getElementById("hello");
dom.innerText = x;  // ใช้เครื่องหมาย = แทนการใช้ ()
 

let counter = 0;

// จับเหตุการณ์การคลิกปุ่ม
document.getElementById('incrementButton').addEventListener('click', function () {
    // เพิ่มค่า +1
    counter++;
    // อัปเดตเนื้อหาของ div ที่มี id="hello"
    document.getElementById('hello').innerText = "ค่าปัจจุบัน: " + counter;
});