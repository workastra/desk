import { enableArrayMethods, enableMapSet, enablePatches } from 'immer';
export { WorkastraContext } from './WorkastraContext';
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

enableArrayMethods();
enableMapSet();
enablePatches();
