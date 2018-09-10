import { HttpCode } from "../constants";
interface Options {
    id: string;
    outputPath?: string;
    updateEvent?: boolean;
}
export default function fetchImage(options: Options): Promise<HttpCode>;
export {};
