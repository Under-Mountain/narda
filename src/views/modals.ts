export function Modals(session, account) {
    return `
        <!-- Put this part before </body> tag -->
        <dialog id="editAccountModal" class="modal">
        <div class="modal-box">
            <h3 class="text-lg font-bold">Edit Account</h3>
            <p class="py-4">Customize your account. Build unique profile to stand out.</p>
            ${session?.username && session.username == account?.id ? `
                <form id="updateBioForm" class="mb-2">
                    <div class="form-control">
                        <textarea name="bio" row="4" class="textarea w-full bg-base-300" placeholder="Write description of this account.">${account.bio ? account.bio : ''}</textarea>
                    </div>
                </form>` : `<p class="text-xs">You need to login to edit this account.</p>`}
            <p class="py-4 text-xs">Press ESC key or click the button below to close</p>
            <div class="modal-action">
            <form method="dialog">
                <button id="updateBioBtn" class="btn btn-primary" ${session?.username && account.credits.balance >= 100 && session.username == account?.id ? ``: `disabled`}>Update (-100.00sl)</button>
                <!-- if there is a button in form, it will close the modal -->
                <button class="btn">Close</button>
            </form>
            </div>
        </div>
        </dialog>
    `
}