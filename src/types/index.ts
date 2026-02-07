import { Takeoff, LandingStance } from "../data/stances";

export interface Trick {
  id: string;
  name: string;
  icon: any;
  types: string[];
  prerequisites: string[];
  difficulty: number; // 0-10
  description: string;
  tutorialUrl: string;
  takeoff: Takeoff;
  landingStance: LandingStance;
}





export type TrickProgress = Record<string, boolean>;

export interface SavedCombo {
  id: string;
  title: string;
  comboText: string;
  timestamp: number;
}
