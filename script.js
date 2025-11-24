document.addEventListener('DOMContentLoaded', () => {

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

const images = ['10.png','jack.png','queen.png','king.png','ace.png','bonus.png','wild.png'];
const symbolPay = {'10.png':1,'jack.png':2,'queen.png':3,'king.png':5,'ace.png':20,'bonus.png':3,'wild.png':0};
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
const weights = {'10.png':40,'jack.png':25,'queen.png':15,'king.png':10,'ace.png':5,'bonus.png':4,'wild.png':1};
const weightedSymbols = [];
for(const s in weights){
    for(let i=0;i<weights[s];i++) weightedSymbols.push(s);
}

const reels = [];
const currentSymbols = Array.from({length: rowCount}, ()=>Array(reelCount).fill(null));

// Initialize reels
for(let r=0;r<rowCount;r++){
    for(let c=0;c<reelCount;c++){
        const div = document.createElement('div');
        div.classList.add('reel');
        const img = weightedSymbols[Math.floor(Math.random()*weightedSymbols.length)];
        div.style.backgroundImage = `url(${img})`;
        div.dataset.symbol = img;
        reelsContainer.appendChild(div);
        reels.push(div);
        currentSymbols[r][c] = img;
    }
}

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

    let bonusTriggered = false;

    if(Math.random() < 1/25 && freeSpins === 0){
        bonusTriggered = true;
        inBonus = true;
        freeSpins = 10;
        bonusPoints = 0;
        for(let r=0;r<rowCount;r++){
            for(let c=0;c<reelCount;c++){
                const idx = r*reelCount+c;
                currentSymbols[r][c] = 'wild.png';
                reels[idx].style.backgroundImage = `url(wild.png)`;
                reels[idx].dataset.symbol = 'wild.png';
                reels[idx].style.border = '3px solid yellow';
            }
        }
        updateCounters();
    }

    let finalSymbols = [];
    if(!bonusTriggered){
        const isLosingSpin = Math.random() < 0.30;
        for(let r=0;r<rowCount;r++){
            for(let c=0;c<reelCount;c++){
                finalSymbols[r*reelCount+c] = weightedSymbols[Math.floor(Math.random()*weightedSymbols.length)];
            }
        }
    }

    for(let c=0;c<reelCount;c++){
        setTimeout(()=>{
            const start = Date.now();
            const duration = 1500 + c*300;
            function animateReel(){
                const elapsed = Date.now()-start;
                if(elapsed < duration){
                    for(let r=0;r<rowCount;r++){
                        const idx = r*reelCount+c;
                        const sym = weightedSymbols[Math.floor(Math.random()*weightedSymbols.length)];
                        reels[idx].style.backgroundImage = `url(${sym})`;
                        reels[idx].style.transform = `translateY(${Math.sin(elapsed/50)*10}px)`;
                    }
                    requestAnimationFrame(animateReel);
                } else {
                    for(let r=0;r<rowCount;r++){
                        const idx = r*reelCount+c;
                        const sym = bonusTriggered ? 'wild.png' : finalSymbols[r*reelCount+c];
                        currentSymbols[r][c] = sym;
                        reels[idx].style.backgroundImage = `url(${sym})`;
                        reels[idx].dataset.symbol = sym;
                        reels[idx].style.transform = 'translateY(0)';
                        reels[idx].style.border = '2px solid white';
                    }
                    if(c === reelCount-1){
                        checkWin();
                        freeSpins = Math.max(0, freeSpins-1);
                        spinButton.disabled = false;
                        if(freeSpins === 0) inBonus = false;
                        updateCounters();
                    }
                }
            }
            animateReel();
        }, c*150);
    }
}

function checkWin(){
    const wager = parseInt(wagerInput.value);
    let messages = [];
    let winAmount = 0;

    for(let r=0;r<rowCount;r++){
        const row = reels.slice(r*reelCount,(r+1)*reelCount);
        const sym = row[0].dataset.symbol;
        if(row.every(d=>d.dataset.symbol===sym)){
            const rowWin = symbolPay[sym]*wager;
            winAmount += rowWin;
            row.forEach(d=>d.style.border='3px solid red');
            messages.push(symbolMessages[sym]);
            if(inBonus) bonusPoints += rowWin;
        }
    }

    const uniqueMessages = [...new Set(messages)].map(m=>m.replace(/\s*\(.*?\)/g,''));
    notificationLabel.textContent = uniqueMessages.length ? uniqueMessages.join(' | ') : 'No win this spin.';
    spinAmountDisplay.textContent = winAmount ? `Won: ${winAmount}` : '';
    balance += winAmount;
    balanceLabel.textContent = `Balance: ${balance}`;
}

spinButton.addEventListener('click', spin);
updateCounters();

});
