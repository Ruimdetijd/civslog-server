import { HttpCode } from "../constants";
import { RawEv3nt } from 'timeline';
declare function deleteEvent(x: string): Promise<HttpCode>;
declare function deleteEvent(x: RawEv3nt): Promise<HttpCode>;
export default deleteEvent;
