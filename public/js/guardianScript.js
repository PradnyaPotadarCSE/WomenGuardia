document.addEventListener("DOMContentLoaded", () => {
  const addGuardianForm = document.getElementById("addGuardianForm");
  const quickDial = document.getElementById("quickDial");
  const guardianCircle = document.querySelector(".guardian-circle");

  // Fetch initial guardians from the backend and update the UI
  async function fetchGuardians() {
    try {
      const response = await fetch("/api/getGuardians");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      updateGuardianCircle(data.guardians);
      updateQuickDial(data.guardians);
    } catch (error) {
      console.error("Error fetching guardians:", error);
      alert(
        "There was an error fetching the guardians. Please try again later."
      );
    }
  }

  async function addGuardian(name, mobile_number) {
    try {
      const response = await fetch("/api/addGuardian", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contacts: [{ name, mobile_number }],
        }),
      });
      const data = await response.json();

      if (data.success) {
        updateGuardianCircle(data.savedContacts);
        updateQuickDial(data.savedContacts);
      } else {
        alert("Failed to add guardian: " + data.error);
      }
    } catch (error) {
      console.error("Error adding guardian:", error);
      alert("An error occurred while adding the guardian.");
    }
  }

  async function deleteGuardian(id) {
    try {
      const response = await fetch(`/api/deleteGuardian/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchGuardians(); // Refresh the guardians list
      } else {
        alert("Failed to delete guardian.");
      }
    } catch (error) {
      console.error("Error deleting guardian:", error);
    }
  }

  function updateGuardianCircle(guardians) {
    guardianCircle.innerHTML =
      '<div class="guardian-circle-center">You</div>';
    guardians.forEach((guardian, index) => {
      const angle = (index / guardians.length) * 2 * Math.PI;
      const x = 120 + 100 * Math.cos(angle);
      const y = 120 + 100 * Math.sin(angle);

      const guardianSlot = document.createElement("div");
      guardianSlot.classList.add("guardian-slot");
      guardianSlot.style.left = `${x}px`;
      guardianSlot.style.top = `${y}px`;
      guardianSlot.textContent = guardian.name[0];

      guardianSlot.addEventListener("click", () => {
        const confirmDelete = confirm(
          `Delete guardian ${guardian.name}?`
        );
        if (confirmDelete) {
          deleteGuardian(guardian._id);
        }
      });

      guardianCircle.appendChild(guardianSlot);
    });
  }

  function updateQuickDial(guardians) {
    // Check if quickDial exists before proceeding
    if (!quickDial) return;

    // Iterate over each guardian and create a new card
    guardians.forEach((guardian) => {
      const card = document.createElement("div");
      card.classList.add("quick-dial-card");

      // Generate the HTML content
      card.innerHTML = `
<h3>${guardian.name}</h3>
<p>${guardian.mobile_number}</p>
<div class="quick-dial-buttons">
    <button class="dial-btn">Dial</button>
    <button class="message-btn">Message</button>
    <button class="delete-btn">Delete</button>
</div>
`;

      // Append the card to the quickDial container
      quickDial.appendChild(card);

      // Attach event listeners to each button after it's created
      card.querySelector(".dial-btn").addEventListener("click", () => {
        alert(`Dialing ${guardian.mobile_number}`);
      });

      card.querySelector(".message-btn").addEventListener("click", () => {
        alert(`Messaging ${guardian.mobile_number}`);
      });

      card.querySelector(".delete-btn").addEventListener("click", () => {
        deleteGuardian(guardian._id); // Use the deleteGuardian function here
      });
    });
  }

  addGuardianForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;

    addGuardian(name, phone);
    addGuardianForm.reset();
  });

  // Initialize by fetching guardians from the backend
  fetchGuardians();
});