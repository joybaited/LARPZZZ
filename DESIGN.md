---
name: LARPZ
description: Immersive landing page with interactive 3D phone and bold display typography
colors:
  ink: "#000000"
  paper: "#ffffff"
  haze: "#f5f2ff"
  deep: "#201e45"
  plum: "#433a67"
  mauve: "#6d6189"
  lilac: "#9d90aa"
  mist: "#cbc9dd"
  violet: "#eac2ff"
  grape: "#3d065f"
typography:
  display:
    fontFamily: "Megion, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 1.14rem + 5.4vw, 9rem)"
    fontWeight: 700
    lineHeight: 0.9
  body:
    fontFamily: "Neue Montreal, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.1vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.5
---

## Overview
LARPZ is a high-craft landing page featuring fluid typography, 100svh modular sections, and interactive 3D elements.

## Colors
- **Ink**: `#000000` - primary text
- **Paper**: `#ffffff` - default ground
- **Haze**: `#f5f2ff` - pale lavender hero ground
- **Violet / Grape Pair**: `#eac2ff` / `#3d065f` - high-contrast accent pair used in Faq, Testimonials, Pricing
- **Tonal Range**: Deep `#201e45`, Plum `#433a67`, Mauve `#6d6189`, Lilac `#9d90aa`, Mist `#cbc9dd`

## Typography
- **Display**: Megion (Bold) for punchy stacked headlines
- **Body & Sans**: Neue Montreal (Regular 400, Medium 500)

## Layout
- Sections are 100svh standard viewport height with fluid gutters and insets.
- Max content width: `80rem` (1280px).
- Responsive fluid scales defined via clamp between 390px and 1440px.

## Components
- Nav: full-bleed inset rectangle
- Section: modular 100svh viewport blocks with optional `extra` viewports.
