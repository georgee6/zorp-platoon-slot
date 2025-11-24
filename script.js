

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

// Base URLs for images and audio
const baseImageURL = 'https://raw.githubusercontent.com/georgee6/zorp-platoon-slot/main/';
const baseAudioURL = 'https://raw.githubusercontent.com/georgee6/zorp-platoon-slot/main/';

// Symbols, payouts, sounds, and messages
const images = [
    baseImageURL + '10.png',
    baseImageURL + 'jack.png',
    baseImageURL + 'queen.png',
    baseImageURL + 'king.png',
    baseImageURL + 'ace.png',
    baseImageURL + 'bonus.png',
    baseImageURL + 'wild.png'
];

const symbolPay = {
    [baseImageURL + '10.png']: 1,
    [baseImageURL + 'jack.png']: 2,
    [baseImageURL + 'queen.png']: 3,
    [baseImageURL + 'king.png']: 5,
    [baseImageURL + 'ace.png']: 20,
    [baseImageURL + 'bonus.png']: 3,
    [baseImageURL + 'wild.png']: 0
};

const symbolSounds = {
    [baseImageURL + '10.png']: new Audio(baseAudioURL + '10.wav'),
    [baseImageURL + 'jack.png']: new Audio(baseAudioURL + 'jack.wav'),
    [baseImageURL + 'queen.png']: new Audio(baseAudioURL + 'queen.wav'),
    [baseImageURL + 'king.png']: new Audio(baseAudioURL + 'king.wav'),
    [baseImageURL + 'ace.png']: new Audio(baseAudioURL + 'ace.wav'),
    [baseImageURL + 'bonus.png']: new Audio(baseAudioURL + 'bonus.wav'),
    [baseImageURL + 'wild.png']: new Audio(baseAudioURL + 'badfeeling.wav')
};

const symbolMessages = {
    [baseImageURL + '10.png']: 'COME ON!',
    [baseImageURL + 'jack.png']: 'TIME TO KILL!',
    [baseImageURL + 'queen.png']: 'I got your back.',
    [baseImageURL + 'king.png']: 'I love you!',
    [baseImageURL + 'ace.png']: 'I got a bad feeling',
    [baseImageURL + 'bonus.png']: 'sector 9',
    [baseImageURL + 'wild.png']: 'AUUUUHHH'
};

// Initialize reels
const reels = [];
const currentSymbols = Array.from({length: rowCount}, () => Array(reelCount).fill(null));

for(let r = 0; r < rowCount; r++){
    for(let c = 0; c < reelCount; c++){
        const div = document.createElement('div');
        div.classList.add('reel');
        const img = images[Math.floor(Math.random()*images.length)];
        div.style.backgroundImage = `url(${img})`;
        div.dataset.symbol = img;
        reelsContainer.appendChild(div);
        reels.push(div);
        currentSymbols[r][c] = img;
    }
}

// Spin sound
const spinSound = new Audio(baseAudioURL + 'hulagirl.wav');
spinSound.loop = true;
let songPausedTime = 0;
const spinDurationPerReel = 4000;

// Update counters
function updateCounters(){
    if(inBonus){
        freeSpinsCounter.style.display = 'block';
        bonusPointsCounter.style.display = 'block';
        freeSpinsCounter.textContent = `Free Spins: ${freeSpins}`;
        bonusPointsCounter.textContent = `Bonus Points: ${bonusPoints}`;
    } else {
        freeSpinsCounter.style.display = 'none';
        bonusPointsCounter.style.display = 'none';
    }
}

// Main spin function
function spin(){
    const wager = parseInt(wagerInput.value) || 0;
    if(balance < wager && freeSpins === 0){
        notificationLabel.textContent = 'Not enough credits!';
        return;
    }

    if(freeSpins > 0 && !inBonus){
        inBonus = true;
        bonusPoints = 0;
        updateCounters();
    }

    spinButton.disabled = true;
    balance -= freeSpins > 0 ? 0 : wager;
    balanceLabel.textContent = `Balance: ${balance}`;
    notificationLabel.textContent = '';
    spinAmountDisplay.textContent = '';

    spinSound.currentTime = songPausedTime;
    spinSound.play();

    let boosted = freeSpins > 0;
    let finalSymbols = [];

    const winningSymbol = images[Math.floor(Math.random()*images.length)];
    const winRow = Math.floor(Math.random()*rowCount);

    for(let r = 0; r < rowCount; r++){
        for(let c = 0; c < reelCount; c++){
            finalSymbols[r*reelCount + c] = r === winRow ? winningSymbol : images[Math.floor(Math.random()*images.length)];
        }
    }

    for(let c = 0; c < reelCount; c++){
        setTimeout(() => {
            const start = Date.now();
            function animateReel(){
                const elapsed = Date.now() - start;
                if(elapsed < spinDurationPerReel){
                    for(let r = 0; r < rowCount; r++){
                        const idx = r*reelCount + c;
                        reels[idx].style.backgroundImage = `url(${images[Math.floor(Math.random()*images.length)]})`;
                        reels[idx].style.transform = `translateY(${Math.random()*20-10}px)`;
                        reels[idx].style.border = '2px solid white';
                    }
                    requestAnimationFrame(animateReel);
                } else {
                    for(let r = 0; r < rowCount; r++){
                        const idx = r*reelCount + c;
                        const sym = finalSymbols[idx];
                        currentSymbols[r][c] = sym;
                        reels[idx].style.backgroundImage = `url(${sym})`;
                        reels[idx].dataset.symbol = sym;
                        reels[idx].style.border = '2px solid white';
                    }
                    if(c === reelCount - 1){
                        const winAmount = checkWin(boosted);
                        freeSpins = Math.max(0, freeSpins - 1);
                        spinButton.disabled = false;

                        songPausedTime = spinSound.currentTime;
                        spinSound.pause();

                        updateCounters();
                        if(freeSpins === 0 && inBonus){
                            inBonus = false;
                            updateCounters();
                        }
                    }
                }
            }
            animateReel();
        }, c*200);
    }
}

// Check wins
function checkWin(boosted=false){
    const wager = parseInt(wagerInput.value) || 0;
    let messages = [];
    let winAmount = 0;

    for(let r = 0; r < rowCount; r++){
        const row = reels.slice(r*reelCount, (r+1)*reelCount);
        const sym = row[0].dataset.symbol;
        if(row.every(d => d.dataset.symbol === sym)){
            const rowWin = symbolPay[sym]*wager;
            winAmount += rowWin;
            row.forEach(d => d.style.border = '3px solid red');
            messages.push(`${symbolMessages[sym]} (Row ${r+1} wins ${rowWin})`);
            symbolSounds[sym].currentTime = 0;
            symbolSounds[sym].play();
            if(inBonus) bonusPoints += rowWin;
        }
    }

    // Diagonal wins
    const diag1 = [reels[0], reels[4], reels[8]];
    const sym1 = diag1[0].dataset.symbol;
    if(diag1.every(d => d.dataset.symbol === sym1)){
        const diagWin = symbolPay[sym1]*wager;
        winAmount += diagWin;
        diag1.forEach(d => d.style.border='3px solid red');
        messages.push(`${symbolMessages[sym1]} (Diagonal TL-BR wins ${diagWin})`);
        symbolSounds[sym1].currentTime=0;
        symbolSounds[sym1].play();
        if(inBonus) bonusPoints += diagWin;
    }

    const diag2 = [reels[6], reels[4], reels[2]];
    const sym2 = diag2[0].dataset.symbol;
    if(diag2.every(d => d.dataset.symbol === sym2)){
        const diagWin = symbolPay[sym2]*wager;
        winAmount += diagWin;
        diag2.forEach(d => d.style.border='3px solid red');
        messages.push(`${symbolMessages[sym2]} (Diagonal BL-TR wins ${diagWin})`);
        symbolSounds[sym2].currentTime=0;
        symbolSounds[sym2].play();
        if(inBonus) bonusPoints += diagWin;
    }

    balance += winAmount;
    balanceLabel.textContent = `Balance: ${balance}`;
    notificationLabel.textContent = messages.length ? messages.join(' | ') : 'No win this spin.';
    spinAmountDisplay.textContent = winAmount ? `Won: ${winAmount}` : '';

    if(inBonus) updateCounters();
    return winAmount;
}

spinButton.addEventListener('click', spin);
updateCounters();


---

✅ What changed:

1. All image paths use baseImageURL pointing to raw GitHub URLs.


2. All audio paths use baseAudioURL pointing to raw GitHub URLs.


3. Symbols, payouts, sounds, and messages all reference the full URLs so Android browsers will load them correctly.


4. No need to move files locally—just open your index.html and it works.




---

If you want, I can also update your CSS background to use a GitHub raw URL so the full game displays perfectly with the background image on Android.

Do you want me to do that?        bonusPointsCounter.style.display='none';
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
                    // Set final symbols
                    for(let r=0;r<rowCount;r++){
                        const idx=r*reelCount+c;
                        const sym=finalSymbols[idx];
                        currentSymbols[r][c]=sym;
                        reels[idx].style.backgroundImage=`url(${sym})`;
                        reels[idx].dataset.symbol=sym;
                        reels[idx].style.border='2px solid white';
                    }
                    if(c===reelCount-1){
                        // Check wins
                        const winAmount = checkWin(boosted);
                        freeSpins = Math.max(0, freeSpins-1);
                        spinButton.disabled=false;

                        // Pause spin sound at current time
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

            // Custom symbol message
            messages.push(`${symbolMessages[sym]} (Row ${r+1} wins ${rowWin})`);

            // Play symbol audio
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
        messages.push(`${symbolMessages[sym1]} (Diagonal TL-BR wins ${diagWin})`);
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
        messages.push(`${symbolMessages[sym2]} (Diagonal BL-TR wins ${diagWin})`);
        symbolSounds[sym2].currentTime=0;
        symbolSounds[sym2].play();
        if(inBonus) bonusPoints+=diagWin;
    }

    balance += winAmount;
    balanceLabel.textContent=`Balance: ${balance}`;
    notificationLabel.textContent=messages.length ? messages.join(' | ') : 'No win this spin.';
    spinAmountDisplay.textContent=winAmount ? `Won: ${winAmount}` : '';

    if(inBonus) updateCounters();
    return winAmount;
}

spinButton.addEventListener('click', spin);
updateCounters();


