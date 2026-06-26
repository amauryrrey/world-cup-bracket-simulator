const fifaGroups = {
    A: ['🇲🇽 México', '🇿🇦 Sudáfrica', '🇰🇷 Corea del Sur', '🇨🇿 Chequia'],
    B: ['🇨🇦 Canadá', '🇧🇦 Bosnia y Herzegovina', '🇶🇦 Catar', '🇨🇭 Suiza'],
    C: ['🇧🇷 Brasil', '🇲🇦 Marruecos', '🇭🇹 Haití', '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia'],
    D: ['🇺🇸 Estados Unidos', '🇵🇾 Paraguay', '🇦🇺 Australia', '🇹🇷 Turquía'],
    E: ['🇩🇪 Alemania', '🇨🇼 Curazao', '🇨🇮 Costa de Marfil', '🇪🇨 Ecuador'],
    F: ['🇳🇱 Países Bajos', '🇯🇵 Japón', '🇸🇪 Suecia', '🇹🇳 Túnez'],
    G: ['🇧🇪 Bélgica', '🇪🇬 Egipto', '🇮🇷 Irán', '🇳🇿 Nueva Zelanda'],
    H: ['🇪🇸 España', '🇨🇻 Cabo Verde', '🇸🇦 Arabia Saudita', '🇺🇾 Uruguay'],
    I: ['🇫🇷 Francia', '🇸🇳 Senegal', '🇮🇶 Irak', '🇳🇴 Noruega'],
    J: ['🇦🇷 Argentina', '🇩🇿 Argelia', '🇦🇹 Austria', '🇯🇴 Jordania'],
    K: ['🇵🇹 Portugal', '🇨🇩 RD del Congo', '🇺🇿 Uzbekistán', '🇨🇴 Colombia'],
    L: ['🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra', '🇭🇷 Croacia', '🇬🇭 Ghana', '🇵🇦 Panamá']
};

const matchIndices = [[0,1], [2,3], [0,2], [1,3], [0,3], [1,2]];

const predefinedScores = {
    A: { 0: [2, 0], 1: [2, 1], 2: [1, 0], 3: [1, 1], 4: [3, 0], 5:[1, 0] },
    B: { 0: [1, 1], 1: [1, 1], 2: [6, 0], 3: [1, 4], 4: [1, 2], 5:[3, 1] },
    C: { 0: [1, 1], 1: [0, 1], 2: [3, 0], 3: [1, 0], 4: [3, 0], 5:[4, 2] },
    D: { 0: [4, 1], 1: [2, 0], 2: [2, 0], 3: [1, 0],},
    E: { 0: [7, 1], 1: [1, 0], 2: [2, 1], 3: [0, 0], 4: [1, 2], 5:[0, 2] },
    F: { 0: [2, 2], 1: [5, 1], 2: [5, 1], 3: [4, 0], 4: [3, 1], 5:[1, 1] },
    G: { 0: [1, 1], 1: [2, 2], 2: [0, 0], 3: [3, 1] },
    H: { 0: [0, 0], 1: [1, 1], 2: [4, 0], 3: [2, 2] },
    I: { 0: [3, 1], 1: [1, 4], 2: [3, 0], 3: [2, 3] },
    J: { 0: [3, 0], 1: [3, 1], 2: [2, 0] ,3: [2, 1] },
    K: { 0: [1, 1], 1: [1, 3], 2: [5, 0], 3: [0, 1] },
    L: { 0: [4, 2], 1: [1, 0], 2: [0, 0], 3: [1, 0] }
};

let stats = {};
// Cargamos los picks guardados del bracket en caso de que existan
let knockoutPicks = JSON.parse(localStorage.getItem('worldCup2026Picks')) || {}; 

function buildGroupsHTML() {
    const container = document.getElementById('groups-container');
    let html = '';

    // Cargamos los scores guardados por el usuario desde LocalStorage
    let savedScores = JSON.parse(localStorage.getItem('worldCup2026Scores')) || {};

    for (let group in fifaGroups) {
        let teams = fifaGroups[group];
        html += `<div class="group-card" id="card-${group}"><h3>Grupo ${group}</h3><div class="matches">`;
        
        matchIndices.forEach((match, index) => {
            let t1 = teams[match[0]];
            let t2 = teams[match[1]];
            let id1 = `match_${group}_${index}_1`;
            let id2 = `match_${group}_${index}_2`;

            let val1 = '', val2 = '', readonlyAttr = '';

            // 1. Prioridad: Resultados predefinidos oficiales
            if (predefinedScores[group] && predefinedScores[group][index]) {
                val1 = predefinedScores[group][index][0];
                val2 = predefinedScores[group][index][1];
                readonlyAttr = 'readonly';
            } 
            // 2. Prioridad: Resultados guardados por el usuario
            else if (savedScores[group] && savedScores[group][index]) {
                val1 = savedScores[group][index][0];
                val2 = savedScores[group][index][1];
            }
            
            html += `<div class="match">
                        <span>${t1}</span>
                        <div class="scoreboard-inputs">
                            <input type="number" min="0" id="${id1}" value="${val1}" ${readonlyAttr} oninput="calculate()"> - 
                            <input type="number" min="0" id="${id2}" value="${val2}" ${readonlyAttr} oninput="calculate()">
                        </div>
                        <span>${t2}</span>
                    </div>`;
        });

        html += `</div><table class="standings" id="table-${group}">
                     <thead><tr><th>Eq</th><th>PTS</th><th>DG</th><th>GF</th></tr></thead>
                     <tbody></tbody></table></div>`;
    }
    container.innerHTML = html;
}

function calculate() {
    stats = {};
    for (let group in fifaGroups) {
        fifaGroups[group].forEach(team => { stats[team] = { pts: 0, gd: 0, gf: 0, group: group }; });
    }

    let userScoresToSave = {};
    const inputs = document.querySelectorAll('input[type="number"]');

    for (let i = 0; i < inputs.length; i += 2) {
        if (inputs[i].value !== "" && inputs[i+1].value !== "") {
            let s1 = parseInt(inputs[i].value), s2 = parseInt(inputs[i+1].value);
            
            let matchDiv = inputs[i].closest('.match');
            let t1 = matchDiv.children[0].innerText;
            let t2 = matchDiv.children[2].innerText;

            // Actualizamos la tabla
            stats[t1].gf += s1; stats[t2].gf += s2;
            stats[t1].gd += (s1 - s2); stats[t2].gd += (s2 - s1);
            
            if (s1 > s2) stats[t1].pts += 3;
            else if (s2 > s1) stats[t2].pts += 3;
            else { stats[t1].pts += 1; stats[t2].pts += 1; }

            // Guardado en LocalStorage
            let idParts = inputs[i].id.split('_'); // ej: ["match", "A", "0", "1"]
            let group = idParts[1];
            let index = idParts[2];

            // Solo guardamos si NO está en predefinedScores
            if (!(predefinedScores[group] && predefinedScores[group][index])) {
                if (!userScoresToSave[group]) userScoresToSave[group] = {};
                userScoresToSave[group][index] = [s1, s2];
            }
        }
    }

    // Guardamos los resultados del usuario
    localStorage.setItem('worldCup2026Scores', JSON.stringify(userScoresToSave));

    updateStandingsAndBracket();
}

function updateStandingsAndBracket() {
    let thirdPlaces = [];
    let standings = { 1: {}, 2: {}, 3: {} };

    for (let group in fifaGroups) {
        let sortedTeams = fifaGroups[group].sort((a, b) => {
            if (stats[b].pts !== stats[a].pts) return stats[b].pts - stats[a].pts;
            if (stats[b].gd !== stats[a].gd) return stats[b].gd - stats[a].gd;
            return stats[b].gf - stats[a].gf;
        });

        standings[1][group] = sortedTeams[0];
        standings[2][group] = sortedTeams[1];
        standings[3][group] = sortedTeams[2];
        thirdPlaces.push(sortedTeams[2]);

        const tbody = document.querySelector(`#table-${group} tbody`);
        tbody.innerHTML = '';
        sortedTeams.forEach((team, index) => {
            let rowClass = index < 2 ? 'qualified' : ''; 
            tbody.innerHTML += `<tr class="${rowClass}" data-team="${team}">
                <td>${team}</td><td><strong>${stats[team].pts}</strong></td>
                <td>${stats[team].gd > 0 ? '+'+stats[team].gd : stats[team].gd}</td><td>${stats[team].gf}</td>
            </tr>`;
        });
    }

    thirdPlaces.sort((a, b) => {
        if (stats[b].pts !== stats[a].pts) return stats[b].pts - stats[a].pts;
        if (stats[b].gd !== stats[a].gd) return stats[b].gd - stats[a].gd;
        return stats[b].gf - stats[a].gf;
    });

    const bestEightThirds = thirdPlaces.slice(0, 8);
    bestEightThirds.forEach(team => {
        let tr = document.querySelector(`tr[data-team="${team}"]`);
        if(tr) tr.classList.add('qualified-third');
    });

    const thirdsTbody = document.querySelector('#thirds-table tbody');
    thirdsTbody.innerHTML = '';
    thirdPlaces.forEach((team, index) => {
        let rowClass = index < 8 ? 'qualified-third' : 'eliminated';
        thirdsTbody.innerHTML += `<tr class="${rowClass}">
            <td><strong>${index + 1}</strong></td><td>${stats[team].group}</td><td>${team}</td>
            <td><strong>${stats[team].pts}</strong></td>
            <td>${stats[team].gd > 0 ? '+'+stats[team].gd : stats[team].gd}</td><td>${stats[team].gf}</td>
        </tr>`;
    });

    drawBracket(standings, bestEightThirds);
}

window.makePick = function(matchId, selectedTeam) {
    if (!selectedTeam || selectedTeam === 'Por definir' || selectedTeam === '---') return;
    knockoutPicks[matchId] = selectedTeam;
    
    // También guardamos el bracket en el local storage
    localStorage.setItem('worldCup2026Picks', JSON.stringify(knockoutPicks));
    
    updateStandingsAndBracket(); 
}

function drawBracket(standings, bestEightThirds) {
    const container = document.getElementById('bracket-container');
    container.innerHTML = '';

    if (bestEightThirds.length < 8) return; 

    let lookupKey = bestEightThirds.map(team => stats[team].group).sort().join("");
    let combinacionActual = typeof fifaThirdsLookup !== 'undefined' ? fifaThirdsLookup[lookupKey] : null;

    const getTercero = (llaveHost) => {
        if (!combinacionActual || !combinacionActual[llaveHost]) return 'Por definir';
        let grupoTercero = combinacionActual[llaveHost].charAt(1);
        return standings[3][grupoTercero] || 'Por definir';
    };

    const officialCruces = [
        { t1: standings[1]['E'], t2: getTercero('1E') },
        { t1: standings[1]['I'], t2: getTercero('1I') },
        { t1: standings[2]['A'], t2: standings[2]['B'] },
        { t1: standings[1]['F'], t2: standings[2]['C'] },
        { t1: standings[2]['K'], t2: standings[2]['L'] },
        { t1: standings[1]['H'], t2: standings[2]['J'] },
        { t1: standings[1]['D'], t2: getTercero('1D') },
        { t1: standings[1]['G'], t2: getTercero('1G') },
        { t1: standings[1]['C'], t2: standings[2]['F'] },
        { t1: standings[2]['E'], t2: standings[2]['I'] },
        { t1: standings[1]['A'], t2: getTercero('1A') },
        { t1: standings[1]['L'], t2: getTercero('1L') },
        { t1: standings[1]['J'], t2: standings[2]['H'] },
        { t1: standings[2]['D'], t2: standings[2]['G'] },
        { t1: standings[1]['B'], t2: getTercero('1B') },
        { t1: standings[1]['K'], t2: getTercero('1K') }
    ];

    const roundsConfig = [
        { id: 'r32', title: '16avos de Final', matchCount: 16 },
        { id: 'r16', title: 'Octavos de Final', matchCount: 8 },
        { id: 'r8', title: 'Cuartos de Final', matchCount: 4 },
        { id: 'r4', title: 'Semifinales', matchCount: 2 },
        { id: 'r2', title: 'Gran Final', matchCount: 1 }
    ];

    let bracketGrid = [];
    let firstRound = [];
    
    officialCruces.forEach((cruce, i) => {
        firstRound.push({ id: `r32-m${i}`, t1: cruce.t1 || 'Por definir', t2: cruce.t2 || 'Por definir' });
    });
    bracketGrid.push(firstRound);

    for (let r = 1; r < roundsConfig.length; r++) {
        let nextRoundMatches = [];
        let prevRound = bracketGrid[r-1];
        
        for (let m = 0; m < roundsConfig[r].matchCount; m++) {
            let parentMatchA = prevRound[m * 2].id;
            let parentMatchB = prevRound[m * 2 + 1].id;

            let team1 = knockoutPicks[parentMatchA] || '';
            let team2 = knockoutPicks[parentMatchB] || '';
            let currentMatchId = `${roundsConfig[r].id}-m${m}`;

            if (knockoutPicks[currentMatchId] && 
                knockoutPicks[currentMatchId] !== team1 && 
                knockoutPicks[currentMatchId] !== team2) {
                delete knockoutPicks[currentMatchId];
            }

            nextRoundMatches.push({ id: currentMatchId, t1: team1, t2: team2 });
        }
        bracketGrid.push(nextRoundMatches);
    }

    let html = '<div class="bracket-layout">';
    
    bracketGrid.forEach((roundMatches, rIdx) => {
        html += `<div class="round-col"><h3>${roundsConfig[rIdx].title}</h3>`;
        
        roundMatches.forEach(m => {
            let isEmptyT1 = !m.t1 || m.t1 === 'Por definir' || m.t1 === '---';
            let isEmptyT2 = !m.t2 || m.t2 === 'Por definir' || m.t2 === '---';
            
            let pickedT1 = knockoutPicks[m.id] === m.t1 && !isEmptyT1;
            let pickedT2 = knockoutPicks[m.id] === m.t2 && !isEmptyT2;

            html += `
                <div class="matchup">
                    <div class="team-slot ${isEmptyT1 ? 'empty' : 'clickable'} ${pickedT1 ? 'picked' : ''}" 
                         onclick="makePick('${m.id}', '${m.t1}')">${m.t1 || '---'}</div>
                    <div class="team-slot ${isEmptyT2 ? 'empty' : 'clickable'} ${pickedT2 ? 'picked' : ''}" 
                         onclick="makePick('${m.id}', '${m.t2}')">${m.t2 || '---'}</div>
                </div>
            `;
        });
        
        html += `</div>`;
    });

    html += '</div>';
    container.innerHTML = html;
}

buildGroupsHTML();
calculate(); 
