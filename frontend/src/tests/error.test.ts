import { describe, it, expect } from 'vitest';
import { handleApiError } from '../shared/utils/error';

describe('handleApiError', () => {
    it('should return the string directly if error is a string', () => {
        expect(handleApiError('Network Error')).toBe('Network Error');
    });

    it('should extract message from Axios error response', () => {
        const mockAxiosError = {
            response: {
                data: {
                    message: 'Invalid credentials'
                }
            }
        };
        expect(handleApiError(mockAxiosError)).toBe('Invalid credentials');
    });

    it('should extract message from standard Error object', () => {
        const error = new Error('Standard error message');
        expect(handleApiError(error)).toBe('Standard error message');
    });

    it('should return default message if error is unknown format', () => {
        expect(handleApiError(null)).toBe('Đã có lỗi xảy ra');
        expect(handleApiError({})).toBe('Đã có lỗi xảy ra');
        expect(handleApiError(undefined, 'Custom default')).toBe('Custom default');
    });
});
