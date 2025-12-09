export interface Package {
  id?: string;
  _id?: string; // Add MongoDB _id field
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  path: string;
  isPopular: boolean;
  deliverables: string;
  submissionLimit: number;
  submissionDurationDays: number;
  expectedOutcome: string;
  createdAt?: string;
  __v?: number;
}

export interface CreatePackageRequest {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  path: string;
  isPopular: boolean;
  deliverables: string;
  submissionLimit: number;
  submissionDurationDays: number;
  expectedOutcome: string;
}

export interface UpdatePackageRequest {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  path: string;
  isPopular: boolean;
  deliverables: string;
  submissionLimit: number;
  submissionDurationDays: number;
  expectedOutcome: string;
}