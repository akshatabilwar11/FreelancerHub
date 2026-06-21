import { describe, it, expect, vi } from 'vitest';
import userService from './userService';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  }
}));

describe('userService', () => {
  it('getAllUsers', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const result = await userService.getAllUsers();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('getUserById', async () => {
    api.get.mockResolvedValueOnce({ data: { id: 2 } });
    const result = await userService.getUserById(2);
    expect(result).toEqual({ id: 2 });
  });

  it('updateUser', async () => {
    api.put.mockResolvedValueOnce({ data: { id: 3 } });
    const result = await userService.updateUser(3, { name: 'hi' });
    expect(result).toEqual({ id: 3 });
  });

  it('getAllUsers error', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    await expect(userService.getAllUsers()).rejects.toThrow('Error');
  });

  it('getUserById error', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    await expect(userService.getUserById(1)).rejects.toThrow('Error');
  });

  it('updateUser error', async () => {
    api.put.mockRejectedValueOnce(new Error('Error'));
    await expect(userService.updateUser(1, {})).rejects.toThrow('Error');
  });
});
