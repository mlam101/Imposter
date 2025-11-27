let players = [];
let words = [];
let imposterCount = 0;
let selectedWord = "";
let trollModeEnabled = false;

const wordSets = {
    clashroyale: [
        'Archer', 'Archer Queen', 'Baby Dragon', 'Balloon', 'Bandit', 'Barbarians', 'Bats', 
    ],
    movies: [
        'Inception', 'The Matrix', 'Titanic', 'Avatar', 'Jaws',
        'E.T.', 'Back to the Future', 'Jurassic Park', 'The Avengers', 'Interstellar',
        'Gladiator', 'The Dark Knight', 'Forrest Gump', 'Pulp Fiction', 'Parasite'
    ],
    cities: [
        'Paris', 'Tokyo', 'New York', 'Sydney', 'Dubai',
        'London', 'Barcelona', 'Rome', 'Bangkok', 'Amsterdam',
        'Berlin', 'Moscow', 'Istanbul', 'Las Vegas', 'Venice'
    ],
    professions: [
        'Doctor', 'Engineer', 'Teacher', 'Chef', 'Pilot',
        'Architect', 'Artist', 'Scientist', 'Lawyer', 'Musician',
        'Photographer', 'Nurse', 'Carpenter', 'Actor', 'Astronaut'
    ],
    sports: [
        'Basketball', 'Soccer', 'Tennis', 'Baseball', 'Swimming',
        'Golf', 'Boxing', 'Gymnastics', 'Ice Hockey', 'Volleyball',
        'Rugby', 'Cricket', 'Skateboarding', 'Surfing', 'Rock Climbing'
    ]
};

// Detect whether the current device is likely a mobile/touch device
function isMobileDevice() {
    try {
        return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ||
            (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
    } catch (e) {
        return false;
    }
}

function toggleTrollMode() {
    trollModeEnabled = document.getElementById('trollMode').checked;
    const imposterCountInput = document.getElementById('imposterCount');
    
    // Disable imposter count input when troll mode is enabled
    imposterCountInput.disabled = trollModeEnabled;
}

function startGame() {
    const namesInput = document.getElementById('names').value;
    const wordsInput = document.getElementById('words').value;
    imposterCount = parseInt(document.getElementById('imposterCount').value);
    trollModeEnabled = document.getElementById('trollMode').checked;

    // Split inputs by newline, trim whitespace, and filter out empty entries
    players = namesInput.split('\n').map(name => name.trim()).filter(name => name.length > 0);
    words = wordsInput.split('\n').map(word => word.trim()).filter(word => word.length > 0);
    
    // Save names and words to local storage
    localStorage.setItem('playerNames', JSON.stringify(players));
    localStorage.setItem('words', JSON.stringify(words));

    console.log(players.length, words.length, imposterCount);
    if (players.length < 3) {
        alert("Please enter at least 3 players.");
        return;
    }

    if (!trollModeEnabled && players.length <= imposterCount) {
        alert("Please ensure the number of imposters is less than the total players.");
        return;
    }

    if (words.length === 0) {
        alert("Please enter at least one word or concept.");
        return;
    }

    assignRoles();
    showAssignmentScreen();
}

function assignRoles() {
    selectedWord = words[Math.floor(Math.random() * words.length)];
    const playerRoles = Array(players.length).fill('Common Role');

    // Check if troll mode activates (1/8 chance)
    if (trollModeEnabled && Math.random() < 1/8) {
        // Everyone is an imposter!
        for (let i = 0; i < players.length; i++) {
            playerRoles[i] = 'Imposter';
        }
    } else {
        // Assign Imposter roles randomly
        for (let i = 0; i < imposterCount; i++) {
            let assigned = false;
            while (!assigned) {
                const randomIndex = Math.floor(Math.random() * players.length);
                if (playerRoles[randomIndex] === 'Common Role') {
                    playerRoles[randomIndex] = 'Imposter';
                    assigned = true;
                }
            }
        }
    }

    // Combine names and roles into a single array of objects
    players = players.map((name, index) => ({
        name: name,
        role: playerRoles[index],
        hasViewed: false
    }));
}

function showAssignmentScreen() {
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('roleRevealScreen').classList.add('hidden');
    document.getElementById('assignmentScreen').classList.remove('hidden');

    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = ''; // Clear previous list
    players.forEach((player, index) => {
        const button = document.createElement('button');
        button.textContent = player.hasViewed ? `${player.name} (Already Looked)` : player.name;
        button.classList.add('player-name');
        if (player.hasViewed) {
            button.classList.add('viewed');
            button.disabled = true;
        }
        // Attach click handler via addEventListener for cleaner JS
        button.addEventListener('click', () => revealRole(index));
        playerListDiv.appendChild(button);
    });
}

function revealRole(index) {
    const player = players[index];
    
    // Prevent viewing if already viewed
    if (player.hasViewed) {
        return;
    }
    
    document.getElementById('assignmentScreen').classList.add('hidden');
    document.getElementById('roleRevealScreen').classList.remove('hidden');
    player.hasViewed = true;
    document.getElementById('playerNameDisplay').textContent = `${player.name}'s Role`;
    const roleDisplay = document.getElementById('roleDisplay');

    if (player.role === 'Imposter') {
        roleDisplay.textContent = "You are the Imposter!";
        roleDisplay.className = 'imposter';
    } else {
        roleDisplay.textContent = `Your word is: "${selectedWord}"`;
        roleDisplay.className = 'common-role';
    }
}

function hideRole() {
    // Clear the displayed role and return to the assignment screen
    document.getElementById('roleDisplay').textContent = "";

    // Check if all players have viewed their roles
    if (players.every(player => player.hasViewed)) {
        const firstPlayerIndex = Math.floor(Math.random() * players.length);
        const firstPlayerName = players[firstPlayerIndex].name;
        sessionStorage.setItem('firstPlayerKey', firstPlayerName)

        // Redirect to the first player announcement page
        window.location.href = 'firstPlayer.html';
    } else {
        showAssignmentScreen();
    }
}

// Load names and words from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
    // If device looks like mobile, add a class so CSS can adapt and increase textarea rows
    if (isMobileDevice()) {
        document.body.classList.add('mobile');
        const namesTextarea = document.getElementById('names');
        const wordsTextarea = document.getElementById('words');
        if (namesTextarea) namesTextarea.rows = Math.max(6, namesTextarea.rows || 5);
        if (wordsTextarea) wordsTextarea.rows = Math.max(4, wordsTextarea.rows || 3);
    }

    const savedNames = JSON.parse(localStorage.getItem('playerNames') || 'null');
    const savedWords = JSON.parse(localStorage.getItem('words') || 'null');

    if (savedNames) {
        document.getElementById('names').value = savedNames.join('\n');
    }
    if (savedWords) {
        document.getElementById('words').value = savedWords.join('\n');
    }
});

function updateWordDisplay() {
    const selectedSet = document.getElementById('wordSet').value;
    const wordsTextarea = document.getElementById('words');
    
    if (selectedSet && wordSets[selectedSet]) {
        wordsTextarea.value = wordSets[selectedSet].join('\n');
    } else {
        wordsTextarea.value = '';
    }
}
