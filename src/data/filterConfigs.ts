import { SKILL_LEVELS } from "./skillLevels";
// filterConfig.ts
export interface FilterConfig {
  name: string;
  category: "Level" | "Type" | "Learn/Landed";
  color: string;
  icon: number; // require() returns a number in React Native
}

export const FILTER_CONFIG: FilterConfig[] = [
  // Trick Types
  {
    name: "Kick",
    category: "Type",
    color: "#3DA1F2",
    icon: require("../../assets/kick.png"),
  },
  {
    name: "Flip",
    category: "Type",
    color: "#E94F87",
    icon: require("../../assets/flip_icon.png"),
  },
  {
    name: "Twist",
    category: "Type",
    color: "#F28C2E",
    icon: require("../../assets/twist_icon.png"),
  },
  {
    name: "Transition",
    category: "Type",
    color: "#40C28C",
    icon: require("../../assets/gymnast.png"),
  },

  // Special Filters
  {
    name: "Landed",
    category: "Learn/Landed",
    color: "#4CC24A",
    icon: require("../../assets/win-gesture.png"),
  },
  {
    name: "Next Learns",
    category: "Learn/Landed",
    color: "#ecbd01ff",
    icon: require("../../assets/NextLearns.png"),
  },
  // Skill Levels
  {
    name: SKILL_LEVELS[0].name,
    category: "Level",
    color: SKILL_LEVELS[0].color,
    icon: require("../../assets/stars/one.png"),
  },
  {
    name: SKILL_LEVELS[1].name,
    category: "Level",
    color: SKILL_LEVELS[1].color,
    icon: require("../../assets/stars/two.png"),
  },
  {
    name: SKILL_LEVELS[2].name,
    category: "Level",
    color: SKILL_LEVELS[2].color,
    icon: require("../../assets/stars/three.png"),
  },
  {
    name: SKILL_LEVELS[3].name,
    category: "Level",
    color: SKILL_LEVELS[3].color,
    icon: require("../../assets/stars/four.png"),
  },
  {
    name: SKILL_LEVELS[4].name,
    category: "Level",
    color: SKILL_LEVELS[4].color,
    icon: require("../../assets/stars/five.png"),
  },
  {
    name: SKILL_LEVELS[5].name,
    category: "Level",
    color: SKILL_LEVELS[5].color,
    icon: require("../../assets/stars/six.png"),
  },
  {
    name: SKILL_LEVELS[6].color,
    category: "Level",
    color: SKILL_LEVELS[6].color,
    icon: require("../../assets/stars/seven.png"),
  },
  {
    name: SKILL_LEVELS[7].name,
    category: "Level",
    color: SKILL_LEVELS[7].color,
    icon: require("../../assets/godlike.png"),
  },
];
