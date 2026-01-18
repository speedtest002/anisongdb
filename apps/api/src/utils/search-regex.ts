/**
 * Anime regex replacement rules for search term normalization
 * These rules handle special characters, Unicode variants, and common substitutions
 */

// ================================================================
// STATIC DATA - Computed once at module load
// ================================================================

const ANIME_REGEX_REPLACE_RULES: { input: string; replace: string }[] = [
    // Ļ can't lower correctly with sqlite lower function hence why next line is needed
    { input: 'ļ', replace: '[ļĻ]' },
    // Ł can't lower correctly with sqlite lower function
    { input: 'ł', replace: '[łŁ]' },
    { input: 'l', replace: '[l˥ļĻΛłŁ]' },
    // Ψ can't lower correctly with sqlite lower function
    { input: 'ψ', replace: '[ψΨ]' },
    // Ź can't lower correctly with sqlite lower function
    { input: 'ź', replace: '[źŹ]' },
    // Ż can't lower correctly with sqlite lower function
    { input: 'ż', replace: '[żŻ]' },
    { input: 'z', replace: '[zźŹżŻ]' },
    // Ū can't lower correctly with sqlite lower function
    { input: 'ū', replace: '[ūŪ]' },
    // Ú can't lower correctly with sqlite lower function
    { input: 'ú', replace: '[úÚ]' },
    // Ü can't lower correctly with sqlite lower function
    { input: 'ü', replace: '[üÜ]' },
    { input: 'ou', replace: '(ou|ō|o)' },
    { input: 'uu', replace: '(uu|u|ū)' },
    { input: 'u', replace: '([uūŪûúÚùüÜǖμυ]|uu)' },
    // Ω can't lower correctly with sqlite lower function
    { input: 'ω', replace: '[ωΩ]' },
    // Ō can't lower correctly with sqlite lower function
    { input: 'ō', replace: '[ōŌ]' },
    // Φ can't lower correctly with  lower function
    { input: 'φ', replace: '[φΦ]' },
    // Ø can't lower correctly with sqlite lower function
    { input: 'ø', replace: '[øØ]' },
    // Ó can't lower correctly with sqlite lower function
    { input: 'ó', replace: '[óÓ]' },
    // Ö can't lower correctly with sqlite lower function
    { input: 'ö', replace: '[öÖ]' },
    { input: '0', replace: '[0Ө]' },
    { input: 'oo', replace: '(oo|ō|o)' },
    { input: 'oh', replace: '(oh|ō|o)' },
    { input: 'wo', replace: '(wo|o)' },
    { input: 'o', replace: '([oōŌóÓòöÖôøØ0ӨφΦο]|ou|oo|oh|wo)' },
    { input: 'w', replace: '[wω]' },
    { input: 'aa', replace: '(aa|a)' },
    { input: 'ae', replace: '(ae|æ)' },
    // Λ can't lower correctly with sqlite lower function
    { input: 'λ', replace: '[λΛ]' },
    // Ⓐ can't lower correctly with sqlite lower function
    { input: 'ⓐ', replace: '[ⓐⒶ]' },
    // À can't lower correctly with sqlite lower function
    { input: 'à', replace: '[àÀ]' },
    // Á can't lower correctly with sqlite lower function
    { input: 'á', replace: '[áÁ]' },
    // ά can't lower correctly with sqlite lower function
    { input: 'ά', replace: '[άΆ]' },
    // Ā can't lower correctly with sqlite lower function
    { input: 'ā', replace: '[āĀ]' },
    // Å can't lower correctly with sqlite lower function
    { input: 'å', replace: '[åÅ]' },
    { input: 'a', replace: '([aəäãάΆ@âàÀáÁạåÅæāĀ∀λΛ]|aa)' },
    // ↄ can't lower correctly with sqlite lower function
    { input: 'ↄ', replace: '[ↄↃ]' },
    { input: 'c', replace: '[cςč℃⊃ↄↃϛ]' },
    // É can't lower correctly with sql lower function
    { input: 'é', replace: '[éÉ]' },
    // Ë can't lower correctly with sqlite lower function
    { input: 'ë', replace: '[ëË]' },
    // Ǝ can't lower correctly with sqlite lower function
    { input: 'ǝ', replace: '[ǝƎ]' },
    { input: 'e', replace: '[eəéÉêёëËèæēǝƎ]' },
    { input: "'", replace: "[''ˈ]" },
    { input: 'n', replace: '[nñň]' },
    { input: '2', replace: '[2²₂]' },
    { input: '3', replace: '[3³]' },
    { input: '5', replace: '[5⁵]' },
    { input: '*', replace: '[*✻＊✳︎]' },
    { input: 'ii', replace: '(ii|i)' },
    { input: 'i', replace: '([iíίɪ]|ii)' },
    { input: 'x', replace: '[x×]' },
    { input: 'b', replace: '[bßβ]' },
    { input: 'ss', replace: '(ss|ß)' },
    // я can't lower correctly with sqlite lower function
    { input: 'я', replace: '[яЯ]' },
    { input: 'r', replace: '[rяЯ]' },
    { input: 's', replace: '[sς]' },
    { input: 'y', replace: '[y¥γ]' },
    { input: 'p', replace: '[pρ]' },
    { input: ' ', replace: '([^\\w]+|_+)' },
];

/**
 * PRE-COMPILED RegExp objects for applyAnimeRegexRules
 * Saves ~86 RegExp constructor calls per request
 */
const COMPILED_REGEX_RULES: { regex: RegExp; replace: string }[] =
    ANIME_REGEX_REPLACE_RULES.map((rule) => ({
        regex: new RegExp(
            rule.input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'g',
        ),
        replace: rule.replace,
    }));

/** Pre-compiled regex for escaping special chars */
const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;

/** Pre-compiled regex for FTS5 special chars */
const FTS5_ESCAPE_REGEX = /["*^()]/g;

/**
 * Extract character variants from a regex replace pattern
 * Parses patterns like '[aəäã@]' or '(ou|ō|o)' to get alternatives
 */
function extractVariantsFromPattern(pattern: string): string[] {
    const variants: string[] = [];

    // Match characters inside [...] brackets
    const bracketMatch = pattern.match(/\[([^\]]+)\]/);
    if (bracketMatch) {
        // Spread string chars directly - faster than split('')
        for (const char of bracketMatch[1]) {
            variants.push(char);
        }
    }

    // Match alternatives inside (...) with |
    const parenMatch = pattern.match(/\(([^)]+)\)/);
    if (parenMatch) {
        const parts = parenMatch[1].split('|');
        for (let i = 0; i < parts.length; i++) {
            variants.push(parts[i]);
        }
    }

    return variants;
}

/**
 * PRE-COMPUTED: Single-char rules with their extracted alternatives
 * Only includes rules where input.length === 1
 * Saves extractVariantsFromPattern() calls per request
 */
interface PrecomputedVariantRule {
    input: string;
    singleCharAlts: string[]; // Pre-filtered: length===1 && !== input
}

function buildPrecomputedVariantRules(): PrecomputedVariantRule[] {
    const rules: PrecomputedVariantRule[] = [];

    for (const rule of ANIME_REGEX_REPLACE_RULES) {
        if (rule.input.length !== 1) continue;

        const alternatives = extractVariantsFromPattern(rule.replace);
        const singleCharAlts: string[] = [];

        for (let i = 0; i < alternatives.length; i++) {
            const alt = alternatives[i];
            if (alt.length === 1 && alt !== rule.input) {
                singleCharAlts.push(alt);
            }
        }

        if (singleCharAlts.length > 0) {
            rules.push({ input: rule.input, singleCharAlts });
        }
    }

    return rules;
}

// ================================================================
// GLOBAL SCOPE: Computed once at module load
// ================================================================
const PRECOMPUTED_VARIANT_RULES = buildPrecomputedVariantRules();

// ================================================================
// EXPORTED FUNCTIONS
// ================================================================

/**
 * Applies ANIME_REGEX_REPLACE_RULES to transform a search term into a regex pattern
 * Uses PRE-COMPILED RegExp objects (no constructor calls per request)
 */
export function applyAnimeRegexRules(term: string): string {
    let result = term.toLowerCase();

    // Escape regex special characters first
    result = result.replace(ESCAPE_REGEX, '\\$&');

    // Apply replacement rules using pre-compiled RegExp
    for (let i = 0; i < COMPILED_REGEX_RULES.length; i++) {
        const rule = COMPILED_REGEX_RULES[i];
        result = result.replace(rule.regex, rule.replace);
    }

    return result;
}

/**
 * Generate search variants for FTS5 query
 * OPTIMIZED: Uses pre-computed variant rules, avoids per-request computation
 */
export function generateSearchVariants(term: string): string[] {
    const inputTerm = term.toLowerCase();
    const variants = new Set<string>();

    variants.add(inputTerm);

    // Add space <-> special character variants
    // "spark again" -> "spark-again", "spark!again", etc. and vice versa
    const specialChars = ['-', '!', ':', '~', '_', '.', ',', ';', '/', '\\'];

    if (inputTerm.includes(' ')) {
        for (const char of specialChars) {
            variants.add(inputTerm.replaceAll(' ', char));
        }
    }

    // Replace special chars with space
    for (const char of specialChars) {
        if (inputTerm.includes(char)) {
            variants.add(inputTerm.replaceAll(char, ' '));
        }
    }

    // Use pre-computed rules instead of extracting variants each time
    for (let i = 0; i < PRECOMPUTED_VARIANT_RULES.length; i++) {
        const rule = PRECOMPUTED_VARIANT_RULES[i];

        // Skip if input char not in term (fast check)
        if (inputTerm.indexOf(rule.input) === -1) continue;

        const alts = rule.singleCharAlts;
        for (let j = 0; j < alts.length; j++) {
            const alt = alts[j];
            // Replace first occurrence
            variants.add(inputTerm.replace(rule.input, alt));
            // Replace all occurrences - replaceAll is V8 native
            variants.add(inputTerm.replaceAll(rule.input, alt));
        }
    }

    return Array.from(variants);
}

/**
 * Build FTS5 query string from search variants
 * OPTIMIZED: Uses pre-compiled regex, manual string building
 */
export function buildRegexReplaced(term: string, column?: string): string {
    const variants = generateSearchVariants(term);
    const len = variants.length;

    // Pre-allocate array (minor optimization)
    const escaped: string[] = new Array(len);

    for (let i = 0; i < len; i++) {
        const clean = variants[i].replace(FTS5_ESCAPE_REGEX, ' ').trim();
        escaped[i] = column ? `${column}:"${clean}"` : `"${clean}"`;
    }

    return escaped.join(' OR ');
}

// Re-export for backwards compatibility
export { ANIME_REGEX_REPLACE_RULES };
