const forbiddenWords = [
    // English
    "nigger", "faggot", "retard", "spic", "kike",
    "cunt", "fuck", "shit", "bitch", "asshole", "cock",

    // Azerbaijani — add your own
    "göt", "sik", "amcıq", "orospu", "qəhbə", "am", "döş",

];

export const containsForbiddenWord = (text: string): boolean => {
    const lower = text.toLowerCase();
    return forbiddenWords.some((word) =>
        lower.includes(word.toLowerCase())
    );
};