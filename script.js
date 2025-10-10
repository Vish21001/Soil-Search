function loadPage(page) {
    const main = document.querySelector("main");

    if (page === "about") {
        main.innerHTML = "<h1>About Us</h1><p>This is the About page content.</p>";
    } else if (page === "soil-ai") {
        main.innerHTML = "<h1>Soil AI</h1><p>This is the Soil AI page content.</p>";
    } else if (page === "plants") {
        main.innerHTML = "<h1>Common Plants</h1><p>This is the Common Plants page content.</p>";
    }

    const routes = {
        "home": "/index.html",
        "about-us": "/about-us.html",
        "soil-ai": "/soil-ai.html",
        "common-plants": "/common-plants.html"
    }

    const target = routes[page];

    if (target) {
        fetch(target)
            .then(response => response.text())
            .then(html => {
                main.innerHTML = html;
            })
            .catch(error => {
                console.error("Error loading page:", error);
            });
    } else {
        main.innerHTML = "<h1>404 Not Found</h1><p>The requested page was not found.</p>";
    }
}
