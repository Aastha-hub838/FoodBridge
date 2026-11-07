
const API_URL = "http://localhost:8080/api";

// Navigation
function showHome() {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("donor-page").style.display = "none";
    document.getElementById("ngo-page").style.display = "none";
}

function openDonorPage() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("donor-page").style.display = "block";
    document.getElementById("ngo-page").style.display = "none";
}

function openNgoPage() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("donor-page").style.display = "none";
    document.getElementById("ngo-page").style.display = "block";
}

// Donor dashboard sections
function showDonateForm() {
    document.getElementById("donor-section").style.display = "block";
    document.getElementById("food-section").style.display = "none";
}

function showFood() {
    document.getElementById("food-section").style.display = "block";
    document.getElementById("donor-section").style.display = "none";
}

async function showNgoFood() {
    const list = document.getElementById("ngo-food-list");
    list.textContent = "Loading food listings...";

    try {
        const response = await fetch(`${API_URL}/food`);

        if (!response.ok) {
            throw new Error("Food API is not available yet.");
        }

        const foods = await response.json();
        list.replaceChildren();

        if (!Array.isArray(foods) || foods.length === 0) {
            list.textContent = "No food donations are available yet.";
            return;
        }

        foods.forEach(food => {
            const card = document.createElement("article");
            card.className = "food-item";

            const title = document.createElement("h3");
            title.textContent = food.foodName || "Food donation";

            const quantity = document.createElement("p");
            quantity.textContent =
                `Quantity: ${food.quantity ?? "Not listed"} ${food.unit ?? ""}`;

            const address = document.createElement("p");
            address.textContent =
                `Pickup location: ${food.pickupAddress || "Not listed"}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${food.status || "Unknown"}`;

            card.append(title, quantity, address, status);
            list.appendChild(card);
        });
    } catch (error) {
        list.textContent =
            "Food listings cannot be loaded yet. The backend food API needs to be implemented.";
    }
}

// Donor registration: existing backend connection
const donorForm = document.getElementById("donor-form");

donorForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = document.getElementById("donor-message");
    const formData = new FormData(this);

    const donor = {
        name: formData.get("name").trim(),
        email: formData.get("email").trim(),
        password: formData.get("password"),
        phone: formData.get("phone").trim(),
        address: formData.get("address").trim()
    };

    message.textContent = "Registering...";

    try {
        const response = await fetch(`${API_URL}/donors`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(donor)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Registration failed. Please check your details."
            );
        }

        message.textContent =
            `Registration successful! Welcome, ${result.name}.`;
        this.reset();
    } catch (error) {
        message.textContent = error.message.includes("Failed to fetch")
            ? "Cannot connect to the server. Make sure the FoodBridge backend is running."
            : error.message;
    }
});

// Existing food listing connection
async function loadFood() {
    const foodList = document.getElementById("food-list");
    foodList.textContent = "Loading...";

    try {
        const response = await fetch(`${API_URL}/food`);

        if (!response.ok) {
            throw new Error("Could not load available food.");
        }

        const foods = await response.json();
        foodList.replaceChildren();

        if (!Array.isArray(foods) || foods.length === 0) {
            foodList.textContent = "No food donations are available yet.";
            return;
        }

        foods.forEach(food => {
            const item = document.createElement("article");
            item.className = "food-item";

            const title = document.createElement("h3");
            title.textContent = food.foodName || "Food donation";

            const details = document.createElement("p");
            details.textContent =
                `${food.quantity ?? "Quantity not listed"} ${food.unit ?? ""}`;

            item.append(title, details);
            foodList.appendChild(item);
        });
    } catch (error) {
        foodList.textContent =
            "Food listings are not connected yet. The backend food API needs to be implemented.";
    }
}

