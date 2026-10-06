/**
 * Checks that the three places a trick lives agree with each other:
 * src/data/tricks.ts, src/i18n/tricksHe.ts and the icon in assets/.
 *
 * tsc already catches wrong field types and stance names. It cannot catch a
 * prerequisite id that points nowhere, which is how Moon Kick and Coin Drop
 * ended up permanently locked, so that and the cross-file checks live here.
 *
 *   node scripts/validate-tricks.mjs            validate, exit 1 on errors
 *   node scripts/validate-tricks.mjs --catalog  print the trick catalog as JSON
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRICKS_FILE = path.join(ROOT, "src/data/tricks.ts");
const HE_FILE = path.join(ROOT, "src/i18n/tricksHe.ts");

const MAX_DIFFICULTY = 7; // last index of SKILL_LEVELS in src/data/skillLevels.ts
const ID_PATTERN = /^[a-z0-9]+(_[a-z0-9]+)*$/;

// Shipped before the snake_case rule. Ids key saved progress, so renaming one
// needs a migration in src/data/migrations.ts; not worth it for a hyphen.
const LEGACY_IDS = new Set(["cork_d-leg"]);

const parse = file =>
  ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

const findVariable = (source, name) => {
  let found;
  const visit = node => {
    if (ts.isVariableDeclaration(node) && node.name.getText() === name) found = node.initializer;
    else ts.forEachChild(node, visit);
  };
  visit(source);
  if (!found) throw new Error(`${name} not found in ${source.fileName}`);
  return found;
};

// Identifier, string literal ("540_kick") and numeric literal names all expose .text.
const propertyName = prop => prop.name.text;

const literalValue = node => {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literalValue);
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    return literalValue(node.left) + literalValue(node.right);
  }
  return undefined;
};

const lineOf = node =>
  node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;

/** import foo from "../../assets/x.png" → { foo: "../../assets/x.png" } */
const readImports = source => {
  const imports = {};
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && statement.importClause?.name) {
      imports[statement.importClause.name.text] = statement.moduleSpecifier.text;
    }
  }
  return imports;
};

const iconPath = (node, imports) => {
  if (ts.isIdentifier(node)) return imports[node.text];
  if (ts.isCallExpression(node) && node.expression.getText() === "require") {
    return literalValue(node.arguments[0]);
  }
  return undefined;
};

const readTricks = () => {
  const source = parse(TRICKS_FILE);
  const imports = readImports(source);
  const array = findVariable(source, "TRICKS_DATA_RAW");

  return array.elements.map(element => {
    const trick = { line: lineOf(element) };
    for (const prop of element.properties) {
      const key = propertyName(prop);
      trick[key] =
        key === "icon" ? iconPath(prop.initializer, imports) : literalValue(prop.initializer);
    }
    return trick;
  });
};

const readHebrew = () => {
  const object = findVariable(parse(HE_FILE), "TRICKS_HE");
  const entries = {};
  for (const prop of object.properties) {
    const value = {};
    for (const field of prop.initializer.properties) {
      value[propertyName(field)] = literalValue(field.initializer);
    }
    entries[propertyName(prop)] = { ...value, line: lineOf(prop) };
  }
  return entries;
};

/** Returns each prerequisite cycle once, as a list of ids. */
const findCycles = byId => {
  const cycles = [];
  const state = {}; // undefined = unvisited, 1 = on the stack, 2 = done
  const stack = [];

  const visit = id => {
    state[id] = 1;
    stack.push(id);
    for (const next of byId[id].prerequisites ?? []) {
      if (!byId[next]) continue; // reported separately as unknown
      if (state[next] === 1) cycles.push([...stack.slice(stack.indexOf(next)), next]);
      else if (!state[next]) visit(next);
    }
    stack.pop();
    state[id] = 2;
  };

  Object.keys(byId).forEach(id => state[id] || visit(id));
  return cycles;
};

const validate = (tricks, hebrew) => {
  const errors = [];
  const at = trick => `tricks.ts:${trick.line} ${trick.id ?? "(no id)"}`;

  const byId = {};
  for (const trick of tricks) {
    if (typeof trick.id !== "string") {
      errors.push(`${at(trick)}: missing id`);
      continue;
    }
    if (byId[trick.id]) errors.push(`${at(trick)}: duplicate id (also line ${byId[trick.id].line})`);
    byId[trick.id] = trick;
  }

  for (const trick of tricks) {
    if (typeof trick.id !== "string") continue;

    if (!ID_PATTERN.test(trick.id) && !LEGACY_IDS.has(trick.id)) errors.push(`${at(trick)}: id must be snake_case`);

    for (const prereq of trick.prerequisites ?? []) {
      if (!byId[prereq]) errors.push(`${at(trick)}: prerequisite "${prereq}" is not a trick`);
    }

    if (!Number.isInteger(trick.difficulty) || trick.difficulty < 0 || trick.difficulty > MAX_DIFFICULTY) {
      errors.push(`${at(trick)}: difficulty must be an integer 0–${MAX_DIFFICULTY}`);
    }

    if (!trick.icon) {
      errors.push(`${at(trick)}: icon is not a local asset`);
    } else if (!fs.existsSync(path.resolve(path.dirname(TRICKS_FILE), trick.icon))) {
      errors.push(`${at(trick)}: icon file ${trick.icon} does not exist`);
    }

    const he = hebrew[trick.id];
    if (!he) errors.push(`${at(trick)}: no Hebrew entry in tricksHe.ts`);
    else if (!he.name || !he.description) errors.push(`${at(trick)}: Hebrew entry needs name and description`);
  }

  for (const [id, entry] of Object.entries(hebrew)) {
    if (!byId[id]) errors.push(`tricksHe.ts:${entry.line} ${id}: Hebrew entry for a trick that does not exist`);
  }

  for (const cycle of findCycles(byId)) {
    errors.push(`prerequisite cycle: ${cycle.join(" → ")}`);
  }

  return errors;
};

const tricks = readTricks();
const hebrew = readHebrew();

if (process.argv.includes("--catalog")) {
  const catalog = tricks.map(({ id, name, types, prerequisites, difficulty, takeoff, landingStance, tutorialUrl, icon }) => ({
    id,
    name,
    nameHe: hebrew[id]?.name ?? null,
    types,
    prerequisites,
    difficulty,
    takeoff,
    landingStance,
    tutorialUrl,
    icon: icon ? path.basename(icon) : null,
  }));
  process.stdout.write(JSON.stringify(catalog, null, 2) + "\n");
  process.exit(0);
}

const errors = validate(tricks, hebrew);
if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in ${tricks.length} tricks:\n`);
  errors.forEach(error => console.error(`  ${error}`));
  process.exit(1);
}
console.log(`✓ ${tricks.length} tricks: ids, prerequisites, icons and Hebrew all line up.`);
