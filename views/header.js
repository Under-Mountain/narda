import { accounts, activities, assets, world, market, current, blog } from '../service/model.js'

export function HeaderView(session, username) {
    const allTags = []
    blog.forEach(p => {
        p.tags.forEach(t => {
            if (allTags.indexOf(t) < 0) allTags.push(t)
        })
    })

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=devide-width, initial-scale=1.0" />
        <link href="https://cdn.jsdelivr.net/npm/daisyui@2.6.0/dist/full.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Arda - Open World Metaverse in tribute to JRR Toklien v.Alpha</title>
    </head>
    <body class="text-gray-800 antialiased"><main>
        <div style="background-color:black;color:white;padding:.2em;"><small>
            📢 Interested in joining this open project?
            <a href="https://under-mountain.github.com" target="_blank">learn more</a>
        </small></div>
        <div style="display:flex;justify-content:space-between">
            <div style="padding:.3em;text-align:right;margin-top:auto"><small>
                <a href="/blog">Blog(${blog.length})</a>
                <a href="/tags">Tags(${allTags.length})</a>
                <a href="/leaderboard">Leaderboard(${accounts.length})</a>
                <a href="/blog">Blog(${blog.length})</a>
                <a href="/marketplace">Marketplace(${market.length})</a>
                <a href="/mints">Items(${assets.length})</a>
                <a href="/transactions">Transactions(${activities.length})</a>
            </small></div>
        </div>
        <div style="display:flex;justify-content:space-between;background:#EFEFEF;margin:0;padding:.5em">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="1em"><circle fill="#00A0FF" stroke="#00A0FF" stroke-width="30" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#00C0FF" stroke="#00C0FF" stroke-width="30" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#00C0FF" stroke="#00C0FF" stroke-width="30" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="1" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>
                <small style="color:${"#00A0FF"}"><strong>water</strong></small>
                <span style="color:${"#000"}">${current.resources.water.balance.toFixed(0)}</span>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="1em"><path fill="#FF03EA" stroke="#FF03EA" stroke-width="30" transform-origin="center" d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="3.5" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>
                <small style="color:${"#FF03EA"}"><strong>mineral</strong></small>
                <span style="color:${"#000"}">${current.resources.mineral.balance.toFixed(0)}</span></span>

                <small style="margin-left:1em">
                    <svg width="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="FF0000" stroke="FF0000" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"/><rect x="11" y="6" rx="1" width="2" height="7"><animateTransform attributeName="transform" type="rotate" dur="15s" values="0 12 12;360 12 12" repeatCount="indefinite"/></rect><rect x="11" y="11" rx="1" width="2" height="9"><animateTransform attributeName="transform" type="rotate" dur="1s" values="0 12 12;360 12 12" repeatCount="indefinite"/></rect></svg><small style="color:gray">x${60000 / world.interval.minute}</small>
                    Year ${Math.floor(current.time / (world.interval.hour * world.interval.day * world.interval.year))}
                    Day ${Math.floor(current.time / (world.interval.hour * world.interval.day))}
                    <a href="/current">${Math.floor(current.time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${current.time % (world.interval.hour) < 10 ? '0' : ''}${current.time % (world.interval.hour)}</a>
                    <small>(${(current.time % (world.interval.hour) / world.interval.hour * 100).toFixed(0)}% to yield)</small>
                </small>
            </div>
            <div style="margin-left:auto">
                <div>
                    ${session.username ? `<a href="/?user=${session.username}">${session.username}</strong>\
                        <small>(${accounts.find(a=>a.id==session.username)?.credits.balance.toFixed(2)} credit)<small> \
                        <a href="/exit">exit</a>` : ``}
                </div>
            </div>
        </div>

        ${session.username && session.username == username ? `
            <form action="/collect?return=/?user=${username}" method="post">
                <input type="hidden" name="owner" value="${username}" />
                <button name="resource" value="water" ${current.resources.water.balance <= 0 ? "disabled" : ""}>Collect water (5-10)</button>
                <button name="resource" value="mineral" ${current.resources.mineral.balance <= 0 ? "disabled" : ""}>Collect mineral (1-3)</button>
            </form>
            ` : ``}
        
        <h2>Worldbank of Web3 Economy <small>(in active development)</small></h2>
        <h3>Collect resources from the new world. Craft and trade items! Receive Web3 credits before token launch!</h3>
    `
}