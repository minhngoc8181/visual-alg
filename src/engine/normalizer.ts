import { assertValidSource } from './validator';

const declarationPattern =
  /^(\s*)(?:final\s+)?(?:int|double|float|long|boolean|String)(?:\s*\[\])?\s+([A-Za-z_]\w*)(\s*=\s*.*;\s*)$/u;

export function normalizeJavaLikeSource(source: string): string {
  assertValidSource(source);

  return source
    .split(/\r?\n/u)
    .map((line) => normalizeLine(line))
    .join('\n');
}

function normalizeLine(line: string): string {
  const declarationMatch = line.match(declarationPattern);
  if (declarationMatch) {
    const [, indent, variableName, assignment] = declarationMatch;
    return `${indent}${variableName}${assignment}`;
  }

  return line
    .replace(/System\.out\.println\s*\(/gu, 'print(')
    .replace(
      /for\s*\(\s*(?:final\s+)?(?:int|double|float|long|boolean|String)\s+([A-Za-z_]\w*)\s*=/gu,
      'for ($1 =',
    );
}