export interface Cohort {
  id: number;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  program_id: number;
  created_at: string;
  updated_at: string;
  modality: string;
  offering: boolean;
  maximum_payments: number;
  schedule: {
    hours: string[];
    days: string[];
  };
}