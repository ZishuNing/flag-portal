document.addEventListener('DOMContentLoaded', () => {
    const selectionScreen = document.getElementById('selection-screen');
    const coloringScreen = document.getElementById('coloring-screen');
    const flagGrid = document.getElementById('flag-grid');
    const flagContainer = document.getElementById('flag-container');
    const colorPicker = document.getElementById('color-picker');
    const hexInput = document.getElementById('hex-input');
    const resetButton = document.getElementById('reset-button');
    const exportButton = document.getElementById('export-button');
    const backButton = document.getElementById('back-button');

    let selectedColor = colorPicker.value;

    const errorModal = document.getElementById('error-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOk = document.getElementById('modal-ok');

    function showErrorModal(message) {
        const box = errorModal ? errorModal.querySelector('.gov-error-box') : null;
        if (box && message) box.textContent = message;
        if (errorModal) errorModal.classList.remove('hidden');
    }
    function hideErrorModal() {
        if (errorModal) errorModal.classList.add('hidden');
    }
    if (modalClose) modalClose.addEventListener('click', hideErrorModal);
    if (modalOk) modalOk.addEventListener('click', hideErrorModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideErrorModal(); });

    fetch('https://flagcdn.com/en/codes.json')
        .then(response => response.json())
        .then(countries => {
            for (const code in countries) {
                const flag = { name: countries[code], code: code };
                if (flag.name === 'China') {
                    flag.name = 'Mainland China';
                }
                const thumbnail = document.createElement('div');
                thumbnail.classList.add('flag-thumbnail');
                thumbnail.innerHTML = `<img src="https://flagcdn.com/w160/${flag.code}.png" alt="${flag.name}" width="100%"><div class="flag-name">${flag.name}</div>`;
                thumbnail.addEventListener('click', () => {
                    const previouslySelected = document.querySelector('.flag-thumbnail.selected');
                    if (previouslySelected) {
                        previouslySelected.classList.remove('selected');
                    }
                    thumbnail.classList.add('selected');
                    selectFlag(flag);
                });
                flagGrid.appendChild(thumbnail);
            }
        });

    let currentFlagCode;

    function selectFlag(flag) {
        selectionScreen.classList.add('hidden');
        coloringScreen.classList.remove('hidden');
        currentFlagCode = flag.code;
        loadFlag(currentFlagCode);
    }

    function addColoringListeners(element) {
        if (element.tagName === 'path' || element.tagName === 'rect' || element.tagName === 'circle' || element.tagName === 'polygon' || element.tagName === 'ellipse' || element.tagName === 'line' || element.tagName === 'polyline') {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                element.style.fill = selectedColor;
                if (element.style.stroke || element.getAttribute('stroke')) {
                    element.style.stroke = selectedColor;
                }
            });
        }
        
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            addColoringListeners(children[i]);
        }
    }

    function loadFlag(countryCode) {
        flagContainer.classList.add('hidden');
        fetch(`https://flagcdn.com/${countryCode}.svg`)
            .then(response => response.text())
            .then(svgData => {
                flagContainer.innerHTML = ''; 
                flagContainer.innerHTML = svgData;
                const svg = flagContainer.querySelector('svg');

                const wAttr = svg.getAttribute('width');
                const hAttr = svg.getAttribute('height');
                let vb = svg.getAttribute('viewBox');

                if (!vb) {
                    let vbW = wAttr ? parseFloat(wAttr) : null;
                    let vbH = hAttr ? parseFloat(hAttr) : null;

                    if (!vbW || !vbH) {
                        try {
                            const bbox = svg.getBBox();
                            vbW = bbox.width || 800;
                            vbH = bbox.height || 600;
                            vb = `${bbox.x || 0} ${bbox.y || 0} ${vbW} ${vbH}`;
                        } catch (_) {
                            vbW = 800;
                            vbH = 600;
                            vb = `0 0 ${vbW} ${vbH}`;
                        }
                    } else {
                        vb = `0 0 ${vbW} ${vbH}`;
                    }
                    svg.setAttribute('viewBox', vb);
                }

                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                flagContainer.style.width = 'min(90vw, 1200px)';
                flagContainer.style.height = 'min(70vh, 800px)';

                addColoringListeners(svg);
                flagContainer.classList.remove('hidden'); 
            });
    }

    colorPicker.addEventListener('input', (e) => {
        selectedColor = e.target.value;
        hexInput.value = selectedColor;
    });

    hexInput.addEventListener('input', (e) => {
        selectedColor = e.target.value;
        colorPicker.value = selectedColor;
    });

    resetButton.addEventListener('click', () => {
        if (currentFlagCode) {
            loadFlag(currentFlagCode);
        }
    });

    exportButton.addEventListener('click', async () => {
        showErrorModal('Export service is temporarily unavailable. Please try again later.');
    });
    backButton.addEventListener('click', () => {
        coloringScreen.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
    });

});
