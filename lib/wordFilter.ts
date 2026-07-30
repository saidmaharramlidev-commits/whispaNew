const forbiddenWords = [
    // English
    "nigger", "faggot", "retard", "spic", "kike",
    "cunt", "fuck", "bitch", "asshole", "cock", "suck",
    "gay", "lesbian", "bisexual", "transgender", "nigga", "ass",

    // Azerbaijani,Turkish — add your own
    "göt", "sik", "amcıq", "orospu", "qəhbə", "döş", "yarrak", "besmantov", 'peysər', 'gij', 'pesi', "oğraş", "gey", "yarrağ"

];

export const containsForbiddenWord = (text: string): boolean => {
    const lower = text.toLowerCase();
    return forbiddenWords.some((word) =>
        lower.includes(word.toLowerCase())
    );
};