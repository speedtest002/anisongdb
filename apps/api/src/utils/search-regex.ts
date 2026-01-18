/**
 * Anime regex replacement rules for search term normalization
 * These rules handle special characters, Unicode variants, and common substitutions
 */
export const ANIME_REGEX_REPLACE_RULES: { input: string; replace: string }[] = [
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
 * Applies ANIME_REGEX_REPLACE_RULES to transform a search term into a regex pattern
 * that can match various Unicode and special character variants
 *
 * @param term - The search term to transform
 * @returns A regex pattern string that matches variants of the input
 */
export function applyAnimeRegexRules(term: string): string {
    let result = term.toLowerCase();

    // Escape regex special characters first (except for chars we'll replace)
    result = result.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Apply replacement rules in order
    // Note: Order matters! Multi-character patterns (ou, uu, oo, etc.) should be processed first
    for (const rule of ANIME_REGEX_REPLACE_RULES) {
        // Escape the input for regex matching
        const escapedInput = rule.input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedInput, 'g');
        result = result.replace(regex, rule.replace);
    }

    return result;
}

/**
 * Creates a SQL LIKE pattern or REGEXP pattern for searching
 * This is useful for fuzzy matching in database queries
 *
 * @param term - The search term
 * @returns The transformed search pattern
 */
export function createSearchPattern(term: string): string {
    return applyAnimeRegexRules(term);
}

// ================================================================
// FTS5 Search Variants Generation (derived from ANIME_REGEX_REPLACE_RULES)
// ================================================================

/**
 * Extract character variants from a regex replace pattern
 * Parses patterns like '[aəäã@]' or '(ou|ō|o)' to get alternatives
 */
function extractVariantsFromPattern(pattern: string): string[] {
    const variants: string[] = [];

    // Match characters inside [...] brackets
    const bracketMatch = pattern.match(/\[([^\]]+)\]/);
    if (bracketMatch) {
        variants.push(...bracketMatch[1].split(''));
    }

    // Match alternatives inside (...) with |
    const parenMatch = pattern.match(/\(([^)]+)\)/);
    if (parenMatch) {
        variants.push(...parenMatch[1].split('|'));
    }

    return variants.filter((v) => v.length > 0);
}

/**
 * Build reverse character map from ANIME_REGEX_REPLACE_RULES
 * Maps special characters back to their base form
 *
 * @example '@' → 'a', 'ō' → 'o'
 */
function buildReverseMapFromRules(): Map<string, string> {
    const reverseMap = new Map<string, string>();

    for (const rule of ANIME_REGEX_REPLACE_RULES) {
        // Only process single-character inputs for simple mapping
        if (rule.input.length !== 1) continue;

        const variants = extractVariantsFromPattern(rule.replace);
        for (const variant of variants) {
            // Only map single chars, skip if same as input
            if (variant.length === 1 && variant !== rule.input) {
                reverseMap.set(variant, rule.input);
            }
        }
    }

    return reverseMap;
}

// Build once at module load
const REVERSE_CHAR_MAP = buildReverseMapFromRules();

/**
 * Normalize a search term by replacing special characters with their base form
 * Example: "m@sterpiece" → "masterpiece"
 */
export function normalizeSearchTerm(term: string): string {
    let normalized = term.toLowerCase();
    for (const [special, base] of REVERSE_CHAR_MAP) {
        normalized = normalized.split(special).join(base);
    }
    return normalized;
}

/**
 * Generate search variants for FTS5 query
 * ONE-WAY: base chars (a,e,i,o,s) → special chars (@,3,1,0,$)
 * Does NOT normalize special chars back to base
 *
 * @param term - Original search term (kept as-is)
 * @returns Array of term variants for OR query
 *
 * @example
 * generateSearchVariants("masterpiece")
 * // → ["masterpiece", "m@sterpiece", "m4sterpiece", ...]
 *
 * generateSearchVariants("m@sterpiece")
 * // → ["m@sterpiece"] (keeps @ as-is, only expands base chars if any)
 */
export function generateSearchVariants(term: string): string[] {
    const inputTerm = term.toLowerCase();
    const variants = new Set<string>();

    // Always include original term (as-is, just lowercased)
    variants.add(inputTerm);

    // Generate variants: base char → special chars (ONE-WAY only)
    for (const rule of ANIME_REGEX_REPLACE_RULES) {
        // Only use single-char inputs (base chars like a, e, i, o, s)
        if (rule.input.length !== 1) continue;
        if (!inputTerm.includes(rule.input)) continue;

        // Extract ALL alternatives from the rule pattern
        const alternatives = extractVariantsFromPattern(rule.replace);

        // Filter to single chars only, exclude the base char itself
        const singleCharAlts = alternatives.filter(
            (a) => a.length === 1 && a !== rule.input,
        );

        for (const alt of singleCharAlts) {
            // Replace first occurrence only
            variants.add(inputTerm.replace(rule.input, alt));
            // Replace all occurrences
            variants.add(inputTerm.split(rule.input).join(alt));
        }
    }

    return Array.from(variants);
}

/**
 * Build FTS5 query string from search variants
 * Wraps each variant in quotes and joins with OR
 *
 * @param term - Original search term
 * @param column - Optional column name to restrict search (e.g., 'song_name')
 * @returns FTS5 query string like: "term1" OR "term2" OR column:"term1" OR column:"term2"
 */
export function buildRegexReplaced(term: string, column?: string): string {
    const variants = generateSearchVariants(term);

    // Escape FTS5 special characters and wrap in quotes
    const escaped = variants.map((v) => {
        const clean = v.replace(/[\"*^:\-()]/g, ' ').trim();
        // If column specified, prefix with column name
        if (column) {
            return `${column}:"${clean}"`;
        }
        return `"${clean}"`;
    });

    return escaped.join(' OR ');
}
