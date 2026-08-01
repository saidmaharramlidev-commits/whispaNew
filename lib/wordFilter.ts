const forbiddenWords = [
    // English
    "nigger", "faggot", "retard", "spic", "kike",
    "cunt", "fuck", "shit", "bitch", "asshole", "cock", "suck", "gay", 'bisexual', 'transgender', "lesbian",

    // Azerbaijani — add your own
    "göt", "sik", "amcıq", "orospu", "qəhbə", "döş", "peysər", "pesi", "besmantov"

];

export const containsForbiddenWord = (text: string): boolean => {
    const lower = text.toLowerCase();
    return forbiddenWords.some((word) =>
        lower.includes(word.toLowerCase())
    );
};