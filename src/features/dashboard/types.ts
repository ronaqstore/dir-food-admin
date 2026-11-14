import type { ReactNode } from 'react';

export type MissingStepId = 'items' | 'whatsapp' | 'hours' | 'deliveryAreas';

export interface MissingPublishStep {
  id: MissingStepId;
  description: string;
  href: string;
  buttonText: string;
  icon: ReactNode;
}

