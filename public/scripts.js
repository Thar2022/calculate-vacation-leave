let nowDate = moment();
document.addEventListener("DOMContentLoaded", function () {
    const summitButton = document.getElementById("summit");
    const form = document.querySelector("form");
    const resultField = form.querySelector("span[id='result']");
    const experienceField = form.querySelector("span[id='experience']");

    document.getElementById("reset").addEventListener("click", () => {
        resultField.innerHTML = experienceField.innerHTML = "-";
        form.reset()
    })
    summitButton.addEventListener("click", function (event) {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const formObject = Object.fromEntries(new FormData(form));
        const leaveRequest = new LeaveRequestModel(
            nowDate,
            formObject.dateStartWork,
            formObject.employeeContact,
            formObject.dateAmountLeave,
            formObject.hourAmountLeave,
            formObject.leaveDaysFromPast,
            formObject.leaveHourFromPast,
        );
        try {
            const result = leaveRequest.calculate()
            if (result.dateAmountLeave < 0 || result.dateAmountLeave < 0)
                throw { message: "กรุณากรอกข้อมูลที่ถูกต้อง  <br>เนื่องจากระบบคำนวณแล้วได้ค่าติดลบ" }
            const dateThai = displayDateThai(result);
            const dateExperienceThai = convertDateToYearsMonthsDays(leaveRequest.dateStartWork);
            resultField.innerHTML = dateThai;
            experienceField.innerHTML = dateExperienceThai;
        } catch (err) {
            swal({
                content: {
                    element: 'div',
                    attributes: {
                        innerHTML: err.message,
                    },
                },
                icon: "warning",
            })
            console.log("error : ", err)
        }
    });

    const toggleButton = document.getElementById("toggle-simmulator");
    const simulater = document.getElementById("mode-simulater");
    toggleButton.addEventListener("change", (e) => {
        const closeSimulator = !e.target.checked;
        if (closeSimulator) {
            selectedDateDiv.textContent = "เลือกวันที่ทดสอบ"
            testDateInput.value = null
            nowDate = moment()
        }
        simulater.hidden = closeSimulator
    })

    const testDateInput = document.getElementById('testDate');
    const selectedDateDiv = document.getElementById('selectedDate');

    testDateInput.addEventListener('change', function () {
        const selectedDate = testDateInput.value;
        nowDate = selectedDate ? moment(selectedDate) : moment();
        const formattedDate = nowDate.format('MM/DD/YYYY')

        selectedDateDiv.textContent = nowDate ? `วันนี้วันที่: ${formattedDate}` : 'ยังไม่เลือกวันที่';
    });
});

class LeaveRequestModel {
    constructor(currentDate, dateStartWork, employeeContact, dateAmountLeave, hourAmountLeave, leaveDaysFromPast, leaveHourFromPast) {
        this.currentDate = moment(currentDate);
        this.hourPerDay = employeeContact == 0 ? 9 : 8;
        this.dateStartWork = dateStartWork ? moment(dateStartWork) : moment();
        this.employeeContact = this.parseToNumber(employeeContact);
        this.dateAmountLeave = this.parseToNumber(dateAmountLeave);
        this.hourAmountLeave = this.parseToNumber(hourAmountLeave);
        this.leaveDaysFromPast = this.parseToNumber(leaveDaysFromPast);
        this.leaveHourFromPast = this.parseToNumber(leaveHourFromPast);
        this.passMonthPro = 4;
        this.right = this.calculateLeaveRights(this.dateStartWork);
    }

    parseToNumber(value) {
        return Number(value) || 0;
    }

    calculateLeaveRights(dateStartWork) {
        const { passMonthPro, currentDate, } = this
        const currentWorkYear = currentDate.get("year");

        const startWorkDate = moment(dateStartWork);
        const startWorkYear = startWorkDate.get("year");

        const startRightDate = startWorkYear == 2024 ? moment(startWorkDate.clone().add(passMonthPro, 'months').format()) : startWorkDate;
        const yearExperience = currentDate.diff(startWorkDate, "years", true);
        const diffMonth = (() => {
            const diff = Math.ceil(currentDate.diff(startRightDate, "months", true));
            return diff < 0 ? 0 : Number(diff);
        })();

        if (yearExperience < 1) {
            const startWorkMonth = startWorkDate.get("month") + 1
            const currentMonth = currentDate.get("month") + 1
            const normalRight = startWorkYear == currentWorkYear ? diffMonth * 0.5 : currentMonth * 0.5
            if (startWorkMonth >= 9) {
                const rigth = diffMonth * 0.5
                return rigth;
            }
            else
                return normalRight;
        }

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

    calculateLeaveCommon(leaveRequestModel) {
        const { currentDate, hourPerDay } = this
        const currentMonth = currentDate.get("month") + 1;
        const rightHourPerMonth = hourPerDay / 2;
        const startWorkDate = moment(leaveRequestModel.dateStartWork);
        const monthExperience = currentDate.diff(startWorkDate, "months");
        const yearExperience = currentDate.diff(startWorkDate, "years");

        const nowRightHourFromMonth = currentMonth * rightHourPerMonth;

        if (yearExperience < 3 && this.getLeaveHoursFromPast()) {
            throw { message: "ประสบการณ์น้อยกว่า 3 ปี  <br>จะไม่มีวันลาสะสมที่ได้จากปีก่อน" };
        }

        return { monthExperience, yearExperience, nowRightHourFromMonth, startWorkDate };
    }

    calculateDayContact(leaveRequestModel) {
        const { monthExperience } = this.calculateLeaveCommon(leaveRequestModel);
        const { passMonthPro } = this 

        if (monthExperience >= passMonthPro) {
            const totalLeave = this.getLeaveRightsInHours() - this.getLeaveInHours();
            const result = this.convertToDaysAndHours(totalLeave);
            return result;
        }
        throw new Error("คุณยังไม่ผ่านทดลองงาน");
    }

    calculateMonthContact(leaveRequestModel) {
        const { monthExperience } = this.calculateLeaveCommon(leaveRequestModel);
        const { passMonthPro } = this
        if (monthExperience >= passMonthPro) {
            const totalLeave = this.getLeaveRightsInHours() - this.getLeaveInHours();
            return this.convertToDaysAndHours(totalLeave);
        }
        throw new Error("คุณยังไม่ผ่านทดลองงาน");
    }

    calculate() {
        const { yearExperience, startWorkDate } = this.calculateLeaveCommon(this);
        const { currentDate, employeeContact } = this
        const yaerStart = startWorkDate.get("year");
        const diffSumulateDateWithStartDate = currentDate.diff(startWorkDate, true);

        if (diffSumulateDateWithStartDate < 0)
            throw { message: "กรุณากรอกวันที่ทดลองมากกว่าวันที่เริ่มทำงาน" }
        if (yearExperience >= 1)
            throw { message: "โปรแกรมนี้ใช้สำหรับพนักงานที่อายุงานยังไม่ครบ 1 ปี" }

        if (employeeContact == 0 || (employeeContact == 1 && yaerStart == 2024)) {
            return this.calculateMonthContact(this);
        }
        else if (employeeContact == 1) {
            return this.calculateDayContact(this)
        }
        else
            throw new Error("ประเภทสัญญาจ้างไม่ถูกต้อง");
    }
}

const displayDateThai = (result) => {
    const date = result.dateAmountLeave
    const hour = result.hourAmountLeave
    let display = ""
    display = date > 0 && `${date} วัน` || "";
    if (hour > 0) {
        const hourDisplay = Math.floor(hour);
        if (hourDisplay > 0.5)
            display += `  ${hourDisplay} ชั่วโมง`
        if (hour % 1 == 0.5)
            display += "ครึ่ง"
        if (hour == 0.5)
            display += "ชั่วโมง"
    }
    return display || "คุณไม่เหลือสิทธิ์ลา";
};

function convertDateToYearsMonthsDays(inputDate) {
    const currentDate = nowDate;
    const years = currentDate.diff(inputDate, 'years');
    const months = currentDate.diff(inputDate, 'months') % 12;
    const tempDate = moment(inputDate).add(years, 'years').add(months, 'months');
    const days = currentDate.diff(tempDate, 'day');

    let result = '';

    if (years > 0) {
        result += `${years} ปี `;
    }

    if (months > 0) {
        result += `${months} เดือน `;
    }

    if (days > 0) {
        result += `${days} วัน`;
    }

    return result || '0 วัน';
}


