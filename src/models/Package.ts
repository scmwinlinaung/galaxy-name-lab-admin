export type CategoryCode = 'BUSINESS' | 'PERSONAL';

export interface Path {
  code: string;
  name: string;
  description: string;
}

export interface Plan {
  code: string;
  name: string;
  isPopular: boolean;
}

export interface Price {
  amount: number;
  currency: string;
}

export interface Deliverables {
  generatedNames: number;
}

export type SubmissionValue = number | string;

export interface SubmissionRange {
  min?: SubmissionValue;
  max?: SubmissionValue;
}

export interface SubmissionPolicy {
  totalSubmissions: SubmissionValue | SubmissionRange;
  maxNamesPerSubmission: SubmissionValue | SubmissionRange;
  submissionFormat: string;
  submissionWindowDays: number;
}

export interface Package {
  id?: string;
  _id?: string; // MongoDB _id field
  categoryCode: CategoryCode;
  categoryName: string;
  path: Path;
  plan: Plan;
  price: Price;
  deliverables: Deliverables;
  submissionPolicy: SubmissionPolicy;
  expectedOutcome: string;
  description: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
  __v?: number;
}

export interface CreatePackageRequest {
  categoryCode: CategoryCode;
  categoryName: string;
  path: Path;
  plan: Plan;
  price: Price;
  deliverables: Deliverables;
  submissionPolicy: SubmissionPolicy;
  expectedOutcome: string;
  description: string;
  displayOrder: number;
  active: boolean;
}

export interface UpdatePackageRequest {
  id: string;
  categoryCode: CategoryCode;
  categoryName: string;
  path: Path;
  plan: Plan;
  price: Price;
  deliverables: Deliverables;
  submissionPolicy: SubmissionPolicy;
  expectedOutcome: string;
  description: string;
  displayOrder: number;
  active: boolean;
}