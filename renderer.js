// DOM elements
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const addUserBtn = document.getElementById('addUserBtn');
const refreshBtn = document.getElementById('refreshBtn');
const usersDiv = document.getElementById('users');
const statusDiv = document.getElementById('status');

// Status messages
function showStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.style.color = isError ? 'red' : 'green';
  setTimeout(() => {
    statusDiv.textContent = '';
  }, 3000);
}

// Display users in the UI
function displayUsers(users) {
  usersDiv.innerHTML = '';
  
  if (users.length === 0) {
    usersDiv.innerHTML = '<p>No users found.</p>';
    return;
  }

  users.forEach(user => {
    const userElement = document.createElement('div');
    userElement.className = 'user-item';
    userElement.innerHTML = `
      <strong>${user.name}</strong> - ${user.email}
      <button onclick="deleteUser(${user.id})">Delete</button>
    `;
    usersDiv.appendChild(userElement);
  });
}

// Load and display users
async function loadUsers() {
  try {
    const users = await window.database.getUsers();
    displayUsers(users);
  } catch (error) {
    showStatus('Error loading users: ' + error.message, true);
    console.error('Error:', error);
  }
}

// Add new user
async function addUser() {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) {
    showStatus('Please fill in all fields', true);
    return;
  }

  try {
    await window.database.addUser(name, email);
    nameInput.value = '';
    emailInput.value = '';
    showStatus('User added successfully!');
    loadUsers(); // Refresh the list
  } catch (error) {
    showStatus('Error adding user: ' + error.message, true);
    console.error('Error:', error);
  }
}

// Delete user (exposed globally for onclick)
window.deleteUser = async function(userId) {
  if (!confirm('Are you sure you want to delete this user?')) {
    return;
  }

  try {
    await window.database.deleteUser(userId);
    showStatus('User deleted successfully!');
    loadUsers(); // Refresh the list
  } catch (error) {
    showStatus('Error deleting user: ' + error.message, true);
    console.error('Error:', error);
  }
};

// Event listeners
addUserBtn.addEventListener('click', addUser);
refreshBtn.addEventListener('click', loadUsers);

// Handle Enter key in inputs
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addUser();
});
emailInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addUser();
});

// Load users when page loads
document.addEventListener('DOMContentLoaded', loadUsers);
