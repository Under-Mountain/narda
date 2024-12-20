import { accounts, current, market } from '../service/model.js'
import { MarketStatsView } from './market.js'

export function AuthView() {
    const listings = market.filter(l => !l.times.sold && !l.times.expired)
        .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? 1 : -1 })
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1 })

    const marketStatsHtml = MarketStatsView(listings)

    return `
<div class="hero bg-base-300 sm:p-10">
  <div class="hero-content flex-col lg:flex-row-reverse">
    <div class="lg:text-left lg:p-4 lg:mb-auto">
      <h1 class="text-5xl font-bold">Arda v.1</h1>
      <p class="py-6">
        Lord of the Rings and Hobbit inspired open world socio-economic platform. \
        Here, user can collect resources, craft items, and trade them in marketplace. \
        Credits earned from the sales or yield can be spent for all activities in the platform. \
        Consumped credits will be circulated back to the world. \
      </p>
      <h3 class="font-bold">Market Satistics</h3>
      ${marketStatsHtml}
    </div>
    <div class="card bg-base-100 w-full max-w-xl shadow-2xl sm:my-4">
        <form action="/api/auth" method="post" class="card-body">
            <h2 class="font-bold mb-2 text-center">
                Access Control
                <small>
                    <svg class="inline" width="1.5em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path fill-rule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6Zm-5.03 4.72a.75.75 0 0 0 0 1.06l1.72 1.72H2.25a.75.75 0 0 0 0 1.5h10.94l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 0 0-1.06 0Z" clip-rule="evenodd" />
                    </svg>
                    Port of Valinor
                </small>
            </h2>
            <div class="form-control">
                <input name="username" class="input input-bordered" placeholder="username" required />
            </div>
            <div class="form-control">
                <input name="password" class="input input-bordered" type="password" placeholder="password" required />
            </div>
            <div class="form-control">
                <label class="cursor-pointer label">
                    <span class="label-text">Remember me</span>
                    <input type="checkbox" class="checkbox checkbox-accent" disabled />
                </label>
            </div>
            <div class="form-control mt-1">
                <button class="btn btn-primary">Enter</button>
            </div>
        </form>
        <form class="card-body m-0 pt-0">
            <div class="form-control">
                <input name="invitation" class="input input-bordered" placeholder="invitation code" required />
            </div>
            <div class="form-control hidden">
                <input name="username" class="input input-bordered" placeholder="username" style="text-transform:lowercase" type="text" pattern="[a-z0-9]+" required />
            </div>
            <div class="form-control hidden">
                <input name="password" class="input input-bordered" type="password" placeholder="password" required />
                <input name="confirm" class="input input-bordered" type="password" placeholder="confirm" required />
            </div>
            <div class="form-control">
                <button class="btn btn-primary" name="type" value="account" disabled>Register</button>
            </div>
        </form>
    </div>
  </div>
</div>
    `
}

export function ProfileView(username, account, userWaterTotal, userMineralTotal, userActiveBankstones, activeEffectsTotal, session) {
    return `
        <div class="card m-10 p-10 bg-base-200">
            <div class="card-title m-auto">
                <div class="btn-circle avatar">
                    <div class="w-15 rounded-full">
                    <img alt="Profile photo of ${username}"
                        src="https://upload.wikimedia.org/wikipedia/en/f/f8/Sauron_Tolkien_illustration.jpg" />
                    </div>
                </div>
                <h2 class="text-white-100 text-5xl">${username}</h2>
            </div>
            <div class="card-body m-auto">
            ${session.username && session.username == username ? `
                <form action="/api/edit?return=/" method="post" class="mb-2">
                    <textarea name="bio" row="3" class="textarea textarea-lg w-full" placeholder="Write description of this account.">${account.bio? account.bio:''}</textarea>
                    <div class="text-right">
                        <button class="btn btn-md"
                            ${(session.username && account.credits.balance < 100) ? `disabled` :``}>
                            Update Bio (-100.00 credit)
                        </button>
                    </div>
                </form>`: `
                <p class="py-4">${account.bio? account.bio : `No description`}</p>`}

                <div style="text-align:right">
                    <h1 class="text-5xl" class="text-white-100">
                        ${account.credits.balance.toFixed(2)}<small class="text-white-300"><small>sl</small></small>
                    </h1>
                    <small>
                        holding ${(account.credits.balance/current.resources.credits.balance*100).toFixed(2)}% of
                        ${current.resources.credits.balance.toFixed(2)} credits circulating..
                    </small>
                    <div style="text-align:right">
                        <small style="color:${"#00A0FF"}"><strong>water</strong></small> ${userWaterTotal}<small style="color:${"#BBB"}">/${current.resources.water.supplied.toFixed(0)}(${(userWaterTotal/current.resources.water.supplied*100).toFixed(2)}%)</small>
                        <small style="color:${"#FF03EA"}"><strong>mineral</strong></small> ${userMineralTotal}<small style="color:${"#BBB"}">/${current.resources.mineral.supplied.toFixed(0)}(${(userMineralTotal/current.resources.mineral.supplied*100).toFixed(2)}%)</small>
                        <small style="color:${"gray"}"><strong>bankstones</strong></small> ${userActiveBankstones.length}<small style="color:${"#BBB"}">/${activeEffectsTotal}(${(userActiveBankstones.length/activeEffectsTotal*100).toFixed(2)}%)</small>
                    </div>
                </div>

            ${session.username && session.username == username ? SendCreditView(account, session) : ``}
            </div>
        </div>
    `
}

export function SendCreditView(account, session) {
    return `
        <form action="/api/transaction?return=/?user=${session.username}" method="post" class="text-right">
            <input type="hidden" name="from" value="${session.username}" />
            <div class="form-control">
                <label for="to" class="label text-xs">Account</label>
                <input name="to" placeholder="receiver's username" required class="input input-md m-1" />
            </div>
            <div class="form-control">
                <label for="amount" class="label text-xs">Amount</label>
                <input name="amount" type="number" min=".01" max="1000.00" value="0.01" step=".01" required class="input input-md m-1" />
            </div>
            <button name="of" value="credit" ${(session.username && account.credits.balance < .01) ? `disabled` :``} class="btn btn-primary btn-md m-1">Send</button>
        </form>
        <form action="/api/post?return=/posts" method="post" class="text-right">
            <div class="form-control">
                <label for="title" class="label text-xs">Title</label>
                <input name="title" class="input" placeholder="Title is required to post" required />
            </div>
            <div class="form-control">
                <label for="tags" class="label text-xs">Channel</label>
                <input name="tags" class="input" placeholder="general, question, issue, ..." />
            </div>
            <div class="form-control">
                <label for="content" class="label text-xs">Content (optional)</label>
                <textarea class="textarea" name="content" rows="4" cols="60" placeholder="Each credit consumption on the post will be fully rewarded to content creator."></textarea>
            </div>
            <button class="btn btn-secondary m-1" ${(session.username && account.credits.balance < 10) ? `disabled` :``}>Post (-10.00 credit)</button>
        </form>
    `
}

export function InventoryView(username, items, userMineralTotal, userWaterTotal, account) {
    let inventoryHtml = `<div class="card m-10 p-10 bg-base-300">
        <div class="card-title">
            <h3>Inventory (<a href="/assets?user=${username}">${items.filter(i => i.owner == username).length}</a>)</h3>
        </div>
        <div class="card-body p-0">`
    if (items.length > 0) {
        inventoryHtml += `
        <form action="/api/mint?return=/?user=${username}" method="post">
            <div class="form-control">
                <input type="hidden" name="owner" value="${username}" />
                <label for="type" class="text-xs">
                    consumes ${Math.ceil(current.resources.water.supplied * Math.log(accounts.length * accounts.length) / current.resources.mineral.supplied)}
                    water + ${200} mineral
                </label>
            </div>
            <button name="type" value="bankstone" class="btn btn-xs"
                ${userMineralTotal < 200 || userWaterTotal < Math.ceil(current.resources.water.supplied / current.resources.mineral.supplied) ||
                    account.credits.balance < 200 ? "disabled" : ""}>
                Mint Bankstone (-200.00 credit)
            </button>
        </form>
        <ul class="text-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1 justify-between">`
        items.slice(0, 20).forEach(i => {
            inventoryHtml += ItemView(i)
        })
        inventoryHtml += "</ul>"
    } else inventoryHtml += `<p class="text-center">Empty. Collect resources or buy items from Marketplace<p>`
    inventoryHtml += `</div></div>`
    return inventoryHtml
}

export function ItemView(i) {
    return `<li class="">
        <form action="/api/list?return=/?user=${i.owner}" method="post" class="p-2 bg-base-200">
            <div>
                ${i.amount} unit(s) of ${i.owner}'s ${i.type}
                <input name="id" type="hidden" value="${i.id}" class="input input-xs" />
            </div>
            <div>
                ${i.type=="bankstone" ? `
                    <small>
                        APR ${(i.properties.yield*100).toFixed(0)}% ${Math.floor(i.properties.staked)}/${i.properties.cap} (${(i.properties.staked/i.properties.cap * 100).toFixed(0)}%)
                    </small>
                    ` : ``}
            </div>
            <div class ="mt-4 text-right">
                <button name="owner" value="${i.owner}" class="btn btn-xs"
                    ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "disabled" : ""}>
                    ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "Sell (min.100)" : `Sell ${i.amount}`}
                </button>
                <input name="amount" type="hidden" value="${i.amount}" />
                <small for="id">${i.id}</small>
                for <input name="price" type="number" class="input input-xs w-20" value="${i.type == "bankstone" ?
                    (i.properties.staked * i.properties.yield * .33).toFixed(2) :
                    (i.amount * (i.type == 'water' ? .03 : .09)).toFixed(2)}" max="1000.00" step=".01" />
            </div>
        </form>
    </li>`
}

export function LeaderboardView() {
    const balanceLeaders = accounts.sort((a, b) => { return a.credits.balance > b.credits.balance ? -1 : 1 })
    let LeaderHtml = `<div class="p-4 sm:p-10">
        <h1 id="leaderboard" class="text-bold text-2xl text-white mb-2">
            Leaderboard
        </h1>
        <div role="tablist" class="tabs bg-base-200 mb-2">
            <a role="tab" class="tab tab-active">Balance</a>
            <a role="tab" class="tab">Items</a>
            <a role="tab" class="tab">Yield</a>
        </div>
        <div role="tabpanel" class="tab-content grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-1 justify-between">
    `
    if (balanceLeaders.length > 0) {
        balanceLeaders.slice(0, 30).forEach((a, idx) => {
            LeaderHtml += `<div class="card bg-base-300 p-2">
                <div class="p-2 card-title ${idx < 3 ? 'text-white text-2xl': idx < 10 ? 'text-gray-200 text-xl' : 'text-lg'}">
                    <small>${idx + 1}.</small> <a href="/?user=${a.id}">${a.id}</a>
                </div>
                <div class="p-2 card-body">
                    <div class="btn-circle avatar m-auto">
                        <div class="w-15 rounded-full">
                        <img alt="Profile photo of ${a.id}"
                            src="https://upload.wikimedia.org/wikipedia/en/f/f8/Sauron_Tolkien_illustration.jpg" />
                        </div>
                    </div>
                    <div class="text-right text-xs">
                        <small class="text-sm">bal. ${a.credits.balance.toFixed(2)}sl</small>
                    </div>
                </div>
            </div>`
        })
    } else LeaderHtml += `<p class="p-4 text-center">Empty<p>`
    LeaderHtml += `</div></div>`
    return LeaderHtml
}