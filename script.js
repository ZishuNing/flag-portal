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

    // Error modal elements
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

    // Fetch flag data from API
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
                    // Remove 'selected' class from previously selected flag
                    const previouslySelected = document.querySelector('.flag-thumbnail.selected');
                    if (previouslySelected) {
                        previouslySelected.classList.remove('selected');
                    }
                    // Add 'selected' class to the clicked flag
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
        // Add click listener to the element itself if it's colorable
        if (element.tagName === 'path' || element.tagName === 'rect' || element.tagName === 'circle' || element.tagName === 'polygon' || element.tagName === 'ellipse' || element.tagName === 'line' || element.tagName === 'polyline') {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                element.style.fill = selectedColor;
                // Also set stroke color for elements that might only have stroke
                if (element.style.stroke || element.getAttribute('stroke')) {
                    element.style.stroke = selectedColor;
                }
            });
        }
        
        // Recursively process all child elements
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            addColoringListeners(children[i]);
        }
    }

    function loadFlag(countryCode) {
        flagContainer.classList.add('hidden'); // Hide the container before loading new flag
        fetch(`https://flagcdn.com/${countryCode}.svg`)
            .then(response => response.text())
            .then(svgData => {
                flagContainer.innerHTML = ''; // Clear previous SVG content
                flagContainer.innerHTML = svgData;
                const svg = flagContainer.querySelector('svg');

                // 解析并确保存在 viewBox，以便按比例缩放
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

                // 移除固定尺寸，按容器等比缩放，避免裁剪
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.style.width = '100%';
                svg.style.height = '100%';
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                // 统一画布区域（响应式），确保所有国旗完整显示在范围内
                flagContainer.style.width = 'min(90vw, 1200px)';
                flagContainer.style.height = 'min(70vh, 800px)';

                addColoringListeners(svg);
                flagContainer.classList.remove('hidden'); // Show the container after new flag is loaded
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
        // Show retro-styled error modal instead of exporting
        showErrorModal('Export service is temporarily unavailable. Please try again later.');
    });
    backButton.addEventListener('click', () => {
        coloringScreen.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
    });

});
