// Plant ID integration (front-end only)
// Simple, step-by-step code with plain comments.
// IMPORTANT: For production or to keep your API key secret, use a small backend
// proxy. This front-end demo puts the key in the browser which is not secure.

// Backend proxy approach: the API key is now stored on the server (Vercel env var)
// and requests are routed through /api/plant-identify. No API key in the browser.

// Holds the base64 image data after you pick a file
let selectedImageBase64 = null;

// Expose an initializer so we can call it after dynamic page loads
function initializePlantIdUI() {
    const uploadArea = document.getElementById("uploadArea");
    const input = document.getElementById("plantImageInput");
    const identifyBtn = document.getElementById("identifyPlantBtn");
    if (!uploadArea || !input || !identifyBtn) return; // Not on Soil AI section

    // No API key is needed client-side; calls go to the serverless proxy.

    // Clicking the upload area opens the file picker
    uploadArea.addEventListener("click", () => input.click());

    // Handle file selection
    input.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        // 2) Validate file type and size (simple checks)
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10 MB max
            alert("Image is too large. Please pick one under 10 MB.");
            return;
        }

        // 3) Convert the image file to base64 so the API can read it
        const reader = new FileReader();
        reader.onload = (ev) => {
            selectedImageBase64 = ev.target.result; // data:image/...;base64,xxxx

            // Update the upload box with a small preview
            const box = uploadArea.querySelector(".upload-placeholder");
            box.innerHTML = `
        <img src="${selectedImageBase64}" alt="Selected plant" style="max-width:220px; max-height:220px; border-radius:8px; display:block; margin: 0 auto 8px;" />
        <small>Looks good? Now click Identify Plant.</small>
      `;

            // Show the identify button
            identifyBtn.style.display = "inline-block";
        };
        reader.readAsDataURL(file);
    });

    // Drag & drop support (nice-to-have)
    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = "rgba(76, 175, 80, 0.15)";
    });
    uploadArea.addEventListener("dragleave", (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = "";
    });
    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = "";
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            input.files = files; // Put dropped file into the input
            input.dispatchEvent(new Event("change")); // Reuse the same handler above
        }
    });

    // 4) When the button is clicked, call the Plant ID API
    identifyBtn.addEventListener("click", async() => {
        if (!selectedImageBase64) {
            alert("Please select an image first.");
            return;
        }
        await identifyPlant(selectedImageBase64);
    });
}

// Initialize if elements already exist (direct load of soil-ai.html)
document.addEventListener("DOMContentLoaded", initializePlantIdUI);

// Also expose globally so the client-side router can call it after dynamic loads
try { window.initializePlantIdUI = initializePlantIdUI; } catch (e) {}

// Actually calls the Plant ID API and renders the result
async function identifyPlant(imageBase64) {
    const resultsWrap = document.getElementById("plantResults");
    const results = document.getElementById("resultsContent");
    const btn = document.getElementById("identifyPlantBtn");

    // Show loading UI
    btn.disabled = true;
    const prevText = btn.textContent;
    btn.textContent = "Identifying...";
    resultsWrap.style.display = "block";
    results.innerHTML = "<p>Analyzing your plant image…</p>";

    try {
        // The API expects the raw base64 (without the prefix)
        const base64Raw = imageBase64.split(",")[1] || "";

        // v3 expects flags in body and details/language as query params
        const payload = {
            images: [base64Raw],
            similar_images: true
        };

        const details = [
            "common_names",
            "url",
            // API v3 refers to "description"; fallback to wiki_description in renderer
            "description",
            "taxonomy"
        ].join(",");

        // Call our serverless proxy instead of Plant.id directly
        const resp = await fetch("/api/plant-identify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                imageBase64: imageBase64,
                details: details,
                language: "en",
                similar_images: payload.similar_images
            })
        });

        if (!resp.ok) {
            throw new Error(`API request failed: ${resp.status} ${resp.statusText}`);
        }

        const data = await resp.json();
        renderSuggestions(data);
    } catch (err) {
        console.error(err);
        results.innerHTML = `
      <div style="color:#ffdddd; background:#5a1a1a; padding:12px; border-radius:6px;">
        <strong>Error identifying plant.</strong><br/>
        <small>${(err && err.message) || "Unknown error"}</small><br/>
        <small>Tip: try a clearer image and try again.</small>
      </div>
    `;
    } finally {
        btn.disabled = false;
        btn.textContent = prevText;
    }
}

// Shows up to 3 suggestions in a simple list
function renderSuggestions(data) {
    const results = document.getElementById("resultsContent");

    // v3 structure: result.classification.suggestions
    const suggestions = (data && data.result && data.result.classification && data.result.classification.suggestions) || [];
    const isPlant = data && data.result && data.result.is_plant && data.result.is_plant.binary;

    if (isPlant === false) {
        results.innerHTML = `
      <p>It looks like the image may not contain a plant. Try a clearer photo showing leaves, flowers, or the whole plant.</p>
    `;
        return;
    }
    if (!suggestions.length) {
        results.innerHTML = `
      <p>No plant matches found. Try a clearer, closer photo.</p>
    `;
        return;
    }

    const top = suggestions.slice(0, 3);

    const blocks = top.map((sug, i) => {
                const probability = Math.round((sug.probability || 0) * 100);
                const name = sug.name || sug.plant_name || "Unknown";
                const details = sug.details || sug.plant_details || {};
                const common = Array.isArray(details.common_names) ? details.common_names.slice(0, 3) : [];
                const desc = (details.wiki_description && details.wiki_description.value) || details.description || "No description available.";
                const url = details.url || null;

                return `
      <div style="border:1px solid #cfe8cf; border-radius:8px; padding:12px; margin-bottom:12px; background:#17351f;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong>${i + 1}. ${name}</strong>
          <span style="background:#2d6a4f; color:white; padding:2px 8px; border-radius:12px; font-size:12px;">${probability}% match</span>
        </div>
        ${common.length ? `<div style="margin:4px 0;"><em>Common names:</em> ${common.join(", ")}</div>` : ""}
        <div style="margin-top:6px; line-height:1.4;">${desc}</div>
        ${url ? `<div style="margin-top:6px;"><a href="${url}" target="_blank" style="color:#9ad1ff;">Learn more</a></div>` : ""}
      </div>
    `;
  });

  results.innerHTML = blocks.join("\n") + `
    <div style="text-align:center; margin-top: 10px;">
      <button onclick="resetPlantIdentification()" style="background:#2d6a4f; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">Try another image</button>
    </div>
  `;
}

// Clears the UI so the user can start again
function resetPlantIdentification() {
  selectedImageBase64 = null;
  const uploadArea = document.getElementById("uploadArea");
  const placeholder = uploadArea.querySelector(".upload-placeholder");
  const identifyBtn = document.getElementById("identifyPlantBtn");
  const resultsWrap = document.getElementById("plantResults");
  const input = document.getElementById("plantImageInput");

  placeholder.innerHTML = `
    <p style="margin-bottom: 6px; font-weight: 600;">Click here or drag & drop a plant image</p>
    <small>JPG, PNG, or WebP • Max 10 MB</small>
  `;
  identifyBtn.style.display = "none";
  resultsWrap.style.display = "none";
  input.value = "";
}
