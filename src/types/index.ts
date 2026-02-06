
export interface Trick {
  id: string;
  name: string;
  icon: any;
  types: string[];
  prerequisites: string[];
  difficulty: number; // 0-10
  description: string;
  tutorialUrl: string;
  takeoff?: string;
  landingStance?: string;
}


export interface Stance {
  id: number;
  name: string;
  dom: "front" | "back";
}



export type TrickProgress = Record<string, boolean>;
