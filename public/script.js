const Current = {
  time: '..:.. (..% to yield)',
  date: 'Year .. Day .. (x..)',
  resources: {
    water: -1,
    mithril: -1
  },
  user: {
    balance: 0,
    water: 0,
    mithril: 0
  }
}

async function sync(world) {
  return fetch('/api/current').then(async (res) => {
    const current = await res.json()
    console.debug(`T${current.global.time}: ...`)
    onSync(world, current)
  })
}

function onSync(world, current) {
  refreshClockResources(world, current.global.time, current.global.resources)
  refreshUserCreditResources(current.account, current.inventory)
}

function refreshUserCreditResources(account, inventory) {
  Current.user.balance = account?.credits.balance
  Current.user.water = inventory?.filter(i => i.type == 'water').reduce((sum, c) => sum + c.amount, 0)
  Current.user.mithril = inventory?.filter(i => i.type == 'mineral').reduce((sum, c) => sum + c.amount, 0)

  const userBalance = document.getElementById("userBalance")
  userBalance.innerHTML = Current.user.balance.toFixed(2)
  const profileBalance = document.getElementById('profileBalance')
  profileBalance.innerHTML = Current.user.balance.toFixed(2)

  const userWater = document.getElementById("userWater")
  userWater.innerHTML = Current.user.water

  const userMineral = document.getElementById("userMineral")
  userMineral.innerHTML = Current.user.mithril
}

function refreshClockResources(world, time, resources) {
  Current.time = `${Math.floor(time % (world.interval.hour * world.interval.day) / (world.interval.hour))}:${time % (world.interval.hour) < 10 ? '0' : ''}${time % (world.interval.hour)}\
                <small class="hidden md:inline">(${(time % (world.interval.hour) / world.interval.hour * 100).toFixed(0)}% to yield)</small>
  `

  Current.date = `<small class="hidden md:inline">Year ${Math.floor(time / (world.interval.hour * world.interval.day * world.interval.year))}\
                Day ${Math.floor(time / (world.interval.hour * world.interval.day))}\
                <small class="hidden md:inline">(x${60000 / world.interval.minute})</small></small>
  `

  Current.resources.water = resources.water.balance.toFixed(0).toLocaleString()
  Current.resources.mithril = resources.mineral.balance.toFixed(0).toLocaleString()

  const headerTime = document.getElementById("headerTime");
  headerTime.innerHTML = Current.time;

  const headerDate = document.getElementById("headerDate");
  headerDate.innerHTML = Current.date;

  const headerWater = document.getElementById("headerWater");
  headerWater.innerHTML = Current.resources.water;

  const headerMithril = document.getElementById("headerMithril");
  headerMithril.innerHTML = Current.resources.mithril;
}

fetch('/api/world').then(async (res) => {
  const world = await res.json()
  setInterval(async () => {
    await sync(world)
  }, world.interval.minute);
})

const collectWaterForm = document.getElementById('collectWaterForm')
collectWaterForm.addEventListener('submit', (e) => {
  e.preventDefault()
  onCollect('water')
})

const collectMineralForm = document.getElementById('collectMineralForm')
collectMineralForm.addEventListener('submit', (e) => {
  e.preventDefault()
  onCollect('mineral')
})

const updateBioForm = document.getElementById('updateBioForm')
updateBioForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)

  fetch('/api/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bio: formData.get('bio') })
  }).catch(err => {
    console.error(err)
  }).then(res => res.json()).then(res => {
  })  
})

const sendCreditForm = document.getElementById('sendCreditForm')
sendCreditForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)
  
  fetch('/api/transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: formData.get('to'),
      amount: formData.get('amount'),
      of: 'credit'
    })
  }).catch(err => {
    console.error(err)
  }).then(res => res.json()).then(res => {
  })  
})

const postForm = document.getElementById('postForm')
postForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)
  
  fetch('/api/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: formData.get('title'),
      channels: formData.get('channels'),
      content: formData.get('content')
    })
  }).catch(err => {
    console.error(err)
  }).then(res => res.json()).then(res => {
  })  
})

function onCollect(resource) {
  fetch('/api/collect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ resource: resource })
  }).catch(err => {
    console.error(err)
  }).then(res => res.json()).then(res => {
  })
}