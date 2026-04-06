
/**
 * Utility functions for date manipulation and formatting.
 */
const DateUtils = {
    timestampToDate(timestamp) {
        if (!timestamp) return null;
        // The new Date() constructor can directly parse numeric timestamps (in milliseconds)
        // and ISO 8601 formatted strings, which is what we are now using in our mock data.
        // The previous multiplication by 1000 was for Unix timestamps (in seconds).
        return new Date(timestamp);
    },

    /**
     * Formats a Date object to 'YYYY-MM-DD' string format.
     * @param {Date} date - The date to format.
     * @returns {string} Formatted date string.
     */
    formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Parses a 'YYYY-MM-DD' formatted string to a Date object.
     * @param {string} dateString - The date string to parse.
     * @returns {Date} Parsed Date object.
     */
    parseYYYYMMDDToDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    },

    /**
     * Check if two dates are the same day.
     * @param {Date} date1 - The first date.
     * @param {Date} date2 - The second date.
     * @returns {boolean} True if both dates are the same day, false otherwise.
     */
    isSameDay(date1, date2) {
        return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
        );
    },

    /**
     * Format Date range to "Oct 5 - Oct 10, 2023"
     * @param {Date} date1 - The first date.
     * @param {Date} date2 - The second date.
     * @returns {string} Formatted date range string.
     */
    formatRange(date1, date2) {
        const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const month1 = monthNames[date1.getMonth()];
        const day1 = date1.getDate();
        const year1 = date1.getFullYear();

        const month2 = monthNames[date2.getMonth()];
        const day2 = date2.getDate();
        const year2 = date2.getFullYear();

        if (this.isSameDay(date1, date2)) {
        return `${month1} ${day1}, ${year1}`;
        } else {
        return `${month1} ${day1} - ${month2} ${day2}, ${year2}`;
        }
    },  

    formatDate(input) {
        if (!input) return null;
        const date = typeof input === 'string' ? new Date(input) : input;

        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yy = String(date.getFullYear()).slice(-2);

        return `${mm}/${dd}/${yy}`;
    },

    formatDateRange(start, end) {
        if (!start || ! end) return "Select Dates";
        return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    },

    formatDayAndTime(date) {
        if (!date) return null;
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${mm}/${dd} ${time}`;
    },

    calculateDaysUntil: (targetDateString) => {
        if (!targetDateString) return 0;
        const targetDate = new Date(targetDateString);
        const today = new Date();
        
        // Calculate the difference in milliseconds, then convert to days
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0; // Return 0 if the trip already passed
    },

    getDatesBetween(startDateStr, endDateStr) {
        const dates = [];
        
        // 1. Split the "YYYY-MM-DD" strings into mathable numbers
        const [startYear, startMonth, startDay] = startDateStr.split('-');
        const [endYear, endMonth, endDay] = endDateStr.split('-');

        // 2. Use the local time constructor: new Date(year, monthIndex, day)
        // Note: monthIndex is 0-based, so we must subtract 1 from the month!
        let currentDate = new Date(startYear, startMonth - 1, startDay);
        const end = new Date(endYear, endMonth - 1, endDay);

        // Normalize hours just to be perfectly safe
        currentDate.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        while (currentDate <= end) {
            const yyyy = currentDate.getFullYear();
            const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dd = String(currentDate.getDate()).padStart(2, '0');
            
            dates.push(`${yyyy}-${mm}-${dd}`);
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    },

    // Strip timezone shifts and save exact literal local time to Supabase
    toLocalISOString(date) {
        if (!date) return null;
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, -1); 
    }
};

export default DateUtils;