

const API_URL = "http://localhost:8080/api";

// ==================== NAVIGATION ====================

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
    updateNgoView();
}

// ==================== DONOR NAVIGATION ====================

function hideDonorSections() {
    [
        "donor-section",
        "food-section",
        "food-donation-section",
        "my-donations-section"
    ].forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = "none";
    });
}

function showDonateForm() {
    hideDonorSections();
    document.getElementById("donor-section").style.display = "block";
}

function showFood() {
    hideDonorSections();
    document.getElementById("food-section").style.display = "block";
    loadFood();
}

function showFoodDonationForm() {
    hideDonorSections();
    document.getElementById("food-donation-section").style.display = "block";
}

function showMyDonations() {
    hideDonorSections();
    document.getElementById("my-donations-section").style.display = "block";
}

// ==================== DONOR REGISTRATION ====================

document.getElementById("donor-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const donor = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value
    };

    const message = document.getElementById("donor-message");

    try {
        const response = await fetch(`${API_URL}/donors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(donor)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || "Registration failed.");
        }

        message.textContent = result.message || "Registration successful!";
        message.style.color = "green";
        this.reset();

    } catch (error) {
        message.textContent = error.message || "Cannot connect to backend.";
        message.style.color = "red";
    }
});

// ==================== FOOD DONATION ====================

document.getElementById("food-donation-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const donation = {
        donorId: Number(document.getElementById("donorId").value),
        foodName: document.getElementById("foodName").value,
        description: document.getElementById("description").value,
        quantity: Number(document.getElementById("quantity").value),
        unit: document.getElementById("unit").value,
        foodType: document.getElementById("foodType").value,
        preparedAt: document.getElementById("preparedAt").value,
        expiryTime: document.getElementById("expiryTime").value,
        pickupAddress: document.getElementById("pickupAddress").value,
        contactNumber: document.getElementById("contactNumber").value,
        instructions: document.getElementById("instructions").value
    };

    const message = document.getElementById("food-donation-message");

    try {
        const response = await fetch(`${API_URL}/food`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(donation)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || "Donation submission failed.");
        }

        message.textContent =
            `Success! Food donation submitted successfully! Donation ID: ${result.donationId}`;
        message.style.color = "green";
        this.reset();

    } catch (error) {
        message.textContent = error.message || "Cannot connect to backend.";
        message.style.color = "red";
    }
});

// ==================== AVAILABLE FOOD ====================

async function loadFood() {
    const foodList = document.getElementById("food-list");
    foodList.innerHTML = "<p>Loading available food...</p>";

    try {
        const response = await fetch(`${API_URL}/food`);

        if (!response.ok) {
            throw new Error("Unable to load available food.");
        }

        const foods = await response.json();

        if (!foods || foods.length === 0) {
            foodList.innerHTML = "<p>No available food donations right now.</p>";
            return;
        }

        foodList.innerHTML = "";

        foods.forEach(food => {
            const card = document.createElement("div");
            card.className = "food-card";

            card.innerHTML = `
                <h3>${food.foodName || "Food donation"}</h3>
                <p><strong>Description:</strong> ${food.description || "Not provided"}</p>
                <p><strong>Quantity:</strong> ${food.quantity || ""} ${food.unit || ""}</p>
                <p><strong>Food Type:</strong> ${food.foodType || "Not specified"}</p>
                <p><strong>Pickup Address:</strong> ${food.pickupAddress || "Not provided"}</p>
                <p><strong>Expiry:</strong> ${food.expiryTime || "Not specified"}</p>
                <p><strong>Status:</strong> ${food.status || "AVAILABLE"}</p>
            `;

            foodList.appendChild(card);
        });

    } catch (error) {
        foodList.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// ==================== MY DONATIONS ====================

async function loadMyDonations() {
    const donorId = document.getElementById("myDonorId").value;
    const list = document.getElementById("my-donations-list");
    const message = document.getElementById("my-donations-message");

    if (!donorId) {
        message.textContent = "Please enter your Donor ID.";
        message.style.color = "red";
        return;
    }

    list.innerHTML = "<p>Loading your donations...</p>";
    message.textContent = "";

    try {
        const response = await fetch(`${API_URL}/food/donor/${donorId}`);

        if (!response.ok) {
            throw new Error("Unable to load your donations.");
        }

        const donations = await response.json();

        if (!donations || donations.length === 0) {
            list.innerHTML = "<p>No donations found for this Donor ID.</p>";
            return;
        }

        list.innerHTML = "";

        donations.forEach(food => {
            const card = document.createElement("div");
            card.className = "food-card";

            card.innerHTML = `
                <h3>${food.foodName || "Food donation"}</h3>
                <p><strong>Donation ID:</strong> ${food.donationId}</p>
                <p><strong>Quantity:</strong> ${food.quantity} ${food.unit || ""}</p>
                <p><strong>Status:</strong> ${food.status}</p>
                <p><strong>Pickup Address:</strong> ${food.pickupAddress || ""}</p>
                <button onclick="editDonation(${food.donationId}, ${donorId})">Edit</button>
                <button onclick="cancelDonation(${food.donationId}, ${donorId})">Cancel</button>
            `;

            list.appendChild(card);
        });

    } catch (error) {
        list.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// ==================== EDIT DONATION ====================

async function editDonation(donationId, donorId) {
    const newQuantity = prompt("Enter the updated quantity:");

    if (newQuantity === null) return;

    if (!newQuantity.trim() || Number(newQuantity) <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/food/${donationId}?donorId=${donorId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quantity: Number(newQuantity)
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to update donation.");
        }

        alert("Donation updated successfully!");
        loadMyDonations();

    } catch (error) {
        alert(error.message || "Cannot connect to backend.");
    }
}

// ==================== CANCEL DONATION ====================

async function cancelDonation(donationId, donorId) {
    if (!confirm("Are you sure you want to cancel this donation?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/food/${donationId}/cancel?donorId=${donorId}`,
            { method: "PATCH" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to cancel donation.");
        }

        alert("Donation cancelled successfully!");
        loadMyDonations();

    } catch (error) {
        alert(error.message || "Cannot connect to backend.");
    }
}

// ==================== NGO LOGIN STATE ====================

function getLoggedInNgo() {
    const storedNgo = localStorage.getItem("foodbridgeNgo");

    if (!storedNgo) return null;

    try {
        return JSON.parse(storedNgo);
    } catch {
        localStorage.removeItem("foodbridgeNgo");
        return null;
    }
}

function updateNgoView() {
    const ngo = getLoggedInNgo();

    document.getElementById("ngo-auth-actions").style.display =
        ngo ? "none" : "block";

    document.getElementById("ngo-register-section").style.display = "none";
    document.getElementById("ngo-login-section").style.display = "none";

    document.getElementById("ngo-dashboard-content").style.display =
        ngo ? "block" : "none";

    if (ngo) {
        document.getElementById("ngo-welcome-heading").textContent =
            `Welcome, ${ngo.name}!`;

        document.getElementById("ngo-account-details").textContent =
            `NGO ID: ${ngo.ngoId} | Email: ${ngo.email}`;
    }
}

// ==================== NGO NAVIGATION ====================

function showNgoRegister() {
    document.getElementById("ngo-auth-actions").style.display = "none";
    document.getElementById("ngo-login-section").style.display = "none";
    document.getElementById("ngo-register-section").style.display = "block";
}

function showNgoLogin() {
    document.getElementById("ngo-auth-actions").style.display = "none";
    document.getElementById("ngo-register-section").style.display = "none";
    document.getElementById("ngo-login-section").style.display = "block";
}

function hideNgoDashboardSections() {
    document.getElementById("ngo-food-section").style.display = "none";
    document.getElementById("ngo-claims-section").style.display = "none";
}

function showNgoFood() {
    hideNgoDashboardSections();
    document.getElementById("ngo-food-section").style.display = "block";
    loadNgoFood();
}

function showNgoClaims() {
    hideNgoDashboardSections();
    document.getElementById("ngo-claims-section").style.display = "block";
    loadNgoClaims();
}

// ==================== NGO REGISTRATION ====================

document.getElementById("ngo-register-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = document.getElementById("ngo-register-message");

    const ngo = {
        name: document.getElementById("ngoName").value,
        email: document.getElementById("ngoEmail").value,
        passwordHash: document.getElementById("ngoPassword").value,
        phone: document.getElementById("ngoPhone").value,
        address: document.getElementById("ngoAddress").value,
        city: document.getElementById("ngoCity").value
    };

    try {
        const response = await fetch(`${API_URL}/ngos/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ngo)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || "NGO registration failed.");
        }

        message.textContent = result.message || "NGO registered successfully!";
        message.style.color = "green";

        document.getElementById("ngoLoginEmail").value = ngo.email;

        this.reset();

        showNgoLogin();

        document.getElementById("ngo-login-message").textContent =
            "Registration successful! Please log in.";

        document.getElementById("ngo-login-message").style.color = "green";

    } catch (error) {
        message.textContent = error.message || "Cannot connect to backend.";
        message.style.color = "red";
    }
});

// ==================== NGO LOGIN ====================

document.getElementById("ngo-login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = document.getElementById("ngo-login-message");

    const credentials = {
        email: document.getElementById("ngoLoginEmail").value,
        passwordHash: document.getElementById("ngoLoginPassword").value
    };

    try {
        const response = await fetch(`${API_URL}/ngos/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || "NGO login failed.");
        }

        const ngo = {
            ngoId: result.ngoId,
            name: result.name,
            email: result.email
        };

        localStorage.setItem("foodbridgeNgo", JSON.stringify(ngo));

        updateNgoView();

        alert(`Welcome, ${ngo.name}!`);

        showNgoFood();

    } catch (error) {
        message.textContent = error.message || "Cannot connect to backend.";
        message.style.color = "red";
    }
});

// ==================== NGO LOGOUT ====================

function ngoLogout() {
    localStorage.removeItem("foodbridgeNgo");
    updateNgoView();
    alert("You have been logged out.");
}

// ==================== NGO AVAILABLE FOOD ====================

async function loadNgoFood() {
    const ngo = getLoggedInNgo();
    const list = document.getElementById("ngo-food-list");

    if (!ngo) {
        list.innerHTML = "<p>Please log in first.</p>";
        return;
    }

    list.innerHTML = "<p>Loading available food...</p>";

    try {
        const response = await fetch(`${API_URL}/food`);

        if (!response.ok) {
            throw new Error("Unable to load available food.");
        }

        const foods = await response.json();

        if (!foods || foods.length === 0) {
            list.innerHTML = "<p>No available food donations right now.</p>";
            return;
        }

        list.innerHTML = "";

        foods.forEach(food => {
            const card = document.createElement("div");
            card.className = "food-card";

            card.innerHTML = `
                <h3>${food.foodName || "Food donation"}</h3>
                <p><strong>Donation ID:</strong> ${food.donationId}</p>
                <p><strong>Description:</strong> ${food.description || "Not provided"}</p>
                <p><strong>Quantity:</strong> ${food.quantity || ""} ${food.unit || ""}</p>
                <p><strong>Food Type:</strong> ${food.foodType || "Not specified"}</p>
                <p><strong>Pickup Address:</strong> ${food.pickupAddress || "Not provided"}</p>
                <p><strong>Contact:</strong> ${food.contactNumber || "Not provided"}</p>
                <p><strong>Expiry:</strong> ${food.expiryTime || "Not specified"}</p>
                <button onclick="claimFood(${food.donationId})">Claim Food</button>
            `;

            list.appendChild(card);
        });

    } catch (error) {
        list.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// ==================== CLAIM FOOD ====================

async function claimFood(donationId) {
    const ngo = getLoggedInNgo();

    if (!ngo) {
        alert("Please log in first.");
        return;
    }

    if (!confirm("Are you sure you want to claim this food donation?")) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/claims/${donationId}/ngo/${ngo.ngoId}`,
            { method: "POST" }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || "Unable to claim food.");
        }

        alert("Food claimed successfully!");

        loadNgoFood();

    } catch (error) {
        alert(error.message || "Cannot connect to backend.");
    }
}

// ==================== NGO MY CLAIMS ====================

async function loadNgoClaims() {
    const ngo = getLoggedInNgo();
    const list = document.getElementById("ngo-claims-list");

    if (!ngo) {
        list.innerHTML = "<p>Please log in first.</p>";
        return;
    }

    list.innerHTML = "<p>Loading your claims...</p>";

    try {
        const response = await fetch(`${API_URL}/claims/ngo/${ngo.ngoId}`);

        if (!response.ok) {
            throw new Error("Unable to load your claims.");
        }

        const claims = await response.json();

        if (!claims || claims.length === 0) {
            list.innerHTML = "<p>You have not claimed any food yet.</p>";
            return;
        }

        list.innerHTML = "";

        claims.forEach(claim => {
            const card = document.createElement("div");
            card.className = "food-card";

            card.innerHTML = `
                <h3>${claim.foodName || "Food donation"}</h3>
                <p><strong>Claim ID:</strong> ${claim.claimId}</p>
                <p><strong>Donation ID:</strong> ${claim.donationId}</p>
                <p><strong>Quantity:</strong> ${claim.quantity || ""} ${claim.unit || ""}</p>
                <p><strong>Pickup Address:</strong> ${claim.pickupAddress || "Not provided"}</p>
                <p><strong>Contact:</strong> ${claim.contactNumber || "Not provided"}</p>
                <p><strong>Expiry:</strong> ${claim.expiryTime || "Not specified"}</p>
                <p><strong>Claim Status:</strong> ${claim.status || "CLAIMED"}</p>
            `;

            list.appendChild(card);
        });

    } catch (error) {
        list.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// Restore NGO login after page refresh
updateNgoView();
