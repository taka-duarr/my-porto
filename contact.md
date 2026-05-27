<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Contact | STUDIO.DEV</title>
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
                    "display-lg-mobile": [
                            "Plus Jakarta Sans"
                    ],
                    "body-md": [
                            "Outfit"
                    ],
                    "headline-lg": [
                            "Plus Jakarta Sans"
                    ],
                    "display-lg": [
                            "Plus Jakarta Sans"
                    ],
                    "body-lg": [
                            "Outfit"
                    ],
                    "headline-md": [
                            "Plus Jakarta Sans"
                    ],
                    "label-md": [
                            "Plus Jakarta Sans"
                    ]
            },
            "fontSize": {
                    "display-lg-mobile": [
                            "40px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "-0.02em",
                                    "fontWeight": "700"
                            }
                    ],
                    "body-md": [
                            "16px",
                            {
                                    "lineHeight": "1.6",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-lg": [
                            "48px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "-0.02em",
                                    "fontWeight": "600"
                            }
                    ],
                    "display-lg": [
                            "72px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "-0.04em",
                                    "fontWeight": "700"
                            }
                    ],
                    "body-lg": [
                            "20px",
                            {
                                    "lineHeight": "1.6",
                                    "fontWeight": "300"
                            }
                    ],
                    "headline-md": [
                            "32px",
                            {
                                    "lineHeight": "1.3",
                                    "fontWeight": "600"
                            }
                    ],
                    "label-md": [
                            "14px",
                            {
                                    "lineHeight": "1.0",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "600"
                            }
                    ]
            }
    },
        },
      }
    </script>
<style>
        body {
            background-color: #0F172A; /* Slate fallback, overwritten by Tailwind dark classes */
        }
    </style>
</head>
<body class="bg-background text-on-background min-h-screen flex flex-col font-body-md selection:bg-tertiary/30 selection:text-tertiary">
<!-- TopNavBar -->
<header class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-on-surface/10 transition-all duration-300 ease-out">
<nav class="flex justify-between items-center max-w-container-max mx-auto px-gutter h-20">
<div class="font-headline-md text-headline-md font-bold text-on-surface tracking-tighter cursor-pointer">
                STUDIO.DEV
            </div>
<!-- Desktop Nav -->
<div class="hidden md:flex items-center gap-8">
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-300" href="#">Work</a>
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-300" href="#">Expertise</a>
<a class="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors duration-300" href="#">About</a>
<a class="font-label-md text-label-md text-tertiary border-b border-tertiary pb-1 hover:text-on-surface transition-colors duration-300" href="#">Contact</a>
</div>
<!-- Mobile Menu Toggle (Decorative) -->
<div class="md:hidden">
<span class="material-symbols-outlined text-on-surface cursor-pointer" data-icon="menu" style="font-size: 28px;">menu</span>
</div>
<div class="hidden md:block">
<button class="font-label-md text-label-md px-6 py-2.5 rounded border border-on-surface/20 hover:border-on-surface/100 hover:bg-on-surface/5 transition-all duration-300 text-on-surface">
                    Resume
                </button>
</div>
</nav>
</header>
<!-- Main Content -->
<main class="flex-grow pt-32 pb-section-padding-mobile md:pb-section-padding-desktop px-4 md:px-gutter max-w-container-max mx-auto w-full flex flex-col justify-center">
<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-gutter mt-12 md:mt-24">
<!-- Intro / Context (Cols 2-5) -->
<div class="md:col-start-2 md:col-span-4 flex flex-col justify-start pt-4">
<h1 class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6">
                    Get in touch.
                </h1>
<p class="font-body-lg text-body-lg text-on-surface-variant mb-12">
                    Whether you have a specific project in mind, need technical consultation, or just want to discuss the architecture of your next big idea, I'm ready to collaborate.
                </p>
<div class="space-y-6">
<div class="flex items-start gap-4">
<span class="material-symbols-outlined text-tertiary" data-icon="mail" style="font-size: 24px;">mail</span>
<div>
<p class="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Direct</p>
<a class="font-body-md text-body-md text-on-surface hover:text-tertiary transition-colors" href="mailto:hello@studio.dev">hello@studio.dev</a>
</div>
</div>
<div class="flex items-start gap-4">
<span class="material-symbols-outlined text-tertiary" data-icon="location_on" style="font-size: 24px;">location_on</span>
<div>
<p class="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Location</p>
<p class="font-body-md text-body-md text-on-surface">Available for remote work globally.</p>
</div>
</div>
</div>
</div>
<!-- Contact Form (Cols 7-11) - Glassmorphic Card -->
<div class="md:col-start-7 md:col-span-5 bg-surface-container/50 backdrop-blur-xl border border-on-surface/10 rounded-xl p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
<form action="#" class="space-y-8 flex flex-col h-full justify-between" method="POST">
<div class="space-y-8">
<!-- Name Field -->
<div class="relative group">
<input class="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-on-surface font-body-md py-3 px-0 transition-colors placeholder-transparent peer" id="name" name="name" placeholder="Name" required="" type="text"/>
<label class="absolute left-0 top-3 text-on-surface-variant font-body-md transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-tertiary peer-valid:-top-4 peer-valid:text-xs peer-valid:text-on-surface-variant" for="name">
                                Your Name
                            </label>
</div>
<!-- Email Field -->
<div class="relative group">
<input class="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-on-surface font-body-md py-3 px-0 transition-colors placeholder-transparent peer" id="email" name="email" placeholder="Email" required="" type="email"/>
<label class="absolute left-0 top-3 text-on-surface-variant font-body-md transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-tertiary peer-valid:-top-4 peer-valid:text-xs peer-valid:text-on-surface-variant" for="email">
                                Email Address
                            </label>
</div>
<!-- Subject Field -->
<div class="relative group">
<input class="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-on-surface font-body-md py-3 px-0 transition-colors placeholder-transparent peer" id="subject" name="subject" placeholder="Subject" type="text"/>
<label class="absolute left-0 top-3 text-on-surface-variant font-body-md transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-tertiary peer-valid:-top-4 peer-valid:text-xs peer-valid:text-on-surface-variant" for="subject">
                                Project Type / Subject
                            </label>
</div>
<!-- Message Field -->
<div class="relative group">
<textarea class="w-full bg-transparent border-0 border-b border-outline-variant focus:border-tertiary focus:ring-0 text-on-surface font-body-md py-3 px-0 transition-colors placeholder-transparent peer resize-none" id="message" name="message" placeholder="Message" required="" rows="4"></textarea>
<label class="absolute left-0 top-3 text-on-surface-variant font-body-md transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-tertiary peer-valid:-top-4 peer-valid:text-xs peer-valid:text-on-surface-variant" for="message">
                                Project Details
                            </label>
</div>
</div>
<!-- Submit Button -->
<div class="pt-8">
<button class="w-full bg-[#E06D53] hover:bg-[#c95b42] text-white font-label-md text-label-md py-4 rounded transition-all duration-300 flex items-center justify-center gap-2 group" type="submit">
                            Send Message
                            <span class="material-symbols-outlined text-white transition-transform group-hover:translate-x-1" data-icon="arrow_forward" style="font-size: 20px;">arrow_forward</span>
</button>
</div>
</form>
</div>
</div>
</main>
<!-- Footer -->
<footer class="w-full py-section-padding-desktop border-t border-outline-variant bg-surface-dim">
<div class="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-unit">
<div class="font-headline-md text-headline-md text-on-surface mb-4 md:mb-0">
                STUDIO.DEV
            </div>
<div class="font-body-md text-body-md text-on-surface-variant text-center md:text-left mb-4 md:mb-0">
                © 2024 Architectural Code Studio. Built with intentionality.
            </div>
<div class="flex items-center gap-6">
<a class="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-all opacity-80 hover:opacity-100" href="#">LinkedIn</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-all opacity-80 hover:opacity-100" href="#">GitHub</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-all opacity-80 hover:opacity-100" href="#">Read.cv</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-tertiary transition-all opacity-80 hover:opacity-100" href="#">Email</a>
</div>
</div>
</footer>
</body></html>