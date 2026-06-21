import { describe, it, expect, vi } from 'vitest';
import projectService from './projectService';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('projectService', () => {
  it('getAllProjects', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const result = await projectService.getAllProjects();
    expect(api.get).toHaveBeenCalledWith('/projects');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('getProjectById', async () => {
    api.get.mockResolvedValueOnce({ data: { id: 2 } });
    const result = await projectService.getProjectById(2);
    expect(api.get).toHaveBeenCalledWith('/projects/2');
    expect(result).toEqual({ id: 2 });
  });

  it('getProjectsByClient', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 3 }] });
    const result = await projectService.getProjectsByClient(10);
    expect(api.get).toHaveBeenCalledWith('/projects/client/10');
    expect(result).toEqual([{ id: 3 }]);
  });

  it('createProject', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 4 } });
    const data = { title: 'Test' };
    const result = await projectService.createProject(data);
    expect(api.post).toHaveBeenCalledWith('/projects', data);
    expect(result).toEqual({ id: 4 });
  });

  it('getAllProjects error', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    await expect(projectService.getAllProjects()).rejects.toThrow('Error');
  });

  it('getProjectById error', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    await expect(projectService.getProjectById(1)).rejects.toThrow('Error');
  });

  it('getProjectsByClient error', async () => {
    api.get.mockRejectedValueOnce(new Error('Error'));
    await expect(projectService.getProjectsByClient(1)).rejects.toThrow('Error');
  });

  it('createProject error', async () => {
    api.post.mockRejectedValueOnce(new Error('Error'));
    await expect(projectService.createProject({})).rejects.toThrow('Error');
  });
});
