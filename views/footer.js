import { current, world } from "../service/model.js"

export function FooterView() {
    return `
        <footer class="footer footer-center mt-4 bg-base-300 text-base-content p-4">
            <aside class="">
                Arda v.1
            </aside>
        </footer>
        </main></body>
        <script>
            function toggleNavbar(collapseID) {
                document.getElementById(collapseID).classList.toggle("hidden");
                document.getElementById(collapseID).classList.toggle("block");
            }
        </script></html>`
}