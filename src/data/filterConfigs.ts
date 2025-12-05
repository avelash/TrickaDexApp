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
    color: "#932ef9ff",
    icon: require("../../assets/kick.png"),
  },
  {
    name: "Flip",
    category: "Type",
    color: "#2a6ce7ff",
    icon: require("../../assets/flip_icon.png"),
  },
  {
    name: "Twist",
    category: "Type",
    color: "#F97316",
    icon: require("../../assets/twist_icon.png"),
  },
  {
    name: "Transition",
    category: "Type",
    color: "#1dbc7aff",
    icon: require("../../assets/gymnast.png"),
  },

  // Special Filters
  {
    name: "Landed",
    category: "Learn/Landed",
    color: "#84CC16",
    icon: require("../../assets/win-gesture.png"),
  },
  {
    name: "Next Learns",
    category: "Learn/Landed",
    color: "#FACC15",
    icon: require("../../assets/NextLearns.png"),
  },
  {
    name: "Favorites",
    category: "Learn/Landed",
    color: "#FF5252",
    icon: require("../../assets/heart_filled.png"),
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
    name: SKILL_LEVELS[6].name,
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
