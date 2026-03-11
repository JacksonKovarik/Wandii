
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
    }
};

export default DateUtils;