import { FixtureUserData } from './collisions/types';
export declare type CollisionEventProps = {
    uuid: string;
    fixtureIndex: number;
    collidedFixtureIndex: number;
    isSensor: boolean;
    data: FixtureUserData | null;
};
export declare const storedPhysicsData: {
    bodies: {
        [uuid: string]: number;
    };
};
