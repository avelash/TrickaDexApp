// Skill level names for tricks
interface SkillLevel {
  name: string;
  color: string;
  number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
export const SKILL_LEVELS: SkillLevel[] = [
  { name: "Novice", color: "#0C8997", number: 0 },
  { name: "Beginner", color: "#FF6B6B", number: 1 },
  { name: "Intermediate", color: "#C2E812", number: 2 },
  { name: "Advanced", color: "#9046CF", number: 3 },
  { name: "Elite", color: "#F0A202", number: 4 },
  { name: "Ascendant", color: "#623CEA", number: 5 },
  { name: "Transcendent", color: "#F5EF36", number: 6 },
  { name: "Godlike", color: "#C2185B", number: 7 },
];
