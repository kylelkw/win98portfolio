// Update this file to customize desktop icons and window content without touching UI logic.
export interface PortfolioLink {
  label: string;
  url: string;
  description: string;
}

export interface ContactEmail {
  label: string;
  address: string;
  description: string;
  defaultSubject?: string;
}

export interface DesktopPagesConfig {
  about: string;
  resume: string;
  linkedin: string;
  projects: string;
  art: string;
  email: string;
  browser: string;
  minesweeper: string;
  tetris: string;
}

export interface AboutSubtab {
  id: string;
  label: string;
  description: string[];
}

export interface CurrentProject {
  name: string;
  description: string;
  url?: string;
}

export interface PortfolioConfig {
  pages: DesktopPagesConfig;
  name: string;
  headline: string;
  aboutSubtabs: AboutSubtab[];
  contactEmail: ContactEmail;
  resume: PortfolioLink;
  linkedin: PortfolioLink;
  artPortfolio: PortfolioLink;
  currentProjects: CurrentProject[];
}

export const portfolioConfig: PortfolioConfig = {
  pages: {
    about: "About",
    resume: "Resume",
    linkedin: "LinkedIn",
    projects: "Projects",
    art: "Art Portfolio",
    email: "Email Me",
    browser: "Internet",
    minesweeper: "Minesweeper",
    tetris: "Tetris",
  },
  name: "Kyle Lee",
  headline: "Aspiring Developer, Analyst, and Creative Builder",
  aboutSubtabs: [
    {
      id: "general",
      label: "General",
      description: [
        "Information:",
        "  Kyle Lee",
        "  516-589-4504",
        "  kylelee07@gmail.com",
        "  U.S. and Canadian Citizen",
        
        " ",
        "Software Developer",
        "Computer Vision Research",

      ],
    },
    {
      id: "skills",
      label: "Skills",
      description: [
        "Programming Languages:",
        "  Python, C++, C, Rust, TypeScript, JavaScript, HTML/CSS, SQL, PostgreSQL, MongoDB, PHP, MATLAB",
        "Frameworks & Libraries:",
        "  PyTorch, NumPy, OpenCV, Pandas, React, Node.js, NextJS, FastAPI, Tailwind, OpenAI API",
        "Technologies and Tools:",
        "  Git, GitHub, Docker, CI/CD, AWS, Azure, Linux, Windows, AndroidOS, FreeRTOS, REST APIs",
        "Creative:",
        "  Adobe Photoshop, Adobe Lightroom, Clip Studio Paint, Blender, Unity, Unreal Engine",
      ],
    },
    {
      id: "hobby",
      label: "Hobbys",
      description: [
        "In my free time, I enjoy drawing landscapes and concept art. When I'm away from my computer I enjoy eating at all-you-can-eat hotpot and bbq, and rock climbing with my friends!",
        " ",
        "Part time water bottle critic.",

      ],
    },
  ],
  contactEmail: {
    label: "Email Me",
    address: "kylelee07@gmail.com",
    description: "Send me a direct email from this portfolio.",
    defaultSubject: "Hi Kyle!",
  },
  resume: {
    label: "Resume",
    url: "https://drive.google.com/file/d/1pkLiBIRbPGk7TwhtKIrR1Yiqa-uWOLEO/view?usp=sharing",
    description: "View my resume, experience, and selected projects.",
  },
  linkedin: {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/kyle-f-lee",
    description: "Connect with me on LinkedIn.",
  },
  artPortfolio: {
    label: "Art Portfolio",
    url: "",
    description: "Browse selected artwork and visual experiments.",
  },
  currentProjects: [
    {
      name: "MelonSight",
      description: "An Arduino-based device that uses infrared sensors and machine learning to estimate watermelon ripeness and sweetness without cutting the fruit.",
    },
    {
      name: "Glyph",
      description: "A vision transformer framework that detects image copies even after extreme cropping, overlays, and diffusion-based edits.",
    },
    {
      name: "ARMadillo",
      description: "A five-stage AArch64 pipeline emulator with hazard detection, value forwarding, and an LRU-managed L1 cache.",
    },
    {
      name: "Koharu",
      description: "Contributions to a local comic and manga translator, improving GPU memory management and computer vision pipelines for detection, OCR, and translation.",
    },
    {
      name: "Monte Carlo Sim",
      description: "A Monte Carlo simulation project that explores possible outcomes through repeated random sampling.",
    },
    {
      name: "Spatial Ink",
      description: "A VR/AR drawing application for Meta Quest 3S that anchors 3D sketches to real-world landmarks using Unity, C#, and OpenCV.",
    },
    {
      name: "Unlinked Pay",
      description: "A private on-chain payroll application for paying salaries in cryptocurrency while keeping compensation details confidential.",
    },
    {
      name: "BlockchainCTF",
      description: "A blockchain-based capture-the-flag hackathon project with a connected-wallet interface.",
    },
    {
      name: "TeenHacksLI",
      description: "A full-stack hackathon platform built with React and TypeScript to support sponsors and host participant projects.",
    },
  ],
};
