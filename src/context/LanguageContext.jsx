import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  English: {
    search: 'Search products, brands, categories...',
    voiceSearch: 'Voice Search',
    imageSearch: 'Image Search',
    recentSearches: 'Recent Searches',
    suggestions: 'Suggestions',
    deliveryLocation: 'Delivery Location',
    change: 'Change',
    compareProducts: 'Compare Products',
    noProductsToCompare: 'No products to compare',
    wishlist: 'Wishlist',
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications yet',
    messages: 'Messages',
    shoppingCart: 'Shopping Cart',
    myCart: 'My Cart',
    yourCartIsEmpty: 'Your cart is empty',
    itemsInCart: 'items in cart',
    viewCart: 'View Cart',
    selectLanguage: 'Select Language',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    myProfile: 'My Profile',
    myOrders: 'My Orders',
    savedSearches: 'Saved Searches',
    adminPanel: 'Admin Panel',
    myShop: 'My Shop',
    startSelling: 'Start Selling',
    logout: 'Logout',
  },
  ଓଡ଼ିଆ: {
    search: 'ଉତ୍ପାଦ, ବ୍ରାଣ୍ଡ, ବର୍ଗ ଖୋଜନ୍ତୁ...',
    voiceSearch: 'ଭଏସ୍ ସର୍ଚ୍ଚ',
    imageSearch: 'ଚିତ୍ର ସର୍ଚ୍ଚ',
    recentSearches: 'ସାମ୍ପ୍ରତିକ ସନ୍ଧାନ',
    suggestions: 'ପରାମର୍ଶ',
    deliveryLocation: 'ବିତରଣ ସ୍ଥାନ',
    change: 'ପରିବର୍ତ୍ତନ',
    compareProducts: 'ଉତ୍ପାଦ ତୁଳନା କରନ୍ତୁ',
    noProductsToCompare: 'ତୁଳନା କରିବାକୁ କୌଣସି ଉତ୍ପାଦ ନାହିଁ',
    wishlist: 'ଇଚ୍ଛା ତାଲିକା',
    notifications: 'ବିଜ୍ଞପ୍ତି',
    markAllRead: 'ସମସ୍ତ ପଢ଼ା ଯାଇଛି ବୋଲି ଚିହ୍ନଟ କରନ୍ତୁ',
    noNotifications: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ବିଜ୍ଞପ୍ତି ନାହିଁ',
    messages: 'ସନ୍ଦେଶ',
    shoppingCart: 'ସପିଂ କାର୍ଟ',
    myCart: 'ମୋର କାର୍ଟ',
    yourCartIsEmpty: 'ଆପଣଙ୍କ କାର୍ଟ ଖାଲି ଅଛି',
    itemsInCart: 'କାର୍ଟରେ ଆଇଟମ୍',
    viewCart: 'କାର୍ଟ ଦେଖନ୍ତୁ',
    selectLanguage: 'ଭାଷା ଚୟନ କରନ୍ତୁ',
    lightMode: 'ଲାଇଟ୍ ମୋଡ୍',
    darkMode: 'ଡାର୍କ ମୋଡ୍',
    myProfile: 'ମୋର ପ୍ରୋଫାଇଲ୍',
    myOrders: 'ମୋର ଅର୍ଡର',
    savedSearches: 'ସଞ୍ଚିତ ସନ୍ଧାନ',
    adminPanel: 'ଆଡମିନ୍ ପ୍ୟାନେଲ୍',
    myShop: 'ମୋର ଦୋକାନ',
    startSelling: 'ବିକ୍ରୟ ଆରମ୍ଭ କରନ୍ତୁ',
    logout: 'ଲଗଆଉଟ୍',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    console.log('Loading saved language:', savedLanguage || 'English (default)');
    return savedLanguage || 'English';
  });

  useEffect(() => {
    console.log('Language changed to:', language);
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    console.log('Switching language from', language, 'to', newLanguage);
    setLanguage(newLanguage);
  };

  const t = (key) => translations[language]?.[key] || translations.English[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};
