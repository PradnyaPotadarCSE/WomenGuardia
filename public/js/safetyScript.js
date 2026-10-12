const sosButton = document.getElementById('sosButton');
const policeButton = document.getElementById('policeButton');
const ambulanceButton = document.getElementById('ambulanceButton');
const sirenAudio = document.getElementById('sirenAudio');
let isSOSActive = false;

sosButton.addEventListener('click', function () {
    if (!isSOSActive) {
        this.textContent = 'SOS Activated';
        this.classList.add('sos-active');
        sirenAudio.play();
        isSOSActive = true;
    } else {
        this.textContent = 'SOS';
        this.classList.remove('sos-active');
        sirenAudio.pause();
        sirenAudio.currentTime = 0;
        isSOSActive = false;
    }
});

policeButton.addEventListener('click', function () {
    alert('Simulating call to Police.');
});

ambulanceButton.addEventListener('click', function () {
    alert('Simulating call to Ambulance.');
});