import { assets, market } from '../service/model.js'
import * as util from '../service/utility.js'

export function MarketplaceView(listings, marketStatsHtml, username, session, account) {
    let marketplaceHtml = `<h3 style="margin-bottom:0">Marketplace (<a href="/market?expired=false&sold=false">${listings.length}</a>)</h3>`
    if (listings.length > 0) {
        marketplaceHtml += `${marketStatsHtml}
        <ul>`
        listings.slice(0, 20).forEach(l => {
            const i = assets.find(a => a.id == l.item)
            marketplaceHtml += `<li>
                <form action="/trade?return=/?user=${username}" method="post">
                    <div>
                        ${l.amount}
                        unit of ${l.owner}'s ${i.type} ${i.type == "bankstone" ? ` <small>APR ${(i.properties.yield * 100).toFixed(0)}% ${Math.floor(i.properties.staked)}/${i.properties.cap} (${(i.properties.staked / i.properties.cap * 100).toFixed(0)}%)</small>` : ``}
                        <small for="id">${l.id}</small>
                        <input name="id" type="hidden" value="${l.id}" />
                    </div>
                    <div>
                        <button name="buyer" value="${username}" ${!session.username || (session.username != username && account.credits.balance < l.price) ? `disabled` : ``}>
                            ${session.username && l.owner == username ? 'Delist' : 'Buy'}</button>
                        for <input name="price" type="number" value="${l.price.toFixed(2)}" readonly />
                        <small>credit (${(l.price / l.amount).toFixed(2)}/unit)</small>
                    </div>
                </form>
            </li>`
        })
        marketplaceHtml += "</ul>"
    } else marketplaceHtml += `<p style="text-align:center">Nothing listed for sale at this time<p>`
    return marketplaceHtml
}

export function MarketStatsView(listings) {
    const marketSoldStats = util.getStats(market.filter(l => l.times.sold).map(l => l.price))
    const activeListingStats = util.getStats(listings.map(l => l.price))

    const marketStatsHtml = `
        <div>
            <small>total ${activeListingStats.count} (${activeListingStats.sum.toFixed(0)} credit) selling at
            avg. ${activeListingStats.mean.toFixed(2)}
            mdn. ${activeListingStats.median.toFixed(2)}
            </small>
        </div>
        <div>
            <small>total ${marketSoldStats.count} (${marketSoldStats.sum.toFixed(2)} credit) sold at
            avg. ${marketSoldStats.mean.toFixed(2)}
            mdn. ${marketSoldStats.median.toFixed(2)}
            </small>
        </div>
    `
    return marketStatsHtml
}