

Array.prototype.remove = function(...elements) {
    for (let element of elements) {
        const i = this.indexOf(element);
        if (i >= 0) this.splice(i, 1);
    }
}


const dates = {
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ],
    weekdays: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ],

    format(dateObj, pattern='{MN} {D}, {YYYY}') {
        if (!(dateObj instanceof Date)) dateObj = new Date(dateObj);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const monthDigit = month < 10 ? '0'+month : `${month}`;
        const monthName = this.months[month-1];
        const day = dateObj.getDate();
        const dayDigit = day < 10 ? '0'+day : `${day}`;
        const weekday = this.weekdays[dateObj.getDay()];
        return pattern
            .replace('{WD}', weekday)
            .replace('{D}', day)
            .replace('{DD}', dayDigit)
            .replace('{MN}', monthName)
            .replace('{MM}', monthDigit)
            .replace('{YYYY}', year);
    }
}
