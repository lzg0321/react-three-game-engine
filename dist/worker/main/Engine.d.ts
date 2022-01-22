import { FC } from 'react';
import { MappedComponents } from '../shared/types';
import { PhysicsProps } from "./worker/shared/types";
export declare const Engine: FC<PhysicsProps & {
    physicsWorker: Worker;
    logicWorker?: Worker;
    logicMappedComponents?: MappedComponents;
}>;
