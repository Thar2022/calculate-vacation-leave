 class LeaveRequestModel {
    hourPerDay = 9
    constructor(dateStartWork, employeeContact, dateAmountLeave, hourAmountLeave, leaveDaysFromPast, leaveHourFromPast) {
        const defaultDate = dateStartWork ? new Date(dateStartWork).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA')
        this.dateStartWork = defaultDate; 
        this.employeeContact = Number(employeeContact) || 0;   
        this.dateAmountLeave = Number(dateAmountLeave) || 0;  
        this.hourAmountLeave = Number(hourAmountLeave) || 0;  
        this.leaveDaysFromPast = Number(leaveDaysFromPast) || 0;
        this.leaveHourFromPast = Number(leaveHourFromPast) || 0;
        this.right = this.getRight(defaultDate)
    }
    getRight = (dateStartWork) => {
        const nowDate = moment();
        const _dateStartWork = moment(dateStartWork);
        const yearExperience = nowDate.diff(_dateStartWork, "years", true); 
        if (yearExperience < 3)
            return 6
        if (yearExperience < 10)
            return 12
        if (yearExperience < 15)
            return 15
        if (yearExperience < 20)
            return 17
        return 20
    }
    getRightNormalize = () => this.convertToHour(this.right)
    getLeaveNormalize = () => this.convertToHour(this.dateAmountLeave, this.hourAmountLeave)
    getLeaveHourFromPastNormalize = () => this.convertToHour(this.leaveDaysFromPast, this.leaveHourFromPast)

 
    convertToHour = (dateAmountLeave, hourAmountLeave = 0) => Number(dateAmountLeave) * this.hourPerDay + Number(hourAmountLeave)
    convertToHourAndDate = (hourAmountLeave) => (
        {
            dateAmountLeave: Math.floor(Number(hourAmountLeave / this.hourPerDay)),
            hourAmountLeave: Number(hourAmountLeave % this.hourPerDay)
        }
    ) 


    // calculateDayContact = (leaveRequestModel) => {  
    // }

    calculateMonthContact = (leaveRequestModel) => {  
 
        const nowDate = moment();
        const nowMonth = nowDate.get("month") + 1;
        const rightHourPerMonth = this.hourPerDay / 2;
        const nowRightHourFromMonth = nowMonth * rightHourPerMonth;

        const dateStartWork = moment(leaveRequestModel.dateStartWork);
        const yearExperience = nowDate.diff(dateStartWork, "years", true);
        const monthExperience = nowDate.diff(dateStartWork, "months");

         
        if (dateStartWork.year() == 2025) { 
            if (monthExperience >= 4) {
                return this.convertToHourAndDate(nowRightHourFromMonth)
            }
            throw { message: "คุณยังไม่ผ่านโปรนะครับ  " };
        }
        else if (dateStartWork.year() == 2024) { 
            if (leaveRequestModel.dateAmountLeave + leaveRequestModel > 6)
                throw { message: "คุณเข้ามาในปี 67 ลามากสุดได้ 6 วัน " };
            if (yearExperience < 1) { 
                const totalLeave = nowRightHourFromMonth - this.getLeaveNormalize();
                return this.convertToHourAndDate(totalLeave)
            }
            if (yearExperience > 1) { 
                const totalLeave = this.getRightNormalize() - this.getLeaveNormalize();
                return this.convertToHourAndDate(totalLeave)
            }
            return null
        }
        else if (dateStartWork.year() < 2024) { 
            const totalLeave = this.getRightNormalize() - this.getLeaveNormalize() + this.getLeaveHourFromPastNormalize();
            return this.convertToHourAndDate(totalLeave)
        } else { 
            throw { message: " คุณยังไม่ได้เริ่มทำงาน " };
        }

    }
    calculate() {
        switch (this.employeeContact) {
            case 0: return this.calculateMonthContact(this)
            // case 1: return this.calculateDayContact(this)
        }
    }
}

export default LeaveRequestModel;
