/**
 * 天文技术博客主要JavaScript功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    initMobileMenu();
    
    // 滚动效果
    initScrollEffects();
    
    // 代码块增强
    enhanceCodeBlocks();
    
    // 初始化思维导图
    if (typeof mermaid !== 'undefined') {
        initMermaid();
    }
    
    // 初始化链接预览
    if (document.querySelector('.site-main')) {
        initLinkPreviews();
    }
});

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            
            // 切换菜单按钮样式
            const spans = menuToggle.querySelectorAll('span');
            if (menuToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // 点击导航链接后关闭菜单
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    menuToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                    
                    const spans = menuToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            });
        });
    }
}

/**
 * 初始化滚动效果
 */
function initScrollEffects() {
    // 滚动时显示/隐藏返回顶部按钮
    const scrollThreshold = 300;
    let backToTopBtn = document.querySelector('.back-to-top');
    
    // 如果按钮不存在，创建一个
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopBtn.style.position = 'fixed';
        backToTopBtn.style.bottom = '20px';
        backToTopBtn.style.right = '20px';
        backToTopBtn.style.zIndex = '99';
        backToTopBtn.style.width = '40px';
        backToTopBtn.style.height = '40px';
        backToTopBtn.style.borderRadius = '50%';
        backToTopBtn.style.backgroundColor = 'var(--color-pulsar)';
        backToTopBtn.style.color = 'var(--color-deep-space)';
        backToTopBtn.style.border = 'none';
        backToTopBtn.style.cursor = 'pointer';
        backToTopBtn.style.display = 'flex';
        backToTopBtn.style.alignItems = 'center';
        backToTopBtn.style.justifyContent = 'center';
        backToTopBtn.style.boxShadow = 'var(--shadow-medium)';
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.transform = 'translateY(20px)';
        backToTopBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        document.body.appendChild(backToTopBtn);
    }
    
    // 滚动事件
    window.addEventListener('scroll', function() {
        if (window.scrollY > scrollThreshold) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.transform = 'translateY(0)';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.transform = 'translateY(20px)';
        }
        
        // 添加滚动时的导航栏阴影
        const header = document.querySelector('.site-header');
        if (header) {
            if (window.scrollY > 10) {
                header.style.boxShadow = 'var(--shadow-medium)';
            } else {
                header.style.boxShadow = 'none';
            }
        }
    });
    
    // 返回顶部点击事件
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 更新URL但不滚动
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // 资源中心导航高亮
    const resourceNavLinks = document.querySelectorAll('.resource-nav-link');
    if (resourceNavLinks.length > 0) {
        window.addEventListener('scroll', function() {
            const sections = document.querySelectorAll('.resource-section');
            const headerHeight = document.querySelector('.site-header').offsetHeight;
            
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top + window.scrollY;
                const sectionBottom = sectionTop + section.offsetHeight;
                const scrollPosition = window.scrollY + headerHeight + 50;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    const id = section.getAttribute('id');
                    resourceNavLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }
}

/**
 * 增强代码块功能
 */
function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock, index) => {
        const pre = codeBlock.parentElement;
        
        // 添加语言标签
        const language = codeBlock.className.match(/language-([\w-]+)/);
        if (language) {
            pre.setAttribute('data-lang', language[1]);
        }
        
        // 添加复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-button';
        copyButton.textContent = '复制';
        copyButton.addEventListener('click', function() {
            const code = codeBlock.textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyButton.textContent = '已复制!';
                setTimeout(() => {
                    copyButton.textContent = '复制';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                copyButton.textContent = '复制失败';
                setTimeout(() => {
                    copyButton.textContent = '复制';
                }, 2000);
            });
        });
        pre.appendChild(copyButton);
        
        // 为长代码块添加折叠功能
        if (codeBlock.offsetHeight > 300) {
            pre.classList.add('code-collapse');
            
            const overlay = document.createElement('div');
            overlay.className = 'code-collapse-overlay';
            
            const expandButton = document.createElement('button');
            expandButton.className = 'code-collapse-button';
            expandButton.textContent = '显示更多';
            expandButton.addEventListener('click', function() {
                pre.classList.toggle('expanded');
                if (pre.classList.contains('expanded')) {
                    expandButton.textContent = '收起';
                    overlay.style.background = 'none';
                } else {
                    expandButton.textContent = '显示更多';
                    overlay.style.background = 'linear-gradient(to bottom, rgba(15, 32, 65, 0), rgba(15, 32, 65, 1))';
                }
            });
            
            overlay.appendChild(expandButton);
            pre.appendChild(overlay);
        }
    });
}

/**
 * 初始化思维导图
 */
function initMermaid() {
    mermaid.initialize({
        startOnLoad: true,
        theme: 'dark',
        securityLevel: 'loose',
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
        },
        themeVariables: {
            primaryColor: '#0B1A2F',
            primaryTextColor: '#E1E5EA',
            primaryBorderColor: '#2C4C7C',
            lineColor: '#4A6FA5',
            secondaryColor: '#1E3A5F',
            tertiaryColor: '#0B1A2F'
        }
    });
    
    // 添加星座连线动画效果
    document.addEventListener('mermaid-render-complete', function() {
        const mermaidSvgs = document.querySelectorAll('.mermaid svg');
        mermaidSvgs.forEach(svg => {
            // 为边添加动画效果
            const edges = svg.querySelectorAll('path.edge');
            edges.forEach((edge, index) => {
                edge.classList.add('constellation-line');
                edge.style.animationDelay = `${index * 0.1}s`;
            });
            
            // 为节点添加脉冲效果
            const nodes = svg.querySelectorAll('g.node');
            nodes.forEach(node => {
                node.classList.add('constellation-node');
            });
        });
    });
}

/**
 * 初始化链接预览
 */
function initLinkPreviews() {
    // 只对非移动设备启用链接预览
    if (window.innerWidth <= 768) return;
    
    const links = document.querySelectorAll('.post-content a:not([href^="#"]):not([href^="javascript:"]):not(.no-preview)');
    let previewElement = null;
    
    links.forEach(link => {
        // 排除图片链接和下载链接
        if (link.querySelector('img') || link.getAttribute('download')) return;
        
        link.addEventListener('mouseenter', function(e) {
            const url = this.href;
            const rect = this.getBoundingClientRect();
            
            // 创建预览元素
            if (!previewElement) {
                previewElement = document.createElement('div');
                previewElement.className = 'link-preview';
                document.body.appendChild(previewElement);
            }
            
            // 设置预览位置
            previewElement.style.top = `${rect.bottom + window.scrollY + 10}px`;
            previewElement.style.left = `${rect.left + window.scrollX}px`;
            
            // 显示加载中
            previewElement.innerHTML = '<div class="preview-loading">加载中...</div>';
            previewElement.classList.add('active');
            
            // 模拟获取链接预览信息
            // 实际项目中，这里应该调用API获取链接的元数据
            setTimeout(() => {
                // 检查是否是arXiv链接
                const isArxiv = url.includes('arxiv.org');
                let previewContent = '';
                
                if (isArxiv) {
                    const arxivId = url.match(/\d+\.\d+/) || ['0000.00000'];
                    previewContent = `
                        <div class="preview-title">arXiv论文: ${arxivId[0]}</div>
                        <div class="preview-description">天文学研究论文，点击查看详情。</div>
                        <div class="arxiv-buttons">
                            <a href="https://arxiv.org/pdf/${arxivId[0]}.pdf" class="arxiv-button pdf" target="_blank" title="PDF">PDF</a>
                            <a href="https://arxiv.org/abs/${arxivId[0]}" class="arxiv-button abstract" target="_blank" title="摘要">摘要</a>
                        </div>
                        <div class="preview-url">${url}</div>
                    `;
                } else {
                    // 从URL中提取域名作为标题
                    const domain = new URL(url).hostname;
                    previewContent = `
                        <div class="preview-title">${domain}</div>
                        <div class="preview-description">点击访问此链接获取更多信息。</div>
                        <div class="preview-url">${url}</div>
                    `;
                }
                
                previewElement.innerHTML = previewContent;
            }, 300);
        });
        
        link.addEventListener('mouseleave', function() {
            if (previewElement) {
                previewElement.classList.remove('active');
            }
        });
    });
    
    // 点击其他区域关闭预览
    document.addEventListener('click', function() {
        if (previewElement) {
            previewElement.classList.remove('active');
        }
    });
}