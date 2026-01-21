export function escapeFTS(input: string): string {
    return input.replace(/"/g, '""');
}