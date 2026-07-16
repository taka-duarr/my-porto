<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>STUDIO.DEV - Full Stack Developer Portfolio</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400&amp;family=Plus+Jakarta+Sans:wght@600;700&amp;display=swap" rel="stylesheet"/>
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
            background-color: #0F172A; /* Deep slate override */
            color: #e4e2e3;
        }
        .glass-panel {
            background: rgba(30, 41, 59, 0.4); /* #1E293B */
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .bento-card {
            background: #1E293B;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bento-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 40px 60px -15px rgba(0, 0, 0, 0.3);
            border-color: rgba(224, 109, 83, 0.2); /* Terracotta hint */
        }
        .text-terracotta {
            color: #E06D53;
        }
        .bg-terracotta {
            background-color: #E06D53;
        }
        .border-terracotta {
            border-color: #E06D53;
        }
    </style>
</head>
<body class="antialiased font-body-md text-body-md overflow-x-hidden selection:bg-terracotta/30">
<!-- TopNavBar -->
<nav class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-on-surface/10 transition-all duration-300 ease-out">
<div class="flex justify-between items-center max-w-container-max mx-auto px-gutter h-20">
<a class="font-headline-md text-headline-md font-bold text-on-surface tracking-tighter" href="#">STUDIO.DEV</a>
<div class="hidden md:flex items-center gap-8">
<a class="font-label-md text-label-md text-tertiary border-b border-tertiary pb-1" href="#">Work</a>
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-300" href="#">Expertise</a>
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-300" href="#">About</a>
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-300" href="#">Contact</a>
</div>
<button class="hidden md:inline-flex items-center justify-center px-6 py-3 font-label-md text-label-md text-on-surface border border-on-surface/20 hover:border-on-surface/50 transition-colors duration-300 rounded">
                Resume
            </button>
<!-- Mobile Menu Trigger -->
<button class="md:hidden text-on-surface">
<span class="material-symbols-outlined" style="font-size: 28px;">menu</span>
</button>
</div>
</nav>
<main class="pt-32 pb-section-padding-mobile md:pb-section-padding-desktop">
<!-- Hero Section (Editorial Asymmetrical) -->
<section class="max-w-container-max mx-auto px-gutter mb-section-padding-mobile md:mb-section-padding-desktop">
<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-gutter items-center min-h-[716px]">
<!-- Text Content (Cols 1-7) -->
<div class="md:col-span-7 order-2 md:order-1 flex flex-col justify-center z-10">
<div class="mb-4 inline-flex items-center gap-3">
<span class="w-8 h-[1px] bg-terracotta block"></span>
<span class="font-label-md text-label-md text-terracotta uppercase tracking-widest">Full Stack Engineer</span>
</div>
<h1 class="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-6 leading-tight">
                        Architecting digital <br class="hidden md:block"/>
                        experiences with <span class="text-on-surface-variant italic font-light">precision</span>.
                    </h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-10">
                        Bridging the gap between robust backend architecture and meticulous frontend design. Crafting scalable solutions that feel effortless.
                    </p>
<div class="flex flex-wrap gap-4">
<a class="inline-flex items-center justify-center px-8 py-4 bg-terracotta text-white font-label-md text-label-md rounded hover:bg-opacity-90 transition-all shadow-[0_0_40px_rgba(224,109,83,0.3)]" href="#">
                            View Selected Works
                        </a>
<a class="inline-flex items-center justify-center px-8 py-4 border border-on-surface/20 text-on-surface font-label-md text-label-md rounded hover:bg-on-surface/5 transition-all" href="#">
                            About The Studio
                        </a>
</div>
</div>
<!-- Image/Visual Anchor (Cols 8-12) -->
<div class="md:col-span-5 order-1 md:order-2 relative w-full aspect-[4/5] md:aspect-[3/4]">
<div class="absolute inset-0 bg-primary-container rounded-lg overflow-hidden glass-panel z-0">
<img alt="Profile Portrait" class="w-full h-full object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 ease-in-out" data-alt="A moody, high-fashion editorial portrait of a developer in a sophisticated studio setting. The lighting is dramatic, casting deep shadows that contrast with a soft, natural key light on the subject's face. The background is a minimalist, dark slate texture. The overall aesthetic is mature, architectural, and premium, utilizing deep blacks, subtle greys, and a hint of warm terracotta ambient light to match the modern portfolio UI." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeXp26WXHZ5sBNvi2M5IIZb1xAiSNQ3WL5IVF78lOsj8mK1TRHPH6fZS3AXwOwMPEk8ncm-HWS87yLGPeg8RGshEikWHX79jnlQXHVI_usm0zQvXrg7aH8rzSrSqrIyiF-6WLuK6zNICW-QHxhSH3IDplDdTN0VBUIjVg2K7xjCMHBc_U6dayG7ChIfDn-3rJvqNQBB8QyhY3OvF5RrUNGh_yamkn1a7zMlTK4qlv85YLtYvZkeiDdrZ6BIMhJztkJx6ZtkjHbebtH"/>
</div>
<!-- Decorative element -->
<div class="absolute -bottom-6 -left-6 w-32 h-32 bg-surface-container rounded-lg border border-outline-variant/30 hidden md:flex items-center justify-center z-20 shadow-2xl backdrop-blur-md">
<div class="text-center">
<span class="block font-headline-md text-headline-md text-on-surface">5+</span>
<span class="block font-label-md text-label-md text-on-surface-variant text-[10px]">Years Exp.</span>
</div>
</div>
</div>
</div>
</section>
<!-- About Bento Grid -->
<section class="max-w-container-max mx-auto px-gutter">
<div class="mb-12 flex items-end justify-between">
<div>
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">The Foundation</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Background, skills, and metrics.</p>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<!-- History / Timeline (Spans 2 cols on desktop) -->
<div class="bento-card rounded-xl p-8 md:col-span-2 flex flex-col justify-between group">
<div class="mb-8 flex justify-between items-start">
<h3 class="font-headline-md text-headline-md text-on-surface">History</h3>
<span class="material-symbols-outlined text-terracotta opacity-50 group-hover:opacity-100 transition-opacity">history</span>
</div>
<div class="space-y-6 relative before:absolute before:inset-y-0 before:left-2 before:w-[1px] before:bg-outline-variant/50">
<div class="relative pl-8">
<span class="absolute left-[3px] top-2 w-[5px] h-[5px] bg-terracotta rounded-full shadow-[0_0_10px_rgba(224,109,83,0.8)]"></span>
<p class="font-label-md text-label-md text-on-surface-variant mb-1">2021 - Present</p>
<h4 class="font-body-lg text-body-lg text-on-surface font-medium">Senior Engineer at Vercel</h4>
<p class="font-body-md text-body-md text-on-surface-variant mt-2">Leading frontend architecture and edge computing integration.</p>
</div>
<div class="relative pl-8">
<span class="absolute left-[3px] top-2 w-[5px] h-[5px] bg-outline-variant rounded-full"></span>
<p class="font-label-md text-label-md text-on-surface-variant mb-1">2018 - 2021</p>
<h4 class="font-body-lg text-body-lg text-on-surface font-medium">Full Stack Dev at Stripe</h4>
<p class="font-body-md text-body-md text-on-surface-variant mt-2">Developed core dashboard features and internal tooling.</p>
</div>
</div>
</div>
<!-- Education -->
<div class="bento-card rounded-xl p-8 flex flex-col justify-between group">
<div class="mb-8 flex justify-between items-start">
<h3 class="font-headline-md text-headline-md text-on-surface">Education</h3>
<span class="material-symbols-outlined text-terracotta opacity-50 group-hover:opacity-100 transition-opacity">school</span>
</div>
<div>
<div class="mb-6">
<h4 class="font-body-lg text-body-lg text-on-surface font-medium">MSc Computer Science</h4>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">Stanford University</p>
<p class="font-label-md text-label-md text-on-surface-variant opacity-60 mt-1">2016 - 2018</p>
</div>
<div>
<h4 class="font-body-lg text-body-lg text-on-surface font-medium">BSc Software Eng.</h4>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">MIT</p>
<p class="font-label-md text-label-md text-on-surface-variant opacity-60 mt-1">2012 - 2016</p>
</div>
</div>
</div>
<!-- Core Stack (List) -->
<div class="bento-card rounded-xl p-8 flex flex-col group">
<div class="mb-6 flex justify-between items-start">
<h3 class="font-headline-md text-headline-md text-on-surface">Core Stack</h3>
<span class="material-symbols-outlined text-terracotta opacity-50 group-hover:opacity-100 transition-opacity">code_blocks</span>
</div>
<ul class="space-y-3 mt-auto">
<li class="flex items-center gap-3 text-on-surface font-body-md text-body-md">
<span class="w-1 h-1 bg-terracotta block"></span> TypeScript / Node.js
                        </li>
<li class="flex items-center gap-3 text-on-surface font-body-md text-body-md">
<span class="w-1 h-1 bg-terracotta block"></span> React / Next.js
                        </li>
<li class="flex items-center gap-3 text-on-surface font-body-md text-body-md">
<span class="w-1 h-1 bg-terracotta block"></span> PostgreSQL / Prisma
                        </li>
<li class="flex items-center gap-3 text-on-surface font-body-md text-body-md">
<span class="w-1 h-1 bg-terracotta block"></span> AWS / Docker
                        </li>
</ul>
</div>
<!-- Stats / Metrics -->
<div class="bento-card rounded-xl p-8 md:col-span-2 grid grid-cols-2 gap-4 group">
<div class="flex flex-col justify-center border-r border-outline-variant/30 pr-4">
<span class="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface">42+</span>
<span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-2">Projects Shipped</span>
</div>
<div class="flex flex-col justify-center pl-4">
<span class="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface">99%</span>
<span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-2">Client Satisfaction</span>
</div>
</div>
</div>
</section>
</main>
<!-- Footer -->
<footer class="w-full py-section-padding-desktop border-t border-outline-variant bg-surface-dim">
<div class="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-unit">
<div class="font-headline-md text-headline-md text-on-surface mb-6 md:mb-0">STUDIO.DEV</div>
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