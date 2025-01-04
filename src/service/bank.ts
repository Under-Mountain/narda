import { createTransaction, consume } from "./activity.js";
import { activities, accounts, world, assets, current, market } from "./model.js";

export function queueBankActivities(): void {
    console.log(`TX${activities.length}: processing worldbank activities...`);
    const account = accounts.find(a => a.id == 'worldbank')
    if (account && account.credits.balance <= -1 * world.worldbank.maxDeficit) {
        console.warn(`TX${activities.length}: worldbank's max deficit reached`);
        return
    }

    buyFloorListing('water')
    buyFloorListing('mineral')
    buyFloorListing('bankstone')

    const userWaters = assets.filter(a => a.owner == account?.id && a.type == "water")
    const userMinerals = assets.filter(a => a.owner == account?.id && a.type == "mineral")

    if (userWaters.reduce((sum, c) => sum + c.amount, 0) < 6 ||
        userMinerals.reduce((sum, c) => sum + c.amount, 0) < 1) {
        console.warn(`not enough balance to consume`)
        return
    }

    // mint a bankstone
    const mintActivity = createTransaction(
        "world",
        account?.id || '',
        1,
        'bankstone',
        `Minting of a bankstone for ${account?.id}`
    );

    const creditConsumption = consume(
        account?.id || '',
        "credits",
        100
    );

    const waterCost = Math.ceil(current.resources.water.supplied * Math.log(accounts.length * accounts.length) / current.resources.mineral.supplied);
    const waterConsumption = consume(
        account?.id || '',
        'water',
        waterCost
    );

    const mineralConsumption = consume(
        account?.id || '',
        "mineral",
        10
    );

    current.activities.pending.push(...[creditConsumption.id, mineralConsumption.id, waterConsumption.id, mintActivity.id]);
}

export function buyFloorListing(type: string): void {
    const itemPrefix = type == 'water' ? 'WTR' : type == 'mineral' ? 'MNR' : 'BNK'

    const medianPrice = getMedianPrice(itemPrefix);

    const floorListings = market.filter(l => !l.times.sold && !l.times.expired && l.item.startsWith(itemPrefix))
        .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? -1 : 1 });

    if (!floorListings || floorListings.length == 0) {
        //console.debug(`TX${activities.length}: listing not found, skipping`)
        return
    }

    const floorListing = floorListings[0];
    if (floorListing.price > medianPrice) {
        console.warn(`TX${activities.length}: listing price exceeds median sold price, skipping`);
        return;
    }

    const creditTx = createTransaction(
        'worldbank',
        floorListing.owner,
        floorListing.price,
        "credit",
        `Purchase of ${floorListing.item} at ${floorListing.price} credit`
    );

    const itemTx = createTransaction(
        floorListing.owner,
        'worldbank',
        floorListing.amount,
        floorListing.item,
        `Sale of ${floorListing.item} at ${floorListing.price} credit`
    );

    current.activities.pending.push(creditTx.id)
    current.activities.pending.push(itemTx.id)
    floorListing.times.sold = current.time
}

function getMedianPrice(txPrefix: string) {
    const soldListings = market.filter(l => l.times.sold && l.item.startsWith(txPrefix))
        .sort((a, b) => a.price - b.price);

    const medianPrice = soldListings.length > 0 ? soldListings[Math.floor(soldListings.length / 2)].price : Infinity;
    return medianPrice;
}
