import { compareTwoStrings } from "string-similarity";

type ResultType = {
  userGuess: string;
  correct: boolean;
  similarity: number;
};

export const isCorrectGuess = (
  userGuess: string,
  actualName: string,
): ResultType => {
  // 1. Normalize both strings: lowercase and remove extra spaces
  const cleanGuess = userGuess.toLowerCase().trim();
  const cleanActual = actualName.toLowerCase().trim();

  // 2. Exact match check (always fast)
  if (cleanGuess === cleanActual)
    return { userGuess, correct: true, similarity: 1 };

  // 3. Fuzzy match check
  // Returns a fraction between 0 and 1
  const similarity = compareTwoStrings(cleanGuess, cleanActual);

  // 0.8 is usually the "sweet spot" for names
  // 'Hary Kan' vs 'Harry Kane' is ~0.88 (True)
  // 'Messi' vs 'Ronaldo' is ~0.0 (False)
  return { correct: similarity >= 0.82, userGuess: userGuess, similarity };
};
