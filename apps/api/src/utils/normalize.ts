/**
 * Usage:
 *     import { normalizeName } from './normalize';
 *
 *     // Returns normalized string or null if too short (≤2 chars)
 *     const result = normalizeName("21-seiki no Koibito");  // "21 seki no koibito"
 *     const result2 = normalizeName("AB");  // null (too short)
 */

const ANIME_REGEX_REPLACE_RULES: { input: string; replace: string }[] = [
    // Vowels with accents → base vowel
    { input: 'ō', replace: 'o' },
    { input: 'ó', replace: 'o' },
    { input: 'ò', replace: 'o' },
    { input: 'ö', replace: 'o' },
    { input: 'ô', replace: 'o' },
    { input: 'ø', replace: 'o' },
    { input: 'Φ', replace: 'o' },
    { input: 'ū', replace: 'u' },
    { input: 'û', replace: 'u' },
    { input: 'ú', replace: 'u' },
    { input: 'ù', replace: 'u' },
    { input: 'ü', replace: 'u' },
    { input: 'ǖ', replace: 'u' },
    { input: 'ä', replace: 'a' },
    { input: 'â', replace: 'a' },
    { input: 'à', replace: 'a' },
    { input: 'á', replace: 'a' },
    { input: 'ạ', replace: 'a' },
    { input: 'å', replace: 'a' },
    { input: 'æ', replace: 'a' },
    { input: 'ā', replace: 'a' },
    { input: 'é', replace: 'e' },
    { input: 'ê', replace: 'e' },
    { input: 'ë', replace: 'e' },
    { input: 'è', replace: 'e' },
    { input: 'ē', replace: 'e' },
    { input: 'í', replace: 'i' },
    { input: 'Í', replace: 'i' },

    // Consonants
    { input: 'č', replace: 'c' },
    { input: 'ñ', replace: 'n' },
    { input: 'ß', replace: 'b' },

    // Numbers with superscripts (keep as number)
    { input: '²', replace: '2' },
    { input: '³', replace: '3' },

    // Special symbols → space
    { input: '★', replace: ' ' },
    { input: '☆', replace: ' ' },
    { input: '/', replace: ' ' },
    { input: '\\', replace: ' ' },
    { input: '*', replace: ' ' },
    { input: '=', replace: ' ' },
    { input: '+', replace: ' ' },
    { input: '·', replace: ' ' },
    { input: '♥', replace: ' ' },
    { input: '∽', replace: ' ' },
    { input: '・', replace: ' ' },
    { input: '〜', replace: ' ' },
    { input: '†', replace: ' ' },
    { input: '×', replace: ' ' },
    { input: '♪', replace: ' ' },
    { input: '→', replace: ' ' },
    { input: '␣', replace: ' ' },
    { input: ':', replace: ' ' },
    { input: ';', replace: ' ' },
    { input: '~', replace: ' ' },
    { input: '-', replace: ' ' },
    { input: '?', replace: ' ' },
    { input: ',', replace: ' ' },
    { input: '.', replace: ' ' },
    { input: '!', replace: ' ' },
    { input: '@', replace: ' ' },
    { input: '_', replace: ' ' },
    { input: '#', replace: ' ' },
    { input: '∞', replace: ' ' },
    { input: '°', replace: ' ' },

    // Apostrophes
    { input: "'", replace: '' },

    // -- extract from database --
    // --- Latin Variations & Diacritics (Transliteration) ---
    { input: 'ç', replace: 'c' }, // LATIN SMALL LETTER C WITH CEDILLA
    { input: 'ł', replace: 'l' }, // LATIN SMALL LETTER L WITH STROKE
    { input: 'ì', replace: 'i' }, // LATIN SMALL LETTER I WITH GRAVE
    { input: 'ə', replace: 'a' }, // LATIN SMALL LETTER SCHWA (Phonetic 'a' or 'e', usually 'a' in titles)
    { input: 'î', replace: 'i' }, // LATIN SMALL LETTER I WITH CIRCUMFLEX
    { input: 'ï', replace: 'i' }, // LATIN SMALL LETTER I WITH DIAERESIS
    { input: 'ð', replace: 'd' }, // LATIN SMALL LETTER ETH
    { input: 'ã', replace: 'a' }, // LATIN SMALL LETTER A WITH TILDE
    { input: 'ý', replace: 'y' }, // LATIN SMALL LETTER Y WITH ACUTE
    { input: 'ś', replace: 's' }, // LATIN SMALL LETTER S WITH ACUTE
    { input: 'ę', replace: 'e' }, // LATIN SMALL LETTER E WITH OGONEK
    { input: 'ń', replace: 'n' }, // LATIN SMALL LETTER N WITH ACUTE
    { input: 'ź', replace: 'z' }, // LATIN SMALL LETTER Z WITH ACUTE
    { input: 'ļ', replace: 'l' }, // LATIN SMALL LETTER L WITH CEDILLA
    { input: 'ż', replace: 'z' }, // LATIN SMALL LETTER Z WITH DOT ABOVE
    { input: 'ǝ', replace: 'e' }, // LATIN SMALL LETTER TURNED E (Visual 'e')
    { input: 'ą', replace: 'a' }, // LATIN SMALL LETTER A WITH OGONEK
    { input: 'ň', replace: 'n' }, // LATIN SMALL LETTER N WITH CARON
    { input: 'ↄ', replace: 'c' }, // LATIN SMALL LETTER REVERSED C (Visual 'c')
    { input: 'ɪ', replace: 'i' }, // LATIN LETTER SMALL CAPITAL I
    { input: 'ᴜ', replace: 'u' }, // LATIN LETTER SMALL CAPITAL U

    // --- Greek Characters (Transliteration) ---
    { input: 'λ', replace: 'l' }, // GREEK SMALL LETTER LAMDA
    { input: 'α', replace: 'a' }, // GREEK SMALL LETTER ALPHA
    { input: 'μ', replace: 'u' }, // GREEK SMALL LETTER MU (Example: µ's -> u's)
    { input: 'ω', replace: 'o' }, // GREEK SMALL LETTER OMEGA (Visual 'w' but phonetic 'o', 'ver.Ω' -> 'ver.o')
    { input: 'φ', replace: 'f' }, // GREEK SMALL LETTER PHI
    { input: 'ψ', replace: 'p' }, // GREEK SMALL LETTER PSI (Phonetic 'ps', mapped to 'p' for simplicity)
    { input: 'θ', replace: 't' }, // GREEK SMALL LETTER THETA
    { input: 'δ', replace: 'd' }, // GREEK SMALL LETTER DELTA
    { input: 'β', replace: 'b' }, // GREEK SMALL LETTER BETA
    { input: 'ά', replace: 'a' }, // GREEK SMALL LETTER ALPHA WITH TONOS
    { input: 'ί', replace: 'i' }, // GREEK SMALL LETTER IOTA WITH TONOS
    { input: 'ο', replace: 'o' }, // GREEK SMALL LETTER OMICRON
    { input: 'ς', replace: 's' }, // GREEK SMALL LETTER FINAL SIGMA
    { input: 'ρ', replace: 'r' }, // GREEK SMALL LETTER RHO
    { input: 'γ', replace: 'g' }, // GREEK SMALL LETTER GAMMA
    { input: 'υ', replace: 'u' }, // GREEK SMALL LETTER UPSILON
    { input: 'ϛ', replace: 's' }, // GREEK SMALL LETTER STIGMA
    { input: 'ζ', replace: 'z' }, // GREEK SMALL LETTER ZETA
    { input: 'ε', replace: 'e' }, // GREEK SMALL LETTER EPSILON

    // --- Cyrillic Characters (Visual/Phonetic Mapping) ---
    { input: 'я', replace: 'r' }, // CYRILLIC SMALL LETTER YA (Visual 'R' in stylized text like "CЯY")
    { input: 'о', replace: 'o' }, // CYRILLIC SMALL LETTER O

    // --- Stylized / Leetspeak / Visual Lookalikes ---
    { input: '$', replace: 's' }, // DOLLAR SIGN (Example: BO$$ -> BOSS)
    { input: '∀', replace: 'a' }, // FOR ALL (Example: Rë∀l -> Real)
    { input: '˥', replace: 'l' }, // MODIFIER LETTER EXTRA-HIGH TONE BAR (Visual 'l' in "Rë∀˥")
    { input: '∅', replace: 'o' }, // EMPTY SET (Visual 'O' in "H∅WL")
    { input: '♭', replace: 'b' }, // MUSIC FLAT SIGN (Example: M♭ -> Mb)
    { input: '℃', replace: 'c' }, // DEGREE CELSIUS (Example: Icchou ℃ -> Icchou C)
    { input: 'ⓐ', replace: 'a' }, // CIRCLED LATIN SMALL LETTER A
    { input: 'ℵ', replace: 'a' }, // ALEF SYMBOL (Visual 'N' or 'A', usually mapped to 'a')
    { input: '∧', replace: 'a' }, // LOGICAL AND (Visual 'A' in "J∧ST")
    { input: '¥', replace: 'y' }, // YEN SIGN (Visual 'Y' in "¥JENNEY")

    // --- Numbers (Subscripts/Superscripts) ---
    { input: '⁵', replace: '5' }, // SUPERSCRIPT FIVE
    { input: '₂', replace: '2' }, // SUBSCRIPT TWO
    { input: '½', replace: ' ' }, // VULGAR FRACTION ONE HALF (Map to space to avoid '1/2' merging words)
    { input: '⁶', replace: '6' }, // SUPERSCRIPT SIX
    { input: '⁺', replace: '+' }, // SUPERSCRIPT PLUS SIGN
    { input: '〇', replace: '0' }, // IDEOGRAPHIC NUMBER ZERO

    // --- Punctuation & Quotes ---
    { input: "'", replace: '' }, // RIGHT SINGLE QUOTATION MARK (Map to ASCII apostrophe)
    { input: '"', replace: ' ' }, // LEFT DOUBLE QUOTATION MARK
    { input: '"', replace: ' ' }, // RIGHT DOUBLE QUOTATION MARK
    { input: '«', replace: ' ' }, // LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
    { input: '»', replace: ' ' }, // RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
    { input: '…', replace: ' ' }, // HORIZONTAL ELLIPSIS
    { input: '―', replace: ' ' }, // HORIZONTAL BAR
    { input: '–', replace: ' ' }, // EN DASH
    { input: '‑', replace: ' ' }, // NON-BREAKING HYPHEN

    // --- Separators, Symbols, Icons (Map to Space) ---
    { input: '&', replace: ' ' }, // AMPERSAND (Standard separator)
    { input: '|', replace: ' ' }, // VERTICAL LINE
    { input: '(', replace: ' ' },
    { input: ')', replace: ' ' },
    { input: '[', replace: ' ' },
    { input: ']', replace: ' ' },
    { input: '{', replace: ' ' },
    { input: '}', replace: ' ' },
    { input: '<', replace: ' ' },
    { input: '>', replace: ' ' },
    { input: '〔', replace: ' ' },
    { input: '〕', replace: ' ' },
    { input: '【', replace: ' ' },
    { input: '】', replace: ' ' },
    { input: '"', replace: ' ' },
    { input: '%', replace: ' ' },
    //{ input: '=', replace: ' ' },
    //{ input: '+', replace: ' ' },
    //{ input: '*', replace: ' ' },
    //{ input: '~', replace: ' ' },
    //{ input: '/', replace: ' ' },
    //{ input: '\\', replace: ' ' },

    // --- Graphical Symbols / Emoji / Shapes (Map to Space) ---
    { input: '♡', replace: ' ' },
    { input: '❤', replace: ' ' }, // Hearts
    //{ input: '☆', replace: ' ' }, { input: '★', replace: ' ' }, // Stars
    { input: '○', replace: ' ' },
    { input: '●', replace: ' ' },
    { input: '◎', replace: ' ' },
    { input: '￮', replace: ' ' }, // Circles
    { input: '△', replace: ' ' },
    { input: '▲', replace: ' ' },
    { input: '▽', replace: ' ' },
    { input: '▼', replace: ' ' },
    { input: '⊿', replace: ' ' },
    { input: '▶', replace: ' ' }, // Triangles
    { input: '□', replace: ' ' },
    { input: '■', replace: ' ' }, // Squares
    { input: '◇', replace: ' ' },
    { input: '♢', replace: ' ' }, // Diamonds
    { input: '↑', replace: ' ' },
    { input: '↓', replace: ' ' },
    { input: '←', replace: ' ' },
    { input: '↖', replace: ' ' },
    { input: '↗', replace: ' ' },
    { input: '↘', replace: ' ' },
    { input: '↙', replace: ' ' },
    { input: '⇔', replace: ' ' },
    { input: '⇄', replace: ' ' },
    { input: '⇧', replace: ' ' }, // Arrows '→': ' '
    { input: '♂', replace: ' ' },
    { input: '♀', replace: ' ' }, // Gender signs
    { input: '♫', replace: ' ' },
    { input: '♬', replace: ' ' },
    { input: '♩', replace: ' ' },
    { input: '𝄞', replace: ' ' }, // Music notes '♪': ' ',
    { input: '彡', replace: ' ' }, // Ideograph
    { input: '∗', replace: ' ' },
    { input: '＊', replace: ' ' },
    { input: '✻', replace: ' ' },
    { input: '✳', replace: ' ' },
    { input: '⁂', replace: ' ' }, // Asterisks
    { input: '※', replace: ' ' }, // Reference mark
    { input: '√', replace: ' ' }, // Square root (Often separates words like "Root A")
    { input: '±', replace: ' ' },
    { input: '÷', replace: ' ' },
    { input: '≠', replace: ' ' },
    { input: '≡', replace: ' ' },
    { input: '≦', replace: ' ' },
    { input: '≧', replace: ' ' },
    { input: '≒', replace: ' ' }, // Math
    { input: '♣', replace: ' ' }, // Suits
    { input: '⚡', replace: ' ' }, // High voltage
    { input: '🐻', replace: ' ' },
    { input: '🍓', replace: ' ' }, // Emoji
    { input: '卍', replace: ' ' }, // Swastika/Manji
    { input: '♨', replace: ' ' }, // Hot springs
    { input: '⌘', replace: ' ' }, // Place of interest
    { input: '®', replace: ' ' }, // Registered
    { input: '©', replace: ' ' }, // Copyright
    { input: '¢', replace: ' ' }, // Cent
    { input: '§', replace: ' ' }, // Section
    { input: '¡', replace: ' ' }, // Inverted Exclamation
    { input: '¬', replace: ' ' }, // Not sign
    { input: '¦', replace: ' ' }, // Broken bar
    { input: '¶', replace: ' ' }, // Pilcrow
    { input: '¨', replace: ' ' }, // Diaeresis (standalone)
    { input: '´', replace: ' ' },
    { input: '｀', replace: ' ' }, // Accents (standalone)
    { input: 'ˆ', replace: ' ' }, // Circumflex (standalone)
    { input: '¯', replace: ' ' }, // Macron (standalone)
    { input: '˙', replace: ' ' }, // Dot above
    { input: '¸', replace: ' ' }, // Cedilla
    { input: '˛', replace: ' ' }, // Ogonek
    { input: 'ˇ', replace: ' ' }, // Caron
    { input: 'ˈ', replace: ' ' }, // Modifier letter vertical line (Stress)
    { input: 'ː', replace: ' ' }, // Modifier letter triangular colon
    { input: '︎', replace: ' ' },
    { input: '️', replace: ' ' }, // Variation selectors
    { input: '‌', replace: '' }, // ZERO WIDTH NON-JOINER (Remove completely)
    { input: '̀', replace: '' }, // COMBINING GRAVE ACCENT (Remove)
    { input: '̄', replace: '' }, // COMBINING MACRON (Remove)
    { input: '＆', replace: ' ' }, // FULLWIDTH AMPERSAND
];
// Pre-computed at module load - cached across requests in CF Workers
const CHAR_MAP: Record<string, string> = Object.fromEntries(
    ANIME_REGEX_REPLACE_RULES.map((rule) => [rule.input, rule.replace]),
);

// Min char count for trigram (excluding spaces)
const MIN_TRIGRAM_CHARS = 2;

// Apply character mapping to a string - uses object lookup (faster than Map.get in V8)
function applyCharMap(str: string): string {
    let result = '';
    for (const char of str) {
        result += CHAR_MAP[char] || char;
    }
    return result;
}

/**
 * @param name - Original name
 * @returns Normalized name if has >2 non-space chars
 *          null otherwise
 */
export function normalizeName(name: string): string | null {
    if (!name) {
        return null;
    }

    // Apply character mapping → lowercase → char_map again → lowercase
    let result = applyCharMap(name);
    result = result.toLowerCase();
    result = applyCharMap(result);
    result = result.toLowerCase();

    // Collapse multiple spaces into single space and strip
    result = result.split(/\s+/).filter(Boolean).join(' ');

    // Check if too short for trigram (count non-space chars)
    const nonSpaceCount = result.replace(/ /g, '').length;
    if (nonSpaceCount <= MIN_TRIGRAM_CHARS) {
        return null;
    }

    return result;
}

export function normalizeNameShort(name: string): string | null {
    if (!name) {
        return null;
    }

    // Apply character mapping → lowercase → char_map again → lowercase
    let result = applyCharMap(name);
    result = result.toLowerCase();
    result = applyCharMap(result);
    result = result.toLowerCase();

    // Collapse multiple spaces into single space and strip
    result = result.split(/\s+/).filter(Boolean).join(' ');

    // Return original name if normalized result is empty (e.g., "#" → " " → "")
    // This ensures names like "#" still get indexed in short_name tables
    if (!result) {
        return name;
    }

    return result;
}

export function isShortName(name: string): boolean {
    const normalized = normalizeNameShort(name);
    if (!normalized) {
        return true; // Empty/whitespace-only is considered short
    }

    const nonSpaceCount = normalized.replace(/ /g, '').length;
    return nonSpaceCount <= MIN_TRIGRAM_CHARS;
}

export { CHAR_MAP, MIN_TRIGRAM_CHARS };
