import { useEffect, useRef } from 'react';
import { clearVisited } from '../lib/visited.js';

export const DEV_SESSION_URL = 'https://claude.ai/code/session_018qeN1BNjkAVkdDAcD3uUoa';

/** כפתור הלוגו A&I (ai-menu.js מאפליקציית האם). העתקת קישור, שיחת הפיתוח והתקנה נמצאים בתוכו. */
export default function AIMenu() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.items = [{ label: 'איפוס סימוני "הייתי כאן"', hint: 'נשמרים רק בדפדפן הזה', onSelect: () => clearVisited() }];
  }, []);
  return <ai-menu ref={ref} chat={DEV_SESSION_URL} />;
}
