export const getWordByIndex = (text: string, index: number): string | null => {
  if (!text || typeof text !== "string") return null;

  const words = text.trim().split(/\s+/);

  if (index < 1 || index > 6 || index > words.length) {
    return null;
  }

  return words[index - 1] || null;
};
