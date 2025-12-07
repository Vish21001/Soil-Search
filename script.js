document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav-links a[data-page]");
    const mainContainer = document.getElementById("app");

    // Simple router: loads HTML content into main container
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            loadPage(page);
        });
    });

    function loadPage(page) {
        let file = "";
        switch(page) {
            case "soil-ai": file = "soil-ai.html"; break;
            case "plant-id": file = "plant-id.html"; break;
            case "common-plants": file = "common-plants.html"; break;
            case "visualizer": file = "analytics.html"; break;
            default: file = "index.html"; break;
        }

        fetch(file)
            .then(response => response.text())
            .then(html => {
                mainContainer.innerHTML = html;
            })
            .catch(err => {
                mainContainer.innerHTML = `<p>Error loading page: ${err}</p>`;
            });
    }

    // Load home page by default
    loadPage("home");
});
