/**
 * نظام الترجمة متعدد اللغات
 * Internationalization (i18n) System
 */

class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'ar';
    this.translations = {};
    this.loadTranslations();
  }

  /**
   * تحميل ملفات الترجمة
   */
  async loadTranslations() {
    try {
      const response = await fetch(`/locales/${this.currentLanguage}.json`);
      this.translations = await response.json();
      this.updatePageLanguage();
    } catch (error) {
      console.error('خطأ في تحميل ملفات الترجمة:', error);
      // استخدام الترجمة الافتراضية
      this.translations = {
        common: { loading: 'جاري التحميل...' },
        navigation: { home: 'الرئيسية' }
      };
    }
  }

  /**
   * الحصول على ترجمة
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let translation = this.translations;
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        return key; // إرجاع المفتاح إذا لم توجد الترجمة
      }
    }
    
    // استبدال المعاملات
    if (typeof translation === 'string') {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    
    return translation;
  }

  /**
   * تغيير اللغة
   */
  async setLanguage(language) {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    await this.loadTranslations();
    this.updatePageLanguage();
    this.updatePageContent();
  }

  /**
   * تحديث اتجاه الصفحة
   */
  updatePageLanguage() {
    document.documentElement.lang = this.currentLanguage;
    document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  /**
   * تحديث محتوى الصفحة
   */
  updatePageContent() {
    // تحديث النصوص
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation !== key) {
        element.textContent = translation;
      }
    });

    // تحديث العناوين
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.t(key);
      if (translation !== key) {
        element.title = translation;
      }
    });

    // تحديث النصوص البديلة للصور
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      const translation = this.t(key);
      if (translation !== key) {
        element.alt = translation;
      }
    });

    // تحديث النصوص في الحقول
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation !== key) {
        element.placeholder = translation;
      }
    });
  }

  /**
   * الحصول على اللغة الحالية
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * الحصول على قائمة اللغات المتاحة
   */
  getAvailableLanguages() {
    return [
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ];
  }

  /**
   * إنشاء قائمة تغيير اللغة
   */
  createLanguageSelector() {
    const selector = document.createElement('select');
    selector.id = 'language-selector';
    selector.className = 'language-selector';
    
    this.getAvailableLanguages().forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = `${lang.flag} ${lang.name}`;
      if (lang.code === this.currentLanguage) {
        option.selected = true;
      }
      selector.appendChild(option);
    });

    selector.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });

    return selector;
  }
}

// إنشاء مثيل عام
const i18n = new I18n();

// تصدير للاستخدام في الملفات الأخرى
window.i18n = i18n;

// تحديث الصفحة عند تحميلها
document.addEventListener('DOMContentLoaded', () => {
  i18n.updatePageContent();
});

// تصدير للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
