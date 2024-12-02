export function isArray(arr) {
    return Array.isArray(arr);
}

export function isEmpty(arr) {
    return Array.isArray(arr) && arr.length === 0;
}

export function isNotEmpty(arr) {
    return !isEmpty(arr);
}