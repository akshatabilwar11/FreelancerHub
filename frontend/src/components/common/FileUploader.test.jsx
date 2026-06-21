import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FileUploader from './FileUploader';

// Global variable to capture dropzone options
let capturedOptions = null;

vi.mock('react-dropzone', () => ({
  useDropzone: (options) => {
    capturedOptions = options;
    return {
      getRootProps: () => ({
        'data-testid': 'dropzone-root',
      }),
      getInputProps: () => ({}),
      isDragActive: false
    };
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key === 'drop_files' ? 'Drag & Drop files' : key
  }),
}));

describe('FileUploader Component', () => {
  beforeEach(() => {
    capturedOptions = null;
    vi.clearAllMocks();
  });

  const triggerDrop = (files) => {
    act(() => {
      capturedOptions.onDrop(files);
    });
  };

  it('renders correctly and handles file dropping', () => {
    const mockOnUpload = vi.fn();
    render(<FileUploader onUpload={mockOnUpload} />);

    expect(screen.getByTestId('dropzone-root')).toBeInTheDocument();
    expect(screen.getByText('Drag & Drop files')).toBeInTheDocument();

    const mockFile = new File(['file contents'], 'test-resume.pdf', { type: 'application/pdf' });
    Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 * 1.5 }); // 1.5 MB

    triggerDrop([mockFile]);

    // File name and size should be displayed
    expect(screen.getByText('test-resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.50 MB')).toBeInTheDocument();
    expect(mockOnUpload).toHaveBeenCalledWith([mockFile]);
  });

  it('supports single-file upload (overwrites previous file)', () => {
    const mockOnUpload = vi.fn();
    render(<FileUploader onUpload={mockOnUpload} multiple={false} />);

    const file1 = new File(['abc'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['def'], 'file2.txt', { type: 'text/plain' });

    triggerDrop([file1]);
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(mockOnUpload).toHaveBeenLastCalledWith([file1]);

    triggerDrop([file2]);
    // file1 should be replaced since multiple is false
    expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
    expect(mockOnUpload).toHaveBeenLastCalledWith([file2]);
  });

  it('supports multi-file upload (appends files)', () => {
    const mockOnUpload = vi.fn();
    render(<FileUploader onUpload={mockOnUpload} multiple={true} />);

    const file1 = new File(['abc'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['def'], 'file2.txt', { type: 'text/plain' });

    triggerDrop([file1]);
    expect(screen.getByText('file1.txt')).toBeInTheDocument();

    triggerDrop([file2]);
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
    expect(mockOnUpload).toHaveBeenLastCalledWith([file1, file2]);
  });

  it('allows removing uploaded files', () => {
    const mockOnUpload = vi.fn();
    render(<FileUploader onUpload={mockOnUpload} multiple={true} />);

    const file1 = new File(['abc'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['def'], 'file2.txt', { type: 'text/plain' });

    triggerDrop([file1, file2]);

    const removeButtons = screen.getAllByRole('button');
    expect(removeButtons).toHaveLength(2);

    // Remove first file
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
    expect(mockOnUpload).toHaveBeenLastCalledWith([file2]);
  });

  it('handles dropping and removing files when onUpload is not provided', () => {
    render(<FileUploader />); // No onUpload passed

    const file = new File(['hello'], 'no-callback.txt', { type: 'text/plain' });
    triggerDrop([file]);

    expect(screen.getByText('no-callback.txt')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button');
    fireEvent.click(removeBtn);

    expect(screen.queryByText('no-callback.txt')).not.toBeInTheDocument();
  });
});

