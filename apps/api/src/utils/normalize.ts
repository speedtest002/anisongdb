const CHAR_MAP: Record<string, string> = {
    // Vowels with accents → base vowel
    'ō': 'o', 'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o', 'ø': 'o', 'Φ': 'o',
    'ū': 'u', 'û': 'u', 'ú': 'u', 'ù': 'u', 'ü': 'u', 'ǖ': 'u',
    'ä': 'a', 'â': 'a', 'à': 'a', 'á': 'a', 'ạ': 'a', 'å': 'a', 'æ': 'a', 'ā': 'a',
    'é': 'e', 'ê': 'e', 'ë': 'e', 'è': 'e', 'ē': 'e',
    'í': 'i', 'Í': 'i',
    
    // Consonants
    'č': 'c',
    'ñ': 'n',
    'ß': 'b',
    
    // Numbers with superscripts (keep as number)
    '²': '2', '³': '3',
    
    // Special symbols → space
    '★': ' ', '☆': ' ', '/': ' ', '\\': ' ', '*': ' ', '=': ' ', '+': ' ',
    '·': ' ', '♥': ' ', '∽': ' ', '・': ' ', '〜': ' ', '†': ' ', '×': ' ',
    '♪': ' ', '→': ' ', '␣': ' ', ':': ' ', ';': ' ', '~': ' ', '-': ' ',
    '?': ' ', ',': ' ', '.': ' ', '!': ' ', '@': ' ', '_': ' ', '#': ' ',
    '∞': ' ', '°': ' ',
    
    // Apostrophes
    "'": "",
// -- extract from database --
    // --- Latin Variations & Diacritics (Transliteration) ---
    'ç': 'c',  // LATIN SMALL LETTER C WITH CEDILLA
    'ł': 'l',  // LATIN SMALL LETTER L WITH STROKE
    'ì': 'i',  // LATIN SMALL LETTER I WITH GRAVE
    'ə': 'a',  // LATIN SMALL LETTER SCHWA (Phonetic 'a' or 'e', usually 'a' in titles)
    'î': 'i',  // LATIN SMALL LETTER I WITH CIRCUMFLEX
    'ï': 'i',  // LATIN SMALL LETTER I WITH DIAERESIS
    'ð': 'd',  // LATIN SMALL LETTER ETH
    'ã': 'a',  // LATIN SMALL LETTER A WITH TILDE
    'ý': 'y',  // LATIN SMALL LETTER Y WITH ACUTE
    'ś': 's',  // LATIN SMALL LETTER S WITH ACUTE
    'ę': 'e',  // LATIN SMALL LETTER E WITH OGONEK
    'ń': 'n',  // LATIN SMALL LETTER N WITH ACUTE
    'ź': 'z',  // LATIN SMALL LETTER Z WITH ACUTE
    'ļ': 'l',  // LATIN SMALL LETTER L WITH CEDILLA
    'ż': 'z',  // LATIN SMALL LETTER Z WITH DOT ABOVE
    'ǝ': 'e',  // LATIN SMALL LETTER TURNED E (Visual 'e')
    'ą': 'a',  // LATIN SMALL LETTER A WITH OGONEK
    'ň': 'n',  // LATIN SMALL LETTER N WITH CARON
    'ↄ': 'c',  // LATIN SMALL LETTER REVERSED C (Visual 'c')
    'ɪ': 'i',  // LATIN LETTER SMALL CAPITAL I
    'ᴜ': 'u',  // LATIN LETTER SMALL CAPITAL U

    // --- Greek Characters (Transliteration) ---
    'λ': 'l',  // GREEK SMALL LETTER LAMDA
    'α': 'a',  // GREEK SMALL LETTER ALPHA
    'μ': 'u',  // GREEK SMALL LETTER MU (Example: µ's -> u's)
    'ω': 'o',  // GREEK SMALL LETTER OMEGA (Visual 'w' but phonetic 'o', 'ver.Ω' -> 'ver.o')
    'φ': 'f',  // GREEK SMALL LETTER PHI
    'ψ': 'p',  // GREEK SMALL LETTER PSI (Phonetic 'ps', mapped to 'p' for simplicity)
    'θ': 't',  // GREEK SMALL LETTER THETA
    'δ': 'd',  // GREEK SMALL LETTER DELTA
    'β': 'b',  // GREEK SMALL LETTER BETA
    'ά': 'a',  // GREEK SMALL LETTER ALPHA WITH TONOS
    'ί': 'i',  // GREEK SMALL LETTER IOTA WITH TONOS
    'ο': 'o',  // GREEK SMALL LETTER OMICRON
    'ς': 's',  // GREEK SMALL LETTER FINAL SIGMA
    'ρ': 'r',  // GREEK SMALL LETTER RHO
    'γ': 'g',  // GREEK SMALL LETTER GAMMA
    'υ': 'u',  // GREEK SMALL LETTER UPSILON
    'ϛ': 's',  // GREEK SMALL LETTER STIGMA
    'ζ': 'z',  // GREEK SMALL LETTER ZETA
    'ε': 'e',  // GREEK SMALL LETTER EPSILON

    // --- Cyrillic Characters (Visual/Phonetic Mapping) ---
    'я': 'r',  // CYRILLIC SMALL LETTER YA (Visual 'R' in stylized text like "CЯY")
    'о': 'o',  // CYRILLIC SMALL LETTER O

    // --- Stylized / Leetspeak / Visual Lookalikes ---
    '$': 's',  // DOLLAR SIGN (Example: BO$$ -> BOSS)
    '∀': 'a',  // FOR ALL (Example: Rë∀l -> Real)
    '˥': 'l',  // MODIFIER LETTER EXTRA-HIGH TONE BAR (Visual 'l' in "Rë∀˥")
    '∅': 'o',  // EMPTY SET (Visual 'O' in "H∅WL")
    '♭': 'b',  // MUSIC FLAT SIGN (Example: M♭ -> Mb)
    '℃': 'c',  // DEGREE CELSIUS (Example: Icchou ℃ -> Icchou C)
    'ⓐ': 'a',  // CIRCLED LATIN SMALL LETTER A
    'ℵ': 'a',  // ALEF SYMBOL (Visual 'N' or 'A', usually mapped to 'a')
    '∧': 'a',  // LOGICAL AND (Visual 'A' in "J∧ST")
    '¥': 'y',  // YEN SIGN (Visual 'Y' in "¥JENNEY")

    // --- Numbers (Subscripts/Superscripts) ---
    '⁵': '5',  // SUPERSCRIPT FIVE
    '₂': '2',  // SUBSCRIPT TWO
    '½': ' ',  // VULGAR FRACTION ONE HALF (Map to space to avoid '1/2' merging words)
    '⁶': '6',  // SUPERSCRIPT SIX
    '⁺': '+',  // SUPERSCRIPT PLUS SIGN
    '〇': '0',  // IDEOGRAPHIC NUMBER ZERO

    // --- Punctuation & Quotes ---
    '’': "",  // RIGHT SINGLE QUOTATION MARK (Map to ASCII apostrophe)
    // "'": "",
    // '“': ' ',  // LEFT DOUBLE QUOTATION MARK
    '”': ' ',  // RIGHT DOUBLE QUOTATION MARK
    '«': ' ',  // LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
    '»': ' ',  // RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
    '…': ' ',  // HORIZONTAL ELLIPSIS
    '―': ' ',  // HORIZONTAL BAR
    '–': ' ',  // EN DASH
    '‑': ' ',  // NON-BREAKING HYPHEN

    // --- Separators, Symbols, Icons (Map to Space) ---
    '&': ' ',  // AMPERSAND (Standard separator)
    '|': ' ',  // VERTICAL LINE
    '(': ' ', ')': ' ',
    '[': ' ', ']': ' ',
    '{': ' ', '}': ' ',
    '<': ' ', '>': ' ',
    '〔': ' ', '〕': ' ',
    '【': ' ', '】': ' ',
    '"': ' ',
    '%': ' ',
    // '=': ' ',
    // '+': ' ',
    // '*': ' ',
    // '~': ' ',
    // '/': ' ',
    // '\\': ' ',
    
    // --- Graphical Symbols / Emoji / Shapes (Map to Space) ---
    '♡': ' ', '❤': ' ', // Hearts
    // '☆': ' ', '★': ' ', // Stars
    '○': ' ', '●': ' ', '◎': ' ', '￮': ' ', // Circles
    '△': ' ', '▲': ' ', '▽': ' ', '▼': ' ', '⊿': ' ', '▶': ' ', // Triangles
    '□': ' ', '■': ' ', // Squares
    '◇': ' ', '♢': ' ', // Diamonds
    '↑': ' ', '↓': ' ', '←': ' ', '↖': ' ', '↗': ' ', '↘': ' ', '↙': ' ', '⇔': ' ', '⇄': ' ', '⇧': ' ', // Arrows '→': ' ', 
    '♂': ' ', '♀': ' ', // Gender signs
    '♫': ' ', '♬': ' ', '♩': ' ', '𝄞': ' ', // Music notes '♪': ' ', 
    '彡': ' ', // Ideograph
    '∗': ' ', '＊': ' ', '✻': ' ', '✳': ' ', '⁂': ' ', // Asterisks
    '※': ' ', // Reference mark
    '√': ' ', // Square root (Often separates words like "Root A")
    '±': ' ', '÷': ' ', '≠': ' ', '≡': ' ', '≦': ' ', '≧': ' ', '≒': ' ', // Math
    '♣': ' ', // Suits
    '⚡': ' ', // High voltage
    '🐻': ' ', '🍓': ' ', // Emoji
    '卍': ' ', // Swastika/Manji
    '♨': ' ', // Hot springs
    '⌘': ' ', // Place of interest
    '®': ' ', // Registered
    '©': ' ', // Copyright
    '¢': ' ', // Cent
    '§': ' ', // Section
    '¡': ' ', // Inverted Exclamation
    '¬': ' ', // Not sign
    '¦': ' ', // Broken bar
    '¶': ' ', // Pilcrow
    '¨': ' ', // Diaeresis (standalone)
    '´': ' ', '｀': ' ', // Accents (standalone)
    'ˆ': ' ', // Circumflex (standalone)
    '¯': ' ', // Macron (standalone)
    '˙': ' ', // Dot above
    '¸': ' ', // Cedilla
    '˛': ' ', // Ogonek
    'ˇ': ' ', // Caron
    'ˈ': ' ', // Modifier letter vertical line (Stress)
    'ː': ' ', // Modifier letter triangular colon
    '︎': ' ', '️': ' ', // Variation selectors
    '‌': '',   // ZERO WIDTH NON-JOINER (Remove completely)
    '̀': '',   // COMBINING GRAVE ACCENT (Remove)
    '̄': '',   // COMBINING MACRON (Remove)
    '＆': ' ', // FULLWIDTH AMPERSAND
};

const MIN_TRIGRAM_CHARS = 2;

/**
 * Returns tuple: [isShortName, normalizedName]
 */
export function normalizeName(input: string): [boolean, string] {
    if (!input) return [true, ''];

    const str = input.toLowerCase();
    
    let res = '';
    let nonSpaceCount = 0;
    let lastIsSpace = true; 

    const len = str.length;
    for (let i = 0; i < len; i++) {
        const char = str[i];
        
        // Lookup map
        let replacement = CHAR_MAP[char];
        
        if (replacement === undefined) {
            replacement = char;
        }

        for (let j = 0; j < replacement.length; j++) {
            const rChar = replacement[j];

            if (rChar === ' ') {
                // check the prevous char is space or not
                if (!lastIsSpace) {
                    res += ' ';
                    lastIsSpace = true;
                }
            } else {
                res += rChar;
                lastIsSpace = false;
                nonSpaceCount++; // count non space char
            }
        }
    }

    // trim trailing space
    if (res.length > 0 && res.charCodeAt(res.length - 1) === 32) {
        res = res.slice(0, -1);
    }

    return [nonSpaceCount <= MIN_TRIGRAM_CHARS, res];
}

export { CHAR_MAP };