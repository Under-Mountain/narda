import { assets, world, market, accounts } from "../service/model.js"
import { Listing, Account } from "../types.js"
import { getStats } from "../common/utility.js"
import { ListingForm } from "../common/html.js"

export function MarketplaceView(listings: Listing[], username: string, session: any): string {
    const account = accounts.find(a => a.id == session.username)

    let marketplaceHtml = `<div class="p-2 sm:p-4 lg:p-8 w-full">
        <h1 id="marketplace" class="text-bold text-2xl text-white mb-2">
            ${username ? `${username}'s Store` : `Global Marketplace`} (<a id="marketTotal" href="/market?expired=false&sold=false">${listings.length}</a>)
        </h1>
        <div class="mb-2">
            ${MarketStatsView()}
        </div>
        <div role="tablist" class="tabs bg-base-200 mb-2">
            <a role="tab" class="tab tab-active">Balance</a>
            <a role="tab" class="tab">Items</a>
            <a role="tab" class="tab">Yield</a>
        </div>
        <div role="tabpanel" class="tab-content">
        <ul id="market" class="card-body p-0 mt-4 text-xs grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-screen-md gap-1 justify-between">`
    if (listings.length > 0) {
        listings.slice(0, 100).forEach(l => {
            const i = assets.find(a => a.id == l.item)
            if (i) {
                marketplaceHtml += `<li>${ListingForm(l, i, session, username, account)}</li>`
            }
        })
    } else marketplaceHtml += `<li style="text-align:center">Nothing listed for sale at this time</li>`
    marketplaceHtml += `</ul></div></div>`
    return marketplaceHtml
}

export function MarketStatsView(): string {
    const itemPrefix = ['WTR', 'MNR', 'BNK'];
    let marketStatsHtml = '';

    itemPrefix.forEach(prefix => {
        const activeListings = market.filter(l => l.item.startsWith(prefix) && !l.times.sold && !l.times.expired);
        const soldListings = market.filter(l => l.item.startsWith(prefix) && l.times.sold);

        const activeListingStats = getStats(activeListings.map(l => l.price / l.amount));
        const marketSoldStats = getStats(soldListings.map(l => l.price / l.amount));

        marketStatsHtml += `
            <div class="leading-4">
                <small>${prefix} - total ${activeListingStats.count} (${activeListingStats.sum.toFixed(0)} credit) selling at
                avg. ${activeListingStats.mean.toFixed(2)}/unit
                mdn. ${activeListingStats.median.toFixed(2)}/unit
                </small>
            </div>
            <div class="leading-4">
                <small>${prefix} - total ${marketSoldStats.count} (${marketSoldStats.sum.toFixed(2)} credit) sold at
                avg. ${marketSoldStats.mean.toFixed(2)}/unit
                mdn. ${marketSoldStats.median.toFixed(2)}/unit
                </small>
            </div>
        `;
    });

    return marketStatsHtml;
}