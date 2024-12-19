export function FooterView() {
    return `
        <footer class="absolute w-full bottom-0 bg-gray-900 pb-6">
            Genesis ${new Date(new Date().getTime() - current.time * world.interval.minute).toLocaleString()}
            <a href="https://undermountain-group.github.com" class="text-white hover:text-gray-400 text-sm font-semibold block py-1 px-3">
                Company
            </a>
            <a href="/blog" class="text-white hover:text-gray-400 text-sm font-semibold block py-1 px-3">
                Blog
            </a>
        </footer>
        </main></body>
        <script>
            function toggleNavbar(collapseID) {
                document.getElementById(collapseID).classList.toggle("hidden");
                document.getElementById(collapseID).classList.toggle("block");
            }
        </script></html>`
}