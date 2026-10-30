import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/** הגדרות זום אחידות לכל המפות: גלגלת לפי מיקום העכבר, בצעדים רכים. */
export const ZOOM_PROPS = {
  scrollWheelZoom: true,
  wheelPxPerZoomLevel: 80,
  wheelDebounceTime: 20,
  zoomSnap: 0.25,
  zoomDelta: 0.5,
};

/**
 * גלגלת עם Ctrl (וצביטה במשטח מגע, שהדפדפן שולח כ-Ctrl+גלגלת) מגדילה את המפה ולא את כל הדף.
 * המאזין לא פסיבי, ולכן preventDefault עוצר את הזום של הדפדפן.
 */
export function WheelGuard() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const stop = (e) => { if (e.ctrlKey) e.preventDefault(); };
    el.addEventListener('wheel', stop, { passive: false });
    return () => el.removeEventListener('wheel', stop);
  }, [map]);
  return null;
}
