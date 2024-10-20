type IterateFunc<T> = (value: T, key: string, obj: Record<string, T>) => void;

export function forOwn<T>(obj: Record<string, T>, iteratee: IterateFunc<T>): void {
    if (obj == null) return; 
    Object.keys(obj).forEach((key: string) => {
        iteratee(obj[key], key, obj);
    });
}
export function remove<T>(array: T[], predicate: (value: T) => boolean): T[] {
    return array.filter(item => !predicate(item));
}

export function uniq<T>(array: T[]): T[] {
    return [...new Set(array)];
}
export function kebabCase(str: string): string {
    return str
        .trim()
        .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
        .replace(/[^\w-]+/g, '') // Bỏ ký tự không phải chữ cái và số
        .toLowerCase();
}

export function escape(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}