export const CATEGORY_STYLES = {
    Food: { icon: 'restaurant', colors: ['#FF9A9E', '#FECFEF'] },
    Nightlife: { icon: 'local-bar', colors: ['#4facfe', '#00f2fe'] },
    Activity: { icon: 'hiking', colors: ['#43e97b', '#38f9d7'] },
    Lodging: { icon: 'hotel', colors: ['#fa709a', '#fee140'] },
    Default: { icon: 'place', colors: ['#a18cd1', '#fbc2eb'] }
};

export const getCategoryFallback = (category) => {
    return CATEGORY_STYLES[category] || CATEGORY_STYLES.Default;
}

export const WALLET_CATEGORIES = [
  { id: 1, name: 'Food', icon: 'food-fork-drink' },
  { id: 2, name: 'Transport', icon: 'car' },
  { id: 3, name: 'Lodging', icon: 'bed' },
  { id: 4, name: 'Activity', icon: 'ticket' },
  { id: 5, name: 'Other', icon: 'receipt' },
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "United States Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound Sterling" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
];