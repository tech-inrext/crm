export interface FileItem {
  url: string;
  title?: string;
  description?: string;
  isPrimary?: boolean;
  uploadedAt?: string;
  fileSize?: number;
  fileType?: string;
  originalName?: string;
  type?: string;
}

export interface UploadProgressProps {
  uploadProgress: { [key: string]: number };
  color?: 'primary' | 'secondary' | 'warning' | 'info' | 'success';
}

export interface FileUploadButtonProps {
  type: 'propertyImages' | 'floorPlans';
  index: number;
  uploading: string | null;
  handleFileUpload: (files: FileList, type: 'propertyImages' | 'floorPlans') => Promise<void>;
  label: string;
  color: 'primary' | 'secondary' | 'warning' | 'info' | 'success';
  accept?: string;
}

export interface UploadedFileCardProps {
  file: FileItem;
  index: number;
  type: 'propertyImages' | 'floorPlans';
  onSetPrimary?: (index: number) => void;
  onRemove: (type: 'propertyImages' | 'floorPlans', index: number) => void;
  showPrimaryOption?: boolean;
  isPrimary?: boolean;
}