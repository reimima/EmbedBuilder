export const isImage = async (url: string): Promise<boolean> =>
    (await (await fetch(url)).blob()).type.startsWith('image/');
