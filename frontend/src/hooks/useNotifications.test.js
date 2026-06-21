import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useNotifications from './useNotifications';
import notificationService from '../services/notificationService';

// Mock notification service
vi.mock('../services/notificationService', () => ({
  default: {
    getNotificationsByUser: vi.fn(),
    markAsRead: vi.fn(),
  }
}));

describe('useNotifications Hook', () => {
  const mockNotifications = [
    { id: 'n1', message: 'First Notification', isRead: false },
    { id: 'n2', message: 'Second Notification', isRead: true }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not fetch notifications if userId is not provided', async () => {
    const { result } = renderHook(() => useNotifications(null));
    
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(notificationService.getNotificationsByUser).not.toHaveBeenCalled();
  });

  it('fetches notifications on mount and sets unreadCount correctly', async () => {
    notificationService.getNotificationsByUser.mockResolvedValue(mockNotifications);
    
    let renderResult;
    await act(async () => {
      renderResult = renderHook(() => useNotifications('user-123'));
    });

    const { result } = renderResult;

    expect(notificationService.getNotificationsByUser).toHaveBeenCalledWith('user-123');
    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(1); // Only n1 is isRead: false
  });

  it('polls notifications at specified intervals', async () => {
    notificationService.getNotificationsByUser.mockResolvedValue(mockNotifications);
    
    let renderResult;
    await act(async () => {
      renderResult = renderHook(() => useNotifications('user-123', 5000));
    });

    // The effect runs initially. Because mockNotifications is returned, notifications.length changes from 0 to 2, causing the effect to run again.
    // So getNotificationsByUser is called 2 times.
    expect(notificationService.getNotificationsByUser).toHaveBeenCalledTimes(2);

    // Advance timers to trigger interval
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // One more call from the interval
    expect(notificationService.getNotificationsByUser).toHaveBeenCalledTimes(3);
  });

  it('dispatches a new-notification event when new unread notification arrives', async () => {
    const initialList = [
      { id: 'n1', message: 'First', isRead: true }
    ];
    const newList = [
      { id: 'n2', message: 'New Alert!', isRead: false },
      { id: 'n1', message: 'First', isRead: true }
    ];

    let currentNotifications = initialList;
    notificationService.getNotificationsByUser.mockImplementation(async () => currentNotifications);
    
    let renderResult;
    await act(async () => {
      renderResult = renderHook(() => useNotifications('user-123', 5000));
    });

    // Listen to the custom event
    const eventHandler = vi.fn();
    window.addEventListener('new-notification', eventHandler);

    // Update notifications value before interval poll triggers
    currentNotifications = newList;

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(eventHandler).toHaveBeenCalled();
    expect(eventHandler.mock.calls[0][0].detail).toEqual(newList[0]);

    window.removeEventListener('new-notification', eventHandler);
  });

  it('marks a notification as read and updates state', async () => {
    notificationService.getNotificationsByUser.mockResolvedValue(mockNotifications);
    notificationService.markAsRead.mockResolvedValue({ success: true });

    let renderResult;
    await act(async () => {
      renderResult = renderHook(() => useNotifications('user-123'));
    });

    const { result } = renderResult;

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    expect(notificationService.markAsRead).toHaveBeenCalledWith('n1');
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.find(n => n.id === 'n1').isRead).toBe(true);
  });

  it('handles error in fetchNotifications and markAsRead gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    notificationService.getNotificationsByUser.mockRejectedValue(new Error('Fetch Error'));
    notificationService.markAsRead.mockRejectedValue(new Error('Mark Error'));

    let renderResult;
    await act(async () => {
      renderResult = renderHook(() => useNotifications('user-123'));
    });

    const { result } = renderResult;
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch notifications:', expect.any(Error));

    await act(async () => {
      await result.current.markAsRead('n1');
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to mark notification as read:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
