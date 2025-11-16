# Templates - Módulo Webpage

Este documento especifica os templates prontos disponíveis no módulo webpage, organizados por categoria e caso de uso.

## Índice

1. [Visão Geral](#visão-geral)
2. [Templates Disponíveis](#templates-disponíveis)
3. [Sistema de Templates](#sistema-de-templates)
4. [Customização de Templates](#customização-de-templates)
5. [Smart Templates](#smart-templates)

---

## Visão Geral

### Conceito

Templates são páginas pré-construídas com:
- Estrutura de blocos otimizada
- Conteúdo placeholder contextual
- Design profissional
- Melhores práticas de UX
- SEO otimizado
- Performance garantida

### Categorias de Templates

```
┌─────────────────────────────────────────────────┐
│ Template Gallery                               │
├─────────────────────────────────────────────────┤
│ Categories:                                    │
│                                                │
│ [Business] [Portfolio] [E-commerce] [Blog]    │
│ [SaaS] [Event] [Restaurant] [Education]        │
│ [Personal] [Non-profit] [Documentation]        │
│                                                │
│ Or start with: [Blank Page]                    │
└─────────────────────────────────────────────────┘
```

---

## Templates Disponíveis

### 1. SaaS Landing Page

**ID**: `template-saas-landing`
**Categoria**: SaaS / Business
**Melhor para**: Software products, Web apps, B2B services

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation Bar:
     - Logo + Menu + CTA Button
     - Sticky header enabled

  2. Hero with Device Mockup:
     - Headline: "Transform Your Workflow"
     - Subheadline: "Powerful automation tools"
     - CTA: "Start Free Trial" + "Watch Demo"
     - MacBook mockup with app screenshot

  3. Client Logos:
     - Title: "Trusted by 10,000+ teams"
     - 6 company logos (grayscale)

  4. Feature Grid (3x2):
     - 6 key features with icons
     - Alternating colors

  5. How It Works (3 steps):
     - Step 1: Sign up
     - Step 2: Connect tools
     - Step 3: Automate

  6. Product Showcase:
     - Split layout with mockup
     - Feature highlights

  7. Pricing Cards (3 plans):
     - Starter: $29/mo
     - Professional: $79/mo
     - Enterprise: Custom

  8. Testimonial Carousel:
     - 5 customer testimonials
     - With avatars and company

  9. FAQ Accordion:
     - 8 common questions
     - Searchable

  10. CTA Section:
      - "Ready to get started?"
      - Email capture + button

  11. Footer:
      - 4 column layout
      - Newsletter signup
```

#### Preview

```
┌─────────────────────────────────────┐
│ 🏢 YourSaaS | Features Pricing Login│
├─────────────────────────────────────┤
│                                     │
│    Transform Your Workflow          │
│    Powerful automation tools        │
│    [Start Free Trial] [Watch Demo]  │
│         💻 [App Preview]            │
│                                     │
│  Trusted by: [L1][L2][L3][L4][L5]  │
│                                     │
│  ┌───┐ ┌───┐ ┌───┐                │
│  │ F1│ │ F2│ │ F3│  Features       │
│  └───┘ └───┘ └───┘                │
│  ┌───┐ ┌───┐ ┌───┐                │
│  │ F4│ │ F5│ │ F6│                │
│  └───┘ └───┘ └───┘                │
│                                     │
│  How It Works: 1→2→3               │
│                                     │
│  [$29] [$79] [Custom]  Pricing     │
│                                     │
│  ⭐⭐⭐⭐⭐ "Amazing tool!"         │
│                                     │
│  [Get Started Today →]              │
│                                     │
│  Footer | Links | Newsletter        │
└─────────────────────────────────────┘
```

---

### 2. Portfolio Creative

**ID**: `template-portfolio-creative`
**Categoria**: Portfolio / Personal
**Melhor para**: Designers, Artists, Photographers, Freelancers

#### Estrutura de Blocos

```yaml
blocks:
  1. Minimal Navigation:
     - Logo/Name + Minimal menu
     - Transparent initially

  2. Hero Minimal Centered:
     - Name: "Jane Designer"
     - Title: "Digital Creator"
     - Subtitle: "Crafting experiences"
     - Animated text effect

  3. About Section (Split):
     - Photo on left
     - Bio text on right
     - Social links

  4. Services Grid (2x2):
     - UI/UX Design
     - Branding
     - Web Development
     - Consultation

  5. Portfolio Gallery (Masonry):
     - 12 project thumbnails
     - Hover effects
     - Filterable by category

  6. Process Timeline:
     - Discovery → Design → Develop → Deploy

  7. Testimonials Grid:
     - 3 client testimonials
     - With project context

  8. Contact Form Split:
     - Form on left
     - Contact info on right
     - Social links

  9. Footer Minimal:
     - Copyright + Social icons
```

#### Preview

```
┌─────────────────────────────────────┐
│        Jane Designer                │
├─────────────────────────────────────┤
│                                     │
│         JANE DESIGNER               │
│        Digital Creator              │
│     Crafting experiences            │
│                                     │
│  ┌─────┐ About Me                  │
│  │Photo│ Creative designer with     │
│  │     │ 10 years experience...    │
│  └─────┘ [Twitter][Dribbble][Git]  │
│                                     │
│  Services:                          │
│  [Design] [Brand] [Web] [Consult]   │
│                                     │
│  Portfolio:                         │
│  ┌──┬──┬──┐                       │
│  │P1│P2│P3│ Filter: All|Web|Brand  │
│  ├──┼──┼──┤                       │
│  │P4│P5│P6│                       │
│  └──┴──┴──┘                       │
│                                     │
│  Process: ●──●──●──●               │
│                                     │
│  [Contact Form] | hello@jane.com    │
│                                     │
└─────────────────────────────────────┘
```

---

### 3. E-commerce Home

**ID**: `template-ecommerce-home`
**Categoria**: E-commerce / Business
**Melhor para**: Online stores, Product showcases, Retail

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation with Mega Menu:
     - Logo + Categories + Search + Cart
     - Mega menu for categories

  2. Hero Carousel:
     - 3 promotional banners
     - Auto-rotating

  3. Category Grid (6 items):
     - Category images with overlay text
     - Link to category pages

  4. Featured Products Carousel:
     - "Trending Now"
     - 8 products with quick view

  5. Banner CTA:
     - "Summer Sale - 50% Off"
     - Countdown timer

  6. New Arrivals Grid:
     - 12 newest products
     - Add to cart buttons

  7. Benefits Bar:
     - Free Shipping | Secure Payment | 30-Day Returns

  8. Newsletter Signup:
     - "Get 10% off your first order"
     - Email capture

  9. Footer E-commerce:
     - Shop links | Customer service | About
     - Payment methods icons
```

#### Preview

```
┌─────────────────────────────────────┐
│ 🛍 Store | Categories 🔍 | Cart (0) │
├─────────────────────────────────────┤
│                                     │
│  ← SUMMER SALE - UP TO 50% OFF →   │
│                                     │
│  Categories:                        │
│  [Men][Women][Kids][Home][Tech]    │
│                                     │
│  Trending Now →                     │
│  [P1][$49][P2][$59][P3][$39][>]   │
│                                     │
│  🔥 FLASH SALE ENDS IN: 02:45:30   │
│                                     │
│  New Arrivals:                      │
│  ┌──┬──┬──┬──┐                    │
│  │P1│P2│P3│P4│                    │
│  ├──┼──┼──┼──┤                    │
│  │P5│P6│P7│P8│                    │
│  └──┴──┴──┴──┘                    │
│                                     │
│  ✓ Free Shipping ✓ Secure ✓ Returns│
│                                     │
│  Newsletter: [email] [Get 10% Off]  │
│                                     │
└─────────────────────────────────────┘
```

---

### 4. Blog Magazine

**ID**: `template-blog-magazine`
**Categoria**: Blog / Content
**Melhor para**: News sites, Blogs, Content platforms

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation Sticky:
     - Logo + Categories + Search
     - Dark mode toggle

  2. Featured Article Hero:
     - Large image + overlay text
     - Category badge + read time

  3. Recent Posts Grid (2+1):
     - 2 medium posts + 1 sidebar

  4. Newsletter Inline:
     - "Daily digest in your inbox"

  5. Category Tabs:
     - Tech | Lifestyle | Business | Travel
     - 4 posts per tab

  6. Popular Posts Sidebar:
     - Numbered list of top 5

  7. Video Section:
     - Featured video post

  8. Author Spotlight:
     - Featured writers grid

  9. Footer with Recent:
     - Recent posts in footer
```

#### Preview

```
┌─────────────────────────────────────┐
│ 📰 Magazine | Tech Life Biz | 🔍 🌙 │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────┐       │
│  │  FEATURED STORY          │       │
│  │  Big headline here...    │       │
│  └─────────────────────────┘       │
│                                     │
│  Recent:          Popular:          │
│  ┌────┬────┐     1. Story #1       │
│  │Post│Post│     2. Story #2       │
│  │  1 │  2 │     3. Story #3       │
│  └────┴────┘     4. Story #4       │
│                                     │
│  📧 Daily digest: [email][Subscribe]│
│                                     │
│  [Tech][Life][Biz][Travel]         │
│  Articles in selected category...   │
│                                     │
│  Featured Video:                    │
│  [▶️ Video Player]                  │
│                                     │
│  Our Writers: [A1][A2][A3][A4]     │
│                                     │
└─────────────────────────────────────┘
```

---

### 5. Restaurant

**ID**: `template-restaurant`
**Categoria**: Restaurant / Business
**Melhor para**: Restaurants, Cafes, Bars, Food services

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation Transparent:
     - Logo + Menu + Reservations button

  2. Hero with Video:
     - Background video of restaurant
     - "Welcome to Bella Vista"
     - Reserve Table button

  3. About Split:
     - Our story + Chef image

  4. Menu Preview Cards:
     - Appetizers | Mains | Desserts | Drinks
     - Sample items with prices

  5. Gallery Grid:
     - Food & ambiance photos

  6. Reservation Form:
     - Date, time, party size
     - Special requests

  7. Testimonials Carousel:
     - Customer reviews

  8. Location Map:
     - Interactive map + hours
     - Contact info

  9. Footer with Hours:
     - Opening hours prominent
```

#### Preview

```
┌─────────────────────────────────────┐
│ 🍽 Bella Vista | Menu Reserve 📞   │
├─────────────────────────────────────┤
│                                     │
│  [Video: Restaurant ambiance]       │
│     Welcome to Bella Vista          │
│     [Reserve Your Table]            │
│                                     │
│  Our Story | Chef Marco             │
│  Est. 1995... | [Photo]            │
│                                     │
│  Menu:                              │
│  ┌────────┬────────┬────────┐      │
│  │Starters│ Mains  │Desserts│      │
│  │ $8-15  │ $18-45 │ $8-12  │      │
│  └────────┴────────┴────────┘      │
│                                     │
│  Gallery: [P1][P2][P3][P4][P5]     │
│                                     │
│  Reserve: [Date][Time][Guests]      │
│           [Book Table]              │
│                                     │
│  ⭐⭐⭐⭐⭐ "Best Italian in town!"  │
│                                     │
│  📍 123 Main St | Open: 11am-11pm  │
│                                     │
└─────────────────────────────────────┘
```

---

### 6. Event Conference

**ID**: `template-event-conference`
**Categoria**: Event
**Melhor para**: Conferences, Workshops, Seminars, Meetups

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation with CTA:
     - Logo + Menu + Register button

  2. Hero Countdown:
     - Event name + Date
     - Countdown timer
     - Register + Learn More

  3. Event Stats:
     - 500+ Attendees | 50+ Speakers | 3 Days | 20+ Sessions

  4. About Event:
     - Description + Why attend

  5. Speakers Grid:
     - Featured speakers with bio

  6. Schedule Timeline:
     - 3-day program overview
     - Expandable sessions

  7. Pricing/Tickets:
     - Early Bird | Regular | VIP

  8. Sponsors Logos:
     - Gold, Silver, Bronze tiers

  9. Venue Info:
     - Location map + Hotels

  10. FAQ:
      - Common questions

  11. CTA Register:
      - "Don't miss out!"
```

#### Preview

```
┌─────────────────────────────────────┐
│ 🎯 TechConf 2025 | About Register  │
├─────────────────────────────────────┤
│                                     │
│      TECHCONF 2025                  │
│    March 25-27, 2025                │
│   ⏰ 89:23:45:12 remaining          │
│   [Register Now] [Learn More]       │
│                                     │
│  500+ Attendees | 50+ Speakers      │
│  3 Days | 20+ Sessions              │
│                                     │
│  Featured Speakers:                 │
│  [S1][S2][S3][S4][S5][S6]          │
│                                     │
│  Schedule:                          │
│  Day 1: Workshops                   │
│  Day 2: Main Conference             │
│  Day 3: Networking                  │
│  [View Full Schedule]               │
│                                     │
│  Tickets:                           │
│  [$199 Early] [$299] [$599 VIP]    │
│                                     │
│  Sponsors: [G1][G2] [S1][S2][S3]   │
│                                     │
│  📍 Convention Center + Hotels      │
│                                     │
└─────────────────────────────────────┘
```

---

### 7. Documentation

**ID**: `template-documentation`
**Categoria**: Documentation
**Melhor para**: API docs, Product docs, Knowledge base

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation with Search:
     - Logo + Version + Search prominent

  2. Hero Search:
     - "How can we help?"
     - Large search bar

  3. Quick Start Cards:
     - Getting Started | Installation | Tutorial

  4. Feature Grid:
     - Main documentation sections

  5. Code Examples Tabs:
     - Multiple language examples

  6. API Reference Table:
     - Endpoints with descriptions

  7. Video Tutorials:
     - Embedded tutorial videos

  8. FAQ Searchable:
     - Common issues

  9. Feedback Widget:
     - "Was this helpful?"

  10. Footer with Links:
      - GitHub | Support | Community
```

#### Preview

```
┌─────────────────────────────────────┐
│ 📚 Docs v2.1 | API Guides | 🔍     │
├─────────────────────────────────────┤
│                                     │
│     How can we help?                │
│     [🔍 Search documentation...]    │
│                                     │
│  Quick Start:                       │
│  [Setup][Install][Tutorial][API]    │
│                                     │
│  Documentation:                     │
│  ┌────┬────┬────┐                  │
│  │Core│ API│Tools│                 │
│  └────┴────┴────┘                  │
│                                     │
│  Examples: [JS][Python][Ruby][Go]   │
│  ```javascript                      │
│  // Code example here               │
│  ```                                │
│                                     │
│  API Endpoints:                     │
│  GET  /api/users                    │
│  POST /api/users                    │
│  PUT  /api/users/:id               │
│                                     │
│  📺 Video Tutorials                 │
│                                     │
│  Was this helpful? [👍][👎]        │
│                                     │
└─────────────────────────────────────┘
```

---

### 8. Personal Brand

**ID**: `template-personal-brand`
**Categoria**: Personal
**Melhor para**: Consultants, Coaches, Speakers, Influencers

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation Minimal:
     - Name + About/Services/Contact

  2. Hero with Avatar:
     - Large photo/avatar
     - Name + Title
     - Social links

  3. Bio Section:
     - Personal story
     - Achievements

  4. Services Offered:
     - Consulting | Speaking | Coaching

  5. Testimonials:
     - Client success stories

  6. Content Preview:
     - Latest blog/podcast

  7. Speaking/Media:
     - Past events + Media mentions

  8. CTA Consultation:
     - Book a free consultation

  9. Contact Simple:
     - Email + Social links
```

#### Preview

```
┌─────────────────────────────────────┐
│     John Smith | About Contact      │
├─────────────────────────────────────┤
│                                     │
│         [Avatar]                    │
│       JOHN SMITH                    │
│    Business Consultant              │
│    [LinkedIn][Twitter][Email]       │
│                                     │
│  About Me:                          │
│  20 years helping businesses...     │
│                                     │
│  Services:                          │
│  [Consulting][Speaking][Coaching]   │
│                                     │
│  ⭐ "John transformed our business" │
│  ⭐ "Best investment we made"       │
│                                     │
│  Latest Content:                    │
│  📝 Blog: "10 Growth Strategies"    │
│  🎙 Podcast: Episode 45             │
│                                     │
│  As Seen On: [Logo1][Logo2][Logo3]  │
│                                     │
│  [Book Free Consultation]           │
│                                     │
└─────────────────────────────────────┘
```

---

### 9. Startup Pitch

**ID**: `template-startup-pitch`
**Categoria**: Business
**Melhor para**: Startups, Investors pitch, Product launches

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation Simple:
     - Logo + Pitch Deck button

  2. Hero Statement:
     - One-line pitch
     - Problem statement

  3. Problem/Solution:
     - Split layout

  4. Market Opportunity:
     - Stats and TAM

  5. Product Demo:
     - Video or mockups

  6. Business Model:
     - How we make money

  7. Traction Stats:
     - Growth metrics

  8. Team Grid:
     - Founders + Advisors

  9. Press Mentions:
     - Media logos + quotes

  10. Investment CTA:
      - Contact for deck
```

#### Preview

```
┌─────────────────────────────────────┐
│ 🚀 StartupName | Get Pitch Deck    │
├─────────────────────────────────────┤
│                                     │
│  The Future of [Industry]           │
│  Solving [Problem] for millions     │
│                                     │
│  Problem:        | Solution:        │
│  Current issue.. | Our approach...  │
│                                     │
│  Market: $50B TAM | 20% CAGR        │
│                                     │
│  [Product Demo Video]               │
│                                     │
│  How we make money:                 │
│  SaaS: $99/mo per user              │
│                                     │
│  Traction:                          │
│  10K users | $1M ARR | 50% MoM      │
│                                     │
│  Team: [F1][F2][F3] + [A1][A2]     │
│                                     │
│  Featured in: [TC][Forbes][VB]      │
│                                     │
│  [Request Pitch Deck]               │
│                                     │
└─────────────────────────────────────┘
```

---

### 10. Course/Education

**ID**: `template-course-education`
**Categoria**: Education
**Melhor para**: Online courses, Training, Workshops

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation with Login:
     - Logo + Courses + Login

  2. Hero with Video:
     - Course title
     - Intro video
     - Enroll button

  3. Course Benefits:
     - What you'll learn

  4. Curriculum Accordion:
     - Module breakdown

  5. Instructor Bio:
     - Teacher credentials

  6. Student Testimonials:
     - Success stories

  7. Pricing Options:
     - Single | Bundle | Subscription

  8. FAQ:
     - Course questions

  9. CTA Enrollment:
     - Limited seats message

  10. Footer Educational:
      - Other courses + Resources
```

#### Preview

```
┌─────────────────────────────────────┐
│ 🎓 LearnHub | Courses Login        │
├─────────────────────────────────────┤
│                                     │
│    Master JavaScript in 30 Days     │
│       [▶️ Watch Intro]              │
│       [Enroll Now - $199]           │
│                                     │
│  What You'll Learn:                 │
│  ✓ Fundamentals ✓ ES6+ ✓ React    │
│  ✓ Node.js ✓ Real Projects         │
│                                     │
│  Curriculum:                        │
│  ▼ Week 1: Basics (8 lessons)      │
│  ▶ Week 2: Advanced (10 lessons)   │
│  ▶ Week 3: Projects (5 projects)   │
│  ▶ Week 4: React (12 lessons)      │
│                                     │
│  Your Instructor:                   │
│  [Photo] Jane Doe                   │
│  10+ years experience...            │
│                                     │
│  ⭐⭐⭐⭐⭐ "Best course ever!"      │
│  - 2,500+ students                  │
│                                     │
│  Pricing: [$199] [$499 Bundle]      │
│                                     │
│  [Enroll Now - Only 5 Spots Left!]  │
│                                     │
└─────────────────────────────────────┘
```

---

### 11. Non-Profit

**ID**: `template-nonprofit`
**Categoria**: Non-profit
**Melhor para**: NGOs, Charities, Foundations, Social causes

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation with Donate:
     - Logo + About + Donate button

  2. Hero with Mission:
     - Mission statement
     - Impact video

  3. Impact Stats:
     - Lives changed | Projects | Countries

  4. Our Work:
     - Program areas grid

  5. Success Stories:
     - Beneficiary testimonials

  6. How to Help:
     - Donate | Volunteer | Share

  7. Current Campaign:
     - Active fundraiser progress

  8. Partners/Sponsors:
     - Supporting organizations

  9. Newsletter:
     - Stay updated

  10. Footer with Impact:
      - Annual report link
```

#### Preview

```
┌─────────────────────────────────────┐
│ 💚 HopeOrg | About Donate          │
├─────────────────────────────────────┤
│                                     │
│   Making a Difference Since 1990    │
│   [Watch Our Story]                 │
│   [Donate Now] [Volunteer]          │
│                                     │
│  10K Lives | 50 Projects | 25 Countries│
│                                     │
│  Our Work:                          │
│  [Education][Health][Water][Food]   │
│                                     │
│  "You changed my life" - Maria      │
│  Success stories from the field...  │
│                                     │
│  How You Can Help:                  │
│  [💰 Donate][🤝 Volunteer][📢 Share]│
│                                     │
│  Current Campaign: Water for All    │
│  ████████░░ 80% of $100K goal      │
│                                     │
│  Partners: [P1][P2][P3][P4]        │
│                                     │
│  [Join Our Newsletter]              │
│                                     │
└─────────────────────────────────────┘
```

---

### 12. App Landing (Mobile)

**ID**: `template-app-landing`
**Categoria**: SaaS / Mobile
**Melhor para**: Mobile apps, App launches, Downloads

#### Estrutura de Blocos

```yaml
blocks:
  1. Navigation Minimal:
     - Logo + Features + Download

  2. Hero with Phone Mockup:
     - App name + Tagline
     - Phone mockup
     - App store buttons

  3. Features List:
     - Key features with icons
     - Animated on scroll

  4. How It Works:
     - 3 phone screens showing flow

  5. Stats Counter:
     - Downloads | Rating | Reviews

  6. Testimonials:
     - App store reviews

  7. Pricing:
     - Free | Pro comparison

  8. FAQ:
     - Common questions

  9. Download CTA:
     - App store buttons repeated

  10. Footer Simple:
      - Privacy | Terms | Support
```

#### Preview

```
┌─────────────────────────────────────┐
│ 📱 AppName | Features Download     │
├─────────────────────────────────────┤
│                                     │
│     Your Life, Organized            │
│     The smartest todo app           │
│                                     │
│     📱[App Screen]                  │
│                                     │
│   [App Store] [Google Play]         │
│                                     │
│  Features:                          │
│  ✨ Smart reminders                 │
│  ✨ Cloud sync                      │
│  ✨ Team collaboration              │
│  ✨ AI suggestions                  │
│                                     │
│  How it works:                      │
│  [Screen1]→[Screen2]→[Screen3]      │
│                                     │
│  1M+ Downloads | 4.8★ | 10K Reviews │
│                                     │
│  ⭐⭐⭐⭐⭐ "Can't live without it!" │
│                                     │
│  Free vs Pro: [Feature comparison]  │
│                                     │
│  [Download Now]                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Sistema de Templates

### Template Selection Interface

```
┌──────────────────────────────────────────┐
│ Choose a Template                        │
├──────────────────────────────────────────┤
│ 🔍 Search templates...                   │
│                                          │
│ Categories: [All][Business][Portfolio]   │
│            [Blog][E-commerce][Events]    │
│                                          │
│ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │  SaaS  │ │Portfolio│ │  Blog  │       │
│ │Landing │ │Creative │ │Magazine│       │
│ │   ★4.9 │ │   ★4.8  │ │   ★4.7 │       │
│ └────────┘ └────────┘ └────────┘       │
│ [Preview] [Preview] [Preview]            │
│ [Use]     [Use]     [Use]                │
│                                          │
│ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │E-commerce│Restaurant│  Event  │       │
│ │  Home  │ │        │ │Conference│      │
│ │   ★4.8 │ │   ★4.7 │ │   ★4.9  │      │
│ └────────┘ └────────┘ └────────┘       │
│                                          │
│ Or: [Start with Blank Page]              │
└──────────────────────────────────────────┘
```

### Template Preview

```
┌──────────────────────────────────────────┐
│ SaaS Landing Page                        │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────┐    │
│ │                                   │    │
│ │     [Template Preview]            │    │
│ │                                   │    │
│ └──────────────────────────────────┘    │
│                                          │
│ Perfect for:                             │
│ • Software products                      │
│ • Web applications                       │
│ • B2B services                          │
│                                          │
│ Includes:                               │
│ • Hero with mockup                      │
│ • Feature grid                          │
│ • Pricing table                         │
│ • Testimonials                          │
│ • FAQ section                           │
│                                          │
│ [Live Preview] [Use This Template]       │
└──────────────────────────────────────────┘
```

---

## Customização de Templates

### Initial Setup Wizard

```
┌──────────────────────────────────────────┐
│ Customize Your Template                  │
├──────────────────────────────────────────┤
│ Step 1/3: Basic Information              │
│                                          │
│ Site Name: [Your Business_____]          │
│ Tagline: [Your success starts here]      │
│                                          │
│ Logo:                                    │
│ [Upload Logo] or [Use Text Logo]         │
│                                          │
│ Brand Color: [🎨 #3B82F6]               │
│                                          │
│ [Back] [Next: Content]                   │
└──────────────────────────────────────────┘

Step 2/3: Content
┌──────────────────────────────────────────┐
│ Quick Content Setup                      │
│                                          │
│ ◉ Use AI to generate content            │
│   Industry: [Technology ▼]              │
│   Tone: [Professional ▼]                │
│                                          │
│ ○ I'll add content manually             │
│                                          │
│ [Back] [Next: Images]                    │
└──────────────────────────────────────────┘

Step 3/3: Images
┌──────────────────────────────────────────┐
│ Image Library                            │
│                                          │
│ ◉ Use stock images (Unsplash)           │
│   Style: [Modern ▼]                     │
│                                          │
│ ○ I'll upload my own images             │
│                                          │
│ [Back] [Create Page]                     │
└──────────────────────────────────────────┘
```

### Smart Content Generation

```javascript
// AI Content Generation based on template + industry
const generateContent = async (template, industry, tone) => {
  return {
    hero: {
      title: generateTitle(industry, tone),
      subtitle: generateSubtitle(industry),
      cta: generateCTA(industry)
    },
    features: generateFeatures(industry, 6),
    testimonials: generateTestimonials(industry, 3),
    faq: generateFAQ(industry, 8)
  };
};
```

---

## Smart Templates

### Template Intelligence

Templates adaptam-se automaticamente baseado em:

1. **Indústria/Nicho**
   - Ajusta terminologia
   - Sugere features relevantes
   - Recomenda estrutura ideal

2. **Conteúdo Disponível**
   - Oculta seções sem conteúdo
   - Reorganiza baseado no que existe
   - Sugere conteúdo faltante

3. **Objetivos**
   - Otimiza para conversão
   - Ajusta CTAs
   - Prioriza elementos chave

### Template Recommendations

```
┌──────────────────────────────────────────┐
│ 🤖 Template Assistant                    │
├──────────────────────────────────────────┤
│ Based on your industry (E-commerce)      │
│ we recommend:                            │
│                                          │
│ Essential blocks:                        │
│ ✓ Product showcase                       │
│ ✓ Customer reviews                       │
│ ✓ Shipping info                         │
│                                          │
│ Consider adding:                         │
│ + Size guide                            │
│ + Return policy                         │
│ + Live chat                             │
│                                          │
│ [Apply Suggestions] [Ignore]             │
└──────────────────────────────────────────┘
```

### Template Variations

Cada template tem variações:

```
SaaS Landing
├── Classic (Hero top)
├── Modern (Split hero)
├── Minimal (Clean design)
└── Bold (Strong colors)

Portfolio
├── Grid (Projects grid)
├── Masonry (Pinterest style)
├── Slider (Full screen)
└── Case Studies (Detailed)
```

### Performance Optimization

Templates são otimizados para:

```yaml
Performance Metrics:
  - First Contentful Paint: < 1s
  - Time to Interactive: < 2s
  - Lighthouse Score: > 95
  - Page Weight: < 500KB

Optimization Features:
  - Lazy loading images
  - Critical CSS inline
  - Async JavaScript
  - Optimized fonts
  - WebP images
  - Minified code
```

---

## Template Marketplace

### Premium Templates

```
┌──────────────────────────────────────────┐
│ 🌟 Premium Templates                     │
├──────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │Premium │ │Premium │ │Premium │       │
│ │Template│ │Template│ │Template│       │
│ │  $49   │ │  $79   │ │  $99   │       │
│ └────────┘ └────────┘ └────────┘       │
│                                          │
│ Premium Benefits:                        │
│ • Advanced animations                    │
│ • Extra block variations                 │
│ • Priority support                       │
│ • Commercial license                     │
│ • Source files included                  │
└──────────────────────────────────────────┘
```

### Template Submission

```
┌──────────────────────────────────────────┐
│ Submit Your Template                     │
├──────────────────────────────────────────┤
│ Share your template with the community   │
│                                          │
│ Requirements:                            │
│ ✓ Original design                        │
│ ✓ Responsive layout                      │
│ ✓ Optimized performance                  │
│ ✓ Documentation included                 │
│                                          │
│ Earn 70% commission on sales             │
│                                          │
│ [Submit Template for Review]             │
└──────────────────────────────────────────┘
```

---

## Notas de Implementação

### Template Structure

```typescript
interface TemplateStructure {
  metadata: {
    id: string;
    name: string;
    category: string;
    tags: string[];
    author: string;
    version: string;
    license: string;
  };

  blocks: Block[];

  settings: {
    colors: ColorScheme;
    typography: Typography;
    spacing: Spacing;
    animations: AnimationPresets;
  };

  content: {
    placeholder: PlaceholderContent;
    sample: SampleContent;
    ai_prompts: AIPrompts;
  };

  requirements: {
    minBlocks: string[];
    optionalBlocks: string[];
    incompatible: string[];
  };
}
```

### Template Instantiation

```typescript
async function instantiateTemplate(
  templateId: string,
  customization: Customization
): Promise<Page> {
  const template = await loadTemplate(templateId);

  // Apply customization
  const customized = applyCustomization(template, customization);

  // Generate content if needed
  if (customization.generateContent) {
    const content = await generateContent(customization);
    customized.blocks = populateContent(customized.blocks, content);
  }

  // Optimize for performance
  const optimized = optimizeTemplate(customized);

  return createPage(optimized);
}
```