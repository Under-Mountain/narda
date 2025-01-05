export function initializeModalHandlers() {
  const editAccountBtn = document.getElementById('editAccountBtn')
  if (editAccountBtn) {
    editAccountBtn.addEventListener('click', (e) => {
        const modal = document.getElementById('editAccountModal') as HTMLFormElement
        console.log(modal)
        modal.showModal()
    })
  }
}