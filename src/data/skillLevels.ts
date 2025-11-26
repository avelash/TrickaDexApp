// Skill level names for tricks
interface SkillLevel {
  name: string;
  color: string;
  number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
export const SKILL_LEVELS: SkillLevel[] = [
  { name: "Novice", color: "#fde047", number: 0 },
  { name: "Beginner", color: "#FB923C", number: 1 },
  { name: "Intermediate", color: "#FF6B6B", number: 2 },
  { name: "Advanced", color: "#F472B6", number: 3 },
  { name: "Elite", color: "#31c87fff", number: 4 },
  { name: "Ascendant", color: "#388DF8", number: 5 },
  { name: "Transcendent", color: "#7C3AED", number: 6 },
  { name: "Godlike", color: "#22A699", number: 7 },
];
