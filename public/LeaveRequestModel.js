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

        if (startWorkDate.year() === 2025) {
            if (monthExperience >= 4) {
                const nowRightHourFromMonth = currentMonth * rightHourPerMonth;
                return this.convertToDaysAndHours(nowRightHourFromMonth);
            }
            throw new Error("คุณยังไม่ผ่านโปรนะครับ");
        }
    }
 
    calculateMonthContact(leaveRequestModel) {
        const currentDate = moment();
        const currentMonth = currentDate.get("month") + 1;
        const rightHourPerMonth = this.hourPerDay / 2;
        const startWorkDate = moment(leaveRequestModel.dateStartWork);
        const monthExperience = currentDate.diff(startWorkDate, "months");
        const yearExperience = currentDate.diff(startWorkDate, "years");

        const nowRightHourFromMonth = currentMonth * rightHourPerMonth;

        if (startWorkDate.year() === 2025) {
            if (monthExperience >= 4) {
                return this.convertToDaysAndHours(nowRightHourFromMonth);
            }
            throw new Error("คุณยังไม่ผ่านโปรนะครับ");
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

export default LeaveRequestModel;
