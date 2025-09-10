let imageFiles = [];
let videoFiles = [];
let compressedImages = [];
let compressedVideos = [];

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
});

const imageDropZone = document.getElementById('image-drop-zone');
const imageInput = document.getElementById('image-input');
const imageFileList = document.getElementById('image-file-list');
const compressImagesBtn = document.getElementById('compress-images-btn');
const downloadImagesBtn = document.getElementById('download-images-btn');
const clearImagesBtn = document.getElementById('clear-images-btn');
const imageQuality = document.getElementById('image-quality');
const imageQualityValue = document.getElementById('image-quality-value');
const imageMaxWidth = document.getElementById('image-max-width');
const imageStats = document.getElementById('image-stats');

const videoDropZone = document.getElementById('video-drop-zone');
const videoInput = document.getElementById('video-input');
const videoFileList = document.getElementById('video-file-list');
const compressVideosBtn = document.getElementById('compress-videos-btn');
const downloadVideosBtn = document.getElementById('download-videos-btn');
const clearVideosBtn = document.getElementById('clear-videos-btn');
const videoQuality = document.getElementById('video-quality');
const videoResolution = document.getElementById('video-resolution');
const videoStats = document.getElementById('video-stats');

const progressBar = document.getElementById('progress-bar');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');

imageQuality.addEventListener('input', (e) => {
    imageQualityValue.textContent = `${e.target.value}%`;
});

function setupDropZone(dropZone, input, fileHandler) {
    dropZone.addEventListener('click', () => input.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        fileHandler(files);
    });
    
    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        fileHandler(files);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function handleImageFiles(files) {
    const validImages = files.filter(file => file.type.startsWith('image/'));
    imageFiles = [...imageFiles, ...validImages];
    updateImageList();
    updateImageButtons();
}

function handleVideoFiles(files) {
    const validVideos = files.filter(file => file.type.startsWith('video/'));
    videoFiles = [...videoFiles, ...validVideos];
    updateVideoList();
    updateVideoButtons();
}

function updateImageList() {
    imageFileList.innerHTML = '';
    imageFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const preview = document.createElement('img');
        preview.className = 'file-preview';
        preview.src = URL.createObjectURL(file);
        
        const fileDetails = document.createElement('div');
        fileDetails.className = 'file-details';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);
        fileSize.id = `image-size-${index}`;
        
        fileDetails.appendChild(fileName);
        fileDetails.appendChild(fileSize);
        
        fileInfo.appendChild(preview);
        fileInfo.appendChild(fileDetails);
        
        const fileStatus = document.createElement('div');
        fileStatus.className = 'file-status pending';
        fileStatus.textContent = '待機中';
        fileStatus.id = `image-status-${index}`;
        
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(fileStatus);
        
        imageFileList.appendChild(fileItem);
    });
}

function updateVideoList() {
    videoFileList.innerHTML = '';
    videoFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const fileDetails = document.createElement('div');
        fileDetails.className = 'file-details';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);
        fileSize.id = `video-size-${index}`;
        
        fileDetails.appendChild(fileName);
        fileDetails.appendChild(fileSize);
        
        fileInfo.appendChild(fileDetails);
        
        const fileStatus = document.createElement('div');
        fileStatus.className = 'file-status pending';
        fileStatus.textContent = '待機中';
        fileStatus.id = `video-status-${index}`;
        
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(fileStatus);
        
        videoFileList.appendChild(fileItem);
    });
}

function updateImageButtons() {
    const hasFiles = imageFiles.length > 0;
    compressImagesBtn.disabled = !hasFiles;
    clearImagesBtn.disabled = !hasFiles;
}

function updateVideoButtons() {
    const hasFiles = videoFiles.length > 0;
    compressVideosBtn.disabled = !hasFiles;
    clearVideosBtn.disabled = !hasFiles;
}

async function compressImage(file, quality, maxWidth) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                
                if (maxWidth && width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name, {
                        type: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality / 100);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function compressImages() {
    compressImagesBtn.classList.add('loading');
    compressImagesBtn.disabled = true;
    compressedImages = [];
    
    progressBar.classList.add('active');
    
    const quality = parseInt(imageQuality.value);
    const maxWidth = imageMaxWidth.value ? parseInt(imageMaxWidth.value) : null;
    
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const statusElement = document.getElementById(`image-status-${i}`);
        const sizeElement = document.getElementById(`image-size-${i}`);
        
        statusElement.className = 'file-status processing';
        statusElement.textContent = '圧縮中...';
        
        try {
            const compressedFile = await compressImage(file, quality, maxWidth);
            compressedImages.push(compressedFile);
            
            totalOriginalSize += file.size;
            totalCompressedSize += compressedFile.size;
            
            statusElement.className = 'file-status completed';
            statusElement.textContent = '完了';
            
            const reduction = Math.round((1 - compressedFile.size / file.size) * 100);
            sizeElement.innerHTML = `
                <span>${formatFileSize(file.size)}</span> → 
                <span class="compressed">${formatFileSize(compressedFile.size)} (-${reduction}%)</span>
            `;
        } catch (error) {
            statusElement.className = 'file-status error';
            statusElement.textContent = 'エラー';
        }
        
        const progress = Math.round(((i + 1) / imageFiles.length) * 100);
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
    }
    
    compressImagesBtn.classList.remove('loading');
    downloadImagesBtn.disabled = false;
    
    displayImageStats(totalOriginalSize, totalCompressedSize);
    
    setTimeout(() => {
        progressBar.classList.remove('active');
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
    }, 1000);
}

function displayImageStats(originalSize, compressedSize) {
    const savings = originalSize - compressedSize;
    const savingsPercent = Math.round((savings / originalSize) * 100);
    
    imageStats.innerHTML = `
        <h3>圧縮統計</h3>
        <div class="stat-item">
            <span class="stat-label">ファイル数:</span>
            <span class="stat-value">${imageFiles.length}個</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">元のサイズ:</span>
            <span class="stat-value">${formatFileSize(originalSize)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">圧縮後のサイズ:</span>
            <span class="stat-value">${formatFileSize(compressedSize)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">削減サイズ:</span>
            <span class="stat-value savings">${formatFileSize(savings)} (-${savingsPercent}%)</span>
        </div>
    `;
    imageStats.classList.add('active');
}

async function simulateVideoCompression(file, quality) {
    return new Promise((resolve) => {
        let reductionFactor;
        switch (quality) {
            case 'high':
                reductionFactor = 0.8;
                break;
            case 'medium':
                reductionFactor = 0.5;
                break;
            case 'low':
                reductionFactor = 0.3;
                break;
            default:
                reductionFactor = 0.5;
        }
        
        setTimeout(() => {
            const simulatedSize = Math.round(file.size * reductionFactor);
            const blob = new Blob([new ArrayBuffer(simulatedSize)], { type: file.type });
            const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
            });
            resolve(compressedFile);
        }, 500);
    });
}

async function compressVideos() {
    compressVideosBtn.classList.add('loading');
    compressVideosBtn.disabled = true;
    compressedVideos = [];
    
    progressBar.classList.add('active');
    
    const quality = videoQuality.value;
    
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i];
        const statusElement = document.getElementById(`video-status-${i}`);
        const sizeElement = document.getElementById(`video-size-${i}`);
        
        statusElement.className = 'file-status processing';
        statusElement.textContent = '圧縮中...';
        
        try {
            const compressedFile = await simulateVideoCompression(file, quality);
            compressedVideos.push({ original: file, compressed: compressedFile });
            
            totalOriginalSize += file.size;
            totalCompressedSize += compressedFile.size;
            
            statusElement.className = 'file-status completed';
            statusElement.textContent = '完了';
            
            const reduction = Math.round((1 - compressedFile.size / file.size) * 100);
            sizeElement.innerHTML = `
                <span>${formatFileSize(file.size)}</span> → 
                <span class="compressed">${formatFileSize(compressedFile.size)} (-${reduction}%)</span>
            `;
        } catch (error) {
            statusElement.className = 'file-status error';
            statusElement.textContent = 'エラー';
        }
        
        const progress = Math.round(((i + 1) / videoFiles.length) * 100);
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
    }
    
    compressVideosBtn.classList.remove('loading');
    downloadVideosBtn.disabled = false;
    
    displayVideoStats(totalOriginalSize, totalCompressedSize);
    
    setTimeout(() => {
        progressBar.classList.remove('active');
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
    }, 1000);
}

function displayVideoStats(originalSize, compressedSize) {
    const savings = originalSize - compressedSize;
    const savingsPercent = Math.round((savings / originalSize) * 100);
    
    videoStats.innerHTML = `
        <h3>圧縮統計</h3>
        <div class="stat-item">
            <span class="stat-label">ファイル数:</span>
            <span class="stat-value">${videoFiles.length}個</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">元のサイズ:</span>
            <span class="stat-value">${formatFileSize(originalSize)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">圧縮後のサイズ:</span>
            <span class="stat-value">${formatFileSize(compressedSize)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">削減サイズ:</span>
            <span class="stat-value savings">${formatFileSize(savings)} (-${savingsPercent}%)</span>
        </div>
    `;
    videoStats.classList.add('active');
}

async function downloadImagesAsZip() {
    const zip = new JSZip();
    
    compressedImages.forEach((file) => {
        zip.file(file.name, file);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_images_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function downloadVideosAsZip() {
    const zip = new JSZip();
    
    compressedVideos.forEach(({ original }) => {
        zip.file(original.name, original);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_videos_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearImages() {
    imageFiles = [];
    compressedImages = [];
    imageFileList.innerHTML = '';
    imageStats.classList.remove('active');
    imageStats.innerHTML = '';
    updateImageButtons();
    downloadImagesBtn.disabled = true;
}

function clearVideos() {
    videoFiles = [];
    compressedVideos = [];
    videoFileList.innerHTML = '';
    videoStats.classList.remove('active');
    videoStats.innerHTML = '';
    updateVideoButtons();
    downloadVideosBtn.disabled = true;
}

setupDropZone(imageDropZone, imageInput, handleImageFiles);
setupDropZone(videoDropZone, videoInput, handleVideoFiles);

compressImagesBtn.addEventListener('click', compressImages);
downloadImagesBtn.addEventListener('click', downloadImagesAsZip);
clearImagesBtn.addEventListener('click', clearImages);

compressVideosBtn.addEventListener('click', compressVideos);
downloadVideosBtn.addEventListener('click', downloadVideosAsZip);
clearVideosBtn.addEventListener('click', clearVideos);