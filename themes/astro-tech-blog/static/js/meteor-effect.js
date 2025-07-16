/**
 * 流星特效 - 鼠标轨迹带流星拖尾效果
 */

document.addEventListener('DOMContentLoaded', function() {
    // 只在非移动设备上启用流星特效
    if (window.innerWidth > 768) {
        initMeteorEffect();
    }
});

function initMeteorEffect() {
    const body = document.body;
    let meteors = [];
    let trails = [];
    const maxMeteors = 5; // 最大流星数量
    const trailLength = 20; // 流星尾巴长度
    const meteorLifespan = 1000; // 流星生命周期（毫秒）
    
    // 鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        // 限制创建流星的频率
        if (meteors.length < maxMeteors && Math.random() > 0.7) {
            createMeteor(e.clientX, e.clientY);
        }
    });
    
    // 创建流星
    function createMeteor(x, y) {
        // 创建流星点
        const meteor = document.createElement('div');
        meteor.className = 'meteor';
        meteor.style.left = `${x}px`;
        meteor.style.top = `${y}px`;
        body.appendChild(meteor);
        
        // 创建流星尾巴
        const trail = document.createElement('div');
        trail.className = 'meteor-trail';
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        trail.style.width = `${trailLength}px`;
        body.appendChild(trail);
        
        // 随机角度
        const angle = Math.random() * 360;
        trail.style.transform = `rotate(${angle}deg)`;
        
        // 添加到数组
        meteors.push({
            element: meteor,
            x: x,
            y: y,
            createdAt: Date.now()
        });
        
        trails.push({
            element: trail,
            x: x,
            y: y,
            angle: angle,
            createdAt: Date.now()
        });
        
        // 显示流星
        setTimeout(() => {
            meteor.style.opacity = '1';
            trail.style.opacity = '0.7';
        }, 10);
        
        // 移除流星
        setTimeout(() => {
            meteor.style.opacity = '0';
            trail.style.opacity = '0';
            
            setTimeout(() => {
                if (meteor.parentNode) {
                    meteor.parentNode.removeChild(meteor);
                }
                if (trail.parentNode) {
                    trail.parentNode.removeChild(trail);
                }
                
                // 从数组中移除
                meteors = meteors.filter(m => m.element !== meteor);
                trails = trails.filter(t => t.element !== trail);
            }, 300);
        }, meteorLifespan);
    }
    
    // 随机创建流星（背景效果）
    function createRandomMeteor() {
        if (meteors.length < maxMeteors * 2) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createMeteor(x, y);
        }
        
        // 随机间隔创建下一个流星
        setTimeout(createRandomMeteor, Math.random() * 3000 + 1000);
    }
    
    // 启动随机流星
    setTimeout(createRandomMeteor, 2000);
    
    // 添加星空背景粒子
    createStarryBackground();
}

// 创建星空背景
function createStarryBackground() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    starsContainer.style.position = 'fixed';
    starsContainer.style.top = '0';
    starsContainer.style.left = '0';
    starsContainer.style.width = '100%';
    starsContainer.style.height = '100%';
    starsContainer.style.pointerEvents = 'none';
    starsContainer.style.zIndex = '-1';
    document.body.appendChild(starsContainer);
    
    // 创建星星
    const starCount = 100;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.7 + 0.3;
        
        star.style.position = 'absolute';
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = i % 20 === 0 ? 'var(--color-pulsar)' : 'white';
        star.style.borderRadius = '50%';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.opacity = opacity;
        star.style.boxShadow = i % 20 === 0 ? '0 0 4px var(--color-pulsar)' : 'none';
        
        // 添加闪烁动画
        star.style.animation = `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite ${Math.random() * 5}s`;
        
        starsContainer.appendChild(star);
    }
    
    // 添加闪烁动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // 添加视差效果
    document.addEventListener('mousemove', function(e) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        starsContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
}