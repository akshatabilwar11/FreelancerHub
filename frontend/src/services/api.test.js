import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from './api';

describe('API Interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should add Authorization header if token exists in localStorage', async () => {
    localStorage.setItem('token', 'test-token');
    
    // Simulate interceptor
    const config = { headers: {} };
    const result = await api.interceptors.request.handlers[0].fulfilled(config);
    
    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('should not add Authorization header if token is missing', async () => {
    const config = { headers: {} };
    const result = await api.interceptors.request.handlers[0].fulfilled(config);
    
    expect(result.headers.Authorization).toBeUndefined();
  });

});
