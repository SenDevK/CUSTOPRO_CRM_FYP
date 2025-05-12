import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A component that updates the HTML lang attribute based on the current language
 * This component doesn't render anything, it just updates the document
 */
export function LanguageAttributeUpdater() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update the lang attribute on the html element
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // This component doesn't render anything
  return null;
}

export default LanguageAttributeUpdater;
