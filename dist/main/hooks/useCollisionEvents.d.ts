import { ValidUUID } from "../worker/shared/types";
export declare const useCollisionEvents: (uuid: ValidUUID, onCollideStart?: ((data: any, fixtureIndex: number, collidedFixtureIndex: number, isSensor: boolean) => void) | undefined, onCollideEnd?: ((data: any, fixtureIndex: number, collidedFixtureIndex: number, isSensor: boolean) => void) | undefined) => void;
