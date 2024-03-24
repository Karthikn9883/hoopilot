// JavaScript for the interactive background
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    document.body.style.background = `linear-gradient(${x * 360}deg, #f6d365, #fda085)`;
  });

function setClockHands() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDegrees = ((seconds / 60) * 360) + 90;
    const minuteDegrees = ((minutes / 60) * 360) + 90;
    const hourDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;

    const secondHand = document.querySelector('.second-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const hourHand = document.querySelector('.hour-hand');

    secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
    hourHand.style.transform = `rotate(${hourDegrees}deg)`;
}

// Call the setClockHands function every second
setInterval(setClockHands, 1000);

// JavaScript for the clock
const clockWidget = document.getElementById('clock-widget');
const hourHand = document.createElement('div');
const minuteHand = document.createElement('div');
const secondHand = document.createElement('div');

hourHand.classList.add('hand', 'hour-hand');
minuteHand.classList.add('hand', 'minute-hand');
secondHand.classList.add('hand', 'second-hand');

clockWidget.appendChild(hourHand);
clockWidget.appendChild(minuteHand);
clockWidget.appendChild(secondHand);

function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const secondsDegrees = ((seconds / 60) * 360) + 90;
    secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

    const minutes = now.getMinutes();
    const minutesDegrees = ((minutes / 60) * 360) + 90;
    minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;

    const hours = now.getHours();
    const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;
    hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
}

setInterval(updateClock, 1000);
updateClock(); // Initialize the clock immediately


