const express = require('express')
const path = require('path');
const app = express()
const port = 3000

// กำหนดให้ Express เสิร์ฟไฟล์ static จากโฟลเดอร์ 'public'
app.use(express.static(path.join(__dirname, 'public')));

// กำหนด route สำหรับหน้า home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// เริ่มต้น server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});