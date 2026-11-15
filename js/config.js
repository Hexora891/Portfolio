const PROFILE = {
  name: "Ayush Singh",
  fullName: "Ayush Singh",
  title: "Red Team Operator",
  brand: "Ayush",
  email: "mail.hexora89@gmail.com",
  location: "India",
  site: "hexora26.xyz",
  github: "https://github.com/Hexora891",
  linkedin: "https://www.linkedin.com/in/ayush-singh-381792390/",
  x: "https://x.com/Hexora89",
  bio: [
    "I'm a red team operator working around Active Directory exploitation, defense evasion, and Windows internals, with most of my time going into malware development. I like building my own tooling instead of leaning on whatever ships out of the box.",
    "Recently I got a stable beacon running against hardened environments protected by CrowdStrike, Defender for Endpoint, Sophos, Cortex XDR, SentinelOne, Bitdefender, and Elastic, WDAC included. On Hack The Box I've worked through RastaLabs, Offshore, Zephyr, Dante, Puppet, and P.O.O. alongside the standalone machines.",
    "Right now I'm finishing a BCA at Chandigarh University and working through ODPC and ARTOC. Before that there was the Teamserver Essentials project — one-click C2 deployment on GCP behind a ModSecurity-hardened Apache redirector.",
    "This desktop is the portfolio. Open a window and poke around."
  ],
  skills: [
    "Active Directory Exploitation",
    "Defense Evasion",
    "Malware Development",
    "C2 Infrastructure",
    "Kerberos Delegation",
    "ADCS Abuse",
    "Python",
    "C / Windows API",
    "PowerShell / Bash",
    "Burp Suite",
    "BloodHound",
    "Adaptix C2"
  ],
  software: [
    "Adaptix C2",
    "BloodHound",
    "Impacket",
    "NetExec",
    "Rubeus",
    "Mimikatz",
    "Burp Suite",
    "VS Code",
    "Git / GitHub"
  ]
};

const ICONS = {
  about: "assets/about-icon.png",
  resume: "assets/icons/pdf.svg",
  contact: "assets/icons/mail.svg",
  computer: "assets/icons/computer.svg",
  paint: "assets/icons/paint.svg",
  mines: "assets/icons/mines.svg",
  snake: "assets/icons/snake.svg",
  pong: "assets/icons/pong.svg",
  g2048: "assets/icons/g2048.svg",
  viewer: "assets/icons/image.svg",
  github: "assets/icons/github.svg",
  linkedin: "assets/icons/linkedin.svg",
  x: "assets/icons/x.svg",
  folder: "assets/icons/folder.svg",
  volume: "assets/icons/volume.svg"
};

const DESKTOP_ICONS = [
  { id: "about", label: "About Me", icon: ICONS.about },
  { id: "resume", label: "My Resume", icon: ICONS.resume },
  { id: "contact", label: "Contact Me", icon: ICONS.contact }
];

const START_LEFT = [
  { id: "contact", label: "Contact Me", sub: "Send me a message", icon: ICONS.contact },
  { id: "about", label: "About Me", icon: ICONS.about },
  { id: "resume", label: "My Resume", icon: ICONS.resume },
  { id: "viewer", label: "Image Viewer", sub: "Browse my pictures", icon: ICONS.viewer },
  { id: "paint", label: "Paint", icon: ICONS.paint }
];

const START_RIGHT = [
  { id: "github", label: "GitHub", href: PROFILE.github, icon: ICONS.github },
  { id: "linkedin", label: "LinkedIn", href: PROFILE.linkedin, icon: ICONS.linkedin },
  { id: "x", label: "X / Twitter", href: PROFILE.x, icon: ICONS.x },
  { id: "computer", label: "My Computer", icon: ICONS.computer },
  { id: "viewer", label: "My Pictures", icon: ICONS.viewer }
];

const ALL_PROGRAMS = [
  { id: "about", label: "About Me", icon: ICONS.about },
  { id: "resume", label: "My Resume", icon: ICONS.resume },
  { id: "contact", label: "Contact Me", icon: ICONS.contact },
  { id: "viewer", label: "Image Viewer", icon: ICONS.viewer },
  { id: "paint", label: "Paint", icon: ICONS.paint },
  { id: "mines", label: "Minesweeper", icon: ICONS.mines },
  { id: "snake", label: "Snake", icon: ICONS.snake },
  { id: "pong", label: "Pong", icon: ICONS.pong },
  { id: "g2048", label: "2048", icon: ICONS.g2048 },
  { id: "computer", label: "My Computer", icon: ICONS.computer }
];

const GALLERY = [
  { src: "assets/wallpaper.jpg", title: "Bliss Wallpaper" },
  { src: "assets/bliss.jpg", title: "Bliss" },
  { src: "assets/projects/gameboy.jpg", title: "Mi Boy Color" },
  { src: "assets/projects/ipod.jpg", title: "MiPod Classic" },
  { src: "assets/projects/sports.jpg", title: "Sport" },
];
