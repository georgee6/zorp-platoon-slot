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
const reelCount = 3;
const rowCount = 3;

// Symbols, payouts, sounds, and custom messages
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

const reels = [];
const currentSymbols = Array.from({length: rowCount},()=>Array(reelCount).fill(null));

// Initialize reels
for(let r=0;r<rowCount;r++){
    for(let c=0;c<reelCount;c++){
        const div=document.createElement('div');
        div.classList.add('reel');
        const img = images[Math.floor(Math.random()*images.length)];
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

// Update counters for bonus
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

// Main spin function
function spin(){
    const wager=parseInt(wagerInput.value);
    if(balance<wager && freeSpins===0){
        notificationLabel.textContent='Not enough credits!';
        return;
    }

    if(freeSpins>0 && !inBonus){
        inBonus=true;
        bonusPoints=0;
        updateCounters();
    }

    spinButton.disabled=true;
    balance -= freeSpins>0 ? 0 : wager;
    balanceLabel.textContent=`Balance: ${balance}`;
    notificationLabel.textContent='';
    spinAmountDisplay.textContent='';

    spinSound.currentTime = songPausedTime;
    spinSound.play();

    let boosted = freeSpins>0;
    let finalSymbols = [];

    // Guaranteed win: randomly select a winning row
    const winningSymbol = images[Math.floor(Math.random()*images.length)];
    const winRow = Math.floor(Math.random()*rowCount);
    for(let r=0;r<rowCount;r++){
        for(let c=0;c<reelCount;c++){
            if(r===winRow){
                finalSymbols[r*reelCount+c] = winningSymbol;
            } else {
                finalSymbols[r*reelCount+c] = images[Math.floor(Math.random()*images.length)];
            }
        }
    }

    // Animate reels
    for(let c=0;c<reelCount;c++){
        setTimeout(()=>{
            const start = Date.now();
            function animateReel(){
                const elapsed = Date.now()-start;
                if(elapsed<spinDurationPerReel){
                    for(let r=0;r<rowCount;r++){
                        const idx = r*reelCount+c;
                        reels[idx].style.backgroundImage=`url(${images[Math.floor(Math.random()*images.length)]})`;
                        reels[idx].style.transform=`translateY(${Math.random()*20-10}px)`;
                        reels[idx].style.border='2px solid white';
                    }
                    requestAnimationFrame(animateReel);
                } else {
                    for(let r=0;r<rowCount;r++){
                        const idx=r*reelCount+c;
                        const sym=finalSymbols[idx];
                        currentSymbols[r][c]=sym;
                        reels[idx].style.backgroundImage=`url(${sym})`;
                        reels[idx].dataset.symbol=sym;
                        reels[idx].style.border='2px solid white';
                    }
                    if(c===reelCount-1){
                        const winAmount = checkWin(boosted);
                        freeSpins = Math.max(0, freeSpins-1);
                        spinButton.disabled=false;

                        songPausedTime = spinSound.currentTime;
                        spinSound.pause();

                        updateCounters();
                        if(freeSpins===0 && inBonus){
                            inBonus=false;
                            updateCounters();
                        }
                    }
                }
            }
            animateReel();
        },c*200);
    }
}

// Check win, play symbol audio, and show symbol-specific messages
function checkWin(boosted=false){
    const wager=parseInt(wagerInput.value);
    let messages=[];
    let winAmount=0;

    for(let r=0;r<rowCount;r++){
        const row=reels.slice(r*reelCount,(r+1)*reelCount);
        const sym=row[0].dataset.symbol;
        if(row.every(d=>d.dataset.symbol===sym)){
            const rowWin = symbolPay[sym]*wager;
            winAmount += rowWin;
            row.forEach(d=>d.style.border='3px solid red');

            // ONLY the symbol message
            messages.push(symbolMessages[sym]);

            symbolSounds[sym].currentTime=0;
            symbolSounds[sym].play();
            if(inBonus) bonusPoints += rowWin;
        }
    }

    // Diagonals
    const diag1=[reels[0],reels[4],reels[8]];
    const sym1=diag1[0].dataset.symbol;
    if(diag1.every(d=>d.dataset.symbol===sym1)){
        const diagWin=symbolPay[sym1]*wager;
        winAmount+=diagWin;
        diag1.forEach(d=>d.style.border='3px solid red');

        messages.push(symbolMessages[sym1]);
        symbolSounds[sym1].currentTime=0;
        symbolSounds[sym1].play();
        if(inBonus) bonusPoints+=diagWin;
    }

    const diag2=[reels[6],reels[4],reels[2]];
    const sym2=diag2[0].dataset.symbol;
    if(diag2.every(d=>d.dataset.symbol===sym2)){
        const diagWin=symbolPay[sym2]*wager;
        winAmount+=diagWin;
        diag2.forEach(d=>d.style.border='3px solid red');

        messages.push(symbolMessages[sym2]);
        symbolSounds[sym2].currentTime=0;
        symbolSounds[sym2].play();
        if(inBonus) bonusPoints+=diagWin;
    }

    // Remove duplicate messages
    let uniqueMessages = [...new Set(messages)];

    // 🔥 NEW: Remove anything inside parentheses, guaranteed
    uniqueMessages = uniqueMessages.map(m => m.replace(/\s*\(.*?\)/g, ''));

    balance += winAmount;
    balanceLabel.textContent=`Balance: ${balance}`;
    notificationLabel.textContent = uniqueMessages.length ? uniqueMessages.join(' | ') : 'No win this spin.';
    spinAmountDisplay.textContent=winAmount ? `Won: ${winAmount}` : '';

    if(inBonus) updateCounters();
    return winAmount;
}

spinButton.addEventListener('click', spin);
updateCounters();
