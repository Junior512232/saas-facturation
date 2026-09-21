const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Header
content = content.replace(
  '<div className="max-w-md mx-auto px-5 h-20 flex items-center justify-between">',
  '<div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">'
);

// Hero
content = content.replace(
  '<section className="pt-8 pb-14 px-5 max-w-md mx-auto">',
  '<section className="pt-8 pb-14 lg:pt-24 lg:pb-32 px-5 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">'
);
// Wrap Hero text and CTA in a div
content = content.replace(
  '{/* Minimalist Category Chip */}',
  '<div className="lg:w-1/2">\n          {/* Minimalist Category Chip */}'
);
// Before Hero Visual Elements, close the text div and open the visuals div
content = content.replace(
  '{/* Hero Visual Elements & SeePay Style Visual Hierarchy */}',
  '</div>\n          {/* Hero Visual Elements & SeePay Style Visual Hierarchy */}\n          <div className="lg:w-1/2 w-full">'
);
// The section closing remains the same, but wait, the inner div for visuals was `<div className="relative pt-4">`
// Let's replace the visual elements wrapper directly:
content = content.replace(
  '<div className="relative pt-4">',
  '<div className="relative pt-4 lg:pt-0 w-full max-w-md mx-auto lg:max-w-none">'
);

// Problem Section
content = content.replace(
  '<section className="py-14 px-5 bg-white border-y border-brand-border/80">\n          <div className="max-w-md mx-auto">',
  '<section className="py-14 lg:py-24 px-5 bg-white border-y border-brand-border/80">\n          <div className="max-w-6xl mx-auto">'
);
content = content.replace(
  '<div className="text-left mb-8">',
  '<div className="text-left lg:text-center mb-12">'
);
content = content.replace(
  '<div className="space-y-4">',
  '<div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">'
);

// Features Section
content = content.replace(
  '<section className="py-14 px-5 max-w-md mx-auto">',
  '<section className="py-14 lg:py-24 px-5 max-w-6xl mx-auto">'
);
content = content.replace(
  '<div className="mb-8">',
  '<div className="mb-12 lg:text-center">'
);
content = content.replace(
  '<div className="grid grid-cols-1 gap-4">',
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">'
);

// How It Works
content = content.replace(
  '<section className="py-14 px-5 bg-brand-creamDark border-t border-brand-border/70" id="comment-ca-marche">\n          <div className="max-w-md mx-auto">',
  '<section className="py-14 lg:py-24 px-5 bg-brand-creamDark border-t border-brand-border/70" id="comment-ca-marche">\n          <div className="max-w-6xl mx-auto">'
);
content = content.replace(
  '<div className="mb-8">\n              <span className="text-xs font-bold text-brand-red uppercase tracking-wider block mb-1">Simple &amp; Rapide</span>\n              <h2 className="text-2xl font-black text-brand-dark tracking-tight">\n                3 étapes pour être payé plus vite\n              </h2>\n            </div>',
  '<div className="mb-12 lg:text-center">\n              <span className="text-xs font-bold text-brand-red uppercase tracking-wider block mb-1">Simple &amp; Rapide</span>\n              <h2 className="text-2xl lg:text-3xl font-black text-brand-dark tracking-tight">\n                3 étapes pour être payé plus vite\n              </h2>\n            </div>'
);
content = content.replace(
  '<div className="space-y-6 relative">',
  '<div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8 relative">'
);

// Testimonials
content = content.replace(
  '<section className="py-14 px-5 max-w-md mx-auto">',
  '<section className="py-14 lg:py-24 px-5 max-w-6xl mx-auto">'
);
// replace mb-8 again, but it's the second instance since hero CTA and others
content = content.replace(
  '<div className="mb-8">\n            <span className="text-xs font-bold text-brand-red uppercase tracking-wider block mb-1">Témoignages</span>',
  '<div className="mb-12 lg:text-center">\n            <span className="text-xs font-bold text-brand-red uppercase tracking-wider block mb-1">Témoignages</span>'
);
content = content.replace(
  '<div className="space-y-4">',
  '<div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">'
);

// Pricing
content = content.replace(
  '<section className="py-14 px-5 bg-white border-y border-brand-border/80" id="tarification">\n          <div className="max-w-md mx-auto">',
  '<section className="py-14 lg:py-24 px-5 bg-white border-y border-brand-border/80" id="tarification">\n          <div className="max-w-6xl mx-auto">'
);
content = content.replace(
  '<div className="text-center mb-8">',
  '<div className="text-center mb-12">'
);
content = content.replace(
  '<div className="space-y-6">',
  '<div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">'
);

// Final CTA
content = content.replace(
  '<section className="py-14 px-5 max-w-md mx-auto">',
  '<section className="py-14 lg:py-24 px-5 max-w-4xl mx-auto">'
);
content = content.replace(
  '<h2 className="text-2xl font-black leading-tight mb-3">',
  '<h2 className="text-2xl lg:text-4xl font-black leading-tight mb-4">'
);
content = content.replace(
  '<p className="text-xs text-white/85 mb-6 leading-relaxed">',
  '<p className="text-sm lg:text-base text-white/85 mb-8 leading-relaxed max-w-lg mx-auto">'
);
content = content.replace(
  '<Link\n              className="inline-block w-full bg-brand-dark text-white font-extrabold text-sm py-4 px-6 rounded-full hover:bg-black shadow-lg transition-transform active:scale-95"',
  '<Link\n              className="inline-block w-full md:w-auto md:px-12 bg-brand-dark text-white font-extrabold text-sm py-4 rounded-full hover:bg-black shadow-lg transition-transform active:scale-95"'
);

// Footer
content = content.replace(
  '<footer className="bg-brand-dark text-white pt-12 pb-16 px-5 border-t border-zinc-800">\n        <div className="max-w-md mx-auto space-y-8">',
  '<footer className="bg-brand-dark text-white pt-12 lg:pt-20 pb-16 px-5 border-t border-zinc-800">\n        <div className="max-w-6xl mx-auto space-y-8 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-12">'
);
// Make the bottom credits spread correctly in footer grid
content = content.replace(
  '{/* Bottom Credits and Compliance */}\n          <div className="pt-6 border-t border-zinc-800/80 flex flex-col gap-2 text-[11px] text-zinc-500">',
  '</div>{/* Bottom Credits and Compliance */}\n          <div className="pt-6 lg:pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row md:justify-between gap-2 text-[11px] text-zinc-500">'
);
// Fix the grid-cols-2 inside the footer grid by wrapping it
content = content.replace(
  '{/* Quick Links Grid */}\n          <div className="grid grid-cols-2 gap-6 text-xs text-zinc-300">',
  '{/* Quick Links Grid */}\n          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6 text-xs text-zinc-300">'
);
// Ensure we close the `lg:grid` correctly
content = content.replace(
  '</div>\n          {/* Bottom Credits and Compliance */}',
  '</div>\n        </div>\n          {/* Bottom Credits and Compliance */}'
);
content = content.replace(
  '<div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6 text-xs text-zinc-300">',
  '<div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 text-xs text-zinc-300">'
);


// Hero texts
content = content.replace(
  '<h1 className="text-4xl leading-[1.12] font-black tracking-tight text-brand-dark mb-5 text-balance">',
  '<h1 className="text-4xl lg:text-5xl xl:text-6xl leading-[1.12] font-black tracking-tight text-brand-dark mb-5 text-balance">'
);
content = content.replace(
  '<p className="text-base text-brand-muted leading-relaxed font-normal mb-8">',
  '<p className="text-base lg:text-lg text-brand-muted leading-relaxed font-normal mb-8 max-w-lg">'
);
content = content.replace(
  '<div className="flex flex-col gap-3 mb-10" id="hero-cta">',
  '<div className="flex flex-col sm:flex-row gap-3 mb-10" id="hero-cta">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Replaced successfully!");
