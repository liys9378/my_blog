/**
 * 链接预览功能 - 当鼠标悬停链接时显示摘要卡片
 */

document.addEventListener('DOMContentLoaded', function() {
    // 只在非移动设备上启用链接预览
    if (window.innerWidth > 768) {
        initLinkPreview();
    }
});

function initLinkPreview() {
    // 创建预览容器
    const previewContainer = document.createElement('div');
    previewContainer.className = 'link-preview';
    document.body.appendChild(previewContainer);
    
    // 获取所有外部链接
    const links = document.querySelectorAll('a[href^="http"]:not(.no-preview)');
    
    // 为每个链接添加鼠标悬停事件
    links.forEach(link => {
        // 排除图片链接
        if (link.querySelector('img')) return;
        
        // 排除社交媒体图标链接
        if (link.classList.contains('social-link') || link.parentElement.classList.contains('social-links')) return;
        
        // 鼠标进入链接
        link.addEventListener('mouseenter', function(e) {
            const url = this.href;
            const rect = this.getBoundingClientRect();
            
            // 设置预览位置
            previewContainer.style.top = `${rect.bottom + window.scrollY + 10}px`;
            previewContainer.style.left = `${rect.left + window.scrollX}px`;
            
            // 显示加载中状态
            previewContainer.innerHTML = '<div class="preview-loading">加载中...</div>';
            previewContainer.classList.add('active');
            
            // 获取链接预览信息
            fetchLinkPreview(url).then(data => {
                if (!data) return;
                
                // 更新预览内容
                updatePreviewContent(previewContainer, data, url);
            }).catch(error => {
                console.error('获取链接预览失败:', error);
                previewContainer.innerHTML = '<div class="preview-error">无法加载预览</div>';
            });
        });
        
        // 鼠标离开链接
        link.addEventListener('mouseleave', function() {
            previewContainer.classList.remove('active');
        });
    });
    
    // 特殊处理arXiv链接
    const arxivLinks = document.querySelectorAll('a[href*="arxiv.org"]');
    arxivLinks.forEach(link => {
        link.addEventListener('mouseenter', function(e) {
            const url = this.href;
            const rect = this.getBoundingClientRect();
            const arxivId = url.match(/\d+\.\d+/) || ['0000.00000'];
            
            // 设置预览位置
            previewContainer.style.top = `${rect.bottom + window.scrollY + 10}px`;
            previewContainer.style.left = `${rect.left + window.scrollX}px`;
            
            // 显示arXiv预览
            previewContainer.innerHTML = `
                <div class="preview-title">arXiv论文: ${arxivId[0]}</div>
                <div class="preview-description">天文学研究论文，点击查看详情。</div>
                <div class="arxiv-buttons">
                    <a href="https://arxiv.org/pdf/${arxivId[0]}.pdf" class="arxiv-button pdf" target="_blank" title="PDF">PDF</a>
                    <a href="https://arxiv.org/abs/${arxivId[0]}" class="arxiv-button abstract" target="_blank" title="摘要">摘要</a>
                </div>
                <div class="preview-url">${url}</div>
            `;
            previewContainer.classList.add('active');
            
            // 阻止事件冒泡，使预览中的链接可点击
            const previewLinks = previewContainer.querySelectorAll('a');
            previewLinks.forEach(previewLink => {
                previewLink.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            });
        });
    });
    
    // 点击其他区域关闭预览
    document.addEventListener('click', function() {
        previewContainer.classList.remove('active');
    });
}

/**
 * 获取链接预览信息
 * 注意：实际项目中，这应该是一个服务器端API调用
 * 这里使用模拟数据进行演示
 */
async function fetchLinkPreview(url) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 检查是否是特殊链接类型
    if (url.includes('arxiv.org')) {
        return null; // arXiv链接已有特殊处理
    }
    
    try {
        // 从URL中提取域名和路径
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const path = urlObj.pathname;
        
        // 模拟不同网站的预览数据
        if (domain.includes('github.com')) {
            return {
                title: 'GitHub - ' + path.split('/').filter(Boolean).join('/'),
                description: 'GitHub是世界上最大的代码托管平台，拥有数百万开发者和项目。',
                image: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
                domain: domain
            };
        } else if (domain.includes('nasa.gov')) {
            return {
                title: 'NASA - 美国国家航空航天局',
                description: 'NASA负责美国的民用太空计划以及航空航天研究。',
                image: '/images/nasa-logo.jpg',
                domain: domain
            };
        } else if (domain.includes('eso.org')) {
            return {
                title: 'ESO - 欧洲南方天文台',
                description: '欧洲南方天文台是欧洲主要的天文研究组织，运营着世界上一些最先进的天文设施。',
                image: '/images/eso-logo.jpg',
                domain: domain
            };
        } else {
            // 默认预览
            return {
                title: domain,
                description: '点击访问此链接获取更多信息。',
                domain: domain
            };
        }
    } catch (error) {
        console.error('解析URL失败:', error);
        return null;
    }
}

/**
 * 更新预览内容
 */
function updatePreviewContent(container, data, url) {
    let content = `
        <div class="preview-title">${data.title}</div>
        <div class="preview-description">${data.description}</div>
    `;
    
    if (data.image) {
        content = `
            <div class="preview-image">
                <img src="${data.image}" alt="${data.title}">
            </div>
        ` + content;
    }
    
    content += `<div class="preview-url">${data.domain}</div>`;
    
    container.innerHTML = content;
    
    // 为预览中的链接添加事件处理
    const previewLinks = container.querySelectorAll('a');
    previewLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}