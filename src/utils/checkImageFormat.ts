import queryString from 'query-string';
import { toVFile } from 'to-vfile';

const { parseUrl } = queryString;

export const checkImageFormat = (url: string, formats: string[]): boolean =>
    !!formats.includes(toVFile(parseUrl(url).url).extname?.slice(1) ?? '');
