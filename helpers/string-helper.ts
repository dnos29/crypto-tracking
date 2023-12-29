export const padStartStr = (str: string | number, maxLength = 2, fillString = '0') => {
    return str.toString().padStart(maxLength, fillString);
}