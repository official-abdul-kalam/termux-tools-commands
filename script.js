import { 
    auth, 
    storage, 
    db, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile,
    ref,
    uploadBytes,
    getDownloadURL,
    doc,
    setDoc,
    getDoc
} from './firebase-config.js';

// Disclaimer handling
document.addEventListener('DOMContentLoaded', () => {
    const disclaimerModal = document.getElementById('disclaimerModal');
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    const agreeButton = document.getElementById('agreeButton');
    
    // Check if user has already agreed
    const hasAgreed = localStorage.getItem('disclaimerAgreed');
    if (hasAgreed) {
        disclaimerModal.style.display = 'none';
        document.body.classList.remove('disclaimer-active');
    } else {
        document.body.classList.add('disclaimer-active');
    }

    // Handle checkbox change
    agreeCheckbox.addEventListener('change', () => {
        agreeButton.disabled = !agreeCheckbox.checked;
    });

    // Handle agree button click
    agreeButton.addEventListener('click', () => {
        if (agreeCheckbox.checked) {
            localStorage.setItem('disclaimerAgreed', 'true');
            disclaimerModal.style.display = 'none';
            document.body.classList.remove('disclaimer-active');
            showNotification('Welcome to HackDeck!', 'success');
        }
    });

    // Prevent closing the disclaimer modal
    disclaimerModal.addEventListener('click', (e) => {
        if (e.target === disclaimerModal) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});

// Sample tools data (in a real app, this would come from a backend)
const tools = [
    {
        id: 1,
        title: "WiFi Scanner",
        description: "Scan and analyze nearby WiFi networks",
        tags: ["WIFI", "NETWORK"],
        preview: "https://picsum.photos/300/150",
        author: "Admin",
        date: "2024-03-20",
        code: `pkg install python
git clone https://github.com/example/wifi-scanner
cd wifi-scanner
python scanner.py`,
        views: 1200,
        likes: 45
    },
    {
        id: 2,
        title: "Social Media Toolkit",
        description: "Collection of social media analysis tools",
        tags: ["SOCIAL", "ANALYSIS"],
        preview: "https://picsum.photos/300/150",
        author: "Admin",
        date: "2024-03-19",
        code: `pkg install git
git clone https://github.com/example/social-toolkit
cd social-toolkit
bash setup.sh`,

        views: 850,
        likes: 32
    }
];

// DOM Elements
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.querySelector('.close-sidebar');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const toolDetailModal = document.getElementById('toolDetailModal');
const toolsGrid = document.getElementById('toolsGrid');
const searchBar = document.querySelector('.search-bar');
const filterTags = document.querySelectorAll('.tag');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');

// Profile picture elements
const profilePicInput = document.getElementById('profilePicInput');
const signupProfilePicInput = document.getElementById('signupProfilePicInput');
const profilePic = document.getElementById('profilePic');
const signupProfilePic = document.getElementById('signupProfilePic');

// Add new DOM elements
const sidebarUserProfile = document.getElementById('sidebarUserProfile');
const sidebarUserPic = document.getElementById('sidebarUserPic');
const sidebarUserName = document.getElementById('sidebarUserName');
const sidebarUserEmail = document.getElementById('sidebarUserEmail');
const logoutBtnSidebar = document.getElementById('logoutBtnSidebar');
const loginPromptModal = document.getElementById('loginPromptModal');
const goToLoginBtn = document.getElementById('goToLoginBtn');
const skipLoginBtn = document.getElementById('skipLoginBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const editProfileForm = document.getElementById('editProfileForm');
const editProfilePic = document.getElementById('editProfilePic');
const editProfilePicInput = document.getElementById('editProfilePicInput');
const sidebarProfilePicInput = document.getElementById('sidebarProfilePicInput');

// Auth state observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in
        loginModal.style.display = 'none';
        loginBtn.style.display = 'none';
        logoutBtnSidebar.style.display = 'block';
        sidebarUserProfile.style.display = 'flex';
        
        // Update sidebar profile info
        const displayName = user.displayName || 'User';
        sidebarUserName.textContent = displayName;
        sidebarUserEmail.textContent = user.email;
        
        // Get user profile picture
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().photoURL) {
            sidebarUserPic.src = userDoc.data().photoURL;
            editProfilePic.src = userDoc.data().photoURL;
        } else {
            const defaultPic = 'https://via.placeholder.com/100';
            sidebarUserPic.src = user.photoURL || defaultPic;
            editProfilePic.src = user.photoURL || defaultPic;
        }
    } else {
        // User is signed out
        loginBtn.style.display = 'block';
        logoutBtnSidebar.style.display = 'none';
        sidebarUserProfile.style.display = 'none';
    }
});

// Add notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    
    notification.className = `notification ${type}`;
    messageElement.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        await signInWithEmailAndPassword(auth, email, password);
        showNotification('Successfully logged in!');
        loginModal.style.display = 'none';
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

// Handle Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
        showNotification("Passwords don't match!", 'error');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Upload profile picture if selected
        let photoURL = null;
        if (signupProfilePicInput.files[0]) {
            const storageRef = ref(storage, `profile_pics/${user.uid}`);
            await uploadBytes(storageRef, signupProfilePicInput.files[0]);
            photoURL = await getDownloadURL(storageRef);
        }

        // Update profile
        await updateProfile(user, {
            displayName: username,
            photoURL: photoURL
        });

        // Save additional user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email,
            photoURL: photoURL,
            createdAt: new Date().toISOString()
        });

        showNotification('Account created successfully!');
        loginModal.style.display = 'none';
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

// Handle Logout (sidebar button only)
logoutBtnSidebar.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showNotification('Successfully logged out!');
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Toggle between login and signup forms
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    // Clear any previous error messages
    document.getElementById('notification').style.display = 'none';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'flex';
    // Clear any previous error messages
    document.getElementById('notification').style.display = 'none';
});

// Handle profile picture upload
async function handleProfilePicUpload(file, previewElement) {
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewElement.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

profilePicInput.addEventListener('change', (e) => {
    handleProfilePicUpload(e.target.files[0], profilePic);
});

signupProfilePicInput.addEventListener('change', (e) => {
    handleProfilePicUpload(e.target.files[0], signupProfilePic);
});

// Toggle Sidebar
hamburgerMenu.addEventListener('click', () => {
    sidebar.classList.add('active');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('active');
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === toolDetailModal) {
        toolDetailModal.style.display = 'none';
    }
});

// Close modals with close button
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        toolDetailModal.style.display = 'none';
    });
});

// Show Login Modal
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'block';
});

// Function to check if user is logged in
function isUserLoggedIn() {
    return auth.currentUser !== null;
}

// Function to show login prompt
function showLoginPrompt() {
    loginPromptModal.style.display = 'block';
}

// Handle login prompt buttons
goToLoginBtn.addEventListener('click', () => {
    loginPromptModal.style.display = 'none';
    loginModal.style.display = 'block';
});

skipLoginBtn.addEventListener('click', () => {
    loginPromptModal.style.display = 'none';
});

// Create Tool Card
function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.innerHTML = `
        <img src="${tool.preview}" alt="${tool.title}" class="tool-preview">
        <div class="tool-info">
            <h3 class="tool-title">${tool.title}</h3>
            <div class="tool-tags">
                ${tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
            </div>
            <div class="tool-meta">
                <span>👁️ ${tool.views}</span>
                <span>❤️ ${tool.likes}</span>
                <span>📅 ${tool.date}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => showToolDetail(tool));
    return card;
}

// Show Tool Detail
function showToolDetail(tool) {
    const modal = document.getElementById('toolDetailModal');
    const content = modal.querySelector('.modal-content');
    
    content.querySelector('.tool-preview').src = tool.preview;
    content.querySelector('.tool-title').textContent = tool.title;
    content.querySelector('.tool-description').textContent = tool.description;
    content.querySelector('.author').textContent = `Author: ${tool.author}`;
    content.querySelector('.date').textContent = `Date: ${tool.date}`;
    
    // Split code into lines and create individual code lines
    const codeLines = tool.code.split('\n');
    const codeLinesContainer = content.querySelector('.code-lines');
    codeLinesContainer.innerHTML = ''; // Clear existing content
    
    codeLines.forEach(line => {
        if (line.trim()) {
            const codeLine = document.createElement('div');
            codeLine.className = 'code-line';
            codeLine.innerHTML = `
                <pre>${line}</pre>
                <button class="copy-btn" title="Copy command">
                    <i class="fas fa-copy"></i>
                </button>
            `;
            
            const copyBtn = codeLine.querySelector('.copy-btn');
            copyBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!isUserLoggedIn()) {
                    showLoginPrompt();
                    return;
                }
                
                try {
                    await navigator.clipboard.writeText(line);
                    copyBtn.classList.add('copied');
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    showNotification('Command copied to clipboard!');
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                } catch (error) {
                    showNotification('Failed to copy command', 'error');
                }
            });
            
            codeLinesContainer.appendChild(codeLine);
        }
    });

    modal.style.display = 'block';
}

// Search Functionality
searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredTools = tools.filter(tool => 
        tool.title.toLowerCase().includes(searchTerm) ||
        tool.description.toLowerCase().includes(searchTerm) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    renderTools(filteredTools);
});

// Filter Tags
filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
        // Remove active class from all tags
        filterTags.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tag
        tag.classList.add('active');

        const selectedTag = tag.textContent;
        const filteredTools = selectedTag === 'ALL' 
            ? tools 
            : tools.filter(tool => tool.tags.includes(selectedTag));
        
        renderTools(filteredTools);
    });
});

// Render Tools
function renderTools(toolsToRender) {
    toolsGrid.innerHTML = '';
    toolsToRender.forEach(tool => {
        toolsGrid.appendChild(createToolCard(tool));
    });
}

// Initial render
renderTools(tools);

// Add some animation to tool cards
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Add About and Privacy Policy handling
const aboutBtn = document.getElementById('aboutBtn');
const privacyBtn = document.getElementById('privacyBtn');
const aboutModal = document.getElementById('aboutModal');
const privacyModal = document.getElementById('privacyModal');

// Show About Modal
aboutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    aboutModal.style.display = 'block';
    sidebar.classList.remove('active');
});

// Show Privacy Modal
privacyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.style.display = 'block';
    sidebar.classList.remove('active');
});

// Close About and Privacy modals
[aboutModal, privacyModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});

// Update window click handler to include new modals
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === toolDetailModal) {
        toolDetailModal.style.display = 'none';
    }
    if (e.target === aboutModal) {
        aboutModal.style.display = 'none';
    }
    if (e.target === privacyModal) {
        privacyModal.style.display = 'none';
    }
});

// Handle Edit Profile Button Click
editProfileBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        document.getElementById('editUsername').value = user.displayName || '';
        editProfileModal.style.display = 'block';
    }
});

// Handle Edit Profile Form Submit
editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const newUsername = document.getElementById('editUsername').value;
    const submitBtn = editProfileForm.querySelector('button[type="submit"]');

    try {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // Upload new profile picture if selected
        let photoURL = null;
        if (editProfilePicInput.files[0]) {
            const storageRef = ref(storage, `profile_pics/${user.uid}`);
            await uploadBytes(storageRef, editProfilePicInput.files[0]);
            photoURL = await getDownloadURL(storageRef);
        }

        // Update profile
        await updateProfile(user, {
            displayName: newUsername,
            photoURL: photoURL || user.photoURL
        });

        // Update Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: newUsername,
            email: user.email,
            photoURL: photoURL || user.photoURL,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        showNotification('Profile updated successfully!');
        editProfileModal.style.display = 'none';
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

// Handle profile picture uploads
editProfilePicInput.addEventListener('change', (e) => {
    handleProfilePicUpload(e.target.files[0], editProfilePic);
});

sidebarProfilePicInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        const user = auth.currentUser;
        if (!user) return;

        try {
            // Show loading state
            sidebarUserPic.style.opacity = '0.5';

            // Upload new profile picture
            const storageRef = ref(storage, `profile_pics/${user.uid}`);
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            // Update profile
            await updateProfile(user, {
                photoURL: photoURL
            });

            // Update Firestore
            await setDoc(doc(db, 'users', user.uid), {
                photoURL: photoURL,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Update UI
            sidebarUserPic.src = photoURL;
            editProfilePic.src = photoURL;
            showNotification('Profile picture updated successfully!');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            sidebarUserPic.style.opacity = '1';
        }
    }
});

// Close Edit Profile Modal
editProfileModal.querySelector('.close-modal').addEventListener('click', () => {
    editProfileModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === editProfileModal) {
        editProfileModal.style.display = 'none';
    }
});

// Function to get random profile image
function getRandomProfileImage() {
    const profileImages = [
        'assets/images/profile/profile1.jpg',
        'assets/images/profile/profile2.jpg',
        'assets/images/profile/profile3.jpg',
        'assets/images/profile/profile4.jpg',
        'assets/images/profile/profile5.jpg',
        'assets/images/profile/profile6.jpg',
        'assets/images/profile/profile7.jpg',
        'assets/images/profile/profile8.jpg',
        'assets/images/profile/profile9.jpg',
        'assets/images/profile/profile10.jpg'
    ];
    return profileImages[Math.floor(Math.random() * profileImages.length)];
}

// Function to get random preview image
function getRandomPreviewImage() {
    const previewImages = [
        'assets/images/preview/preview1.jpg',
        'assets/images/preview/preview2.jpg',
        'assets/images/preview/preview3.jpg',
        'assets/images/preview/preview4.jpg',
        'assets/images/preview/preview5.jpg'
    ];
    return previewImages[Math.floor(Math.random() * previewImages.length)];
}

// Update user profile when displaying
const userProfile = document.querySelector('.sidebar-user-profile img');
if (userProfile) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        currentUser.profileImage = currentUser.profileImage || getRandomProfileImage();
        userProfile.src = currentUser.profileImage;
    }
}

// Update tool previews
const toolCards = document.querySelectorAll('.tool-card img');
toolCards.forEach(card => {
    const toolId = card.closest('.tool-card').dataset.id;
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
        tool.preview = tool.preview || getRandomPreviewImage();
        card.src = tool.preview;
    }
}); 