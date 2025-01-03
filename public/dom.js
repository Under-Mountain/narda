import { Current, queryUser } from './app.js'

export function showAlert(alert, alertContent, alertClass, message) {
  alert.classList.remove('alert-warning', 'alert-error', 'alert-success')
  alert.classList.add(alertClass)
  alertContent.innerHTML = message
  alert.classList.remove('hidden')
}

export function hideAlert(alert, button) {
  if (button) button.disabled = false
  setTimeout(() => {
    alert.classList.add('hidden')
  }, 1500)
}

export function updateElementContent(elementId, content) {
  const element = document.getElementById(elementId)
  if (element) element.innerHTML = content
}

export function toggleElementVisibility(element, hidden) {
  if (hidden) element.classList.add('hidden')
  else element.classList.remove('hidden')
}

export function buildTimeString(world, time) {
  return `${Math.floor(time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${time % (world.interval.hour) < 10 ? '0' : ''}${time % (world.interval.hour)}\
          <small class="hidden md:inline">(${(time % (world.interval.hour) / world.interval.hour * 100).toFixed(0)}% to yield)</small>`;
}

export function buildDateString(world, time) {
  return `<small class="hidden md:inline">Year ${Math.floor(time / (world.interval.hour * world.interval.day * world.interval.year))}\
          Day ${Math.floor(time / (world.interval.hour * world.interval.day))}\
          <small class="hidden md:inline">(x${60000 / world.interval.minute})</small></small>`;
}

export function updateHeader(Current) {
  updateElementContent("headerTime", Current.time);
  updateElementContent("headerDate", Current.date);
  updateElementContent("headerWater", Current.resources.water);
  updateElementContent("headerMithril", Current.resources.mithril);
}

export function updateStatus(res) {
  const topRight = document.getElementById("topRightStatus");
  updateElementContent("topRightStatus", `+${res.amount} ${res.of}`);
  topRight.classList.remove('text-blue-400', 'text-white')

  const topLeft = document.getElementById("topLeftStatus");
  updateElementContent("topLeftStatus", `-${res.amount} ${res.of}`);
  topLeft.classList.remove('text-blue-500', 'text-gray-300')

  switch(res.of) {
    case 'water':
      topRight.classList.add('text-blue-400')
      topLeft.classList.add('text-blue-500')
      break
    case 'mineral':
      topRight.classList.add('text-white')
      topLeft.classList.add('text-gray-300')
      break
    default:
      break
  }

  toggleElementVisibility(topRight, false)
  toggleElementVisibility(topLeft, false)
}

export function toggleButtonState(button, icon, loadingIcon, isLoading) {
  button.disabled = isLoading
  toggleElementVisibility(icon, isLoading)
  toggleElementVisibility(loadingIcon, !isLoading)
}

export function getItemElement(i) {
  const element = document.createElement('li')
  element.innerHTML = `
    <form class="itemForm p-2 bg-base-200">
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
        <div class="m-auto">
        </div>
        <div class ="mt-4 text-right">
            <button class="btn btn-xs"
                ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "disabled" : ""}>
                ${(i.type == "water" || i.type == "mineral") && i.amount < 100 ? "Sell (min.100)" : `Sell ${i.amount}`}
            </button>
            <input name="amount" type="hidden" value="${i.amount}" />
            <small for="id">${i.id}</small>
            for <input name="price" type="number" class="input input-xs w-20" value="${i.type == "bankstone" ?
                (i.properties.staked * i.properties.yield * .33).toFixed(2) :
                (i.amount * (i.type == 'water' ? .03 : .09)).toFixed(2)}" max="1000.00" step=".01" />
        </div>
    </form>`
    return element
}

export function getListingElement(l, i) {
  const element = document.createElement('li')
  element.innerHTML = `
    <form class="p-2 bg-base-200">
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
      <div class="m-auto">
      </div>
      <div class="text-right mt-4"><small>(${(l.price / l.amount).toFixed(2)}/unit)</small></div>
      <div class="text-right">
          <button name="buyer" value="${Current.user.id}" class="btn btn-xs"
              ${Current.user.id != queryUser && Current.user.balance < l.price ?
                  `disabled` : ``}>
              ${Current.user.id == queryUser && l.owner == queryUser ? 'Delist' : 'Buy'}
          </button>
          ${l.amount}
          <small for="id">${l.id}</small> for
          <input name="price" type="number" value="${l.price.toFixed(2)}" class="input input-xs w-20" readonly />
      </div>
    </form>`
    return element
}

export function updateUserBalance(Current, queryUser) {
  updateElementContent("userBalance", Current.user?.balance?.toFixed(2))
  if (queryUser == Current.user.id) updateElementContent('profileBalance', Current.user?.balance?.toFixed(2))
  updateElementContent("userWater", Current.user?.water)
  updateElementContent("userMineral", Current.user.mithril)

  const mintBankBtn = document.getElementById('mintBankBtn')
  const alert = document.getElementById('alert')
  if (mintBankBtn && alert.classList.contains('hidden'))
    mintBankBtn.disabled = Current.user.mithril < 200 ||
      Current.user.water < Math.ceil(Math.pow(Current.resources.water / Current.resources.mithril, 7)) || Current.user.balance < 200
}