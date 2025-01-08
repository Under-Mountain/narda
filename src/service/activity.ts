import { activities, current, accounts, posts, auth, assets } from './model.js';
import { ActivityType } from '../interfaces/Activity.js';
import bcrypt from 'bcrypt';
import { exploreCost } from "../common/pricing.js";

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
    let prefix = 'TX';
    switch (type) {
        case 'mint':
            prefix = 'MNT';
            break;
        case 'consume':
            prefix = 'CSM';
            break;
        case 'collect':
            prefix = 'CLT';
            break;
        case 'transaction':
            prefix = 'TX';
            break;
        case 'system':
            prefix = 'SYS';
            break;
        case 'exchange':
            prefix = 'EXC';
            break;
        case 'stake':
            prefix = 'STK';
            break;
        case 'withdraw':
            prefix = 'WTD';
            break;
        default:
            prefix = 'TX';
            break;
    }

    const id = `${prefix}${activities.length}`;
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
 * Creates a new transaction activity.
 * @param from - The origin of the transaction.
 * @param to - The destination of the transaction.
 * @param amount - The amount involved in the transaction.
 * @param of - The entity that the transaction is related to (default is "credit").
 * @param note - The note or description of the transaction.
 * @returns The created transaction activity.
 */
export function createTransaction(from: string, to: string, amount: number, of: string = "credit", note: string = "") {
    const activity = createActivity(
        "transaction" as ActivityType,
        of,
        from,
        to,
        amount,
        note
    );
    
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
    const activity = createActivity(
        "consume" as ActivityType,
        type,
        user,
        "world",
        cost,
        `Consuming ${cost} ${type} for ${user}`
    );
    
    return activity;
}

/**
 * Creates a new collection activity.
 * @param user - The user who is collecting the resource.
 * @param resource - The type of resource being collected.
 * @param amount - The amount of the resource being collected.
 * @returns The created collection activity.
 */
export function collect(user: string, resource: string, amount: number) {
    const activity = createActivity(
        "collect" as ActivityType,
        resource,
        "world",
        user,
        amount,
        `Collecting ${amount} ${resource} for ${user}`
    );
    
    return activity;
}

/**
 * Handles the creation of a comment.
 * @param username - The username of the commenter.
 * @param postId - The ID of the post being commented on.
 * @param comment - The comment text.
 * @returns The updated post.
 */
export function comment(username: string, postId: string, comment: string) {
    const account = accounts.find(a => a.id == username);
    if (!account || account.credits.balance < 5) {
        throw new Error('Not enough balance to comment');
    }
    const post = posts.find(p => p.id == postId);
    if (!post) {
        throw new Error('Post not found');
    }
    const creditConsumption = consume(username, "credits", 5);
    post.comments.push({
        comment,
        author: account.id,
        time: current.time,
        likes: 0,
        dislikes: 0
    });
    return post;
}

/**
 * Handles the creation of a like or dislike.
 * @param username - The username of the liker/disliker.
 * @param postId - The ID of the post being liked/disliked.
 * @param dislike - Whether the action is a dislike.
 * @returns The updated post.
 */
export function like(username: string, postId: string, dislike: boolean) {
    const account = accounts.find(a => a.id == username);
    if (!account || account.credits.balance < 1) {
        throw new Error('Not enough balance to like/dislike');
    }
    const post = posts.find(p => p.id == postId);
    if (!post) {
        throw new Error('Post not found');
    }
    const creditConsumption = consume(username, "credits", 1);
    if (dislike) post.dislikes += 1;
    else post.likes += 1;
    return post;
}

/**
 * Handles the creation of a post.
 * @param username - The username of the poster.
 * @param title - The title of the post.
 * @param content - The content of the post.
 * @param places - The places of the post.
 * @returns The created post.
 */
export function postContent(username: string, title: string, content: string, places: string) {
    const account = accounts.find(a => a.id == username);
    if (!account || account.credits.balance < 10) {
        throw new Error('Not enough balance to post');
    }
    const creditConsumption = consume(username, "credits", 10);
    const post = {
        id: `PST${posts.length}`,
        author: username,
        title,
        content,
        places: places.replace(/\s+/g, '').split(','),
        likes: 0,
        dislikes: 0,
        times: {
            created: current.time
        },
        comments: []
    };
    posts.push(post);
    return post;
}

/**
 * Handles the minting of a new asset.
 * @param type - The type of asset to mint.
 * @param username - The username of the requester.
 * @param password - The password for account creation.
 * @param invitation - The invitation code for account creation.
 * @returns The created activity and any consumptions.
 */
export async function mint(type: string, username: string, password?: string, invitation?: string) {
    const id = `MNT${activities.length}`;
    console.log(`${id}: minting ${type}...`);
    const to = type == "account" ? username.toLowerCase() : username;
    const account = accounts.find(a => a.id == to);

    const { creditCost, mineralCost, waterCost } = exploreCost(current.resources.water.balance, current.resources.mineral.balance);
    if (type == "place" && !account) {
        const userWaters = assets.filter(a => a.owner == to && a.type == "water");
        const userMinerals = assets.filter(a => a.owner == to && a.type == "mineral");

        if (account.credits.balance < creditCost ||
            userWaters.reduce((sum, c) => sum + c.amount, 0) < waterCost ||
            userMinerals.reduce((sum, c) => sum + c.amount, 0) < mineralCost) {
            console.error(`${id}: Not enough balance to mint place, abort.`);
            return;
        }
    }

    const activity = createActivity(
        "mint" as ActivityType,
        type,
        "world",
        to,
        1,
        `Minting of ${type} for ${to}`
    );
    const consumptions: any[] = [];
    switch (type) {
        case "account":
            if (account) {
                console.error(`Account ${account.id} already exists`);
                break;
            }
            if (!invitation || invitation != '1892') {
                console.error(`Invalid invitation code ${invitation}`);
                break;
            }
            const hash = await bcrypt.hash(password, 2);
            auth.push({ username: to, password: hash });
            break;
        case "place":
            if (!account) {
                console.error('Account not found');
                break;
            }

            const creditConsumption = consume(to, "credits", creditCost);
            const waterConsumption = consume(to, 'water', waterCost);
            const mineralConsumption = consume(to, "mineral", mineralCost);
            consumptions.push(... [creditConsumption, mineralConsumption, waterConsumption]);
            break;
        default:
            break;
    }
    return { activity, consumptions };
}

/**
 * Handles the trade of an item.
 * @param sessionUsername - The username of the session.
 * @param listing - The listing of the item.
 * @param item - The item being traded.
 * @returns An array containing the credit transaction and item transaction.
 */
export function trade(sessionUsername: string, listing: any, item: any) {
    if (sessionUsername == item.owner) {
        // delist and restore amount
        item.amount += listing.amount;
        listing.times.expired = current.time;
        return [item, listing];
    } else {
        console.log(`TX${activities.length}: buying ${item.id} at ${listing.price}...`);
        const creditTx = createTransaction(
            sessionUsername,
            item.owner,
            listing.price
        );
        const itemTx = createTransaction(
            item.owner,
            sessionUsername,
            listing.amount,
            item.id,
            `Sale of ${item.id} at ${listing.price} credit`
        );
        listing.times.sold = current.time;
        return [creditTx, itemTx];
    }
}
