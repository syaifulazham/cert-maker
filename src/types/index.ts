import { User } from 'next-auth';

export interface ExtendedUser extends User {
  id: string;
}

export interface Template {
  id: string;
  userId: string;
  title: string;
  baseTemplate: string; // PDF URL
  dimensions: string; // A4, Letter, Custom
  labels: Label[];
  images: Image[];
  fileNaming: string;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  text: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  isBold: boolean;
  isItalic: boolean;
  alignment: 'left' | 'center' | 'right';
  isDynamic: boolean;
  datasetField?: string;
}

export interface Image {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // Rotation in degrees (0, 90, 180, 270)
}

export interface Dataset {
  id: string;
  userId: string;
  title: string;
  data: Record<string, any>[];
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: string;
  userId: string;
  templateId: string;
  datasetId: string;
  status: 'Queued' | 'Processing' | 'Completed';
  outputFiles: string[];
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  template?: {
    title: string;
  };
  dataset?: {
    title: string;
  };
}