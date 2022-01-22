import { FC } from 'react';
import { PhysicsProps } from './worker/shared/types';
export declare const usePhysicsWorker: () => Worker;
declare const PhysicsWorker: FC<PhysicsProps & {
    physicsWorker: Worker;
}>;
export default PhysicsWorker;
