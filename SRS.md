# Software Requirements Specification: Church Website (Phase 1)

*Felege Genet Sema'etu Kidus Giorgis Church, London · Prepared by Arch Solutions · Version 0.1 (draft for trustee review) · 6 October 2026*

## 1. Introduction

### 1.1 Purpose

This document defines what the first release of the church website must do. Phase 1 is a landing page with clear information on where and when to find the church. Phase 2 (mission and goals, community support and other content) will be added after the trustee interviews; Section 7 and Appendix A prepare for it.

### 1.2 Scope

**In scope (Phase 1):** a bilingual (English and Amharic) landing page, a “Find us” location section, service times, contact details, privacy and accessibility pages, and a simple way for a church volunteer to keep key details up to date.

**Out of scope (Phase 1):** online giving, member logins, event booking, livestreaming, a news feed or blog, an online shop and a mobile app.

### 1.3 About the church

| Item | Detail |
| --- | --- |
| Name | Felege Genet Sema'etu Kidus Giorgis Church (final spelling to be confirmed, see Section 9) |
| Tradition | Ethiopian Orthodox Tewahedo Church, London, United Kingdom |
| Dedication | Saint Mary, the Virgin Mother of Jesus Christ, and Saint George (wording to be confirmed by clergy) |
| Status | Registered UK charity (registration number to be supplied) |

### 1.4 Definitions

| Term | Meaning |
| --- | --- |
| EOTC | Ethiopian Orthodox Tewahedo Church |
| Trustees | The charity trustees who govern the church and approve website content |
| Content editor | A person nominated by the trustees to keep the site up to date after launch |
| CMS | Content management system: the screen used to edit the site without writing code |
| Ethiopic (Ge'ez) script | The script used to write Amharic, Ge'ez and Tigrinya |
| WCAG 2.2 AA | The international web accessibility standard this site must meet |

## 2. Overall description

### 2.1 Product perspective

A new, standalone, public website with no links to existing systems. Its look comes from the church's brand identity, which is being developed in parallel; until that is approved, the build uses neutral placeholders so work is not blocked.

### 2.2 Goals for Phase 1

1. Give the church an official, trustworthy online presence.
2. Let a first-time visitor find the church and arrive on time for a service.
3. Work well on a phone, in English and Amharic, for older and younger members.
4. Meet UK charity and data-protection obligations from day one.
5. Leave room for Phase 2 content without a rebuild.

### 2.3 Users

| User | Needs | Notes |
| --- | --- | --- |
| First-time visitor | Where, when and what to expect | Often arrives from Google Maps or a link shared on WhatsApp |
| Established parishioner | Service times, notices, contact details | Mostly on a phone |
| Older congregant | Large, clear text and a simple layout | Accessibility is a priority |
| English-speaking or second-generation visitor | Plain-English explanations of terms and practice | Terms such as Sema'etu (the martyr) need short glosses |
| Clergy and trustees | Accurate, respectful content and easy approval | Approve all wording |
| Content editor | Safe, simple updates | Not technical |

### 2.4 Operating environment

Mobile-first, designed from 320 px wide upwards. Supports the latest two versions of Chrome, Safari, Edge and Firefox on Android, iOS, Windows and macOS. Must stay usable on slow 4G.

### 2.5 Assumptions and constraints

- The trustees supply every fact: address, times, wording, photos. Nothing is invented. Desk research found no existing website or register entry under this exact name (Appendix B).
- The church, not the developer, owns the domain, hosting account and content.
- Amharic is assumed to be the second language alongside English; trustees to confirm.
- Budget, launch date and running costs are to be confirmed.

### 2.6 Phasing

| Phase | Content | Status |
| --- | --- | --- |
| 1 | Landing page, location, contact, privacy and accessibility pages | Specified here |
| 2 | Mission and goals, community support, about us, calendar, policies, news | Awaiting trustee interviews |
| 3 (candidates) | Online giving, sermon or livestream archive, sacrament request forms | To be agreed |

Delivery milestones (dates to be agreed): content and brand assets received; design approved by trustees; build and testing; trustee sign-off; launch and handover.

## 3. Phase 1 functional requirements

Priority: M = Must, S = Should, C = Could. Each requirement has a stable ID for testing and change control.

### 3.1 Landing page

| ID | Requirement | Pri |
| --- | --- | --- |
| HOME-1 | The first screen shows the church's full name, the dedication line, the logo and a short welcome. | M |
| HOME-2 | The first screen also shows the next service day and time, the short address and a “Get directions” button, so the essentials need no scrolling. | M |
| HOME-3 | A short “About us” paragraph (about 100 words) introduces the church and its tradition. | M |
| HOME-4 | A sticky navigation bar links to each section of the page, with a “skip to content” link for keyboard and screen-reader users. | M |
| HOME-5 | Sections for Phase 2 topics (mission, community support) stay hidden until their content is approved. No placeholder text appears on the live site. | M |
| HOME-6 | One to three approved photographs show the church and community, each with alt text. Photographs of identifiable people need documented consent. | S |

### 3.2 Find us (location)

| ID | Requirement | Pri |
| --- | --- | --- |
| FIND-1 | The full address and postcode appear as real text that can be selected and copied. | M |
| FIND-2 | A static map image shows the worship venue. An interactive map loads only when the visitor taps “Show map”, so no third-party code runs before then. | M |
| FIND-3 | “Get directions” opens the visitor's maps app (Google Maps or Apple Maps) with the venue pre-filled. | M |
| FIND-4 | Public transport guidance lists the nearest stations and bus routes with walking times, and links to the TfL Journey Planner. | M |
| FIND-5 | Parking and access information covers step-free entry, accessible toilets, parking and Blue Badge bays. | M |
| FIND-6 | The worship venue and the postal or registered address can differ. If the church meets in a host building, the host name and entrance instructions are shown. | M |
| FIND-7 | A “What to expect on your first visit” block covers the language of the service, length, dress, children and photography. Wording comes from clergy. | S |
| FIND-8 | The page carries machine-readable data (schema.org PlaceOfWorship with address, coordinates and hours) so search engines show the church correctly. | S |

### 3.3 Service times and notices

| ID | Requirement | Pri |
| --- | --- | --- |
| TIME-1 | Regular service days and times are shown as text in UK local time. | M |
| TIME-2 | A notice banner can be switched on and off for short-notice changes such as a cancelled service, a special feast or a venue change. | S |
| TIME-3 | Ethiopian-calendar dates can be shown beside Gregorian dates for special days. | C |

### 3.4 Contact

| ID | Requirement | Pri |
| --- | --- | --- |
| CONT-1 | Phone number and email address are tappable (tel: and mailto: links). | M |
| CONT-2 | A contact form (name, email, message) delivers to a church-controlled mailbox, with spam protection, a privacy notice and clear success and error messages. | S |
| CONT-3 | Links to social or messaging accounts appear only for accounts the church officially runs. | C |

### 3.5 Language and script

| ID | Requirement | Pri |
| --- | --- | --- |
| LANG-1 | Key content exists in English and Amharic: church name, welcome, service times, address labels and contact details. | M |
| LANG-2 | A visible language switch (English / አማርኛ) appears on the page. Each language has its own address (for example / and /am/) with language tags, so no cookie is needed to remember the choice. | M |
| LANG-3 | Ethiopic text renders correctly on iOS, Android, Windows and macOS, using a self-hosted, subsetted Ethiopic web font (for example Noto Sans Ethiopic) and generous line height. | M |
| LANG-4 | Pages declare their language (en, am) so screen readers and search engines handle them properly. | M |
| LANG-5 | The official Amharic wording of the church name and dedication is supplied or approved by clergy before launch. Tigrinya and Ge'ez support is a trustee decision (Section 9). | M |

### 3.6 Legal and trust

| ID | Requirement | Pri |
| --- | --- | --- |
| LEGAL-1 | Every page footer shows the registered charity name, the charity number and a statement that the church is a registered charity. | M |
| LEGAL-2 | A privacy notice explains what data the site collects (contact form, server logs), why, how long it is kept and who to contact. | M |
| LEGAL-3 | A cookie notice states that Phase 1 sets no non-essential cookies. If analytics or embeds are added later, a consent banner is added first. | M |
| LEGAL-4 | An accessibility statement describes the standard met, any known gaps and how to report a problem. | S |
| LEGAL-5 | Phase 2: a policies area for safeguarding, complaints and similar governance documents. | C |

### 3.7 Content maintenance

| ID | Requirement | Pri |
| --- | --- | --- |
| EDIT-1 | A nominated content editor can update service times, the notice banner, address and contact details without a developer, using a password-protected editor with two-factor sign-in. | M |
| EDIT-2 | Changes can be previewed before publishing and rolled back to an earlier version. | S |
| EDIT-3 | Trustees approve new pages and wording changes before they go live (a process, recorded by email). | M |

### 3.8 Discoverability

| ID | Requirement | Pri |
| --- | --- | --- |
| SEO-1 | Each page has a unique title and description. The site has a sitemap and a robots file. | M |
| SEO-2 | Share previews (image and text) display correctly when the link is shared on WhatsApp, Facebook and Telegram. | S |
| SEO-3 | The church's name, address and phone number match exactly on the site and on its Google Business Profile. | S |

## 4. Non-functional requirements

| ID | Area | Requirement | Measured by |
| --- | --- | --- | --- |
| NFR-1 | Performance | Largest Contentful Paint of 2.5 s or less on a mid-range Android phone over 4G. Home page under 1 MB transferred, excluding the optional map. | Lighthouse (mobile), WebPageTest |
| NFR-2 | Accessibility | Meets WCAG 2.2 AA. Body text at least 18 px, contrast at least 4.5:1, tap targets at least 44 px, full keyboard use, usable at 200% zoom. | axe-core scan plus manual VoiceOver and TalkBack checks |
| NFR-3 | Compatibility | Latest two versions of Chrome, Safari, Edge and Firefox. Layouts from 320 px to 1920 px wide. | Cross-browser checklist |
| NFR-4 | Security | HTTPS with HSTS, standard security headers, two-factor sign-in for editors, dependencies kept up to date, automated backups. | Header scan, backup restore test |
| NFR-5 | Privacy | Complies with UK GDPR, the Data Protection Act 2018 and PECR as currently in force. No third-party trackers or advertising. Data is collected only through the contact form and server logs. | Privacy checklist, network request audit |
| NFR-6 | Reliability | 99.9% monthly uptime target using managed hosting with a CDN. | Uptime monitor |
| NFR-7 | Maintainability | Source in version control, a staging site, a short handover guide, and all accounts held in the church's name. | Handover checklist |
| NFR-8 | Localisation | UTF-8 throughout. Layouts tolerate longer Amharic text. UK date and time formats. | Visual review in both languages |
| NFR-9 | Content tone | Respectful, plain language. Religious terms and spellings approved by clergy. One consistent spelling of the church name. | Trustee and clergy sign-off |

## 5. Interfaces

### 5.1 Page layout (top to bottom)

| Section | Contents |
| --- | --- |
| Header | Logo, church name, language switch, navigation |
| Welcome | Name, dedication, welcome line, next service, “Get directions” |
| About | Short introduction to the church |
| Services | Regular times and notice banner |
| Find us | Address, map, transport, parking, access, first-visit guide |
| Contact | Phone, email, contact form |
| Footer | Charity statement, privacy, accessibility, address |

### 5.2 External services

| Service | Purpose | Requirement |
| --- | --- | --- |
| Domain and DNS | The web address | Registered to the church. A .org.uk or .uk name is preferred (availability to be checked). |
| Hosting and CDN | Serving the site | Managed hosting, HTTPS, UK or EU region where practical |
| Map provider | Location map | Loaded on demand. A privacy-friendly option such as OpenStreetMap is preferred. |
| Email delivery | Contact form | Delivers to a church-controlled mailbox |
| Analytics (optional) | Visit counts | Cookie-free and privacy-friendly only. Trustees decide whether to have it. |

## 6. Site structure

| Page | Address | Phase |
| --- | --- | --- |
| Home (landing page with all Phase 1 sections) | / and /am/ | 1 |
| Privacy and cookies | /privacy | 1 |
| Accessibility statement | /accessibility | 1 |
| Visit us (split from Home if location content grows) | /visit | 2 candidate |
| About us: mission, vision, history, clergy | /about | 2 |
| Community and charity work | /community | 2 |
| Services and calendar | /services | 2 |
| Policies: safeguarding, complaints | /policies | 2 |
| News and announcements | /news | 2 |
| Giving | /give | 3 candidate |

## 7. Phase 2 placeholders (to complete after the trustee interviews)

| Topic | What we need to learn | Likely requirement |
| --- | --- | --- |
| Mission, vision, values | Approved wording in the trustees' own words | About page; one-line mission on Home |
| Community support | Which programmes exist, who they help, how to ask for help | Community page and a help contact or form |
| Leadership | Which clergy and trustees are named publicly; photo consent | Leadership section |
| Calendar | Fasts, feasts and monthly commemorations; whether Ethiopian dates are shown | Dual-calendar events page |
| Sacraments and requests | How people ask for baptism, weddings, memorial or funeral services | Contact routes or request forms |
| Giving | Bank transfer or online giving; Gift Aid | Giving page; payment provider choice |
| Media | Sermons, hymns, livestream; copyright and consent | Media page or video embed |
| Policies | Safeguarding, complaints, data protection | Policies page |

## 8. Acceptance criteria

| Check | Method | Pass condition |
| --- | --- | --- |
| Content accuracy | Trustee and clergy review of every line | Written sign-off |
| Accessibility (NFR-2) | axe-core scan, keyboard-only run, VoiceOver, TalkBack | No critical issues; WCAG 2.2 AA met |
| Performance (NFR-1) | Lighthouse mobile | Performance 90+, Accessibility 100, SEO 90+ |
| Ethiopic rendering (LANG-3) | Test on iPhone, Android, Windows and Mac | No missing or broken characters |
| Location (FIND-1 to FIND-6) | Test directions links on iOS and Android; check the map fallback | Opens the correct venue |
| Contact form (CONT-2) | Send test messages; check spam handling | Messages delivered; errors are clear |
| Legal (LEGAL-1 to LEGAL-3) | Review every page footer and notice | Charity name and number present; no non-essential cookies |
| Handover (EDIT-1) | Content editor changes a service time unaided | Change live within 10 minutes |

## 9. Open items and risks

| # | Open item | Owner | Needed by |
| --- | --- | --- | --- |
| 1 | Official name, spellings (Sema'etu or Semaetu; Giorgis, Giyorgis or Georgis), Amharic form and dedication wording | Trustees and clergy | Before design |
| 2 | Registered charity number | Trustees | Before build |
| 3 | Worship venue address, host building (if any), entrance, parking, step-free access | Trustees | Before build |
| 4 | Regular service times and the language or languages of the service | Clergy | Before build |
| 5 | Public phone and email, and who monitors them | Trustees | Before build |
| 6 | Languages beyond English and Amharic (Tigrinya, Ge'ez) | Trustees | Before design |
| 7 | Domain name, hosting budget, and who holds the accounts | Trustees | Before build |
| 8 | Logo, brand files and approved photographs with consent | Brand work and trustees | Before design |
| 9 | Name of the content editor | Trustees | Before launch |

**Main risks:**

- Content arrives late. Mitigation: design with real-content slots and share a content checklist early.
- Religious terms or spellings are inconsistent. Mitigation: one clergy-approved glossary.
- Accounts end up in the developer's name. Mitigation: the church registers the domain and hosting itself.
- Scope grows before launch. Mitigation: anything outside Section 3 moves to Phase 2.

## 10. Document control

| Version | Date | Author | Change |
| --- | --- | --- | --- |
| 0.1 | 6 October 2026 | Arch Solutions | First draft, Phase 1 |

**Sign-off**

| Role | Name | Signature | Date |
| --- | --- | --- | --- |
| Chair of Trustees |  |  |  |
| Clergy representative |  |  |  |
| Developer (Arch Solutions) |  |  |  |

## Appendix A. Trustee interview guide

**Purpose and identity**

- How would you describe the church's mission in two sentences?
- Who is the church for, and who do you most want to reach online?
- How did the church come to be in London, and what is its story?
- What should a first-time visitor know and feel after reading the website?
- Which words, titles and spellings must always be used, and which avoided?

**Community and charitable activity**

- What help does the church give its community (spiritual, practical, advice, youth, elderly)?
- Who can receive help, and how do they ask for it?
- Which activities should be publicised and which kept private?
- Are there partner organisations to link to?
- Which photographs or stories do you have permission to share?

**Practical and governance**

- Where and when do you meet, is the venue shared, and what are the access arrangements?
- Who answers calls and emails, and how quickly?
- Which policies exist (safeguarding, complaints, data protection), and may they be published?
- How are donations received today, and do you want online giving later?
- Who will keep the site up to date, and who approves changes?

## Appendix B. Desk research notes (October 2026)

- No website or register entry under this exact name was found, so no facts about the church come from third parties. Trustees supply all details.
- Charities Act 2011, s.39: registered charities with gross income above £10,000 must state that they are registered charities on specified documents. NCVO guidance extends this to showing name and number on online publications, so the footer shows all three (LEGAL-1).
- Debre-Genet Holy Trinity, a London EOTC church (dght.uk), shows its registered charity number prominently on its site. The same pattern is used here.
- Charity Commission entries for other London EOTC congregations list religious activities and services and, in one case, published safeguarding, complaints and anti-bullying policies. This informs the Phase 2 policies area.
- Another London EOTC congregation lists a host church as its address, which supports FIND-6. A 2007 New Statesman article reports London EOTC services in both Ge'ez and English, which is why language needs are an open item.
