import LeaveRequestModel from './LeaveRequestModel.js';
import { displayDateThai } from './utils.js';

document.addEventListener("DOMContentLoaded", function () {
    const summitButton = document.getElementById("summit");

    const form = document.querySelector("form");
    summitButton.addEventListener("click", function (event) {
        event.preventDefault();
        if (!form.checkValidity()) { 
            form.reportValidity(); 
            return;  
        }
        const formObject = Object.fromEntries(new FormData(form));
        const leaveRequest = new LeaveRequestModel(
            formObject.dateStartWork,
            formObject.employeeContact,
            formObject.dateAmountLeave,
            formObject.hourAmountLeave,
            formObject.leaveDaysFromPast,
            formObject.leaveHourFromPast
        );
        try {
            const result = leaveRequest.calculate()
            if (result.dateAmountLeave < 0 || result.dateAmountLeave < 0)
                throw { message: "กรุณากรอกข้อมูลที่ถูกต้อง" }
            const dateThai = displayDateThai(result);
            console.log("result", result)
            const resultField = form.querySelector("input[name='result']");
            resultField.value = dateThai;

        } catch (err) {
            swal({
                text: err.message,
                icon: "warning",
            })
            console.log("error : ", err)
        }


    });
});
