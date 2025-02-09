
document.addEventListener("DOMContentLoaded", function () {
    const summitButton = document.getElementById("summit");
    const form = document.querySelector("form");
    document.getElementById("reset").addEventListener("click", () => form.reset())
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
                throw { message: "กรุณากรอกข้อมูลที่ถูกต้อง  <br>เนื่องจากระบบคำนวณแล้วได้ค่าติดลบ" }
            const dateThai = displayDateThai(result);
            const resultField = form.querySelector("div[name='result']");
            resultField.innerHTML = dateThai;

        } catch (err) {
            swal({
                content: {
                    element: 'div',
                    attributes: {
                        innerHTML: err.message, // ใช้ innerHTML แทนเพื่อแสดง HTML
                    },
                },
                icon: "warning",
            })
            console.log("error : ", err)
        }

    });
});

class LeaveRequestModel {
    hourPerDay = 9;

    constructor(dateStartWork, employeeContact, dateAmountLeave, hourAmountLeave, leaveDaysFromPast, leaveHourFromPast) {
        this.dateStartWork = this.formatDate(dateStartWork);
        this.employeeContact = this.parseToNumber(employeeContact);
        this.dateAmountLeave = this.parseToNumber(dateAmountLeave);
        this.hourAmountLeave = this.parseToNumber(hourAmountLeave);
        this.leaveDaysFromPast = this.parseToNumber(leaveDaysFromPast);
        this.leaveHourFromPast = this.parseToNumber(leaveHourFromPast);
        this.right = this.calculateLeaveRights(this.dateStartWork);
    }

    formatDate(dateStartWork) {
        return dateStartWork ? new Date(dateStartWork).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA');
    }

    parseToNumber(value) {
        return Number(value) || 0;
    }

    calculateLeaveRights(dateStartWork) {
        const currentDate = moment();
        const startWorkDate = moment(dateStartWork);
        const yearExperience = currentDate.diff(startWorkDate, "years", true);

        if (yearExperience < 3) return 6;
        if (yearExperience < 10) return 12;
        if (yearExperience < 15) return 15;
        if (yearExperience < 20) return 17;
        return 20;
    }

    getLeaveRightsInHours() {
        return this.convertToHours(this.right);
    }

    getLeaveInHours() {
        return this.convertToHours(this.dateAmountLeave, this.hourAmountLeave);
    }

    getLeaveHoursFromPast() {
        return this.convertToHours(this.leaveDaysFromPast, this.leaveHourFromPast);
    }

    convertToHours(days, hours = 0) {
        return Number(days) * this.hourPerDay + Number(hours);
    }

    convertToDaysAndHours(hourAmountLeave) {
        return {
            dateAmountLeave: Math.floor(Number(hourAmountLeave / this.hourPerDay)),
            hourAmountLeave: Number(hourAmountLeave % this.hourPerDay)
        };
    }

    calculateDayContact(leaveRequestModel) {
        const currentDate = moment();
        const currentMonth = currentDate.get("month") + 1;
        const rightHourPerMonth = this.hourPerDay / 2;
        const startWorkDate = moment(leaveRequestModel.dateStartWork);
        const monthExperience = currentDate.diff(startWorkDate, "months");
        const yearExperience = currentDate.diff(startWorkDate, "years");
        if (yearExperience < 3 && this.getLeaveHoursFromPast())
            throw { message: "ประสบการณ์น้อยกว่า 3 ปี  <br>จะไม่มีวันลาสะสมที่ได้จากปีก่อน" } 
        if (monthExperience >= 4) {
            const nowRightHourFromMonth = currentMonth * rightHourPerMonth;
            return this.convertToDaysAndHours(nowRightHourFromMonth);
        }
        throw new Error("คุณยังไม่ผ่านทดลองงาน");
    }

    calculateMonthContact(leaveRequestModel) {
        const currentDate = moment();
        const currentMonth = currentDate.get("month") + 1;
        const rightHourPerMonth = this.hourPerDay / 2;
        const startWorkDate = moment(leaveRequestModel.dateStartWork);
        const monthExperience = currentDate.diff(startWorkDate, "months");
        const yearExperience = currentDate.diff(startWorkDate, "years");

        const nowRightHourFromMonth = currentMonth * rightHourPerMonth;
        if (yearExperience < 3 && this.getLeaveHoursFromPast())
            throw { message: "ประสบการณ์น้อยกว่า 3 ปี  <br>จะไม่มีวันลาสะสมที่ได้จากปีก่อน" }
        if (startWorkDate.year() >= 2025) { 
            
            if (monthExperience >= 4) { 
                const totalLeave = nowRightHourFromMonth - this.getLeaveInHours();
                return this.convertToDaysAndHours(totalLeave);
            }
            throw new Error("คุณยังไม่ผ่านทดลองงาน");
        } else if (startWorkDate.year() === 2024) {
            if (leaveRequestModel.dateAmountLeave + leaveRequestModel > 6) {
                throw new Error("คุณเข้ามาในปี 67 ลามากสุดได้ 6 วัน");
            }

            if (yearExperience < 1) {
                const totalLeave = nowRightHourFromMonth - this.getLeaveInHours();
                return this.convertToDaysAndHours(totalLeave);
            }

            if (yearExperience >= 1) {
                const totalLeave = this.getLeaveRightsInHours() - this.getLeaveInHours();
                return this.convertToDaysAndHours(totalLeave);
            }

            return null;
        } else if (startWorkDate.year() < 2024) {
            const totalLeave = this.getLeaveRightsInHours() - this.getLeaveInHours() + this.getLeaveHoursFromPast();
            return this.convertToDaysAndHours(totalLeave);
        } else {
            throw new Error("คุณยังไม่ได้เริ่มทำงาน");
        }
    }

    calculate() {
        switch (this.employeeContact) {
            case 0: return this.calculateMonthContact(this);
            case 1: return this.calculateDayContact(this);
            default: throw new Error("ประเภทการติดต่อไม่ถูกต้อง");
        }
    }
}

const displayDateThai = (result) => {
    const date = result.dateAmountLeave
    const hour = result.hourAmountLeave
    let display = ""
    display = date > 0 && `${date} วัน` || "";
    if (hour > 0) {
        display += `  ${Math.floor(hour)} ชั่วโมง`
        if (hour % 1 == 0.5)
            display += "ครึ่ง"

    }

    return display || "คุณไม่เหลือสิทธิ์ลา";
};

