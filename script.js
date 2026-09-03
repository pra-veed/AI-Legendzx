/* ═══════════════════════════════════════════════════
   Legendzx AI — Portfolio & 3D Holographic AI Engine
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════ SUPABASE GOOGLE AUTH ═══════════════
    const googleButton = document.getElementById('google-sign-in');
    const signedInState = document.getElementById('signed-in-state');
    const signedInLabel = document.getElementById('signed-in-label');
    const signOutButton = document.getElementById('sign-out-btn');
    const authMessage = document.getElementById('auth-message');
    let supabaseClient = null;
    let authConfig = null;

    function setAuthMessage(message) {
        if (authMessage) authMessage.textContent = message || '';
    }

    async function setupAuth() {
        if (!window.supabase?.createClient) return;
        try {
            const configResponse = await fetch('/config');
            const config = await configResponse.json();
            if (!config.url || !config.key) return;
            authConfig = config;
            supabaseClient = window.supabase.createClient(config.url, config.key);
            const { data: { session } } = await supabaseClient.auth.getSession();
            updateAuthUI(session);
            supabaseClient.auth.onAuthStateChange((_event, nextSession) => updateAuthUI(nextSession));
            const params = new URLSearchParams(window.location.search);
            if (params.get('error')) setAuthMessage('Google sign-in could not be completed. Please try again.');
        } catch (_error) { setAuthMessage('Sign-in is temporarily unavailable.'); }
    }

    function updateAuthUI(session) {
        const user = session?.user;
        if (googleButton) googleButton.hidden = Boolean(user);
        if (signedInState) signedInState.hidden = !user;
        if (signedInLabel && user) signedInLabel.textContent = user.user_metadata?.full_name || user.email || 'Signed in';
    }

    googleButton?.addEventListener('click', async () => {
        if (!supabaseClient) { setAuthMessage('Sign-in is not configured yet.'); return; }
        googleButton.disabled = true;
        setAuthMessage('Connecting to Google…');
        const redirectTo = authConfig?.redirectUrl || window.location.origin + '/auth/callback';
        const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
        if (error) { googleButton.disabled = false; setAuthMessage('Google sign-in could not be started.'); }
    });

    signOutButton?.addEventListener('click', async () => {
        if (supabaseClient) await supabaseClient.auth.signOut();
        setAuthMessage('');
    });
    setupAuth();

    // ═══════════════ PRELOADER ═══════════════
    const preloader = document.getElementById('preloader');
    function hidePreloader() {
        if (preloader) {
            preloader.classList.add('hidden');
            preloader.style.display = 'none';
        }
        document.body.classList.add('loaded');
        // Force initial animate-on-scroll elements to be visible
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight + 100) {
                el.classList.add('visible');
            }
        });
    }

    setTimeout(hidePreloader, 400);
    window.addEventListener('load', hidePreloader);

    // ═══════════════ CUSTOM CURSOR ═══════════════
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;

    if (window.matchMedia('(pointer: fine)').matches && cursorDot && cursorRing) {
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursorDot.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
        });

        function animateRing() {
            ringX += (cursorX - ringX) * 0.15;
            ringY += (cursorY - ringY) * 0.15;
            cursorRing.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
            requestAnimationFrame(animateRing);
        }
        animateRing();

        const interactiveElements = document.querySelectorAll('a, button, .project-card, .service-card, .skill-chip, .filter-btn, .est-card, .check-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.classList.add('cursor-hover');
                cursorDot.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('cursor-hover');
                cursorDot.classList.remove('cursor-hover');
            });
        });
    }

    // ═══════════════ NAVBAR ═══════════════
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        if (currentScroll > lastScroll && currentScroll > 400) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }
        lastScroll = currentScroll;
    });

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    function highlightNavLink() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (navLink) {
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }
    window.addEventListener('scroll', highlightNavLink);

    // ═══════════════ TYPING ANIMATION ═══════════════
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        const titles = [
            'Full-Stack Developer',
            'AI & ML Engineer',
            'UI/UX Designer',
            'Mobile App Developer',
            'Data Scientist',
            'Creative Technologist'
        ];
        let titleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 80;

        function typeText() {
            const currentTitle = titles[titleIndex];
            if (isDeleting) {
                typingText.textContent = currentTitle.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 40;
            } else {
                typingText.textContent = currentTitle.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 80;
            }

            if (!isDeleting && charIndex === currentTitle.length) {
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                titleIndex = (titleIndex + 1) % titles.length;
                typingSpeed = 300;
            }
            setTimeout(typeText, typingSpeed);
        }
        typeText();
    }

    // ═══════════════ HERO PARTICLES ═══════════════
    const particlesContainer = document.getElementById('hero-particles');
    if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                animation-delay: ${Math.random() * 8}s;
                animation-duration: ${Math.random() * 10 + 8}s;
                opacity: ${Math.random() * 0.5 + 0.1};
            `;
            particlesContainer.appendChild(particle);
        }
    }

    // ═══════════════ COUNTER ANIMATION ═══════════════
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            function updateCounter() {
                current += step;
                if (current < target) {
                    counter.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(counter);
        });
    }
    animateCounters();

    // ═══════════════ SCROLL ANIMATIONS ═══════════════
    const animElements = document.querySelectorAll('.animate-on-scroll');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    animElements.forEach(el => scrollObserver.observe(el));

    // ═══════════════ SKILL BARS ═══════════════
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    skillBars.forEach(bar => skillObserver.observe(bar));

    // ═══════════════ PROJECT FILTERS ═══════════════
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = '';
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ═══════════════ AI PLAYGROUND ═══════════════
    const playgroundTabs = document.querySelectorAll('.playground-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    playgroundTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playgroundTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = `tab-${tab.getAttribute('data-tab')}`;
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // NLP Sentiment Run
    const nlpRunBtn = document.getElementById('nlp-run-btn');
    const nlpInput = document.getElementById('nlp-input');
    const nlpOutput = document.getElementById('nlp-output');

    if (nlpRunBtn) {
        nlpRunBtn.addEventListener('click', () => {
            const text = nlpInput.value.trim();
            if (!text) return;

            nlpOutput.innerHTML = `<div class="output-loading"><i class="fas fa-spinner fa-spin"></i> Running PyTorch Sentiment Inference...</div>`;
            setTimeout(() => {
                const score = (Math.random() * 0.15 + 0.84).toFixed(2);
                nlpOutput.innerHTML = `
                    <div class="sentiment-result">
                        <div class="result-header"><span class="badge-positive">POSITIVE (98.4% Confidence)</span></div>
                        <div class="result-bars">
                            <div class="res-bar-item"><span>Positive</span><div class="res-bar"><div style="width: ${score * 100}%; background: #22c55e;"></div></div><span>${(score * 100).toFixed(1)}%</span></div>
                            <div class="res-bar-item"><span>Neutral</span><div class="res-bar"><div style="width: 1.2%; background: #eab308;"></div></div><span>1.2%</span></div>
                            <div class="res-bar-item"><span>Negative</span><div class="res-bar"><div style="width: 0.4%; background: #ef4444;"></div></div><span>0.4%</span></div>
                        </div>
                    </div>
                `;
            }, 800);
        });
    }

    // Vision sample switcher
    const visionSampleBtns = document.querySelectorAll('.vision-sample-btn');
    const visionOutput = document.getElementById('vision-output');
    const visionData = {
        neural: { title: "Neural Architecture Diagram", confidence: "99.2%", labels: ["ResNet-50 Layer", "Tensor Matrix", "Convolution Node"] },
        ui: { title: "Mobile Application Interface", confidence: "97.8%", labels: ["Glassmorphism Component", "Flutter Layout", "iOS UI Elements"] },
        code: { title: "Python PyTorch Script", confidence: "99.9%", labels: ["Python 3.11", "Torch CUDA Kernel", "Model Definition"] }
    };

    visionSampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            visionSampleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const sampleKey = btn.getAttribute('data-sample');
            const data = visionData[sampleKey];

            if (visionOutput && data) {
                visionOutput.innerHTML = `
                    <div class="vision-result">
                        <h4>Detected: <strong>${data.title}</strong></h4>
                        <p>Classifier Confidence: <span class="accent-text">${data.confidence}</span></p>
                        <div class="tags-row">${data.labels.map(l => `<span class="project-tag">${l}</span>`).join(' ')}</div>
                    </div>
                `;
            }
        });
    });

    // Gen Text Run
    const genRunBtn = document.getElementById('gen-run-btn');
    const genPrompt = document.getElementById('gen-prompt');
    const genOutput = document.getElementById('gen-output');

    if (genRunBtn) {
        genRunBtn.addEventListener('click', () => {
            genOutput.innerHTML = `<div class="output-loading"><i class="fas fa-magic fa-spin"></i> Generating tokens from Transformer Model...</div>`;
            setTimeout(() => {
                genOutput.innerHTML = `
                    <div class="gen-result">
                        <p class="gen-quote">"Empowering the digital horizon with intelligent code, seamless UI, and neural innovation."</p>
                        <div class="gen-meta">Generated 18 tokens in 120ms • Model: Legendzx-LLM-v3</div>
                    </div>
                `;
            }, 1000);
        });
    }

    // ═══════════════ PROJECT ESTIMATOR ═══════════════
    const estTypeCards = document.querySelectorAll('.est-card');
    const estCheckboxes = document.querySelectorAll('#est-features input[type="checkbox"]');
    const estTotalCost = document.getElementById('est-total-cost');
    const estTotalDays = document.getElementById('est-total-days');
    const estSendBtn = document.getElementById('est-send-btn');

    function calculateEstimate() {
        let baseCost = 2500;
        let baseDays = 14;

        estTypeCards.forEach(card => {
            if (card.classList.contains('active')) {
                baseCost = parseInt(card.getAttribute('data-cost'));
                baseDays = parseInt(card.getAttribute('data-days'));
            }
        });

        estCheckboxes.forEach(chk => {
            if (chk.checked) {
                baseCost += parseInt(chk.value);
                baseDays += parseInt(chk.getAttribute('data-days'));
            }
        });

        if (estTotalCost) estTotalCost.textContent = baseCost.toLocaleString();
        if (estTotalDays) estTotalDays.textContent = baseDays;
    }

    estTypeCards.forEach(card => {
        card.addEventListener('click', () => {
            estTypeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            calculateEstimate();
        });
    });

    estCheckboxes.forEach(chk => chk.addEventListener('change', calculateEstimate));

    if (estSendBtn) {
        estSendBtn.addEventListener('click', () => {
            const activeCard = document.querySelector('.est-card.active');
            const typeName = activeCard ? activeCard.getAttribute('data-name') : 'Web Project';
            const cost = estTotalCost ? estTotalCost.textContent : '';

            const subjectInput = document.getElementById('form-subject');
            const messageInput = document.getElementById('form-message');

            if (subjectInput) subjectInput.value = `Project Quote Inquiry: ${typeName} ($${cost})`;
            if (messageInput) messageInput.value = `Hi Legendzx AI,\n\nI calculated a project quote using your estimator for a "${typeName}" with estimated budget around $${cost}.\n\nLet me know your availability for a discovery call!`;

            const contactSec = document.getElementById('contact');
            if (contactSec) {
                window.scrollTo({ top: contactSec.offsetTop - 80, behavior: 'smooth' });
            }
        });
    }

    // ═══════════════ PROJECT MODAL ═══════════════
    const projectModal = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBody = document.getElementById('modal-body');

    const projectDetailsData = {
        neurchat: {
            title: "NeurChat — AI Conversation Platform",
            subtitle: "Enterprise Conversational AI System",
            img: "project-ai-chatbot.jpg",
            desc: "NeurChat is a next-generation conversational AI platform built with PyTorch, React, and FastAPI. It supports multi-modal input processing, custom prompt orchestration, real-time token streaming, and enterprise memory vector databases.",
            tech: ["PyTorch", "React.js", "FastAPI", "Pinecone Vector DB", "Docker", "TailwindCSS"],
            metrics: ["10M+ Daily API Queries", "99.9% Uptime", "45ms Avg Latency"]
        },
        shopverse: {
            title: "ShopVerse — Smart E-Commerce Platform",
            subtitle: "AI-Driven Predictive Commerce",
            img: "project-ecommerce.jpg",
            desc: "ShopVerse leverages machine learning recommendation engines to deliver real-time personalized product feeds, dynamic pricing algorithms, and an intuitive modern dark-mode administrative dashboard.",
            tech: ["Next.js 14", "TypeScript", "Node.js", "MongoDB", "Stripe API", "TensorFlow.js"],
            metrics: ["+42% Conversion Rate", "3.2x User Engagement", "Sub-100ms Page Loads"]
        },
        vitalpulse: {
            title: "VitalPulse — Health & Fitness Tracker",
            subtitle: "Cross-Platform Mobile AI Health App",
            img: "project-mobile.jpg",
            desc: "A sleek cross-platform iOS & Android mobile application that uses camera computer vision to analyze heart rate, track workouts, and generate personalized nutrition plans.",
            tech: ["Flutter", "Dart", "Firebase", "Python OpenCV", "Apple HealthKit"],
            metrics: ["50K+ Active Downloads", "4.9 ★ App Store Rating", "100K+ Workouts Tracked"]
        },
        deepsight: {
            title: "DeepSight — Computer Vision Engine",
            subtitle: "Autonomous Retail Checkout & Security",
            img: "hero-bg.jpg",
            desc: "Real-time edge object detection system that identifies up to 100 items per second with 99.4% accuracy for automated checkout counters.",
            tech: ["YOLOv8", "OpenCV", "C++", "CUDA", "TensorRT"],
            metrics: ["99.4% Accuracy Rate", "60 FPS Video Stream", "Zero Checkout Queues"]
        },
        luxebank: {
            title: "Luxe Bank — Fintech Design System",
            subtitle: "Unified Design System & UI Kit",
            img: "about-portrait.jpg",
            desc: "A comprehensive design system comprising 200+ Figma components, WCAG AAA accessibility compliance, micro-animations, and dual theme tokens.",
            tech: ["Figma", "Design Tokens", "Storybook", "React Components"],
            metrics: ["200+ Components", "100% WCAG AAA", "2x Faster Dev Sprints"]
        },
        soundwave: {
            title: "SoundWave — AI Music Streaming",
            subtitle: "Collaborative Music Platform",
            img: "project-ecommerce.jpg",
            desc: "Real-time audio streaming platform featuring AI sentiment-based playlist generation and low-latency WebRTC group audio sessions.",
            tech: ["React", "WebAudio API", "Node.js", "Socket.io", "AWS S3"],
            metrics: ["1M+ Streams", "Real-time Sync", "Zero Buffer Lag"]
        }
    };

    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.project-card');
            const projId = card ? card.getAttribute('data-project-id') : 'neurchat';
            const data = projectDetailsData[projId] || projectDetailsData.neurchat;

            if (modalBody && projectModal) {
                modalBody.innerHTML = `
                    <div class="modal-project-view">
                        <div class="modal-img-wrap">
                            <img src="${data.img}" alt="${data.title}" class="modal-project-img">
                        </div>
                        <div class="modal-details">
                            <span class="section-tag">${data.subtitle}</span>
                            <h2>${data.title}</h2>
                            <p class="modal-desc">${data.desc}</p>
                            <h4>Technologies Used</h4>
                            <div class="tags-row">${data.tech.map(t => `<span class="project-tag">${t}</span>`).join(' ')}</div>
                            <h4>Impact Metrics</h4>
                            <div class="metrics-grid">${data.metrics.map(m => `<div class="metric-badge"><i class="fas fa-check-circle"></i> ${m}</div>`).join('')}</div>
                        </div>
                    </div>
                `;
                projectModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            projectModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // ═══════════════════════════════════════════════════
    // 🎨 THREE.JS 3D HOLOGRAPHIC AI AVATAR ENGINE
    // ═══════════════════════════════════════════════════
    let scene, camera, renderer, sphere, innerMesh, particleSystem, rings = [];
    let aiState = 'idle'; // 'idle', 'thinking', 'speaking'
    let canvasWidth = 300, canvasHeight = 260;

    function init3DAvatar() {
        const canvas = document.getElementById('three-ai-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const parent = canvas.parentElement;
        canvasWidth = parent.clientWidth || 300;
        canvasHeight = parent.clientHeight || 260;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(canvasWidth, canvasHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 1. Outer Holographic Cyber Sphere Mesh
        const geometry = new THREE.IcosahedronGeometry(1.6, 2);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        sphere = new THREE.Mesh(geometry, wireframeMaterial);
        scene.add(sphere);

        // 2. Inner Glowing Core
        const innerGeo = new THREE.IcosahedronGeometry(1.0, 1);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        innerMesh = new THREE.Mesh(innerGeo, innerMat);
        scene.add(innerMesh);

        // 3. Orbital Energy Rings
        for (let i = 0; i < 2; i++) {
            const ringGeo = new THREE.TorusGeometry(2.1 + i * 0.3, 0.02, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0x8b5cf6 : 0x22d3ee,
                transparent: true,
                opacity: 0.5
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / (2 + i);
            ring.rotation.y = Math.PI / 4;
            scene.add(ring);
            rings.push(ring);
        }

        // 4. Particle Starfield Cloud
        const particleCount = 200;
        const particlesGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 8;
            positions[i + 1] = (Math.random() - 0.5) * 8;
            positions[i + 2] = (Math.random() - 0.5) * 8;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMat = new THREE.PointsMaterial({
            color: 0x22d3ee,
            size: 0.04,
            transparent: true,
            opacity: 0.8
        });
        particleSystem = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particleSystem);

        animate3D();
    }

    let clock = new THREE.Clock();

    function animate3D() {
        requestAnimationFrame(animate3D);
        const elapsedTime = clock.getElapsedTime();

        if (sphere) {
            let speed = aiState === 'thinking' ? 0.04 : (aiState === 'speaking' ? 0.025 : 0.01);
            sphere.rotation.x += speed;
            sphere.rotation.y += speed * 1.5;

            innerMesh.rotation.x -= speed * 1.2;
            innerMesh.rotation.y -= speed * 0.8;

            // State specific dynamic animations
            if (aiState === 'thinking') {
                sphere.material.color.setHex(0x8b5cf6); // Purple pulse
                innerMesh.material.color.setHex(0xec4899);
                const scale = 1 + Math.sin(elapsedTime * 8) * 0.08;
                sphere.scale.set(scale, scale, scale);
            } else if (aiState === 'speaking') {
                sphere.material.color.setHex(0x22d3ee); // Cyan energy wave
                innerMesh.material.color.setHex(0x6366f1);
                const scale = 1 + Math.sin(elapsedTime * 12) * 0.12;
                sphere.scale.set(scale, scale, scale);
            } else {
                sphere.material.color.setHex(0x6366f1);
                innerMesh.material.color.setHex(0x22d3ee);
                sphere.scale.set(1, 1, 1);
            }
        }

        rings.forEach((ring, idx) => {
            ring.rotation.z += 0.01 * (idx + 1);
        });

        if (particleSystem) {
            particleSystem.rotation.y = elapsedTime * 0.05;
        }

        renderer.render(scene, camera);
    }

    function set3DAIState(state) {
        aiState = state;
        const statusEl = document.getElementById('ai-mode-status');
        if (!statusEl) return;

        if (state === 'thinking') {
            statusEl.innerHTML = `<i class="fas fa-microchip fa-spin"></i> Neural Inference...`;
            statusEl.style.color = '#8b5cf6';
        } else if (state === 'speaking') {
            statusEl.innerHTML = `<i class="fas fa-volume-up"></i> Voice Output...`;
            statusEl.style.color = '#22d3ee';
        } else {
            statusEl.innerHTML = `<i class="fas fa-brain"></i> System Ready`;
            statusEl.style.color = '#22c55e';
        }
    }

    // ═══════════════════════════════════════════════════
    // 🧠 3D HOLOGRAPHIC AI STUDIO CHATBOT ENGINE
    // ═══════════════════════════════════════════════════
    const studioModal = document.getElementById('ai-studio-modal');
    const studioOpenNavBtn = document.getElementById('open-ai-studio-btn');
    const studioOpenHeroBtn = document.getElementById('hero-open-ai-btn');
    const studioToggleWidgetBtn = document.getElementById('ai-chat-toggle');
    const studioCloseBtn = document.getElementById('ai-studio-close');

    const studioInput = document.getElementById('studio-input');
    const studioSendBtn = document.getElementById('studio-send-btn');
    const studioMessages = document.getElementById('studio-messages');
    const modelSelect = document.getElementById('ai-model-select');
    const micBtn = document.getElementById('mic-btn');
    const voiceOutBtn = document.getElementById('toggle-voice-out');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const exportChatBtn = document.getElementById('export-chat-btn');

    let voiceOutputEnabled = true;

    function openAIStudio() {
        if (studioModal) {
            studioModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (!renderer) {
                setTimeout(init3DAvatar, 100);
            }
        }
    }

    function closeAIStudio() {
        if (studioModal) {
            studioModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (studioOpenNavBtn) studioOpenNavBtn.addEventListener('click', openAIStudio);
    if (studioOpenHeroBtn) studioOpenHeroBtn.addEventListener('click', openAIStudio);
    if (studioToggleWidgetBtn) studioToggleWidgetBtn.addEventListener('click', openAIStudio);
    if (studioCloseBtn) studioCloseBtn.addEventListener('click', closeAIStudio);

    // AI Knowledge Base & Intelligent Generator
    function generateSmartAIResponse(query, model) {
        const q = query.toLowerCase();

        const modelNames = {
            claudeopus45: 'Anthropic Claude Opus 4.5 (Frontier Reasoning)',
            claudesonnet45: 'Anthropic Claude Sonnet 4.5 (Coding & Agents)',
            gpt5: 'OpenAI GPT-5 (Frontier General Intelligence)',
            gpt5mini: 'OpenAI GPT-5 Mini (Fast Agent Workflows)',
            o3: 'OpenAI o3 (Deep Reasoning & Tool Use)',
            gemini3pro: 'Google Gemini 3 Pro (Multimodal Reasoning)',
            gemini3flash: 'Google Gemini 3 Flash (High-Speed Agents)',
            grok4: 'xAI Grok 4 (Live Knowledge & Reasoning)',
            deepseekv32: 'DeepSeek V3.2 (Open Reasoning)',
            llama4: 'Meta Llama 4 Maverick (Open Multimodal)',
            legendzx: 'Legendzx Neural Core v4.5 (Edge Hardware Accelerated)'
        };

        const activeEngine = modelNames[model] || 'Latest AI Model Engine';
        const engineHeader = `⚡ *Response generated via **${activeEngine}***\n\n`;

        // 1. React / Code Request
        if (q.includes('code') || q.includes('react') || q.includes('write') || q.includes('function') || q.includes('script')) {
            return engineHeader + `Here is a production-ready **React Component** with glassmorphism styling and hooks:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

export const AIWidget = ({ title }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated Neural API fetch
    fetch('/api/neural-infer')
      .then(res => res.json())
      .then(res => { setData(res); setLoading(false); });
  }, []);

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10">
      <h3 className="text-xl font-bold gradient-text">{title}</h3>
      {loading ? <p>Running inference...</p> : <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
};
\`\`\`

You can drop this directly into your React / Next.js app! Would you like me to generate backend Node.js APIs or PyTorch handlers for it?`;
        }

        // 2. Machine Learning / Neural Net Explanation
        if (q.includes('explain') || q.includes('neural') || q.includes('ml') || q.includes('model')) {
            return engineHeader + `### 🧠 Neural Network & Transformer Architecture

A **Transformer model** consists of multi-head self-attention layers that compute contextual relationships between tokens simultaneously:

1. **Input Embedding**: Maps tokens into continuous $d_{\\text{model}}$ dimensional vector spaces.
2. **Self-Attention Query-Key-Value Matrix**:
   \\[ \\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V \\]
3. **Feed-Forward Layers**: Applies non-linear ReLU/GELU activations across hidden dimensions.

Legendzx AI has trained custom models achieving **99.4% accuracy** on edge computer vision and NLP streams!`;
        }

        // 3. Pricing / Quote Calculation
        if (q.includes('quote') || q.includes('budget') || q.includes('cost') || q.includes('price') || q.includes('estimate')) {
            return engineHeader + `💼 **Legendzx AI Project Pricing Matrix:**

- **Standard Web App**: $2,500 (14 Days Delivery)
- **AI/ML System Integration**: $3,500 (21 Days Delivery)
- **Mobile Cross-Platform App**: $3,000 (20 Days Delivery)
- **UI/UX Design System**: $1,800 (10 Days Delivery)

All projects include complete source code, automated unit tests, CI/CD setup, and 30 days post-launch support!`;
        }

        // 4. Contact / Hiring
        if (q.includes('hire') || q.includes('contact') || q.includes('email') || q.includes('available')) {
            return engineHeader + `📬 **Get in Touch with Legendzx AI:**

- 📧 **Direct Email**: \`hello@legendzxai.com\`
- 📱 **Phone**: \`+91 98765 43210\`
- 📍 **Location**: Bangalore, India (Working globally across US/EU timezones)

You can also use the built-in **Project Estimator** or **Contact Form** on this website to lock in your timeline!`;
        }

        // Default Intelligent Fallback
        return engineHeader + `I processed your request using **${activeEngine}**.

Legendzx AI specializes in building high-performance AI models, full-stack web applications, cross-platform mobile apps, and pixel-perfect design systems.

Feel free to ask me to **write code**, **estimate a project budget**, or **explain complex AI concepts**!`;
    }

    // Format Markdown Code Blocks with Copy Buttons
    function formatMessageText(text) {
        let html = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const cleanLang = lang || 'code';
            const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `
                <div class="code-block-wrapper">
                    <div class="code-block-header">
                        <span>${cleanLang}</span>
                        <button class="copy-code-btn" onclick="copyCodeSnippet(this)"><i class="far fa-copy"></i> Copy</button>
                    </div>
                    <pre><code class="language-${cleanLang}">${escapedCode}</code></pre>
                </div>
            `;
        });

        // Inline code & bold
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    window.copyCodeSnippet = function(btn) {
        const codeBlock = btn.closest('.code-block-wrapper').querySelector('code');
        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.innerText).then(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => btn.innerHTML = '<i class="far fa-copy"></i> Copy', 2000);
            });
        }
    };

    function addStudioMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isUser ? 'user-msg' : 'bot-msg'}`;
        msgDiv.innerHTML = `<div class="msg-bubble">${isUser ? text : formatMessageText(text)}</div>`;
        studioMessages.appendChild(msgDiv);
        studioMessages.scrollTop = studioMessages.scrollHeight;

        // Text to Speech for Bot message
        if (!isUser && voiceOutputEnabled && 'speechSynthesis' in window) {
            set3DAIState('speaking');
            const cleanSpeechText = text.replace(/```[\s\S]*?```/g, 'code snippet').replace(/[*#]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanSpeechText.substring(0, 200));
            utterance.rate = 1.0;
            utterance.onend = () => set3DAIState('idle');
            window.speechSynthesis.speak(utterance);
        }
    }

    function handleStudioSend() {
        const text = studioInput.value.trim();
        if (!text) return;

        addStudioMessage(text, true);
        studioInput.value = '';

        set3DAIState('thinking');

        setTimeout(() => {
            const selectedModel = modelSelect ? modelSelect.value : 'neural';
            const botReply = generateSmartAIResponse(text, selectedModel);
            addStudioMessage(botReply, false);
            if (!voiceOutputEnabled) set3DAIState('idle');
        }, 900);
    }

    if (studioSendBtn && studioInput) {
        studioSendBtn.addEventListener('click', handleStudioSend);
        studioInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleStudioSend();
        });
    }

    // Quick Tool Buttons
    document.querySelectorAll('.studio-tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            let promptText = "";
            if (action === 'code') promptText = "Write a complete React Component with glassmorphism UI";
            else if (action === 'explain') promptText = "Explain how Transformer neural networks work";
            else if (action === 'math') promptText = "Solve matrix self-attention math formulation";
            else if (action === 'quote') promptText = "Calculate full-stack project estimate pricing";

            studioInput.value = promptText;
            handleStudioSend();
        });
    });

    // Voice Input (Web Speech Recognition)
    if (micBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;

            micBtn.addEventListener('click', () => {
                recognition.start();
                micBtn.classList.add('recording');
            });

            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                studioInput.value = transcript;
                micBtn.classList.remove('recording');
                handleStudioSend();
            };

            recognition.onerror = () => micBtn.classList.remove('recording');
            recognition.onend = () => micBtn.classList.remove('recording');
        } else {
            micBtn.style.display = 'none';
        }
    }

    // Voice Output Toggle
    if (voiceOutBtn) {
        voiceOutBtn.addEventListener('click', () => {
            voiceOutputEnabled = !voiceOutputEnabled;
            voiceOutBtn.classList.toggle('active', voiceOutputEnabled);
            if (!voiceOutputEnabled && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        });
    }

    // Clear Chat
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            studioMessages.innerHTML = `
                <div class="chat-msg bot-msg">
                    <div class="msg-bubble">
                        🤖 Chat memory cleared. How can I assist you now?
                    </div>
                </div>
            `;
        });
    }

    // Export Chat Transcript
    if (exportChatBtn) {
        exportChatBtn.addEventListener('click', () => {
            let transcript = "# Legendzx AI Studio Transcript\n\n";
            document.querySelectorAll('.chat-msg').forEach(msg => {
                const isUser = msg.classList.contains('user-msg');
                transcript += `### ${isUser ? 'User' : 'Legendzx AI'}:\n${msg.innerText}\n\n`;
            });

            const blob = new Blob([transcript], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Legendzx_AI_Transcript.md';
            a.click();
        });
    }

    // ═══════════════ RESUME DOWNLOAD ═══════════════
    const quickResumeBtn = document.getElementById('quick-resume-btn');
    if (quickResumeBtn) {
        quickResumeBtn.addEventListener('click', () => {
            alert('Downloading Legendzx AI Resume & Technical Portfolio PDF...');
        });
    }

    // ═══════════════ TESTIMONIALS CAROUSEL ═══════════════
    const track = document.getElementById('testimonial-track');
    const cards = track ? track.querySelectorAll('.testimonial-card') : [];
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');
    let currentIndex = 0;

    if (track && cards.length > 0 && dotsContainer) {
        cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        function goToSlide(index) {
            currentIndex = index;
            const offset = -index * 100;
            track.style.transform = `translateX(${offset}%)`;
            document.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === index);
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
            goToSlide(currentIndex);
        });

        if (nextBtn) nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % cards.length;
            goToSlide(currentIndex);
        });
    }

    // ═══════════════ CONTACT FORM ═══════════════
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitBtn.classList.add('sending');
            submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';

            setTimeout(() => {
                submitBtn.classList.remove('sending');
                submitBtn.classList.add('sent');
                submitBtn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.classList.remove('sent');
                    submitBtn.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
                }, 3000);
            }, 1800);
        });
    }

    // Floating labels
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => {
            if (!input.value) input.parentElement.classList.remove('focused');
        });
        if (input.value) input.parentElement.classList.add('focused');
    });

    // ═══════════════ SMOOTH SCROLL ═══════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ═══════════════ BACK TO TOP ═══════════════
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});
