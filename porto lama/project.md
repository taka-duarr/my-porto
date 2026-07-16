<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Expertise &amp; Work | STUDIO.DEV</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&amp;family=Outfit:wght@300;400&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container-highest": "#353536",
                        "error": "#ffb4ab",
                        "tertiary": "#ffb4a3",
                        "surface-variant": "#353536",
                        "surface-container": "#1f1f21",
                        "secondary-fixed-dim": "#c4c7c9",
                        "surface-dim": "#131315",
                        "on-secondary-container": "#b6b9bb",
                        "on-tertiary-fixed-variant": "#822714",
                        "on-surface": "#e4e2e3",
                        "on-error": "#690005",
                        "on-tertiary-fixed": "#3d0600",
                        "inverse-surface": "#e4e2e3",
                        "on-tertiary": "#621001",
                        "primary": "#bcc7de",
                        "surface-container-high": "#2a2a2b",
                        "tertiary-container": "#550b00",
                        "on-surface-variant": "#c5c6cd",
                        "on-primary": "#263143",
                        "on-background": "#e4e2e3",
                        "secondary-container": "#464a4b",
                        "error-container": "#93000a",
                        "inverse-primary": "#545f73",
                        "on-error-container": "#ffdad6",
                        "on-primary-fixed": "#111c2d",
                        "on-secondary-fixed": "#191c1e",
                        "secondary-fixed": "#e0e3e5",
                        "on-primary-fixed-variant": "#3c475a",
                        "on-secondary": "#2d3133",
                        "inverse-on-surface": "#303032",
                        "on-secondary-fixed-variant": "#444749",
                        "tertiary-fixed": "#ffdad2",
                        "background": "#131315",
                        "on-tertiary-container": "#e16e54",
                        "surface-bright": "#39393a",
                        "outline-variant": "#45474c",
                        "on-primary-container": "#8590a6",
                        "tertiary-fixed-dim": "#ffb4a3",
                        "primary-container": "#1e293b",
                        "surface-container-lowest": "#0e0e0f",
                        "surface-container-low": "#1b1b1d",
                        "secondary": "#c4c7c9",
                        "surface": "#131315",
                        "surface-tint": "#bcc7de",
                        "primary-fixed": "#d8e3fb",
                        "outline": "#8f9097",
                        "primary-fixed-dim": "#bcc7de"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "section-padding-desktop": "120px",
                        "gutter": "32px",
                        "container-max": "1280px",
                        "section-padding-mobile": "64px",
                        "unit": "8px"
                    },
                    "fontFamily": {
                        "display-lg-mobile": ["Plus Jakarta Sans"],
                        "body-md": ["Outfit"],
                        "headline-lg": ["Plus Jakarta Sans"],
                        "display-lg": ["Plus Jakarta Sans"],
                        "body-lg": ["Outfit"],
                        "headline-md": ["Plus Jakarta Sans"],
                        "label-md": ["Plus Jakarta Sans"]
                    },
                    "fontSize": {
                        "display-lg-mobile": ["40px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-lg": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600" }],
                        "display-lg": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
                        "body-lg": ["20px", { "lineHeight": "1.6", "fontWeight": "300" }],
                        "headline-md": ["32px", { "lineHeight": "1.3", "fontWeight": "600" }],
                        "label-md": ["14px", { "lineHeight": "1.0", "letterSpacing": "0.05em", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        body {
            background-color: #0F172A; /* Base background from Style Guidance */
            color: theme('colors.on-background');
        }
        .glass-panel {
            background-color: rgba(30, 41, 59, 0.7); /* Surface lighter slate with transparency */
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .skill-tag {
            border-bottom: 1px solid theme('colors.tertiary'); /* Terracotta accent #E06D53 implied by tertiary */
            transition: all 0.3s ease;
        }
        .skill-tag:hover {
            background-color: rgba(224, 109, 83, 0.1); /* Subtle terracotta glow */
        }
        .project-card-image-wrap {
            overflow: hidden;
        }
        .project-card-image {
            transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.5s ease;
            filter: grayscale(10%); /* Desaturate 10% by default per guidelines */
        }
        .project-card:hover .project-card-image {
            transform: scale(1.05);
            filter: grayscale(0%);
        }
        .ambient-shadow:hover {
            box-shadow: 0 40px 60px -15px rgba(15, 23, 42, 0.5), 0 0 40px 10px rgba(188, 199, 222, 0.05); /* Tinted with primary bg */
        }
        .tech-tag {
            color: #8A9A5B; /* Sage Green from guidelines */
            background-color: rgba(138, 154, 91, 0.1);
            border: 1px solid rgba(138, 154, 91, 0.2);
        }
        .btn-primary {
            background-color: #E06D53; /* Terracotta */
            color: white;
            transition: opacity 0.3s ease;
        }
        .btn-primary:hover {
            opacity: 0.9;
        }
        .btn-ghost {
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: theme('colors.on-surface');
            transition: border-color 0.3s ease, background-color 0.3s ease;
        }
        .btn-ghost:hover {
            border-color: rgba(255, 255, 255, 1);
            background-color: rgba(255, 255, 255, 0.05);
        }
    </style>
</head>
<body class="antialiased selection:bg-tertiary selection:text-white">
<!-- TopNavBar -->
<nav class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-on-surface/10 transition-all duration-300 ease-out hidden md:block">
<div class="flex justify-between items-center max-w-container-max mx-auto px-gutter h-20">
<a class="font-headline-md text-headline-md font-bold text-on-surface tracking-tighter" href="#">STUDIO.DEV</a>
<div class="flex items-center gap-8">
<div class="flex gap-6">
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-300" href="#">Work</a>
<a class="font-label-md text-label-md text-tertiary border-b border-tertiary pb-1 hover:text-on-surface transition-colors duration-300" href="#">Expertise</a>
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-300" href="#">About</a>
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-300" href="#">Contact</a>
</div>
<a class="font-label-md text-label-md text-on-surface hover:text-tertiary transition-colors duration-300 ml-4 border border-outline-variant px-4 py-2 rounded-DEFAULT btn-ghost" href="#">Resume</a>
</div>
</div>
</nav>
<!-- Mobile Nav Anchor -->
<nav class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-on-surface/10 md:hidden">
<div class="flex justify-between items-center px-4 h-16">
<a class="font-headline-md text-headline-md font-bold text-on-surface tracking-tighter text-xl" href="#">STUDIO.DEV</a>
<button class="text-on-surface"><span class="material-symbols-outlined">menu</span></button>
</div>
</nav>
<main class="pt-24 md:pt-40 pb-section-padding-mobile md:pb-section-padding-desktop px-4 md:px-gutter max-w-container-max mx-auto">
<!-- Header Section -->
<header class="mb-20 md:mb-32 max-w-4xl">
<h1 class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6">Architecting <br/><span class="text-on-surface-variant">Digital Spaces.</span></h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">A curated selection of technical solutions and the foundational expertise that powers them. Designed with intentionality, built for scale.</p>
</header>
<!-- Skills Section - Minimalist Grid -->
<section class="mb-32">
<div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
<div class="md:col-span-4">
<h2 class="font-headline-md text-headline-md text-on-surface mb-4">Expertise</h2>
<p class="font-body-md text-body-md text-on-surface-variant max-w-sm">The technical foundation enabling scalable, high-performance web applications. Focused on modern stacks and resilient architectures.</p>
</div>
<div class="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
<!-- Skill Tags -->
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">React</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">TypeScript</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">Node.js</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">Next.js</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">AWS</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">GraphQL</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">PostgreSQL</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">Tailwind CSS</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">Docker</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
<div class="skill-tag px-4 py-3 bg-surface-container-low rounded-DEFAULT flex items-center justify-between cursor-default">
<span class="font-label-md text-label-md text-on-surface">Figma</span>
<div class="w-1 h-1 bg-tertiary"></div>
</div>
</div>
</div>
</section>
<!-- Projects Section - Asymmetrical Grid -->
<section>
<div class="mb-12 flex justify-between items-end border-b border-outline-variant pb-6">
<h2 class="font-headline-lg text-headline-lg text-on-surface">Selected Work</h2>
<a class="font-label-md text-label-md text-on-surface-variant hover:text-tertiary transition-colors flex items-center gap-2" href="#">View All <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 0;">arrow_forward</span></a>
</div>
<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-gutter">
<!-- Project 1: Spans full width on mobile, 8 cols on desktop -->
<div class="md:col-span-8 group project-card ambient-shadow rounded-lg transition-all duration-500 relative cursor-pointer block bg-surface-container">
<div class="project-card-image-wrap aspect-video rounded-t-lg bg-surface-bright relative">
<img alt="E-commerce Platform Architecture" class="w-full h-full object-cover project-card-image absolute inset-0" data-alt="A sleek, modern web application interface displayed on a high-resolution monitor, showcasing a complex e-commerce dashboard. The screen reveals intricate data visualization charts in muted sage green and terracotta tones against a dark slate background. The lighting is moody and cinematic, highlighting the clean lines of the device and the sophisticated glassmorphic UI elements. The overall aesthetic is professional, architectural, and highly technical." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwudezppqaTAoliNwc4gXq-ZwNYw9OdQFHfGLZdFfGSUZFD9fkFaWRbs-enYNRmQ5weH6vzd9qeJLV5ygMMyaKEO54_MACr5rYOiLFJIkAF9N_5RP0PheaTkC0nW91cyofYId2WihW6bspLnlDPYE8IYi35pqzqW5MoxtmKWJCaq8S6-itX4SylMDq6h2HItUt-rcUSf3jqNT3lqfeH7sFxyfte9McQetzpgJbYIkOuXjj_DukEt6jrTF_Bz_CTJIfjC7S63KysdKS"/>
</div>
<div class="glass-panel absolute bottom-0 left-0 w-full p-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 rounded-b-lg border-t-0">
<div>
<h3 class="font-headline-md text-headline-md text-on-surface mb-2">Aura E-Commerce</h3>
<p class="font-body-md text-body-md text-on-surface-variant mb-4 max-w-md">A headless commerce solution built for a luxury fashion brand, featuring sub-second page loads and seamless inventory sync.</p>
<div class="flex flex-wrap gap-2">
<span class="tech-tag font-label-md text-[11px] px-2 py-1 rounded-sm uppercase tracking-wider">Next.js</span>
<span class="tech-tag font-label-md text-[11px] px-2 py-1 rounded-sm uppercase tracking-wider">Shopify API</span>
<span class="tech-tag font-label-md text-[11px] px-2 py-1 rounded-sm uppercase tracking-wider">Framer Motion</span>
</div>
</div>
<div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
<span class="btn-primary font-label-md text-label-md px-6 py-3 rounded-DEFAULT inline-flex items-center gap-2">
                                View Project <span class="material-symbols-outlined text-sm">arrow_outward</span>
</span>
</div>
</div>
</div>
<!-- Project 2: Spans 4 cols on desktop -->
<div class="md:col-span-4 group project-card ambient-shadow rounded-lg transition-all duration-500 relative cursor-pointer block bg-surface-container flex flex-col h-full">
<div class="project-card-image-wrap flex-grow min-h-[240px] rounded-t-lg bg-surface-bright relative">
<img alt="Financial Analytics Dashboard" class="w-full h-full object-cover project-card-image absolute inset-0" data-alt="A close-up, angled view of a minimalist smartphone displaying a financial technology application. The interface features clean typography and subtle translucent layers over a dark, high-end slate background. A subtle glow of terracotta accentuates an active graph line. The setting suggests a premium, modern workspace with soft, ambient lighting emphasizing the device's sleek geometry." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJGiePen5aJH8thw3vxvAbLBhWFdG_WYMbDlw73xK-V0HwMIXqeLsPulpWxOtdpKAg8DrORT9TbwLXVGl1cyTe6xC9wxkLOApkYO4Ks-ODaNe31G6xEmBo6xRRTginfF6Gkqu5R66JMeO6cXi_xMjKlyU0_od8A8k53258e19iFjghN0LR1F7quTFDWNQQgFBfcvgZ8ca7b6zAdq5ohqPJiGl3dOlpOMl7VB9-v0YI1cA0wQiajUPYHDDTPpvIdAPgD82mUP749wWg"/>
</div>
<div class="glass-panel p-6 flex flex-col justify-between rounded-b-lg border-t-0">
<div class="mb-6">
<h3 class="font-headline-md text-2xl font-bold text-on-surface mb-2">Fintech Analytics App</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Real-time data processing and visualization for institutional investors.</p>
</div>
<div class="flex flex-col gap-4">
<div class="flex flex-wrap gap-2">
<span class="tech-tag font-label-md text-[11px] px-2 py-1 rounded-sm uppercase tracking-wider">React Native</span>
<span class="tech-tag font-label-md text-[11px] px-2 py-1 rounded-sm uppercase tracking-wider">Node.js</span>
</div>
<div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end">
<span class="text-tertiary font-label-md text-label-md inline-flex items-center gap-1 hover:text-white transition-colors">
                                    Explore <span class="material-symbols-outlined text-sm">arrow_forward</span>
</span>
</div>
</div>
</div>
</div>
</div>
</section>
</main>
<!-- Footer -->
<footer class="bg-surface-dim w-full py-section-padding-desktop border-t border-outline-variant">
<div class="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-unit">
<div class="font-headline-md text-headline-md text-on-surface mb-6 md:mb-0">
                STUDIO.DEV
            </div>
<div class="flex gap-6 mb-6 md:mb-0">
<a class="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-all opacity-80 hover:opacity-100" href="#">LinkedIn</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-all opacity-80 hover:opacity-100" href="#">GitHub</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-all opacity-80 hover:opacity-100" href="#">Read.cv</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-all opacity-80 hover:opacity-100" href="#">Email</a>
</div>
<div class="font-body-md text-body-md text-on-surface-variant text-sm">
                © 2024 Architectural Code Studio. Built with intentionality.
            </div>
</div>
</footer>
</body></html>