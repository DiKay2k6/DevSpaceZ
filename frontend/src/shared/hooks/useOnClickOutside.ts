import { useEffect, RefObject } from 'react';

/**
 * Hook để lắng nghe sự kiện click ra ngoài một thẻ HTML cụ thể.
 * Rất hữu ích cho Modal, Dropdown, Tooltip.
 * 
 * @param ref Ref của thẻ HTML cần theo dõi
 * @param handler Hàm callback sẽ được gọi khi click ra ngoài
 */
export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    handler: (event: MouseEvent | TouchEvent) => void
) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};
