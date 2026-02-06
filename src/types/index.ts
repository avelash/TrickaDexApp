import { TakeoffName, LandingStanceName } from "../data/stances";

export interface Trick {
  id: string;
  name: string;
  icon: any;
  types: string[];
  prerequisites: string[];
  difficulty: number; // 0-10
  description: string;
  tutorialUrl: string;
  takeoff: TakeoffName;
  landingStance: LandingStanceName;
}





export type TrickProgress = Record<string, boolean>;
