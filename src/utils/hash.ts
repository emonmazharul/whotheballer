import bcrypt from "bcrypt";

export const hashAnswer = (value: string) =>
  bcrypt.hash(value.toLowerCase(), 10);
export const compareAnswer = (guess: string, hash: string) =>
  bcrypt.compare(guess.toLowerCase(), hash);
