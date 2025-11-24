const reelsContainer = document.getElementById('reelsContainer');
const balanceLabel = document.getElementById('balance');
const notificationLabel = document.getElementById('notification');
const spinButton = document.getElementById('spinButton');
const wagerInput = document.getElementById('wager');
const spinAmountDisplay = document.getElementById('spinAmountDisplay');
const freeSpinsCounter = document.getElementById('freeSpinsCounter');
const bonusPointsCounter = document.getElementById('bonusPointsCounter');

let balance = 100;
let freeSpins = 0;
let bonusPoints = 0;
let inBonus = false;
const reelCount = 7;
const rowCount = 3;

// Symbols, payouts, sounds, messages
const images = ['10.png','jack.png','queen.png','king.png','ace.png','bonus.png','wild.png'];
const symbolPay = {'10.png':1,'jack.png':2,'queen.png':3,'king.png':5,'ace.png':20,'bonus.png':3,'wild.png':0};
const symbolSounds = {
    '10.png': new Audio('10.wav'),
    'jack.png': new Audio('jack.wav'),
    'queen.png': new Audio('queen.wav'),
    'king.png': new Audio('king.wav'),
    'ace.png': new Audio('ace.wav'),
    'bonus.png': new Audio('bonus.wav'),
    'wild.png': new Audio('badfeeling.wav')
};
const symbolMessages = {
    '10.png': 'COME ON!',
    'jack.png': 'TIME TO KILL!',
    'queen.png': 'I got your back.',
    'king.png': 'I love you!',
    'ace.png': 'I got a bad feeling',
    'bonus.png': 'sector 9',
    'wild.png': 'AUUUUHHH'
};

// Weighted symbols
const weights = {
    '10.png': 40,
    'jack.png': 25,
    'queen.png': 15,
    'king.png': 10,
    'ace.png': 5,
    'bonus.png': 4,
    'wild.png': 1
};
const weightedSymbols = [];
for (const sym in weights) {
    for (let i = 0; i < weights[sym]; i++) {
        weightedSymbols.push(sym);
    }
}

const reels = [];
const currentSymbols = Array.from({length: rowCount},()=>Array(reelCount).fill(null));

// Initialize reels
for(let r=0;r<rowCount;r++){
    for(let c=0;c<reelCount;c++){
        const div=document.createElement('div');
        div.classList.add('reel');
        const img = weightedSymbols[Math.floor(Math.random()*weightedSymbols.length)];
        div.style.backgroundImage=`url(${img})`;
        div.dataset.symbol=img;
        reelsContainer.appendChild(div);
        reels.push(div);
        currentSymbols[r][c]=img;
    }
}

// Spin sound
const spinSound = new Audio('hulagirl.wav');
spinSound.loop = true;
let songPausedTime = 0;
const spinDurationPerReel = 4000;

// Update counters
function updateCounters(){
    if(inBonus){
        freeSpinsCounter.style.display='block';
        bonusPointsCounter.style.display='block';
        freeSpinsCounter.textContent=`Free Spins: ${freeSpins}`;
        bonusPointsCounter.textContent=`Bonus Points: ${bonusPoints}`;
    } else {
        freeSpinsCounter.style.display='none';
        bonusPointsCounter.style.display='none';
    }
}

// Define paylines for 7 reels
const paylines = [
    [0,1,2,3,4,5,6],          // Top row
    [7,8,9,10,11,12,13],      // Middle row
    [14,15,16,17,18,19,20],   // Bottom row
    [0,8,16,10,4,12,20],      // V-shape
    [14,6,16,10,4,12,0],      // Inverted V
    [0,7,16,10,18,5,20],      // Zig-zag 1
    [14,8,2,10,18,12,6],      // Zig-zag 2
    [7,1,9,10,11,5,13],       // W-shape
    [7,13,9,10,11,5,7],       // M-shape
    [0,8,2,10,18,12,20]       // Random pattern
];

// Main spin
function spin(){
    const wager = parseInt(wagerInput.value);
    if(balance < wager && freeSpins === 0){
        notificationLabel.textContent = 'Not enough credits!';
        return;
    }

    spinButton.disabled = true;
    balance -= freeSpins > 0 ? 0 : wager;
    balanceLabel.textContent = `Balance: ${balance}`;
    notificationLabel.textContent = '';
    spinAmountDisplay.textContent = '';

    spinSound.currentTime = songPausedTime;
    spinSound.play();

    let bonusTriggered = false;

    // 1 in 25 chance guaranteed bonus
    if(Math.random() < 1/25 && freeSpins === 0){
        bonusTriggered = true;
        inBonus = true;
        freeSpins = 10;
        bonusPoints = 0;

        for(let r=0;r<rowCount;r++){
            for(let c=0;c<reelCount;c++){
                const idx = r*reelCount+c;
                const sym = 'wild.png';
                currentSymbols[r][c] = sym;
                reels[idx].style.backgroundImage = `url(${sym})`;
                reels[idx].dataset.symbol = sym;
                reels[idx].style.border = '3px solid yellow';
            }
        }
        updateCounters();
    }

    let finalSymbols = [];

    if(!bonusTriggered){
        const isLosingSpin = Math.random() < 0.30; // 30% lose
        for(let r=0;r<rowCount;r++){
            for(let c=0;c<reelCount;c++){
                if(isLosingSpin){
                    let sym;
                    do { sym = weightedSymbols[Math.floor(Math.random()*weightedSymbols.length)]; }
                    while (sym === finalSymbols[r*reelCount]);
                    finalSymbols[r*reelCount+c] = sym;
                } else {
                    finalSymbols[r*reelCount+c] = weightedSymbols[Math.floor(Math.random()*weightedSymbols.length)];
                }
            }
        }
    } else {
        for(let r=0;r<rowCount;r++){
            for(let c=0;c<reelCount;c++){
                finalSymbols[r*reelCount+c] = 'wild.png';
            }
        }
    }

    // Animate reels
    for(let c=0;c<reelCount;c++){
        setTimeout(()=>{
            const startTime = Date.now();
            let speed = 50;

            function frame(){
                const elapsed = Date.now() - startTime;
                for(let r=0;r<rowCount;r++){
                    const idx = r*reelCount+c;
                    if(!bonusTriggered){
                        reels[idx].style.backgroundImage = `url(${weightedSymbols[Math.floor(Math.random()*weightedSymbols.length)]})`;
                    }
                    reels[idx].style.transform = `translateY(${Math.random()*20-10}px)`;
                    reels[idx].style.border='2px solid white';
                }
                speed *= 1.02;
                if(elapsed < spinDurationPerReel){
                    setTimeout(frame, speed);
                } else {
                    for(let r=0;r<rowCount;r++){
                        const idx=r*reelCount+c;
                        const sym = finalSymbols[idx];
                        currentSymbols[r][c] = sym;
                        reels[idx].style.backgroundImage = `url(${sym})`;
                        reels[idx].dataset.symbol = sym;
                        reels[idx].style.border='2px solid white';
                    }
                    if(c === reelCount-1){
                        const winAmount = checkWin();
                        if(freeSpins > 0 && !bonusTriggered) freeSpins--;
                        spinButton.disabled=false;

                        songPausedTime = spinSound.currentTime;
                        spinSound.pause();

                        updateCounters();
                        if(freeSpins === 0 && inBonus){
                            inBonus=false;
                            updateCounters();
                        }
                    }
                }
            }
            frame();
        }, c*200);
    }
}

// Check wins for all paylines
function checkWin(){
    const wager = parseInt(wagerInput.value);
    let messages = [];
    let winAmount = 0;

    paylines.forEach(line => {
        const symbolsInLine = line.map(idx => reels[idx].dataset.symbol);
        if(symbolsInLine.every(s => s === symbolsInLine[0])){
            const sym = symbolsInLine[0];
            const lineWin = symbolPay[sym] * wager;
            winAmount += lineWin;

            line.forEach(idx => reels[idx].style.border='3px solid red');
            messages.push(symbolMessages[sym]);
            symbolSounds[sym].currentTime = 0;
            symbolSounds[sym].play();
            if(inBonus) bonusPoints += lineWin;
        }
    });

    let uniqueMessages = [...new Set(messages)];

    balance += winAmount;
    balanceLabel.textContent = `Balance: ${balance}`;
    notificationLabel.textContent = uniqueMessages.length ? uniqueMessages.join(' | ') : 'No win this spin.';
    notificationLabel.textContent = notificationLabel.textContent.replace(/\s*\(.*?\)/g,'');
    spinAmountDisplay.textContent = winAmount ? `Won: ${winAmount}` : '';

    if(inBonus) updateCounters();
    return winAmount;
}

spinButton.addEventListener('click', spin);
updateCounters();
