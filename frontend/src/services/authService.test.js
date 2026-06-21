import { describe, it, expect, vi } from 'vitest';
import authService from './authService';
import api from './api';

// Mock the entire api module
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  }
}));

describe('authService', () => {
  it('should login and return token', async () => {
    api.post.mockResolvedValueOnce({ data: { token: 'mock-token' } });
    const result = await authService.login('test@example.com', 'password');
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password' });
    expect(result).toEqual({ token: 'mock-token' });
  });

  it('should register and return msg', async () => {
    api.post.mockResolvedValueOnce({ data: { msg: 'User registered successfully!' } });
    const data = { name: 'Test', email: 'test@example.com', password: 'password', role: 'CLIENT' };
    const result = await authService.register(data);
    expect(api.post).toHaveBeenCalledWith('/auth/register', data);
    expect(result).toEqual({ msg: 'User registered successfully!' });
  });

  it('should get profile', async () => {
    const mockUser = { userId: 1, name: 'Test', email: 'test@example.com', roles: 'CLIENT' };
    api.get.mockResolvedValueOnce({ data: mockUser });
    const result = await authService.getProfile();
    expect(api.get).toHaveBeenCalledWith('/auth/profile');
    expect(result).toEqual(mockUser);
  });

  it('login error', async () => {
    api.post.mockRejectedValueOnce(new Error('Login Failed'));
    await expect(authService.login('test@example.com', 'password')).rejects.toThrow('Login Failed');
  });

  it('register error', async () => {
    api.post.mockRejectedValueOnce(new Error('Register Failed'));
    await expect(authService.register({})).rejects.toThrow('Register Failed');
  });

  it('getProfile error', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    await expect(authService.getProfile()).rejects.toThrow('Error');
  });
});
