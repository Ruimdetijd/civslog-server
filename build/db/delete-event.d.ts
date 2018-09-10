import { Ev3nt } from "../models";
import { HttpCode } from "../constants";
declare function deleteEvent(x: string): Promise<HttpCode>;
declare function deleteEvent(x: Ev3nt): Promise<HttpCode>;
export default deleteEvent;
