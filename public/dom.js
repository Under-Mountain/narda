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