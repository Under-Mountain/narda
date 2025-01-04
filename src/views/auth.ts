import { market } from '../service/model.js'
import { MarketStatsView } from './market.js'

export function AuthView(): string {
    const listings = market.filter(l => !l.times.sold && !l.times.expired)
        .sort((a, b) => { return a.price / a.amount < b.price / b.amount ? 1 : -1 })
        .sort((a, b) => { return a.amount < b.amount ? 1 : -1 })

    const marketStatsHtml = MarketStatsView()

    return `
<div class="hero bg-base-300 sm:p-10">
  <div class="hero-content flex-col lg:flex-row-reverse items-start">
    <div class="lg:text-left lg:p-4 lg:mb-auto">
        <div>
            <h1 class="text-3xl font-bold">Project <span class="text-yellow-500">Arda</span></h1>
            <p>
                Building sustainable virtual socio-economy for better future in real life. Value through openness and connection.
            </p>
            <div class="carousel py-2 max-w-xs md:max-w-full">
                <div id="slide1" class="carousel-item relative">
                    <img class="max-w-xs" src="/images/profiles/gandalf.png" />
                </div>
                <div id="slide2" class="carousel-item relative">
                    <img class="max-w-xs" src="/images/profiles/sauron.png" />
                </div>
            </div>
            <p class="py-2">
                Open Socio-Economic Metaverse & Trading Platform. \
                Here, user can <span class="text-yellow-500">collect resources</span>, <span class="text-yellow-500">craft items</span>, and <span class="text-yellow-500">trade</span> in marketplace. \
                Create a settlement for <span class="text-yellow-500">passive income</span>, join <span class="text-yellow-500">houses</span> and participate in activities to build friendship and receive <span class="text-yellow-500">greater benefits.</span> \
                <small>(Explore infinite world of user minted lands and items. Trade and market your unique item for greater profit!, 2025 TBD)</small> \
            </p>
        </div>
        <div>
            <h2 class="font-bold mt-2 text-xl">Market Satistics</h2>
            ${marketStatsHtml}
        </div>
    </div>
    <div class="card bg-base-100 w-full max-w-xl shadow-2xl sm:my-4">
        ${LoginView()}
        ${RegisterView()}
    </div>
  </div>
</div>
    `
}

function LoginView(): string {
    return `
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
    <div class="form-control mt-1">
        <button class="btn btn-primary">Enter</button>
    </div>
</form>
    `
}

function RegisterView(): string {
    return `
<form action="/api/mint?return=/" method="post" class="card-body m-0 pt-0">
    <div class="form-control">
        <input id="invitationCode" name="invitation" class="input input-bordered" placeholder="invitation code (hint: JRR's)" required />
    </div>
    <div id="usernameControl" class="form-control hidden">
        <input name="username" class="input input-bordered" placeholder="username" style="text-transform:lowercase" type="text" pattern="[a-z0-9]+" required />
    </div>
    <div id="passwordControl" class="form-control hidden">
        <input name="password" class="input input-bordered" type="password" placeholder="password" required />
        <input name="confirm" class="input input-bordered" type="password" placeholder="confirm" required />
    </div>
    <div class="form-control">
        <button id="registerBtn" class="btn btn-primary" name="type" value="account" disabled>Register</button>
    </div>
</form>
    `
}
