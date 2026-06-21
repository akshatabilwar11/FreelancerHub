import { describe, it, expect, vi } from 'vitest';
import notificationService from './notificationService';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('notificationService', () => {
  it('getAllNotifications', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const result = await notificationService.getAllNotifications();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('getNotificationsByUser', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 2 }] });
    const result = await notificationService.getNotificationsByUser(1);
    expect(result).toEqual([{ id: 2 }]);
  });

  it('sendNotification', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 3 } });
    const result = await notificationService.sendNotification({ userId: 1, message: 'hi' });
    expect(result).toEqual({ id: 3 });
  });

  it('getAllNotifications error', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    await expect(notificationService.getAllNotifications()).rejects.toThrow('Error');
  });

  it('getNotificationsByUser error', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    await expect(notificationService.getNotificationsByUser(1)).rejects.toThrow('Error');
  });

  it('sendNotification error', async () => {
    api.post.mockRejectedValueOnce(new Error('Error'));
    await expect(notificationService.sendNotification({})).rejects.toThrow('Error');
  });
});
