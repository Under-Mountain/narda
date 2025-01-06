import { assets, market, accounts } from "../service/model.js"
import { Listing } from "../types.js"
import { getPricingStats } from "../common/utility.js"
import { ListingForm } from "../common/html.js"

export function MarketplaceView(listings: Listing[], username: string, session: any): string {
    const account = accounts.find(a => a.id == session.username)

    let marketplaceHtml = `<div>
        <h1 id="posts" class="text-bold text-xl text-gray-300">
            Marketplace
            <small>(<span id="marketTotal" class="text-primary">${listings.length}</span> listing)</small>
        </h1>
        <small>Leading accounts of the platform. Filter by league tabs below.</small>
        <div role="tablist" class="tabs tabs-bordered tabs-sm mb-2 justify-end">
            <a role="tab" class="tab tab-active">Balance</a>
            <a role="tab" class="tab">Items</a>
            <a role="tab" class="tab">Yield</a>
        </div>
        <div class="mb-2 flex flex-wrap justify-start text-xs md:gap-x-3">
            ${MarketStatsView()}
        </div>
        <ul role="tabpanel" id="market" class="tab-content text-xs grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 max-w-screen-xl gap-1 justify-between">`
    if (listings.length > 0) {
        listings.slice(0, 100).forEach(l => {
            const i = assets.find(a => a.id == l.item)
            if (i) {
                marketplaceHtml += `<li>${ListingForm(l, i, session, username, account)}</li>`
            }
        })
    } else marketplaceHtml += `<li style="text-align:center">Nothing listed for sale at this time</li>`
    marketplaceHtml += `</ul></div>`
    return marketplaceHtml
}

export function MarketStatsView(): string {
    const itemPrefix = ['WTR', 'MNR', 'BNK'];
    let marketStatsHtml = '';

    itemPrefix.forEach(prefix => {
        const activeListings = market.filter(l => l.item.startsWith(prefix) && !l.times.sold && !l.times.expired);
        const soldListings = market.filter(l => l.item.startsWith(prefix) && l.times.sold);

        const activeListingStats = getPricingStats(activeListings.map(l => l.price / l.amount));
        const marketSoldStats = getPricingStats(soldListings.map(l => l.price / l.amount));

        const activeListingAmount = activeListings.reduce((sum, c) => sum + c.amount, 0)
        const totalSellingCredit = activeListings.reduce((sum, c) => sum + c.price, 0)
        const marketSoldAmount = soldListings.reduce((sum, c) => sum + c.amount, 0)
        const totalSoldCredit = soldListings.reduce((sum, c) => sum + c.price, 0)

        marketStatsHtml += `
            <div class="min-w-min">
                <div class="m-0 p-0 leading-none">
                    <small>tot.</small> <span class="text-bold ${prefix == 'WTR' ? `text-blue-400` : prefix == 'MNR' ? 'text-yellow-400' : 'text-green-400'}">${activeListingAmount} ${prefix}</span><small> (${totalSellingCredit.toFixed(0)}sl) listed</small>
                    <small>avg.</small> <span class="text-bold ${prefix == 'WTR' ? `text-blue-400` : prefix == 'MNR' ? 'text-yellow-400' : 'text-green-400'}">${activeListingStats.mean.toFixed(2)}</span><small>/unit</small>
                    <small>mdn.</small> <span class="text-bold ${prefix == 'WTR' ? `text-blue-400` : prefix == 'MNR' ? 'text-yellow-400' : 'text-green-400'}">${activeListingStats.median.toFixed(2)}</span><small>/unit</small>
                </div>
                <div class="m-0 p-0 leading-none">
                    <small>tot.</small> <span class="text-bold ${prefix == 'WTR' ? `text-blue-400` : prefix == 'MNR' ? 'text-yellow-400' : 'text-green-400'}">${marketSoldAmount} ${prefix}</span><small> (${totalSoldCredit.toFixed(2)}sl) sold at</small>
                    <small>avg.</small> <span class="text-bold ${prefix == 'WTR' ? `text-blue-400` : prefix == 'MNR' ? 'text-yellow-400' : 'text-green-400'}">${marketSoldStats.mean.toFixed(2)}</span><small>/unit</small>
                    <small>mdn.</small> <span class="text-bold ${prefix == 'WTR' ? `text-blue-400` : prefix == 'MNR' ? 'text-yellow-400' : 'text-green-400'}">${marketSoldStats.median.toFixed(2)}</span><small>/unit</small>
                </div>
            </div>
        `;
    });

    return marketStatsHtml;
}