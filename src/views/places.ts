import { PlaceIcon } from "../common/svg"
import { posts } from "../service/model"

export function PlacesView(): string {
    const allPlaces: string[] = []
    posts.forEach(p => {
        p.places.forEach(t => {
            if (allPlaces.indexOf(t) < 0) allPlaces.push(t)
        })
    })

    let placesHtml = ``
    if (allPlaces.length > 0) {
        allPlaces.forEach((channel, idx) => {
            placesHtml += `<li><a href="/posts?channel=${channel}" class="btn hover:animate-pulse">
                ${PlaceIcon} ${channel}
            </a></li>`
        })
    } else { `<li>Empty</li>`}

    return `<div class="">
    <h1 id="posts" class="text-bold text-xl text-gray-300">
        All Places to Explore
        <small>(<span id="marketTotal" class="text-primary">${allPlaces.length}</span> total)</small>
    </h1>
    <small>Leading accounts of the platform. Filter by league tabs below.</small>
    <div role="tablist" class="tabs tabs-bordered tabs-sm mb-2 justify-end">
        <a role="tab" class="tab tab-active">Balance</a>
        <a role="tab" class="tab">Items</a>
        <a role="tab" class="tab">Yield</a>
    </div>
    <ul role="tabpanel" id="market" class="tab-content flex gap-1 justify-start">
        ${placesHtml}
    </ul>
    </div>
    `
}