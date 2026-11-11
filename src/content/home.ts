/*
 * Text for the home page. Every claim is checked against the repos and the
 * claim audit (see the project tracker). Client names stay hidden.
 */

export const hero = {
  role: "Frontend Engineer",
  line: "I build web products that have to be fast, secure and well made, and I stay with them all the way to production.",
  location: "Chennai, India · Open to relocation and remote work worldwide",
  proof: [
    "3.5+ years shipping production web apps",
    "18-language prerendered site, led end to end",
    "96+ mobile Lighthouse on 3 production sites",
    "10 security test rounds taken through to fixes",
  ],
};

export const career = {
  company: "Finstein Advizory LLP",
  place: "Chennai",
  dates: "Mar 2023 – present",
  title: "Associate Trainee (Full Stack Developer)",
  summary:
    "Frontend-focused full stack engineering on corporate websites, product platforms and enterprise applications, from UI architecture through UAT, security review and production.",
  phases: [
    {
      name: "Platforms and ownership",
      when: "Late 2025 – present",
      points: [
        "Lead developer on a prerendered Angular product platform and an 18-language React site.",
        "Took security findings from penetration-test reports through fixes, deployment and retest across six websites.",
        "Built browser-driven QA tooling and moved a 59-page site to Next.js.",
      ],
    },
    {
      name: "Foundation",
      when: "2023 – 2025",
      points: [
        "Delivered Angular and NestJS features for lending, approval-workflow, asset-management, retail-analytics and learning products.",
        "Made 626 commits to a 181-component Angular finance and procurement console.",
        "Wrote automated tests in an existing WebdriverIO and Appium framework for banking applications on Android, iOS and web.",
        "Led a team workshop on mobile device-orientation effects.",
      ],
    },
  ],
  education: "B.Tech, Information Technology · Park College of Engineering and Technology, Coimbatore · 2017 – 2021",
};

export type MoreItem = { name: string; line: string; proof: string; href?: string };

export const moreWork: MoreItem[] = [
  { name: "Consent product site", line: "A consent product's site with no cookies, no analytics and 9 KB of gzipped JavaScript.", proof: "98 mobile / 100 desktop Lighthouse", href: "/work/consent-product-site" },
  { name: "Compliance platform site", line: "A 59-page site moved to a static Next.js export, verified page by page in a real browser.", proof: "96 mobile Lighthouse", href: "/work/compliance-platform-site" },
  { name: "Security and delivery", line: "Security findings taken from report to verified production change.", proof: "10 test rounds, 6 websites", href: "/work/security-delivery-loop" },
  { name: "Finstein.ai", line: "The company site, kept maintainable without a framework. Lead developer since July 2025.", proof: "100 accessibility and SEO", href: "/work/finstein-corporate-site" },
  { name: "Finstein Cyber", line: "A 20-page site assembled from components by a hand-written build, with llms.txt for answer engines.", proof: "Component build, no framework", href: "/work/finstein-cyber-website" },
  { name: "Design QA harness", line: "Python scripts that captured, compared and scored a 57-route site at four breakpoints.", proof: "898 comparison screenshots", href: "/work/security-platform-qa" },
  { name: "Jarvis Mobile", line: "A voice and text assistant for Android, running in Termux with Gemini.", proof: "Open source", href: "https://github.com/KishoreCR728/jarvis-mobile" },
  { name: "Obsidian Sprint", line: "A React and three.js experience that scales its effects to the device's GPU.", proof: "Open source", href: "https://github.com/KishoreCR728/obsidian-sprint" },
  { name: "Project-to-Video skill", line: "An AI agent skill that turns a repository or URL into a Remotion video.", proof: "Open source", href: "https://github.com/KishoreCR728/project-to-video-skill" },
];

export const teamSystems: [string, string][] = [
  ["Finance and procurement console", "626 commits · Angular, 181 components, 49 feature modules"],
  ["Manufacturing execution system", "Backend and frontend features (NestJS, Angular SSR) and the system documentation"],
  ["Banking test automation", "Tests in an existing WebdriverIO and Appium framework · Android, iOS and web"],
  ["Learning platform", "Learner app and admin console · Angular on a shared NestJS API"],
  ["Gold-loan back office", "Features in a 332-component Angular console"],
];

export const skills: [string, string[]][] = [
  ["Frontend", ["Angular (8 → 21)", "React", "Next.js", "TypeScript", "JavaScript", "RxJS", "Signals", "HTML", "SCSS", "Tailwind"]],
  ["3D and motion", ["three.js", "GSAP", "Lenis"]],
  ["Platform", ["Node.js", "NestJS", "Express", "TypeORM", "MySQL", "PostgreSQL", "REST", "SSR and prerendering"]],
  ["Quality", ["Playwright", "Puppeteer", "Vitest", "Jest", "Lighthouse CI", "WebdriverIO", "Appium"]],
  ["Delivery and security", ["GitLab CI", "GitHub Actions", "Docker", "Nginx", "Apache", "Linux", "Security remediation", "CSP", "HSTS", "reCAPTCHA v3"]],
  ["AI tooling", ["Claude Code", "Agent workflows", "Anthropic API", "Gemini", "Ollama", "Python", "FastAPI"]],
];

export const method: [string, string][] = [
  ["Understand the real problem", "Not only the ticket. What is actually happening, and for whom?"],
  ["Reproduce it", "Before changing anything. A problem I can't reproduce isn't understood yet."],
  ["Change carefully", "The smallest change that fixes it, and a look at what else it could touch."],
  ["Verify where it runs", "In the real environment, then again after retest. The build output, not the restart."],
];

export const aiNote =
  "I use AI coding agents every day to move faster on scaffolding, implementation and tests. Architecture, security, performance budgets and the final decision stay with me, and I can explain every line I ship. The case studies and articles say plainly which work was done with an agent.";

export const about =
  "I started in 2023 by teaching myself through documentation, searching and trial and error, and grew into owning production websites and platforms end to end. I care about the parts users never see: release checks, security headers, accessibility and how a site behaves on a slow phone.";
