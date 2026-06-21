import { describe, it, expect, vi } from 'vitest';
import paymentService from './paymentService';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('paymentService', () => {
  it('getAllPayments', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const result = await paymentService.getAllPayments();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('processPayment', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 2 } });
    const result = await paymentService.processPayment({ amount: 100 });
    expect(result).toEqual({ id: 2 });
  });

  it('getAllPayments error', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    await expect(paymentService.getAllPayments()).rejects.toThrow('Error');
  });

  it('processPayment error', async () => {
    api.post.mockRejectedValueOnce(new Error('Error'));
    await expect(paymentService.processPayment({ amount: 100 })).rejects.toThrow('Error');
  });
});
