export interface Trick {
  id: string;
  name: string;
  icon: any;
  types: string[];
  prerequisites: string[];
  difficulty: number; // 0-10
  description: string;
  tutorialUrl: string;
}

export type TrickProgress = Record<string, boolean>;
