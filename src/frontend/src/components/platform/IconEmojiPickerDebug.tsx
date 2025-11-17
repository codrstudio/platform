/**
 * DEBUG Component - IconEmojiPicker
 *
 * Identificar por que AVAILABLE_ICONS está vazio
 */

import * as LucideIcons from 'lucide-react';
import { useEffect } from 'react';

export function IconEmojiPickerDebug() {
  useEffect(() => {
    console.log('=== LUCIDE DEBUG ===');
    console.log('Total keys:', Object.keys(LucideIcons).length);

    const allKeys = Object.keys(LucideIcons);
    console.log('First 20 keys:', allKeys.slice(0, 20));

    const functionKeys = allKeys.filter(key => {
      const component = (LucideIcons as any)[key];
      return typeof component === 'function';
    });
    console.log('Function keys count:', functionKeys.length);
    console.log('Function keys sample:', functionKeys.slice(0, 20));

    const filtered = allKeys.filter(key => {
      const component = (LucideIcons as any)[key];
      return (
        typeof component === 'function' &&
        key !== 'createLucideIcon' &&
        key !== 'default' &&
        key !== 'Icon' &&
        !key.startsWith('Lucide')
      );
    });
    console.log('Filtered count:', filtered.length);
    console.log('Filtered sample:', filtered.slice(0, 20));

    // Testar conversão
    const kebabCase = filtered.map(key => {
      return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    });
    console.log('Kebab-case sample:', kebabCase.slice(0, 20));

  }, []);

  return (
    <div style={{ padding: '20px', background: '#f0f0f0' }}>
      <h1>IconEmojiPicker Debug</h1>
      <p>Verifique o console (F12)</p>
    </div>
  );
}
