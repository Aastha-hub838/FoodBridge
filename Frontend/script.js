
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
    document.getElementById("food-donation-section").style.display = "none";
    document.getElementById("my-donations-section").style.display = "none";
}

function showFood() {
    document.getElementById("food-section").style.display = "block";
    document.getElementById("donor-section").style.display = "none";
    document.getElementById("food-donation-section").style.display = "none";
    document.getElementById("my-donations-section").style.display = "none";
}

function showFoodDonationForm() {
    document.getElementById("donor-section").style.display = "none";
    document.getElementById("food-section").style.display = "none";
    document.getElementById("food-donation-section").style.display = "block";
    document.getElementById("my-donations-section").style.display = "none";
}

// Show My Donations
function showMyDonations() {
    document.getElementById("donor-section").style.display = "none";
    document.getElementById("food-section").style.display = "none";
    document.getElementById("food-donation-section").style.display = "none";
    document.getElementById("my-donations-section").style.display = "block";
}

// Load donations belonging to a donor
async function loadMyDonations() {
    const donorId = document.getElementById("myDonorId").value.trim();
    const donationList = document.getElementById("my-donations-list");
    const message = document.getElementById("my-donations-message");

    donationList.replaceChildren();
    message.textContent = "";

    if (!donorId || Number(donorId) <= 0) {
        message.textContent = "Please enter a valid Donor ID.";
        return;
    }

    message.textContent = "Loading your donations...";

    try {
        const response = await fetch(`${API_URL}/food/donor/${donorId}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not load your donations.");
        }

        message.textContent = "";

        if (!Array.isArray(result) || result.length === 0) {
            message.textContent = "You have not submitted any food donations yet.";
            return;
        }

        result.forEach(food => {
            const card = document.createElement("article");
            card.className = "food-item";

            const title = document.createElement("h3");
            title.textContent = food.foodName || "Food Donation";

            const donationId = document.createElement("p");
            donationId.textContent = `Donation ID: ${food.donationId}`;

            const quantity = document.createElement("p");
            quantity.textContent =
                `Quantity: ${food.quantity ?? "Not listed"} ${food.unit ?? ""}`;

            const foodType = document.createElement("p");
            foodType.textContent =
                `Food Type: ${food.foodType || "Not specified"}`;

            const address = document.createElement("p");
            address.textContent =
                `Pickup Address: ${food.pickupAddress || "Not listed"}`;

            const expiry = document.createElement("p");
            expiry.textContent =
                `Expiry Time: ${food.expiryTime || "Not specified"}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${food.status || "Unknown"}`;

            card.append(
                title,
                donationId,
                quantity,
                foodType,
                address,
                expiry,
                status
            );

            // Show Edit and Cancel only for available donations
            if (food.status === "AVAILABLE") {
                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.textContent = "Edit Donation";

                editButton.addEventListener("click", () => {
                    editDonation(food, donorId);
                });

                const cancelButton = document.createElement("button");
                cancelButton.type = "button";
                cancelButton.textContent = "Cancel Donation";

                cancelButton.addEventListener("click", () => {
                    cancelDonation(food.donationId, donorId);
                });

                card.append(editButton, cancelButton);
            }

            donationList.appendChild(card);
        });

        message.textContent = `Found ${result.length} donation(s).`;

    } catch (error) {
        message.textContent = error.message.includes("Failed to fetch")
            ? "Cannot connect to the server. Please check whether the backend is running."
            : error.message;
    }
}

// Edit an existing donation
async function editDonation(food, donorId) {

    const foodName = prompt("Enter food name:", food.foodName || "");
    if (foodName === null) return;

    const description = prompt(
        "Enter food description:",
        food.description || ""
    );
    if (description === null) return;

    const quantity = prompt("Enter quantity:", food.quantity ?? "");
    if (quantity === null) return;

    const unit = prompt("Enter unit (kg, plates, etc.):", food.unit || "");
    if (unit === null) return;

    const foodType = prompt(
        "Enter food type:",
        food.foodType || ""
    );
    if (foodType === null) return;

    const preparedAt = prompt(
        "Enter preparation date and time (YYYY-MM-DDTHH:mm):",
        food.preparedAt ? food.preparedAt.substring(0, 16) : ""
    );
    if (preparedAt === null) return;

    const expiryTime = prompt(
        "Enter expiry date and time (YYYY-MM-DDTHH:mm):",
        food.expiryTime ? food.expiryTime.substring(0, 16) : ""
    );
    if (expiryTime === null) return;

    const pickupAddress = prompt(
        "Enter pickup address:",
        food.pickupAddress || ""
    );
    if (pickupAddress === null) return;

    const contactNumber = prompt(
        "Enter contact number:",
        food.contactNumber || ""
    );
    if (contactNumber === null) return;

    const instructions = prompt(
        "Enter pickup instructions:",
        food.instructions || ""
    );
    if (instructions === null) return;

    if (!foodName.trim() || !quantity.trim() ||
        !unit.trim() || !expiryTime.trim() ||
        !pickupAddress.trim() ||
        !Number.isFinite(Number(quantity)) ||
        Number(quantity) <= 0) {

        alert("Please enter valid values in all required fields.");
        return;
    }

    const updatedDonation = {
        foodName: foodName.trim(),
        description: description.trim(),
        quantity: Number(quantity),
        unit: unit.trim(),
        foodType: foodType.trim(),
        preparedAt: preparedAt.trim() || null,
        expiryTime: expiryTime.trim(),
        pickupAddress: pickupAddress.trim(),
        contactNumber: contactNumber.trim(),
        instructions: instructions.trim()
    };

    try {
        const response = await fetch(
            `${API_URL}/food/${food.donationId}?donorId=${donorId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedDonation)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not update donation.");
        }

        alert("Donation updated successfully!");
        loadMyDonations();

    } catch (error) {
        alert(error.message.includes("Failed to fetch")
            ? "Cannot connect to the backend."
            : error.message);
    }
}

// Cancel an existing donation
async function cancelDonation(donationId, donorId) {

    const confirmed = confirm(
        "Are you sure you want to cancel this food donation?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `${API_URL}/food/${donationId}/cancel?donorId=${donorId}`,
            {
                method: "PATCH"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not cancel donation.");
        }

        alert("Donation cancelled successfully!");
        loadMyDonations();

    } catch (error) {
        alert(error.message.includes("Failed to fetch")
            ? "Cannot connect to the backend."
            : error.message);
    }
}

// NGO food listings
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
            "Food listings cannot be loaded. Please check the backend.";
    }
}

// Donor registration
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

// Food donation form submission
const foodDonationForm = document.getElementById("food-donation-form");

foodDonationForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const message = document.getElementById("food-donation-message");
    const formData = new FormData(this);

    const foodDonation = {
        donorId: Number(formData.get("donorId")),
        foodName: formData.get("foodName").trim(),
        description: formData.get("description").trim(),
        quantity: Number(formData.get("quantity")),
        unit: formData.get("unit"),
        foodType: formData.get("foodType").trim(),
        preparedAt: formData.get("preparedAt") || null,
        expiryTime: formData.get("expiryTime"),
        pickupAddress: formData.get("pickupAddress").trim(),
        contactNumber: formData.get("contactNumber").trim(),
        instructions: formData.get("instructions").trim()
    };

    message.textContent = "Submitting food donation...";

    try {
        const response = await fetch(`${API_URL}/food`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(foodDonation)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Food donation submission failed."
            );
        }

        message.textContent =
            `Success! ${result.message} Donation ID: ${result.donationId}`;

        this.reset();

    } catch (error) {
        message.textContent = error.message.includes("Failed to fetch")
            ? "Cannot connect to the server. Check whether the backend is running."
            : error.message;
    }
});

// Available food listing
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
            "Food listings cannot be loaded. Please check the backend.";
    }
}



