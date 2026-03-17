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
    projects: "Current Projects",
    art: "Art Portfolio",
    email: "Email Me",
    browser: "Internet Explorer",
  },
  name: "Kyle Lee",
  headline: "Aspiring Developer, Analyst, and Creative Builder",
  aboutSubtabs: [
    {
      id: "general",
      label: "General",
      description: [
        "Information:",
        "Kyle Lee",
        "Aspiring developer, analyst, and creative",
        "",
        "US and Canadian Citizen",
        "Email: kylelee07@example.com",
      ],
    },
    {
      id: "skills",
      label: "Skills",
      description: [
        "Programming: Python(Tensorflow, Numpy, Pandas, FastAPI), C, C++, C#, React, TypeScript, Javascript, SQL, R, Git, Docker, Linux",
        "Data Analysis: Excel, Tableau, Statistical Modeling, Financial Modeling, Financial Accounting",
        "Creative: Adobe Photoshop, Adobe Lightroom, Clip Studio Paint, Blender",
        "Languages: English, Cantonese Chinese",
      ],
    },
    {
      id: "hobby",
      label: "Hobbys",
      description: [
        "In my free time, I enjoy drawing, eating at all you can eat hotpot, and rock climbing with my friends!",
      ],
    },
  ],
  contactEmail: {
    label: "Email Me",
    address: "kylelee07@example.com",
    description: "Send me a direct email from this portfolio.",
    defaultSubject: "Hi Kyle!",
  },
  resume: {
    label: "Resume",
    url: "https://drive.google.com/file/d/1EOhm4DjyEgATNR-bjZj28Nq6uXbDW_ba/view?usp=sharing",
    description: "Open a hosted PDF or personal resume page.",
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
      name: "Spacial Ink AR Drawing",
      description: "",
      url: "https://vimeo.com/1167914539?fl=ip&fe=ec",
    },
    {
      name: "Unlinked Pay",
      description: "",
      url: "https://www.youtube.com/watch?v=0d8POpG3pts",
    },
    {
      name: "BlockchainCTF",
      description: "https://vimeo.com/1169317146?fl=ip&fe=ec",
      url: "",
    },
    {
      name: "Monte Carlo Sim",
      description: "A GUI has not been developed at tims point in time",
      url: "",
    },
    {
      name: "TeenHacksLI",
      description: "",
      url: "https://www.teenhacksli.com/",
    },
  ],
};
