// Handle all navigation buttons in one window.onload
window.onload = function () {
    const aboutUs = document.getElementById("about-us");
    if (aboutUs) {
        aboutUs.addEventListener("click", function () {
            window.location.href = "/about-us";
        });
    }

    const soilAi = document.getElementById("soil-ai");
    if (soilAi) {
        soilAi.addEventListener("click", function () {
            window.location.href = "/soil-ai";
        });
    }

    const commonPlants = document.getElementById("common-plants");
    if (commonPlants) {
        commonPlants.addEventListener("click", function () {
            window.location.href = "/common-plants";
        });
    }
};
