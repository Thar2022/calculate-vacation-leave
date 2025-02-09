export const displayDateThai = (result) => {
    const date = result.dateAmountLeave
    const hour = result.hourAmountLeave
    let display = ""
    display = date > 0 && `${date} วัน` || "";
    if (hour > 0) {
        display += `  ${Math.floor(hour)} ชั่วโมง`
        if (hour % 1 == 0.5)
            display += "ครึ่ง"

    }  
    
    return display ||"คุณไม่เหลือสิทธิ์ลา";
};


