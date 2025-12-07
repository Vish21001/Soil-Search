ocument.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("plant-file");
    const identifyBtn = document.getElementById("identify-btn");
    const resultDiv = document.getElementById("plant-results");

    if (!fileInput || !identifyBtn || !resultDiv) return;

    identifyBtn.addEventListener("click", () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Please upload a plant image first!");
            return;
        }

        resultDiv.innerHTML = "<p>Analyzing plant image... please wait.</p>";

        // Placeholder: Call your plant identification API
        setTimeout(() => {
            resultDiv.innerHTML = `<p>Plant identified: <strong>Ficus lyrata</strong></p>`;
        }, 1500);
    });
});
