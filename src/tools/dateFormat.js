export function formatDate(input) {
    if (!input) return null;
    const date = typeof input === 'string' ? new Date(input) : input;

    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);

    return `${mm}/${dd}/${yy}`;
}

export function formatDateRange(start, end) {
    if (!start || ! end) return "Select Dates";
    return `${formatDate(start)} - ${formatDate(end)}`;
}
