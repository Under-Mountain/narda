import { assets, market } from '../service/model.js'
import * as util from '../service/utility.js'

export function MarketplaceView(listings, username, session, account) {
    let marketplaceHtml = `<div class="p-4 sm:p-10">
        <h1 id="marketplace" class="text-bold text-2xl text-white mb-2">
            Marketplace (<a href="/market?expired=false&sold=false">${listings.length}</a>)
        </h1>
        <div class="mb-2">
            ${MarketStatsView(listings)}
        </div>
        <div role="tablist" class="tabs bg-base-200 mb-2">
            <a role="tab" class="tab tab-active">Balance</a>
            <a role="tab" class="tab">Items</a>
            <a role="tab" class="tab">Yield</a>
        </div>
        <div role="tabpanel" class="tab-content">`
    if (listings.length > 0) {
        marketplaceHtml += `
        <ul class="card-body p-0 mt-4 text-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1 justify-between">`
        listings.slice(0, 20).forEach(l => {
            const i = assets.find(a => a.id == l.item)
            marketplaceHtml += `<li>
                <form action="/api/trade?return=/?user=${session?.username}" method="post" class="p-2 bg-base-200">
                    <div>
                        ${l.amount}
                        unit of ${l.owner}'s ${i.type} 
                        <input name="id" type="hidden" value="${l.id}" />
                    </div>
                    <div>
                        ${i.type == "bankstone" ?
                            `<small>
                                APR ${(i.properties.yield * 100).toFixed(0)}% ${Math.floor(i.properties.staked)}/${i.properties.cap} (${(i.properties.staked / i.properties.cap * 100).toFixed(0)}%)
                            </small>` : ``}
                    </div>
                    <div class="text-right mt-4"><small>(${(l.price / l.amount).toFixed(2)}/unit)</small></div>
                    <div class="text-right">
                        <button name="buyer" value="${session?.username}" class="btn btn-xs"
                            ${!session || !session.username || (session.username != username && account.credits.balance < l.price) ?
                                `disabled` : ``}>
                            ${session?.username && l.owner == username ? 'Delist' : 'Buy'}
                        </button>
                        ${l.amount}
                        <small for="id">${l.id}</small> for
                        <input name="price" type="number" value="${l.price.toFixed(2)}" class="input input-xs w-20" readonly />
                    </div>
                </form>
            </li>`
        })
        marketplaceHtml += "</ul>"
    } else marketplaceHtml += `<p style="text-align:center">Nothing listed for sale at this time<p>`
    marketplaceHtml += `</div>`
    return marketplaceHtml
}

export function MarketStatsView(listings) {
    const marketSoldStats = util.getStats(market.filter(l => l.times.sold).map(l => l.price))
    const activeListingStats = util.getStats(listings.map(l => l.price))

    const marketStatsHtml = `
        <div class="leading-4">
            <small>total ${activeListingStats.count} (${activeListingStats.sum.toFixed(0)} credit) selling at
            avg. ${activeListingStats.mean.toFixed(2)}
            mdn. ${activeListingStats.median.toFixed(2)}
            </small>
        </div>
        <div class="leading-4">
            <small>total ${marketSoldStats.count} (${marketSoldStats.sum.toFixed(2)} credit) sold at
            avg. ${marketSoldStats.mean.toFixed(2)}
            mdn. ${marketSoldStats.median.toFixed(2)}
            </small>
        </div>
    `
    return marketStatsHtml
}