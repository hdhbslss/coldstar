// ===== 粒子系統 =====
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.stars = [];
        this.meteors = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.connectionDistance = 140;
        this.scrollOffset = 0;
        this.init();
        this.bindEvents();
        this.animate();
    }

    init() { this.resize(); this.createStars(); this.createParticles(); }
    resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; }

    createStars() {
        this.stars = [];
        for (let i = 0; i < 120; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.5 + 0.3,
                opacity: Math.random() * 0.6 + 0.4,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleOffset: Math.random() * Math.PI * 2,
                layer: 0
            });
        }
        for (let i = 0; i < 50; i++) {
            const colors = ['rgba(180,210,255,OP)','rgba(200,180,255,OP)','rgba(255,200,220,OP)','rgba(180,230,255,OP)','rgba(220,220,255,OP)'];
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                twinkleSpeed: Math.random() * 0.015 + 0.008,
                twinkleOffset: Math.random() * Math.PI * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                layer: 1
            });
        }
    }

    createParticles() {
        this.particles = [];
        const count = window.innerWidth < 768 ? 25 : 50;
        for (let i = 0; i < count; i++) {
            const colors = ['rgba(140,200,255,OP)','rgba(160,160,255,OP)','rgba(120,220,255,OP)','rgba(180,180,255,OP)','rgba(100,200,240,OP)'];
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 3 + 1.5,
                opacity: Math.random() * 0.5 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulseSpeed: Math.random() * 0.015 + 0.005,
                pulseOffset: Math.random() * Math.PI * 2,
                trail: []
            });
        }
    }

    createMeteor() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height * 0.5;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 4 + 3;
        const length = Math.random() * 80 + 40;
        this.meteors.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, length, opacity: Math.random() * 0.6 + 0.4, life: 1 });
    }

    bindEvents() {
        window.addEventListener('resize', () => { this.resize(); this.createStars(); this.createParticles(); });
        window.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
        window.addEventListener('mouseleave', () => { this.mouse.x = null; this.mouse.y = null; });
        window.addEventListener('touchmove', (e) => { this.mouse.x = e.touches[0].clientX; this.mouse.y = e.touches[0].clientY; }, { passive: true });
        window.addEventListener('touchend', () => { this.mouse.x = null; this.mouse.y = null; });
        window.addEventListener('scroll', () => { this.scrollOffset = window.scrollY * 0.2; });
    }

    drawStar(star, time) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const opacity = star.opacity * twinkle;
        if (star.layer === 0) {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255,255,255,${opacity})`;
            this.ctx.fill();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color.replace('OP', opacity);
            this.ctx.fill();
            if (twinkle > 0.75) {
                const go = (twinkle - 0.75) * opacity * 0.6;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
                this.ctx.fillStyle = star.color.replace('OP', go);
                this.ctx.fill();
            }
        }
    }

    drawParticle(particle, time) {
        const pulse = Math.sin(time * particle.pulseSpeed + particle.pulseOffset) * 0.3 + 0.7;
        const opacity = particle.opacity * pulse;
        particle.trail.push({ x: particle.x, y: particle.y, opacity: opacity * 0.5 });
        if (particle.trail.length > 8) particle.trail.shift();
        for (let i = 0; i < particle.trail.length; i++) {
            const t = particle.trail[i];
            const alpha = (i / particle.trail.length) * opacity * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, particle.radius * 0.6, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color.replace('OP', alpha);
            this.ctx.fill();
        }
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius * pulse, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color.replace('OP', opacity);
        this.ctx.fill();
        if (pulse > 0.8) {
            const glow = (pulse - 0.8) * opacity * 0.5;
            const grad = this.ctx.createRadialGradient(particle.x, particle.y, particle.radius * 0.5, particle.x, particle.y, particle.radius * 4);
            grad.addColorStop(0, particle.color.replace('OP', glow));
            grad.addColorStop(1, 'transparent');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = grad;
            this.ctx.fill();
        }
    }

    drawConnection(p1, p2) {
        const dx = p1.x - p2.x, dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.connectionDistance) {
            const op = (1 - dist / this.connectionDistance) * 0.08;
            const grad = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, `rgba(140,200,255,${op})`);
            grad.addColorStop(0.5, `rgba(180,180,255,${op})`);
            grad.addColorStop(1, `rgba(160,180,255,${op})`);
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
        }
    }

    drawMeteor(meteor) {
        const gradient = this.ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - Math.cos(Math.PI / 4) * meteor.length, meteor.y - Math.sin(Math.PI / 4) * meteor.length);
        gradient.addColorStop(0, `rgba(255,255,255,${meteor.opacity * meteor.life})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.beginPath();
        this.ctx.moveTo(meteor.x, meteor.y);
        this.ctx.lineTo(meteor.x - Math.cos(Math.PI / 4) * meteor.length, meteor.y - Math.sin(Math.PI / 4) * meteor.length);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
    }

    updateParticle(p) {
        p.x += p.vx; p.y += p.vy;
        p.y += this.scrollOffset * 0.00005;
        if (p.x < -30 || p.x > this.canvas.width + 30) p.vx *= -1;
        if (p.y < -30 || p.y > this.canvas.height + 30) p.vy *= -1;
        if (this.mouse.x !== null) {
            const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.mouse.radius) {
                const force = (this.mouse.radius - dist) / this.mouse.radius;
                const angle = Math.atan2(dy, dx);
                const acc = force * 0.05;
                p.vx += Math.cos(angle) * acc;
                p.vy += Math.sin(angle) * acc;
            }
        }
        p.vx *= 0.997; p.vy *= 0.997;
        const speed = Math.sqrt(p.vx ** 2 + p.vy ** 2);
        if (speed < 0.1) { p.vx += (Math.random() - 0.5) * 0.1; p.vy += (Math.random() - 0.5) * 0.1; }
        if (speed > 1.5) { p.vx *= 0.97; p.vy *= 0.97; }
    }

    updateMeteor(meteor) { meteor.x += meteor.vx; meteor.y += meteor.vy; meteor.life -= 0.008; }

    animate() {
        const time = Date.now();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const auroraGrad = this.ctx.createRadialGradient(this.canvas.width * 0.3, this.canvas.height * 0.4, 0, this.canvas.width * 0.3, this.canvas.height * 0.4, this.canvas.width * 0.8);
        auroraGrad.addColorStop(0, 'rgba(80,120,200,0.015)');
        auroraGrad.addColorStop(0.5, 'rgba(100,80,180,0.01)');
        auroraGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = auroraGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (const star of this.stars) this.drawStar(star, time);
        for (let i = 0; i < this.particles.length; i++) {
            this.updateParticle(this.particles[i]);
            this.drawParticle(this.particles[i], time);
            for (let j = i + 1; j < this.particles.length; j++) this.drawConnection(this.particles[i], this.particles[j]);
        }
        if (Math.random() < 0.008) this.createMeteor();
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            this.updateMeteor(this.meteors[i]);
            this.drawMeteor(this.meteors[i]);
            if (this.meteors[i].life <= 0) this.meteors.splice(i, 1);
        }
        requestAnimationFrame(() => this.animate());
    }
}

// ===== 打字機效果 =====
class Typewriter {
    constructor(element, cursorElement, texts) {
        this.element = element;
        this.cursor = cursorElement;
        this.texts = texts;
        this.currentTextIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.typeSpeed = 80;
        this.deleteSpeed = 40;
        this.pauseTime = 3000;
    }

    type() {
        const currentText = this.texts[this.currentTextIndex];
        if (!this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
            if (this.charIndex === currentText.length) {
                if (this.texts.length > 1) { this.isDeleting = true; setTimeout(() => this.type(), this.pauseTime); return; }
                else { this.cursor.style.display = 'none'; return; }
            }
            setTimeout(() => this.type(), this.typeSpeed);
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
            if (this.charIndex === 0) { this.isDeleting = false; this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length; }
            setTimeout(() => this.type(), this.deleteSpeed);
        }
    }

    start() { setTimeout(() => this.type(), 1500); }
}

// ===== 漣漪效果 =====
class RippleEffect {
    constructor() { this.init(); }
    init() {
        document.querySelectorAll('.ripple').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
                btn.appendChild(ripple);
                ripple.addEventListener('animationend', () => ripple.remove());
            });
        });
    }
}

// ===== 頁面控制 =====
class PageManager {
    constructor() {
        this.pageHome = document.getElementById('pageHome');
        this.pageDesktop = document.getElementById('pageDesktop');
        this.navBtn = document.getElementById('navBtn');
        this.backBtn = document.getElementById('backBtn');
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.navBtn.addEventListener('click', () => this.goTo('desktop'));
        this.backBtn.addEventListener('click', () => this.goTo('home'));
    }

    goTo(page) {
        if (page === this.currentPage) return;
        this.currentPage = page;
        if (page === 'desktop') {
            this.pageHome.classList.remove('active');
            this.pageDesktop.classList.add('active');
            this.navBtn.style.opacity = '0';
            this.navBtn.style.pointerEvents = 'none';
            this.backBtn.classList.add('show');
        } else {
            this.pageDesktop.classList.remove('active');
            this.pageHome.classList.add('active');
            this.navBtn.style.opacity = '1';
            this.navBtn.style.pointerEvents = 'auto';
            this.backBtn.classList.remove('show');
        }
    }
}

// ===== 語言切換 =====
class LanguageManager {
    constructor() {
        this.currentLang = 'zh-Hant';
        this.translations = {
            'zh-Hant': {
                subtitle: 'Developer · Creator',
                greeting: '嗨，我是 ColdStar。',
                bio1: '我是 YouTube 的創作者，一位熱愛程式開發與創新的開發者。',
                bio2: '目前主要專注於 Python 開發、Discord Bot、Roblox Studio 與各種自動化工具的設計與開發，並持續學習新的技術，將想法一步步實現成真正能使用的作品。',
                bio3: '我喜歡挑戰各種不同類型的專案，從機器人、網站、遊戲到各種工具，享受從零開始規劃、設計、開發到完成的整個過程。我相信每一個專案都是一次成長的機會，也希望透過技術打造出兼具實用性、美感與使用體驗的作品。',
                bio4: '除了程式開發之外，我也十分重視介面設計與使用者體驗，希望每個作品不只是功能完整，更能帶來流暢、直覺且舒適的操作感受。',
                focusTitle: '我專注的領域',
                focusList: ['🤖 Discord Bot 開發','🐍 Python 程式開發','🎮 Roblox Studio','🌐 網站前後端開發','⚡ 自動化工具開發','🎨 UI／UX 介面設計'],
                philosophyTitle: '我的理念',
                philosophy1: '我相信技術不只是解決問題，更能創造價值。',
                philosophy2: '每一次開發都是一次新的挑戰，每一次完成作品都是持續進步的證明。我希望透過不斷學習與實作，打造出穩定、高品質且真正能幫助使用者的作品。',
                philosophyClosing: '持續學習，持續創造，持續突破。',
                toastText: 'Discord 已複製：well_xerz'
            },
            'en': {
                subtitle: 'Developer · Creator',
                greeting: "Hi, I'm ColdStar.",
                bio1: "I'm a YouTube creator and a developer passionate about coding and innovation.",
                bio2: 'Currently focused on Python development, Discord Bots, Roblox Studio, and designing various automation tools. I continuously learn new technologies to turn ideas into real, functional creations.',
                bio3: 'I enjoy taking on diverse projects — from bots, websites, and games to various tools — relishing the entire journey from planning, designing, and developing to completion. I believe every project is an opportunity to grow, and I strive to create works that blend practicality, aesthetics, and great user experience.',
                bio4: 'Beyond development, I place great emphasis on interface design and user experience, ensuring each project is not only fully functional but also delivers a smooth, intuitive, and comfortable experience.',
                focusTitle: 'What I Focus On',
                focusList: ['🤖 Discord Bot Development','🐍 Python Development','🎮 Roblox Studio','🌐 Full-Stack Web Dev','⚡ Automation Tools','🎨 UI/UX Design'],
                philosophyTitle: 'My Philosophy',
                philosophy1: 'I believe technology is not just about solving problems — it creates value.',
                philosophy2: 'Every development is a new challenge, and every completed project is proof of continuous improvement. Through constant learning and hands-on practice, I aim to build stable, high-quality works that truly help people.',
                philosophyClosing: 'Keep learning, keep creating, keep breaking through.',
                toastText: 'Discord copied: well_xerz'
            }
        };

        this.elements = {
            subtitle: document.getElementById('nameSubtitle'),
            greeting: document.getElementById('greetingText'),
            bio1: document.getElementById('bioText1'),
            bio2: document.getElementById('bioText2'),
            bio3: document.getElementById('bioText3'),
            bio4: document.getElementById('bioText4'),
            focusTitle: document.getElementById('focusTitle'),
            focusGrid: document.getElementById('focusGrid'),
            philosophyTitle: document.getElementById('philosophyTitle'),
            philosophy1: document.getElementById('philosophyText1'),
            philosophy2: document.getElementById('philosophyText2'),
            closingText: document.querySelector('.typewriter-text'),
            closingCursor: document.querySelector('.typewriter-cursor'),
            toastText: document.querySelector('.toast-text')
        };

        this.buttons = document.querySelectorAll('.lang-btn');
        this.bioContent = document.getElementById('bioContent');
        this.typewriter = null;
        this.init();
    }

    init() {
        this.buttons.forEach(btn => btn.addEventListener('click', () => this.switchLang(btn.dataset.lang)));
        this.startTypewriter(this.translations[this.currentLang].philosophyClosing);
    }

    startTypewriter(text) {
        this.typewriter = null;
        this.elements.closingText.textContent = '';
        this.elements.closingCursor.style.display = 'inline-block';
        this.typewriter = new Typewriter(this.elements.closingText, this.elements.closingCursor, [text]);
        this.typewriter.start();
    }

    switchLang(lang) {
        if (lang === this.currentLang) return;
        this.buttons.forEach(btn => { btn.classList.remove('active'); btn.setAttribute('aria-checked', 'false'); });
        const activeBtn = document.querySelector(`[data-lang="${lang}"]`);
        activeBtn.classList.add('active'); activeBtn.setAttribute('aria-checked', 'true');
        this.bioContent.style.opacity = '0';
        setTimeout(() => {
            const t = this.translations[lang];
            this.elements.subtitle.textContent = t.subtitle;
            this.elements.greeting.textContent = t.greeting;
            this.elements.bio1.textContent = t.bio1;
            this.elements.bio2.textContent = t.bio2;
            this.elements.bio3.textContent = t.bio3;
            this.elements.bio4.textContent = t.bio4;
            this.elements.focusTitle.innerHTML = `<span class="section-icon">🎯</span>${t.focusTitle}`;
            this.elements.philosophyTitle.innerHTML = `<span class="section-icon">💡</span>${t.philosophyTitle}`;
            this.elements.philosophy1.textContent = t.philosophy1;
            this.elements.philosophy2.textContent = t.philosophy2;
            this.elements.toastText.textContent = t.toastText;
            this.elements.focusGrid.innerHTML = '';
            t.focusList.forEach(item => {
                const card = document.createElement('div');
                card.className = 'focus-card';
                const emoji = item.split(' ')[0];
                const label = item.substring(emoji.length + 1);
                card.innerHTML = `<span class="focus-emoji">${emoji}</span><span class="focus-label">${label}</span>`;
                this.elements.focusGrid.appendChild(card);
            });
            this.bioContent.style.opacity = '1';
            this.startTypewriter(t.philosophyClosing);
        }, 350);
        document.documentElement.lang = lang;
        this.currentLang = lang;
    }
}

// ===== Discord 複製 =====
class CopyManager {
    constructor() {
        this.toast = document.getElementById('toast');
        this.init();
    }
    init() {
        document.querySelectorAll('.copy-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const text = btn.dataset.copy;
                navigator.clipboard.writeText(text).then(() => this.showToast()).catch(() => alert('Discord: ' + text));
            });
        });
    }
    showToast() {
        this.toast.classList.add('show');
        clearTimeout(this.toast._timeout);
        this.toast._timeout = setTimeout(() => this.toast.classList.remove('show'), 2000);
    }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
    new PageManager();
    new LanguageManager();
    new RippleEffect();
    new CopyManager();
});
