import { POWERUP_DURATION } from './constants.js';
import { supabase } from './supabaseClient.js';

export function updateComboUI(combo, comboElement) {
    if (combo > 1) {
        comboElement.innerText = `x${combo}`;
        comboElement.classList.remove('hidden');
        comboElement.classList.add('pulse');
        setTimeout(() => comboElement.classList.remove('pulse'), 100);
    } else {
        comboElement.classList.add('hidden');
    }
}

let notificationTimeout;
export function showNotification(text) {
    const notifyElem = document.getElementById('notification');
    if (!notifyElem) return;
    notifyElem.innerText = text;
    notifyElem.classList.remove('hidden');
    notifyElem.style.opacity = '1';

    if (notificationTimeout) clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(() => {
        notifyElem.style.opacity = '0';
        setTimeout(() => notifyElem.classList.add('hidden'), 500);
    }, 2000);
}

export function drawHUD(ctx, canvas, multishotCount, multishotTimer, shieldTimer, currentMaxShieldDuration, scale = 1) {
    // HUD scaling factor for Canvas elements (different from gameplay scale to keep them slightly larger/usable)
    const hudScale = Math.max(0.6, scale);

    // Multishot HUD
    if (multishotTimer > 0) {
        ctx.save();
        const centerX = canvas.width / 2 - (40 * hudScale);
        const centerY = canvas.height - (40 * hudScale);
        const radius = 25 * hudScale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.lineWidth = 4 * hudScale;
        ctx.stroke();

        const progress = multishotTimer / POWERUP_DURATION;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 4 * hudScale;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.fillStyle = '#a855f7';
        ctx.font = `bold ${12 * hudScale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x${multishotCount}`, centerX, centerY);
        ctx.restore();
    }

    // Shield HUD
    if (shieldTimer > 0) {
        ctx.save();
        const centerX = canvas.width / 2 + (40 * hudScale);
        const centerY = canvas.height - (40 * hudScale);
        const radius = 25 * hudScale;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
        ctx.lineWidth = 4 * hudScale;
        ctx.stroke();

        const progress = Math.min(1, shieldTimer / currentMaxShieldDuration);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4 * hudScale;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.font = `bold ${12 * hudScale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SHLD', centerX, centerY);
        ctx.restore();
    }
}

export async function fetchGlobalScores() {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching global scores:', error);
        return [];
    }
    return data;
}

export async function getPlayerRank(score) {
    if (score <= 0) return null;
    const { count, error } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .gte('score', score);

    if (error) {
        console.error('Error fetching player rank:', error);
        return null;
    }
    return count;
}

export async function qualifiesForLeaderboard(currentScore) {
    if (currentScore <= 0) return false;
    const scores = await fetchGlobalScores();
    if (scores.length < 10) return true;
    return currentScore > scores[scores.length - 1].score;
}

export async function displayLeaderboard(scoreList, currentPlayerScore = null, currentPlayerName = null) {
    const rankDisplay = document.getElementById('personal-rank-display');
    rankDisplay && rankDisplay.classList.add('hidden');

    // Show skeleton placeholders while loading
    scoreList.innerHTML = Array(10).fill(0).map(() => `
        <li class="loading-item">
            <div class="skeleton skeleton-name"></div>
            <div class="skeleton skeleton-score"></div>
        </li>
    `).join('');

    const leaderboard = await fetchGlobalScores();
    scoreList.innerHTML = '';

    if (leaderboard.length === 0) {
        scoreList.innerHTML = '<li>NO SCORES RECORDED.</li>';
        return;
    }

    let highlighted = false;
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');

        // Highlight if it's the current player's score and name
        if (!highlighted && currentPlayerName && entry.name === currentPlayerName && entry.score === currentPlayerScore) {
            li.classList.add('new-entry-highlight');
            highlighted = true;
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${index + 1}. ${entry.name}`;

        const scoreSpan = document.createElement('span');
        scoreSpan.textContent = entry.score.toLocaleString();

        li.appendChild(nameSpan);
        li.appendChild(scoreSpan);
        scoreList.appendChild(li);
    });

    // Display personal rank in separate container if score is provided and not in Top 10
    if (currentPlayerScore !== null && rankDisplay) {
        const rank = await getPlayerRank(currentPlayerScore);
        if (rank > 10) {
            rankDisplay.classList.remove('hidden');
            rankDisplay.innerHTML = `
                <div class="rank-info">
                    <span class="rank-label">YOUR GLOBAL RANK:</span>
                    <span class="rank-value">#${rank}</span>
                    <span class="rank-score">(${currentPlayerScore.toLocaleString()})</span>
                </div>
            `;
        }
    }
}
