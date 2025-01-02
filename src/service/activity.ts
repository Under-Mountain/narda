import { activities, current } from './model.js';
import { ActivityType } from '../interfaces/Activity.js';

/**
 * Creates a new activity.
 * @param type - The type of the activity.
 * @param of - The entity that the activity is related to.
 * @param from - The origin of the activity.
 * @param to - The destination of the activity.
 * @param amount - The amount involved in the activity.
 * @param note - The note or description of the activity.
 * @returns The created activity.
 */
export function createActivity(type: ActivityType, of: string, from: string, to: string, amount: number, note: string) {
    const id = `${type.toUpperCase()}${activities.length}`;
    const activity = {
        type,
        id,
        of,
        from,
        to,
        amount,
        note,
        times: {
            created: current.time
        }
    };
    activities.push(activity);
    current.activities.pending.push(activity.id);
    return activity;
}

/**
 * Creates a new consumption activity.
 * @param user - The user who is consuming the resource.
 * @param type - The type of resource being consumed.
 * @param cost - The cost of the resource being consumed.
 * @returns The created consumption activity.
 */
export function consume(user: string, type: string, cost: number) {
    return createActivity(
        "consume" as ActivityType,
        type,
        user,
        "world",
        cost,
        `Consuming ${cost} ${type} for ${user}`
    );
}

/**
 * Creates a new collection activity.
 * @param user - The user who is collecting the resource.
 * @param resource - The type of resource being collected.
 * @param amount - The amount of the resource being collected.
 * @returns The created collection activity.
 */
export function collect(user: string, resource: string, amount: number) {
    return createActivity(
        "collect" as ActivityType,
        resource,
        "world",
        user,
        amount,
        `Collecting ${amount} ${resource} for ${user}`
    );
}
