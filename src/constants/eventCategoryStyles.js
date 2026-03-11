export const CATEGORY_STYLES = {
    Food: { icon: 'restaurant', colors: ['#FF9A9E', '#FECFEF'] },
    Nightlife: { icon: 'local-bar', colors: ['#4facfe', '#00f2fe'] },
    Activity: { icon: 'hiking', colors: ['#43e97b', '#38f9d7'] },
    Lodging: { icon: 'hotel', colors: ['#fa709a', '#fee140'] },
    Default: { icon: 'place', colors: ['#a18cd1', '#fbc2eb'] }
};

// Helper function so your components don't have to write the fallback logic!
export const getCategoryFallback = (category) => {
    return CATEGORY_STYLES[category] || CATEGORY_STYLES.Default;
};