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

// ===== 彈出視窗 =====
class ModalManager {
    constructor() {
        this.modal = document.getElementById('modalAbout');
        this.modalClose = document.getElementById('modalClose');
        this.modalOverlay = this.modal.querySelector('.modal-overlay');
        this.init();
    }

    init() {
        document.querySelectorAll('[data-app="about"]').forEach(btn => {
            btn.addEventListener('click', () => this.open());
        });
        this.modalClose.addEventListener('click', () => this.close());
        this.modalOverlay.addEventListener('click', () => this.close());
    }

    open() { this.modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
    close() { this.modal.classList.remove('open'); document.body.style.overflow = ''; }
}

// ===== 語言切換 =====
class LanguageManager {
    constructor() {
        this.currentLang = 'zh-Hant';
        this.translations = {
            'zh-Hant': {
                homeBio: 'Developer · Creator',
                toastText: 'Discord 已複製：well_xerz'
            },
            'en': {
                homeBio: 'Developer · Creator',
                toastText: 'Discord copied: well_xerz'
            }
        };
        this.buttons = document.querySelectorAll('.lang-btn');
        this.init();
    }

    init() {
        this.buttons.forEach(btn => btn.addEventListener('click', () => this.switchLang(btn.dataset.lang)));
    }

    switchLang(lang) {
        if (lang === this.currentLang) return;
        this.buttons.forEach(btn => { btn.classList.remove('active'); btn.setAttribute('aria-checked', 'false'); });
        const activeBtn = document.querySelector(`[data-lang="${lang}"]`);
        activeBtn.classList.add('active'); activeBtn.setAttribute('aria-checked', 'true');
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
    new ModalManager();
    new LanguageManager();
    new CopyManager();
});
