const state = {
    elements: [],
    selectedId: null,
    dragData: null,
    resizeData: null,
    nextId: 1,
    history: [],
    historyIndex: -1,
    gridEnabled: false,
    gridSize: 20
};

// DOM References
const canvas = document.getElementById('canvas');
const layersList = document.getElementById('layersList');
const propertiesContent = document.getElementById('propertiesContent');

// Initialize
init();

function init() {
    loadFromStorage();
    setupEventListeners();
    renderLayers();
    updateProperties();
}

// Event Listeners Setup
function setupEventListeners() {
    document.getElementById('addRectangle').addEventListener('click', () => addElement('rectangle'));
    document.getElementById('addText').addEventListener('click', () => addElement('text'));
    document.getElementById('saveBtn').addEventListener('click', saveToStorage);
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('exportJSON').addEventListener('click', exportJSON);
    document.getElementById('exportHTML').addEventListener('click', exportHTML);
    document.getElementById('gridToggle').addEventListener('click', toggleGrid);
    document.getElementById('duplicateBtn').addEventListener('click', duplicateSelected);

    canvas.addEventListener('click', handleCanvasClick);
    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Create Element
function addElement(type) {
    const el = {
        name: `${type === 'rectangle' ? 'Rectangle' : 'Text'} ${state.nextId}`,
        id: `el-${state.nextId++}`,
        type: type,
        x: 50,
        y: 50,
        width: type === 'rectangle' ? 150 : 200,
        height: type === 'rectangle' ? 100 : 60,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        backgroundColor: type === 'rectangle' ? '#d9d9d9' : '#000000',
        color: '#d9d9d9',
        text: type === 'text' ? 'Text' : '',
        zIndex: state.elements.length
    };

    state.elements.push(el);
    saveHistory();
    renderElement(el);
    selectElement(el.id);
    renderLayers();
}

// Render Element on Canvas
function renderElement(el) {
    let div = document.getElementById(el.id);

    if (!div) {
        div = document.createElement('div');
        div.id = el.id;
        div.className = `design-element ${el.type}`;

        // Add resize handles
        ['nw', 'ne', 'sw', 'se'].forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos}`;
            handle.dataset.position = pos;
            handle.addEventListener('mousedown', (e) => startResize(e, el.id, pos));
            div.appendChild(handle);
        });

        div.addEventListener('mousedown', (e) => {
            // Check if target or any parent is a resize handle
            const isResizeHandle = e.target.classList.contains('resize-handle') || 
                                   e.target.closest('.resize-handle');
            if (!isResizeHandle) {
                startDrag(e, el.id);
            }
        });

        canvas.appendChild(div);
    }

    // Update styles
    div.style.left = el.x + 'px';
    div.style.top = el.y + 'px';
    div.style.width = el.width + 'px';
    div.style.height = el.height + 'px';
    div.style.backgroundColor = el.backgroundColor;
    div.style.color = el.color;
    div.style.transform = `rotate(${el.rotation}deg)`;
    div.style.transform += ` scaleX(${el.scaleX || 1}) scaleY(${el.scaleY || 1})`;
    div.style.zIndex = el.zIndex;

    if (el.type === 'text') {
        // Find or create a text wrapper to avoid destroying resize handles
        let textWrapper = div.querySelector('.text-wrapper');
        if (!textWrapper) {
            textWrapper = document.createElement('div');
            textWrapper.className = 'text-wrapper';
            div.insertBefore(textWrapper, div.firstChild);
        }
        textWrapper.textContent = el.text;
    }
}

// Selection
function selectElement(id) {
    state.selectedId = id;

    document.querySelectorAll('.design-element').forEach(el => {
        el.classList.remove('selected');
    });

    const selectedEl = document.getElementById(id);
    if (selectedEl) {
        selectedEl.classList.add('selected');
    }

    renderLayers();
    updateProperties();
}

function deselectElement() {
    state.selectedId = null;
    document.querySelectorAll('.design-element').forEach(el => {
        el.classList.remove('selected');
    });
    renderLayers();
    updateProperties();
}

// Canvas Click Handler
function handleCanvasClick(e) {
    if (e.target === canvas) {
        deselectElement();
    }
}

// Drag & Drop
function startDrag(e, id) {
    e.preventDefault();
    e.stopPropagation();

    selectElement(id);
    const el = state.elements.find(e => e.id === id);
    const dragElement = document.getElementById(id);

    state.dragData = {
        id: id,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: el.x,
        elementStartY: el.y
    };

    // Add grabbing cursor
    if (dragElement) {
        dragElement.classList.add('grabbing');
    }
}

function handleMouseMove(e) {
    if (state.dragData) {
        const dx = e.clientX - state.dragData.startX;
        const dy = e.clientY - state.dragData.startY;

        const el = state.elements.find(e => e.id === state.dragData.id);
        const canvasRect = canvas.getBoundingClientRect();

        // Calculate new position with boundary constraints
        let newX = state.dragData.elementStartX + dx;
        let newY = state.dragData.elementStartY + dy;

        newX = Math.max(0, Math.min(newX, canvasRect.width - el.width));
        newY = Math.max(0, Math.min(newY, canvasRect.height - el.height));

        el.x = newX;
        el.y = newY;

        renderElement(el);
        updateProperties();
    }

    if (state.resizeData) {
        handleResize(e);
    }
}

function handleMouseUp() {
    // Remove grabbing cursor
    if (state.dragData) {
        const dragElement = document.getElementById(state.dragData.id);
        if (dragElement) {
            dragElement.classList.remove('grabbing');
        }
    }

    state.dragData = null;
    state.resizeData = null;
}

// Resize
function startResize(e, id, position) {
    e.preventDefault();
    e.stopPropagation();

    selectElement(id);
    const el = state.elements.find(e => e.id === id);

    state.resizeData = {
        id: id,
        position: position,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: el.width,
        startHeight: el.height,
        startPosX: el.x,
        startPosY: el.y
    };
}

function handleResize(e) {
    const el = state.elements.find(e => e.id === state.resizeData.id);
    const dx = e.clientX - state.resizeData.startX;
    const dy = e.clientY - state.resizeData.startY;
    const pos = state.resizeData.position;

    const minSize = 30;

    if (pos === 'se') {
        el.width = Math.max(minSize, state.resizeData.startWidth + dx);
        el.height = Math.max(minSize, state.resizeData.startHeight + dy);
    } else if (pos === 'sw') {
        const newWidth = Math.max(minSize, state.resizeData.startWidth - dx);
        el.x = state.resizeData.startPosX + (state.resizeData.startWidth - newWidth);
        el.width = newWidth;
        el.height = Math.max(minSize, state.resizeData.startHeight + dy);
    } else if (pos === 'ne') {
        el.width = Math.max(minSize, state.resizeData.startWidth + dx);
        const newHeight = Math.max(minSize, state.resizeData.startHeight - dy);
        el.y = state.resizeData.startPosY + (state.resizeData.startHeight - newHeight);
        el.height = newHeight;
    } else if (pos === 'nw') {
        const newWidth = Math.max(minSize, state.resizeData.startWidth - dx);
        const newHeight = Math.max(minSize, state.resizeData.startHeight - dy);
        el.x = state.resizeData.startPosX + (state.resizeData.startWidth - newWidth);
        el.y = state.resizeData.startPosY + (state.resizeData.startHeight - newHeight);
        el.width = newWidth;
        el.height = newHeight;
    }

    renderElement(el);
    updateProperties();
}

// Keyboard Interactions
function handleKeyboard(e) {
    // Only run if canvas is focused or if focus is not on an input element
    const activeElement = document.activeElement;
    const isFormElement = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
    const isCanvasFocused = activeElement === canvas || activeElement === document.body;
    
    if (isFormElement && activeElement !== canvas) return;

    if (!state.selectedId) return;

    const el = state.elements.find(e => e.id === state.selectedId);
    if (!el) return;

    // Ctrl+C / Cmd+C - Copy
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        localStorage.setItem('elementClipboard', JSON.stringify(el));
        return;
    }

    // Ctrl+V / Cmd+V - Paste (Duplicate)
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        duplicateSelected();
        return;
    }

    // Delete key
    if (e.key === 'Delete') {
        deleteElement(el.id);
        return;
    }

    // Arrow keys
    const step = e.shiftKey ? 10 : 5;
    const canvasRect = canvas.getBoundingClientRect();

    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            el.x = Math.max(0, el.x - step);
            break;
        case 'ArrowRight':
            e.preventDefault();
            el.x = Math.min(canvasRect.width - el.width, el.x + step);
            break;
        case 'ArrowUp':
            e.preventDefault();
            el.y = Math.max(0, el.y - step);
            break;
        case 'ArrowDown':
            e.preventDefault();
            el.y = Math.min(canvasRect.height - el.height, el.y + step);
            break;
        default:
            return;
    }

    renderElement(el);
    updateProperties();
    saveHistory();
}

// Delete Element
function deleteElement(id) {
    const index = state.elements.findIndex(e => e.id === id);
    if (index > -1) {
        state.elements.splice(index, 1);
        document.getElementById(id)?.remove();
        deselectElement();
        renderLayers();
    }
}

// Layers Panel
function renderLayers() {
    layersList.innerHTML = '';

    [...state.elements].reverse().forEach(el => {
        const item = document.createElement('div');
        item.className = `layer-item ${el.id === state.selectedId ? 'selected' : ''}`;

        item.innerHTML = `
                    <div class="layer-icon">${el.type === 'rectangle' ? '▭' : 'T'}</div>
                    <div class="layer-info">
                        <div class="layer-type">${el.name || (el.type === 'rectangle' ? 'Rectangle' : 'Text')}</div>
                        <div class="layer-details">${el.width}×${el.height}</div>
                    </div>
                    <div class="layer-actions">
                        <button class="layer-btn" title="Move Up">▲</button>
                        <button class="layer-btn" title="Move Down">▼</button>
                    </div>
                `;

        item.querySelector('.layer-info').addEventListener('click', () => selectElement(el.id));
        item.querySelector('.layer-type').addEventListener('dblclick', (e) => {
            e.stopPropagation();
            renameElement(el.id, item.querySelector('.layer-type'));
        });

        const [upBtn, downBtn] = item.querySelectorAll('.layer-btn');
        upBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moveLayer(el.id, 1);
        });
        downBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moveLayer(el.id, -1);
        });

        layersList.appendChild(item);
    });
}

function moveLayer(id, direction) {
    const index = state.elements.findIndex(e => e.id === id);
    const newIndex = index + direction;

    if (newIndex >= 0 && newIndex < state.elements.length) {
        [state.elements[index], state.elements[newIndex]] = [state.elements[newIndex], state.elements[index]];

        // Update z-index
        state.elements.forEach((el, i) => {
            el.zIndex = i;
            renderElement(el);
        });

        renderLayers();
    }
}

// Properties Panel
function updateProperties() {
    if (!state.selectedId) {
        propertiesContent.innerHTML = '<div class="no-selection">Select an element to edit properties</div>';
        return;
    }

    const el = state.elements.find(e => e.id === state.selectedId);
    if (!el) return;

    propertiesContent.innerHTML = `
                <div class="property-group">
                    <div class="property-group-title">Alignment</div>
                    <div class="alignment-buttons">
                        <div class="vertical">
                            <button class="align-btn" title="Align Left">⬅</button>
                            <button class="align-btn" title="Align Center H">↔</button>
                            <button class="align-btn" title="Align Right">➡</button>
                        </div>
                        <div class="horizontal">
                            <button class="align-btn" title="Align Top">⬆</button>
                            <button class="align-btn" title="Align Center V">↕</button>
                            <button class="align-btn" title="Align Bottom">⬇</button>
                        </div>
                    </div>
                </div>

                <div class="property-group">
                    <div class="property-group-title">Position</div>
                    <div class="property-row-group">
                        <div class="property-row-inline">
                            <label class="property-label-compact">X</label>
                            <input type="number" class="property-input-compact" id="prop-x" value="${Math.round(el.x)}">
                        </div>
                        <div class="property-row-inline">
                            <label class="property-label-compact">Y</label>
                            <input type="number" class="property-input-compact" id="prop-y" value="${Math.round(el.y)}">
                        </div>
                    </div>
                </div>
                
                <div class="property-group">
                    <div class="property-group-title">Dimensions</div>
                    <div class="property-row-group">
                        <div class="property-row-inline">
                            <label class="property-label-compact">W</label>
                            <input type="number" class="property-input-compact" id="prop-width" value="${Math.round(el.width)}">
                        </div>
                        <div class="property-row-inline">
                            <label class="property-label-compact">H</label>
                            <input type="number" class="property-input-compact" id="prop-height" value="${Math.round(el.height)}">
                        </div>
                    </div>
                </div>
                
                <div class="property-group">
                    <div class="property-group-title">Rotation</div>
                    <div class="rotation-container">
                        <div class="property-row-inline">
                            <span class="property-label-compact">↻</span>
                            <input type="number" class="property-input-compact" id="prop-rotation" value="${el.rotation}" min="0" max="360">
                        </div>
                        <div class="horizontal">
                            <button class="align-btn" id="rotate-90" title="Rotate 90°">◇</button>
                            <button class="align-btn" id="flip-h" title="Flip Horizontal">⇄</button>
                            <button class="align-btn" id="flip-v" title="Flip Vertical">⇅</button>
                        </div>
                    </div>
                </div>
                
                <div class="property-group">
                    <div class="property-group-title">Background Color</div>
                    <div class="property-row">
                        <div class="color-input-wrapper">
                            <input type="text" class="property-input color-input" id="prop-bg" value="${el.backgroundColor}">
                            <input type="color" class="color-preview" id="prop-bg-picker" value="${el.backgroundColor}">
                        </div>
                    </div>
                </div>
                
                ${el.type === 'text' ? `
                    <div class="property-group">
                        <div class="property-group-title">Text Content</div>
                        <div class="property-row">
                            <label class="property-label">Text</label>
                            <textarea class="property-textarea" id="prop-text">${el.text}</textarea>
                        </div>
                        <div class="property-row">
                            <label class="property-label">Color</label>
                            <div class="color-input-wrapper">
                                <input type="text" class="property-input color-input" id="prop-color" value="${el.color}">
                                <input type="color" class="color-preview" id="prop-color-picker" value="${el.color}">
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="delete">
                    <button class="delete-btn" id="deleteElementBtn">Delete Element</button>
                </div>
            `;

    // Attach event listeners
    document.getElementById('prop-x').addEventListener('input', (e) => {
        el.x = parseInt(e.target.value) || 0;
        renderElement(el);
        saveHistory();
    });

    document.getElementById('prop-y').addEventListener('input', (e) => {
        el.y = parseInt(e.target.value) || 0;
        renderElement(el);
        saveHistory();
    });

    document.getElementById('prop-width').addEventListener('input', (e) => {
        el.width = Math.max(30, parseInt(e.target.value) || 30);
        renderElement(el);
        saveHistory();
    });

    document.getElementById('prop-height').addEventListener('input', (e) => {
        el.height = Math.max(30, parseInt(e.target.value) || 30);
        renderElement(el);
        saveHistory();
    });

    document.getElementById('prop-rotation').addEventListener('input', (e) => {
        el.rotation = parseInt(e.target.value) || 0;
        if (el.rotation >= 360) el.rotation = el.rotation % 360;
        if (el.rotation < 0) el.rotation = 360 + (el.rotation % 360);
        renderElement(el);
        updateProperties();
        saveHistory();
    });

    // Rotation buttons
    const rotate90 = document.getElementById('rotate-90');
    const flipH = document.getElementById('flip-h');
    const flipV = document.getElementById('flip-v');

    if (rotate90) {
        rotate90.addEventListener('click', (e) => {
            e.preventDefault();
            el.rotation = (el.rotation - 90 + 360) % 360;
            renderElement(el);
            updateProperties();
            saveHistory();
        });
    }

    if (flipH) {
        flipH.addEventListener('click', (e) => {
            e.preventDefault();
            el.scaleX *= -1;
            renderElement(el);
            updateProperties();
            saveHistory();
        });
    }

    if (flipV) {
        flipV.addEventListener('click', (e) => {
            e.preventDefault();
            el.scaleY *= -1;
            renderElement(el);
            updateProperties();
            saveHistory();
        });
    }

    document.getElementById('prop-bg').addEventListener('input', (e) => {
        el.backgroundColor = e.target.value;
        document.getElementById('prop-bg-picker').value = e.target.value;
        renderElement(el);
        saveHistory();
    });

    document.getElementById('prop-bg-picker').addEventListener('input', (e) => {
        el.backgroundColor = e.target.value;
        document.getElementById('prop-bg').value = e.target.value;
        renderElement(el);
        saveHistory();
    });

    // Alignment buttons
    const alignBtns = document.querySelectorAll('.align-btn');
    alignBtns[0].addEventListener('click', () => alignElements('left'));
    alignBtns[1].addEventListener('click', () => alignElements('centerH'));
    alignBtns[2].addEventListener('click', () => alignElements('right'));
    alignBtns[3].addEventListener('click', () => alignElements('top'));
    alignBtns[4].addEventListener('click', () => alignElements('centerV'));
    alignBtns[5].addEventListener('click', () => alignElements('bottom'));

    if (el.type === 'text') {
        document.getElementById('prop-text').addEventListener('input', (e) => {
            el.text = e.target.value;
            renderElement(el);
            saveHistory();
        });

        document.getElementById('prop-color').addEventListener('input', (e) => {
            el.color = e.target.value;
            document.getElementById('prop-color-picker').value = e.target.value;
            renderElement(el);
            saveHistory();
        });

        document.getElementById('prop-color-picker').addEventListener('input', (e) => {
            el.color = e.target.value;
            document.getElementById('prop-color').value = e.target.value;
            renderElement(el);
            saveHistory();
        });
    }

    // Delete button
    document.getElementById('deleteElementBtn').addEventListener('click', () => {
        deleteElement(el.id);
    });
}

// Alignment Functions
function alignElements(direction) {
    if (!state.selectedId) return;

    const el = state.elements.find(e => e.id === state.selectedId);
    if (!el) return;

    const canvasRect = canvas.getBoundingClientRect();

    switch (direction) {
        case 'left':
            el.x = 0;
            break;
        case 'centerH':
            el.x = (canvasRect.width - el.width) / 2;
            break;
        case 'right':
            el.x = canvasRect.width - el.width;
            break;
        case 'top':
            el.y = 0;
            break;
        case 'centerV':
            el.y = (canvasRect.height - el.height) / 2;
            break;
        case 'bottom':
            el.y = canvasRect.height - el.height;
            break;
    }

    renderElement(el);
    updateProperties();
    saveHistory();
}

// Grid and Canvas Enhancement
function toggleGrid() {
    state.gridEnabled = !state.gridEnabled;
    const gridToggle = document.getElementById('gridToggle');

    if (state.gridEnabled) {
        canvas.style.backgroundImage = `linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent),
                                       linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)`;
        canvas.style.backgroundSize = `${state.gridSize}px ${state.gridSize}px`;
        gridToggle.classList.add('active');
    } else {
        canvas.style.backgroundImage = 'none';
        gridToggle.classList.remove('active');
    }
}

// Duplicate Element
function duplicateSelected() {
    if (!state.selectedId) return;

    const original = state.elements.find(e => e.id === state.selectedId);
    if (!original) return;

    const duplicate = {
        ...original,
        id: `el-${state.nextId++}`,
        x: original.x + 20,
        y: original.y + 20,
        name: `${original.name} copy`
    };

    state.elements.push(duplicate);
    saveHistory();
    renderElement(duplicate);
    selectElement(duplicate.id);
    renderLayers();
}

// Rename Element
function renameElement(id, element) {
    const el = state.elements.find(e => e.id === id);
    if (!el) return;

    const currentName = el.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'layer-rename-input';

    element.replaceWith(input);
    input.focus();
    input.select();

    function saveName() {
        el.name = input.value || currentName;
        renderLayers();
    }

    input.addEventListener('blur', saveName);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveName();
        if (e.key === 'Escape') renderLayers();
    });
}

// History Management
function saveHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(JSON.parse(JSON.stringify(state.elements)));
    state.historyIndex++;
}

function redrawCanvas() {
    canvas.innerHTML = '';
    state.elements.forEach(el => renderElement(el));
    renderLayers();
    updateProperties();
}

// Persistence
function saveToStorage() {
    localStorage.setItem('visualEditor', JSON.stringify({
        elements: state.elements,
        nextId: state.nextId
    }));
    alert('Design saved successfully!');
}

function loadFromStorage() {
    const saved = localStorage.getItem('visualEditor');
    if (saved) {
        const data = JSON.parse(saved);
        state.elements = data.elements || [];
        state.nextId = data.nextId || 1;

        state.elements.forEach(el => renderElement(el));
    }
}
function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
        state.elements = [];
        state.selectedId = null;
        state.nextId = 1;
        canvas.innerHTML = '';
        renderLayers();
        updateProperties();
        localStorage.removeItem('visualEditor');
    }
}

// Export
function exportJSON() {
    const dataStr = JSON.stringify(state.elements, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.json';
    a.click();
    URL.revokeObjectURL(url);
}

function exportHTML() {
    let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Exported Design</title>
            <style>
                body, html { 
                    margin: 0; 
                    padding: 0; 
                    background: #1e1e1e;
                }
                .design-element {
                    position: absolute;
                    box-sizing: border-box;
                    user-select: none;
                }
            </style>
        </head>
        <body>
    `;
    state.elements.forEach(el => {
        htmlContent += `<div class="design-element" style="
            left: ${el.x}px;
            top: ${el.y}px;
            width: ${el.width}px;
            height: ${el.height}px;
            background-color: ${el.backgroundColor};
            color: ${el.color};
            transform: rotate(${el.rotation}deg);
            z-index: ${el.zIndex};
        ">${el.type === 'text' ? el.text : ''}</div>\n`;
    });
    htmlContent += `
        </body>
        </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.html';
    a.click();
    URL.revokeObjectURL(url);
}

function deleteElement(id) {
    const index = state.elements.findIndex(e => e.id === id);
    if (index > -1) {
        state.elements.splice(index, 1);
        document.getElementById(id)?.remove();
        deselectElement();
        renderLayers();
    }
}