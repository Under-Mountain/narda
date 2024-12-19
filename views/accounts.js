import { accounts, current } from '../service/model.js'

export function AuthView() {
    return `${!session.username?
        `<form action="/auth" method="post">
            <h3 style="margin-bottom:1px">Login</h3>
            <div><small>
                <input name="save" type="checkbox" />
                <label for="save">Keep the access for next 7 days</label>
            </small></div>
            <div>
                <input name="username" placeholder="username" required />
                <input name="password" type="password" placeholder="password" required />
                <button>Enter</button>
            </div>
        </form>
    
        <form action="/mint" method="post">
            <h3 style="margin-bottom:1px">Register</h3>
            <small>Invitation code is required at this time. Please check out <a href="https://github.com" target="_blank">project site</a> for more details.</small>
            <div>
                <input name="invitation" placeholder="invitation code" required />
                <input name="username" placeholder="username" style="text-transform:lowercase" type="text" pattern="[a-z0-9]+" required />
            </div>
            <div>
                <input name="password" type="password" placeholder="password" required />
                <input name="confirm" type="password" placeholder="confirm" required />
                <button name="type" value="account">Mint Account</button>
            </div>
        </form>`:``}`
}

export function ProfileView(username, account, userWaterTotal, userMineralTotal, userActiveBankstones, activeEffectsTotal) {
    return `
        <h2 style="text-align:center;margin-bottom:.3em">${username}</h2>

        <div style="text-align:center">${session.username && session.username == username ? `
            <form action="/edit?return=/" method="post">
                <textarea name="bio" rows="3" cols="50" placeholder="Write description of this account.">${account.bio? account.bio:''}</textarea>
                <div style="margin-top:.3em"><button ${(session.username && account.credits.balance < 100) ? `disabled` :``}>Update Bio (-100.00 credit)</button></div>
            </form>
        `: `<p style="text-align:center">${account.bio? account.bio : `No description`}</p>`}
        </div>

        <div style="text-align:right"><small style="color:gray;margin-bottom:0">balance</small></div>
        <div style="text-align:right">
            <small style="color:${"#00A0FF"}"><strong>water</strong></small> ${userWaterTotal}<small style="color:${"#BBB"}">/${current.resources.water.supplied.toFixed(0)}(${(userWaterTotal/current.resources.water.supplied*100).toFixed(2)}%)</small>

            <small style="color:${"#FF03EA"}"><strong>mineral</strong></small> ${userMineralTotal}<small style="color:${"#BBB"}">/${current.resources.mineral.supplied.toFixed(0)}(${(userMineralTotal/current.resources.mineral.supplied*100).toFixed(2)}%)</small>
            <small style="color:${"gray"}"><strong>bankstones</strong></small> ${userActiveBankstones.length}<small style="color:${"#BBB"}">/${activeEffectsTotal}(${(userActiveBankstones.length/activeEffectsTotal*100).toFixed(2)}%)</small>
        </div>
        <div style="text-align:right">
            <h1 style="margin-top:.3em;margin-bottom:1px">
                ${account.credits.balance.toFixed(2)} <small style="color:gray"><small>credit</small></small>
            </h1>
            <small>
                holding ${(account.credits.balance/current.resources.credits.balance*100).toFixed(2)}% of
                ${current.resources.credits.balance.toFixed(2)} credits circulating..
            </small>
        </div>
    `
}

export function BalanceView(account) {
    return `
        <form action="/transaction?return=/?user=${session.username}" method="post" style="text-align:right">
            <div style="margin-top:1em">
                <input type="hidden" name="from" value="${session.username}" />
                <input name="to" placeholder="receiver's username" required />
                <input name="amount" type="number" min=".01" max="1000.00" value=".01" step=".01" required />
                <button name="of" value="credit" ${(session.username && account.credits.balance < .01) ? `disabled` :``}>Send</button>
            </div>
        </form>
        <form action="/post?return=/" method="post" style="text-align:right">
            <div>
                <label for="title">Title</label>
                <input name="title" placeholder="Title is required to post" required />
                <label for="tags">Tags</label>
                <input name="tags" placeholder="general, question, issue, ..." />
            </div>
            <textarea style="margin-bottom:.3em" name="content" rows="4" cols="60" placeholder="Each credit consumption on the post will be fully rewarded to content creator."></textarea>
            <div><button ${(session.username && account.credits.balance < 10) ? `disabled` :``}>Post (-10.00 credit)</button></div>
        </form>
    `
}

export function InventoryView(username, items, userMineralTotal, userWaterTotal, account) {
    let inventoryHtml = `<h3>Inventory (<a href="/assets?user=${username}">${items.filter(i => i.owner == username).length}</a>)</h3>`
    if (items.length > 0) {
        inventoryHtml += `
            <form action="/mint?return=/?user=${username}" method="post">
                <div>
                    <input type="hidden" name="owner" value="${username}" />
                    
                    <button name="type" value="bankstone"
                        ${userMineralTotal < 100 || userWaterTotal < Math.ceil(current.resources.water.supplied / current.resources.mineral.supplied) ||
                            account.credits.balance < 200 ? "disabled" : ""}>
                        Mint Bankstone (-200.00 credit)
                    </button>
                    <small for="type">
                        consumes
                        ${Math.ceil(current.resources.water.supplied * Math.log(accounts.length * accounts.length) / current.resources.mineral.supplied)}
                        water +
                        ${200} mineral
                </div>
            </form>
        <ul>`
        items.slice(0, 20).forEach(i => {
            inventoryHtml += ItemView(i)
        })
        inventoryHtml += "</ul>"
    } else inventoryHtml += "<p>Empty. Collect resources or buy items from Marketplace<p>"
    return inventoryHtml
}

export function ItemView(i) {
    return `<li>
        <form action="/list?return=/?user=${session.username}" method="post">
            <div>
                ${i.amount} unit(s) of ${i.owner}'s ${i.type} ${i.type=="bankstone" ? ` <small>APR ${(i.properties.yield*100).toFixed(0)}% ${Math.floor(i.properties.staked)}/${i.properties.cap} (${(i.properties.staked/i.properties.cap * 100).toFixed(0)}%)</small>` : ``}
                <small for="id">${i.id}</small>
                <input name="id" type="hidden" value="${i.id}" />
            </div>
            <div>
                <button name="owner" value="${session.username}" 
                    ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "disabled" : ""}>
                    ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "Sell (min.100)" : `Sell ${i.amount}`}
                </button>
                <input name="amount" type="hidden" value="${i.amount}" />
                for <input name="price" type="number" value="${i.type == "bankstone" ?
                    (i.properties.staked * i.properties.yield * .33).toFixed(2) :
                    (i.amount * (i.type == 'water' ? .03 : .09)).toFixed(2)}" max="1000.00" step=".01" />
                <small>credit</small>
            </div>
        </form>
    </li>`
}

export function LeaderboardView() {
    const balanceLeaders = accounts.sort((a, b) => { return a.credits.balance > b.credits.balance ? -1 : 1 })
    let balanceLeaderHtml = "<p>Empty<p>"
    if (balanceLeaders.length > 0) {
        balanceLeaderHtml = "<ul>"
        balanceLeaders.slice(0, 100).forEach((a, idx) => {
            balanceLeaderHtml += `<oi><div>
                    <strong>${idx + 1}.</strong>
                    <strong><a href="/?user=${a.id}">${a.id}</a></strong>
                    <small>(balance: ${a.credits.balance.toFixed(2)})</small>
                </div></oi>`
        })
        balanceLeaderHtml += "</ul>"
    }
    return balanceLeaderHtml
}