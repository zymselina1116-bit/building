// ===================================
// EMERGENT AXIS - Interactive Prototype
// ===================================

// Canvas Setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Colors
const BG_COLOR = '#121212';
const LINE_COLOR = '#E7E0C9';

// State
let phase = 1; // 1: Choose style, 2: Generated line, 3: Editing, 4: Plane structure, 5: Altitude selection, 6: Final
let selectedStyle = null; // 'sharp', 'straight', 'flow'
let selectedAltitude = null; // 'linear', 'curved', 'wavy', 'spiked'
let nodes = []; // Control points for the line
let draggedNode = null;
let inactivityTimer = null;

// Constants
const MAX_NODES = 8;
const NODE_RADIUS = 6;
const HOVER_DISTANCE = 15;

// Style options for Phase 1
const styleOptions = [
    {
        name: 'Sharp',
        type: 'sharp',
        x: canvas.width / 2 - 200,
        y: canvas.height / 2,
        width: 120,
        height: 80
    },
    {
        name: 'Straight',
        type: 'straight',
        x: canvas.width / 2 - 60,
        y: canvas.height / 2,
        width: 120,
        height: 80
    },
    {
        name: 'Flow',
        type: 'flow',
        x: canvas.width / 2 + 80,
        y: canvas.height / 2,
        width: 120,
        height: 80
    }
];

// Altitude options for Phase 5
const altitudeOptions = [
    {
        name: 'Linear Altitude',
        type: 'linear',
        x: canvas.width / 2 - 240,
        y: canvas.height / 2,
        width: 140,
        height: 80
    },
    {
        name: 'Curved Altitude',
        type: 'curved',
        x: canvas.width / 2 - 80,
        y: canvas.height / 2,
        width: 140,
        height: 80
    },
    {
        name: 'Wavy Altitude',
        type: 'wavy',
        x: canvas.width / 2 + 80,
        y: canvas.height / 2,
        width: 140,
        height: 80
    },
    {
        name: 'Spiked Altitude',
        type: 'spiked',
        x: canvas.width / 2 + 240,
        y: canvas.height / 2,
        width: 140,
        height: 80
    }
];

// ===================================
// PHASE 1: CHOOSE LINE STYLE
// ===================================

function drawPhase1() {
    clearCanvas();

    styleOptions.forEach(option => {
        // Draw option box
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeRect(option.x - option.width / 2, option.y - option.height / 2, option.width, option.height);

        // Draw label
        ctx.fillStyle = LINE_COLOR;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(option.name, option.x, option.y - option.height / 2 - 15);

        // Draw visual sample
        drawStyleSample(option);
    });
}

function drawStyleSample(option) {
    const cx = option.x;
    const cy = option.y;

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (option.type === 'sharp') {
        // Angular zig-zag
        ctx.moveTo(cx - 30, cy);
        ctx.lineTo(cx - 15, cy - 20);
        ctx.lineTo(cx, cy + 10);
        ctx.lineTo(cx + 15, cy - 15);
        ctx.lineTo(cx + 30, cy + 5);
    } else if (option.type === 'straight') {
        // Straight horizontal line
        ctx.moveTo(cx - 35, cy);
        ctx.lineTo(cx + 35, cy);
    } else if (option.type === 'flow') {
        // Smooth curve
        ctx.moveTo(cx - 35, cy);
        ctx.bezierCurveTo(cx - 15, cy - 25, cx + 15, cy + 20, cx + 35, cy);
    }

    ctx.stroke();
}

function handlePhase1Click(x, y) {
    for (let option of styleOptions) {
        const left = option.x - option.width / 2;
        const right = option.x + option.width / 2;
        const top = option.y - option.height / 2;
        const bottom = option.y + option.height / 2;

        if (x >= left && x <= right && y >= top && y <= bottom) {
            selectedStyle = option.type;
            phase = 2;
            generateLine();
            return;
        }
    }
}

// ===================================
// PHASE 2: GENERATE LINE
// ===================================

function generateLine() {
    nodes = [];

    const margin = 100;
    const startX = margin;
    const endX = canvas.width - margin;
    const centerY = canvas.height / 2;

    if (selectedStyle === 'sharp') {
        // Generate 3-5 points with sharp angles
        const numPoints = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numPoints; i++) {
            const x = startX + (endX - startX) * (i / (numPoints - 1));
            const y = centerY + (Math.random() - 0.5) * 200;
            nodes.push({ x, y });
        }
    } else if (selectedStyle === 'straight') {
        // Generate 2-3 points in nearly straight line
        const numPoints = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numPoints; i++) {
            const x = startX + (endX - startX) * (i / (numPoints - 1));
            const y = centerY + (Math.random() - 0.5) * 40;
            nodes.push({ x, y });
        }
    } else if (selectedStyle === 'flow') {
        // Generate smooth flowing curve with 4-5 points
        const numPoints = 4 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numPoints; i++) {
            const x = startX + (endX - startX) * (i / (numPoints - 1));
            const y = centerY + Math.sin(i * 0.8) * 100 + (Math.random() - 0.5) * 50;
            nodes.push({ x, y });
        }
    }

    phase = 3;
    draw();
}

// ===================================
// PHASE 3: LINE EDITING
// ===================================

function drawPhase3() {
    clearCanvas();

    // Draw the line
    drawLine();

    // Draw nodes
    nodes.forEach((node, index) => {
        ctx.fillStyle = LINE_COLOR;
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw instruction
    ctx.fillStyle = LINE_COLOR;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Click on the line to add nodes • Drag nodes to reshape', 20, 30);
    ctx.fillText(`Nodes: ${nodes.length}/${MAX_NODES}`, 20, 50);
}

function drawLine() {
    if (nodes.length < 2) return;

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (selectedStyle === 'flow') {
        // Draw smooth curve using quadratic curves
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);

        for (let i = 1; i < nodes.length - 1; i++) {
            const xc = (nodes[i].x + nodes[i + 1].x) / 2;
            const yc = (nodes[i].y + nodes[i + 1].y) / 2;
            ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, xc, yc);
        }

        ctx.lineTo(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
        ctx.stroke();
    } else {
        // Draw polyline (for sharp and straight)
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);

        for (let i = 1; i < nodes.length; i++) {
            ctx.lineTo(nodes[i].x, nodes[i].y);
        }

        ctx.stroke();
    }
}

function handlePhase3Click(x, y) {
    // Check if clicking on existing node
    for (let i = 0; i < nodes.length; i++) {
        const dx = x - nodes[i].x;
        const dy = y - nodes[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < NODE_RADIUS + 5) {
            draggedNode = i;
            return;
        }
    }

    // Check if clicking near the line to add a new node
    if (nodes.length >= MAX_NODES) return;

    const nearestPoint = findNearestPointOnLine(x, y);
    if (nearestPoint && nearestPoint.distance < HOVER_DISTANCE) {
        // Insert new node at the appropriate position
        nodes.splice(nearestPoint.segmentIndex + 1, 0, { x, y });
        resetInactivityTimer();
        draw();
    }
}

function findNearestPointOnLine(x, y) {
    let minDistance = Infinity;
    let nearestSegment = -1;

    for (let i = 0; i < nodes.length - 1; i++) {
        const distance = distanceToSegment(x, y, nodes[i], nodes[i + 1]);
        if (distance < minDistance) {
            minDistance = distance;
            nearestSegment = i;
        }
    }

    if (minDistance < HOVER_DISTANCE) {
        return { distance: minDistance, segmentIndex: nearestSegment };
    }

    return null;
}

function distanceToSegment(px, py, p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
        return Math.sqrt((px - p1.x) ** 2 + (py - p1.y) ** 2);
    }

    let t = ((px - p1.x) * dx + (py - p1.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const closestX = p1.x + t * dx;
    const closestY = p1.y + t * dy;

    return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
}

// ===================================
// PHASE 4: GENERATE PLANE STRUCTURE
// ===================================

function generatePlaneStructure() {
    phase = 4;
    draw();

    // Auto-transition to altitude selection after 1.5 seconds
    setTimeout(() => {
        phase = 5;
        draw();
    }, 1500);
}

function drawPhase4() {
    clearCanvas();

    // Draw the original line
    drawLine();

    // Generate parallel strips offset from the line
    const numStrips = 6;
    const stripSpacing = 30;

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;

    for (let i = 1; i <= numStrips / 2; i++) {
        // Offset upward
        drawOffsetLine(i * stripSpacing);
        // Offset downward
        drawOffsetLine(-i * stripSpacing);
    }

    ctx.globalAlpha = 1;

    // Draw original line on top
    ctx.lineWidth = 2;
    drawLine();

    // Draw nodes
    nodes.forEach((node) => {
        ctx.fillStyle = LINE_COLOR;
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw instruction
    ctx.fillStyle = LINE_COLOR;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Plane structure generated', 20, 30);
}

function drawOffsetLine(offset) {
    if (nodes.length < 2) return;

    ctx.beginPath();

    // Calculate offset points perpendicular to each segment
    const offsetNodes = nodes.map((node, i) => {
        if (i === 0) {
            // First point: use direction from first segment
            const dx = nodes[1].x - nodes[0].x;
            const dy = nodes[1].y - nodes[0].y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / len;
            const perpY = dx / len;
            return {
                x: node.x + perpX * offset,
                y: node.y + perpY * offset
            };
        } else if (i === nodes.length - 1) {
            // Last point: use direction from last segment
            const dx = nodes[i].x - nodes[i - 1].x;
            const dy = nodes[i].y - nodes[i - 1].y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / len;
            const perpY = dx / len;
            return {
                x: node.x + perpX * offset,
                y: node.y + perpY * offset
            };
        } else {
            // Middle points: average perpendicular from both adjacent segments
            const dx1 = node.x - nodes[i - 1].x;
            const dy1 = node.y - nodes[i - 1].y;
            const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            const perp1X = -dy1 / len1;
            const perp1Y = dx1 / len1;

            const dx2 = nodes[i + 1].x - node.x;
            const dy2 = nodes[i + 1].y - node.y;
            const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            const perp2X = -dy2 / len2;
            const perp2Y = dx2 / len2;

            const avgPerpX = (perp1X + perp2X) / 2;
            const avgPerpY = (perp1Y + perp2Y) / 2;
            const avgLen = Math.sqrt(avgPerpX * avgPerpX + avgPerpY * avgPerpY);

            return {
                x: node.x + (avgPerpX / avgLen) * offset,
                y: node.y + (avgPerpY / avgLen) * offset
            };
        }
    });

    // Draw the offset line
    if (selectedStyle === 'flow') {
        ctx.moveTo(offsetNodes[0].x, offsetNodes[0].y);

        for (let i = 1; i < offsetNodes.length - 1; i++) {
            const xc = (offsetNodes[i].x + offsetNodes[i + 1].x) / 2;
            const yc = (offsetNodes[i].y + offsetNodes[i + 1].y) / 2;
            ctx.quadraticCurveTo(offsetNodes[i].x, offsetNodes[i].y, xc, yc);
        }

        ctx.lineTo(offsetNodes[offsetNodes.length - 1].x, offsetNodes[offsetNodes.length - 1].y);
    } else {
        ctx.moveTo(offsetNodes[0].x, offsetNodes[0].y);

        for (let i = 1; i < offsetNodes.length; i++) {
            ctx.lineTo(offsetNodes[i].x, offsetNodes[i].y);
        }
    }

    ctx.stroke();
}

// ===================================
// PHASE 5: ALTITUDE SHAPE SELECTION
// ===================================

function drawPhase5() {
    clearCanvas();

    altitudeOptions.forEach(option => {
        // Draw option box
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeRect(option.x - option.width / 2, option.y - option.height / 2, option.width, option.height);

        // Draw label
        ctx.fillStyle = LINE_COLOR;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(option.name, option.x, option.y - option.height / 2 - 15);

        // Draw visual sample
        drawAltitudeSample(option);
    });

    // Draw instruction at top
    ctx.fillStyle = LINE_COLOR;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Choose Altitude Shape', canvas.width / 2, 60);
}

function drawAltitudeSample(option) {
    const cx = option.x;
    const cy = option.y;

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (option.type === 'linear') {
        // Straight rising diagonal line
        ctx.moveTo(cx - 30, cy + 15);
        ctx.lineTo(cx + 30, cy - 15);
    } else if (option.type === 'curved') {
        // Smooth arc curve
        ctx.moveTo(cx - 30, cy + 10);
        ctx.bezierCurveTo(cx - 10, cy + 10, cx - 10, cy - 20, cx + 30, cy - 20);
    } else if (option.type === 'wavy') {
        // Sine wave pattern
        ctx.moveTo(cx - 35, cy);
        for (let i = 0; i <= 20; i++) {
            const x = cx - 35 + i * 3.5;
            const y = cy + Math.sin(i * 0.5) * 15;
            ctx.lineTo(x, y);
        }
    } else if (option.type === 'spiked') {
        // Sharp jagged zig-zag
        ctx.moveTo(cx - 30, cy + 10);
        ctx.lineTo(cx - 20, cy - 15);
        ctx.lineTo(cx - 10, cy + 5);
        ctx.lineTo(cx, cy - 20);
        ctx.lineTo(cx + 10, cy);
        ctx.lineTo(cx + 20, cy - 15);
        ctx.lineTo(cx + 30, cy + 10);
    }

    ctx.stroke();
}

function handlePhase5Click(x, y) {
    for (let option of altitudeOptions) {
        const left = option.x - option.width / 2;
        const right = option.x + option.width / 2;
        const top = option.y - option.height / 2;
        const bottom = option.y + option.height / 2;

        if (x >= left && x <= right && y >= top && y <= bottom) {
            selectedAltitude = option.type;
            phase = 6;
            finalizeAltitudeSelection();
            return;
        }
    }
}

// ===================================
// PHASE 6: FINALIZE ALTITUDE
// ===================================

function finalizeAltitudeSelection() {
    console.log("ALTITUDE SHAPE SELECTED:", selectedAltitude);

    // Placeholder for future 3D extrusion or height logic
    // This is where advanced city-generation will be added later

    draw();
}

function drawPhase6() {
    clearCanvas();

    // For now, just show confirmation message
    ctx.fillStyle = LINE_COLOR;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Altitude Shape: ' + selectedAltitude.toUpperCase(), canvas.width / 2, canvas.height / 2);
    ctx.font = '12px sans-serif';
    ctx.fillText('(3D extrusion will be added here)', canvas.width / 2, canvas.height / 2 + 30);
}

// ===================================
// MOUSE EVENT HANDLERS
// ===================================

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (phase === 1) {
        handlePhase1Click(x, y);
    } else if (phase === 3) {
        handlePhase3Click(x, y);
    } else if (phase === 5) {
        handlePhase5Click(x, y);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (phase === 3 && draggedNode !== null) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        nodes[draggedNode].x = x;
        nodes[draggedNode].y = y;

        resetInactivityTimer();
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    draggedNode = null;
});

// ===================================
// INACTIVITY TIMER FOR AUTO-TRANSITION
// ===================================

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    if (phase === 3) {
        inactivityTimer = setTimeout(() => {
            generatePlaneStructure();
        }, 2000);
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function clearCanvas() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    if (phase === 1) {
        drawPhase1();
    } else if (phase === 3) {
        drawPhase3();
    } else if (phase === 4) {
        drawPhase4();
    } else if (phase === 5) {
        drawPhase5();
    } else if (phase === 6) {
        drawPhase6();
    }
}

// ===================================
// WINDOW RESIZE
// ===================================

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (phase === 1) {
        // Recalculate style option positions
        styleOptions[0].x = canvas.width / 2 - 200;
        styleOptions[0].y = canvas.height / 2;
        styleOptions[1].x = canvas.width / 2 - 60;
        styleOptions[1].y = canvas.height / 2;
        styleOptions[2].x = canvas.width / 2 + 80;
        styleOptions[2].y = canvas.height / 2;
    } else if (phase === 5) {
        // Recalculate altitude option positions
        altitudeOptions[0].x = canvas.width / 2 - 240;
        altitudeOptions[0].y = canvas.height / 2;
        altitudeOptions[1].x = canvas.width / 2 - 80;
        altitudeOptions[1].y = canvas.height / 2;
        altitudeOptions[2].x = canvas.width / 2 + 80;
        altitudeOptions[2].y = canvas.height / 2;
        altitudeOptions[3].x = canvas.width / 2 + 240;
        altitudeOptions[3].y = canvas.height / 2;
    }

    draw();
});

// ===================================
// INITIALIZATION
// ===================================

draw();
