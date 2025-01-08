import { Account } from "../types.js";
import { createTransaction, consume } from "./activity.js";
import { activities, accounts, world, assets, current, market } from "./model.js";
import { exploreCost } from "../common/pricing.js";

export function queueWorldActivities(): void {
    console.log(`TX${activities.length}: processing world activities...`);
    let worldBank = accounts.find(a => a.id == 'world') as Account
    if (!worldBank) {
        worldBank = {
            id: 'world',
            credits: {
                balance: 0
            },
            times: {
                created: current.time
            },
            visual: 'world.webp'
        }

        accounts.push(worldBank)
    }

    const { creditCost, mineralCost, waterCost } = exploreCost(current.resources.water.balance, current.resources.mineral.balance);

    if (worldBank && worldBank.credits.balance - creditCost < -1 * world.bank.maxDeficit) {
        console.warn(`TX${activities.length}: world's max deficit reached`);
        return
    }

    buyFloorListing('water')
    buyFloorListing('mineral')
    buyFloorListing('place')

    const userWaters = assets.filter(a => a.owner == worldBank.id && a.type == "water")
    const userMinerals = assets.filter(a => a.owner == worldBank.id && a.type == "mineral")

    if (userWaters.reduce((sum, c) => sum + c.amount, 0) < waterCost ||
        userMinerals.reduce((sum, c) => sum + c.amount, 0) < mineralCost) {
        console.warn(`not enough balance to consume`)
        return
    }

    const creditConsumption = consume(worldBank.id, "credits", creditCost);
    const waterConsumption = consume(worldBank.id, 'water', waterCost);
    const mineralConsumption = consume(worldBank.id, "mineral", mineralCost);

    // mint a place
    const mintActivity = createTransaction(
        worldBank.id,
        worldBank.id,
        1,
        'place',
        `Minting of a place for ${worldBank.id}`
    );
}

export function buyFloorListing(type: string): void {
    const itemPrefix = type == 'water' ? 'WTR' : type == 'mineral' ? 'MNR' : 'BNK'

    const avgPrice = getAvgPrice(itemPrefix);

    const floorListings = market.filter(l => !l.times.sold && !l.times.expired && l.item.startsWith(itemPrefix))
        .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? -1 : 1 });

    if (!floorListings || floorListings.length == 0) {
        //console.debug(`TX${activities.length}: listing not found, skipping`)
        return
    }

    const floorListing = floorListings[0];
    if (floorListing.price/floorListing.amount > avgPrice) {
        console.warn(`TX${activities.length}: listing price exceeds median sold price, skipping`);
        return;
    }

    const creditTx = createTransaction(
        'world',
        floorListing.owner,
        floorListing.price,
        "credit",
        `Purchase of ${floorListing.item} at ${floorListing.price} credit`
    );

    const itemTx = createTransaction(
        floorListing.owner,
        'world',
        floorListing.amount,
        floorListing.item,
        `Sale of ${floorListing.item} at ${floorListing.price} credit`
    );

    floorListing.times.sold = current.time
}

function getAvgPrice(txPrefix: string) {
    const soldListings = market.filter(l => l.times.sold && l.item.startsWith(txPrefix));

    if (soldListings.length === 0) {
        return Infinity;
    }

    const totalAmount = soldListings.reduce((sum, l) => sum + l.amount, 0);
    const totalPrice = soldListings.reduce((sum, l) => sum + l.price, 0);

    return totalPrice / totalAmount;
}
