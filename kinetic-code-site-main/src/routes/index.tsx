import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Send, Github, Briefcase } from "lucide-react";
import Particles from "@/components/Particles";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const PHRASES = [
  "Code is Written.",
  "Workflows are Automated.",
  "Models are Optimized.",
  "Ideas are Deployed."
];

function Typewriter() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    let timer = setTimeout(() => {
      const i = loopNum % PHRASES.length;
      const fullText = PHRASES[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 40 : 100);

      if (!isDeleting && text === fullText) {
        // Pause at the end of the phrase
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        // Move to next phrase
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <span className="relative inline-flex items-center">
      {/* Invisible placeholder sized to the longest phrase prevents horizontal layout shift */}
      <span className="invisible whitespace-nowrap">Workflows are Automated.</span>
      <span className="absolute left-0 whitespace-nowrap">
        <span className="bg-gradient-to-r from-[#00ffc0] to-white bg-clip-text text-transparent">{text}</span>
        <span className="text-[#00ffc0] font-light animate-[pulse_1s_infinite] ml-1">|</span>
      </span>
    </span>
  );
}

const navLinks = [
  { num: "01.", label: "ABOUT", href: "#about" },
  { num: "02.", label: "EXPERIENCE", href: "#experience" },
  { num: "03.", label: "PROJECTS", href: "#projects" },
  { num: "04.", label: "STACK", href: "#stack" },
  { num: "05.", label: "CONTACT", href: "#contact" },
];

const experience = [
  {
    role: "AI/ML Intern",
    company: "MPOnline Limited",
    sub: "TCS & MP Government JV — Bhopal, India",
    period: "APR 2026 — PRESENT",
    points: [
      "Engineered an NLP-driven conversational chatbot with advanced intent recognition, cutting manual support overhead and accelerating query resolution.",
      "Architected new modules for the HRMS web portal and optimized internal workflows, driving cross-functional operational efficiency.",
      "Built end-to-end automated RAG pipelines using n8n, integrating disparate internal tools and APIs to eliminate repetitive manual work.",
    ],
    stack: ["PYTHON", "NLP", "RAG", "N8N", "FASTAPI"],
  },
];

const stackData = [
  {
    category: "CORE",
    items: [
      { name: "NLP" },
      { name: "LLM Fine-Tuning" },
      { name: "Workflow Automation" },
      { name: "Machine Learning" },
      { name: "RAG" }
    ],
  },
  {
    category: "LANGUAGES",
    items: [
      { name: "Python" },
      { name: "SQL" },
      { name: "Java" },
      { name: "JavaScript" }
    ],
  },
  {
    category: "LIBRARIES",
    items: [
      { name: "Pandas" },
      { name: "NumPy" },
      { name: "PyTorch" },
      { name: "Hugging Face" },
      { name: "Scikit-learn" }
    ],
  },
  {
    category: "TOOLS",
    items: [
      { name: "n8n" },
      { name: "FastAPI" },
      { name: "Streamlit" },
      { name: "Power BI" },
      { name: "AWS", accent: true },
      { name: "Docker" }
    ],
  },
];

const STACK_MARQUEE = ["TUNING", "FASTAPI", "STREAMLIT", "HUGGING FACE", "n8n", "POWER BI"];

const projects = [
  {
    num: "01",
    badge: "LIVE",
    title: "Resume Parser & Ranker",
    desc: "Full-stack web app for automated, scalable resume screening. NLP pipeline extracts skills; job-aware algorithm dynamically scores resumes against selected roles.",
    stack: ["STREAMLIT", "FASTAPI", "NLP", "PYTHON"],
    href: "https://resumescreening-and-ranking-h4dpczsqncvjvrarjblomd.streamlit.app/",
  },
  {
    num: "02",
    badge: "GITHUB",
    title: "Real-Time Data Orchestration Bot",
    desc: "LLM-backed orchestrator fusing multiple external APIs — live news, weather, temperature — into one conversational interface, with a location-aware travel guide.",
    stack: ["LLM", "PYTHON", "APIS"],
    href: "https://github.com/BANIYAA",
  },
  {
    num: "03",
    badge: "96% ACCURACY",
    title: "LLM Fine-Tuning — Sentiment",
    desc: "Fine-tuned a pre-trained LLM on a labeled Twitter sentiment dataset reaching 96% test accuracy, with 70% on AI-generated synthetic data for cross-domain robustness.",
    stack: ["HUGGINGFACE", "TRANSFORMERS", "PYTORCH"],
    href: "https://colab.research.google.com/drive/1UhutgyXDmnp-Zd4HGwVztnCESFw7mrZs?usp=sharing",
  },
  {
    num: "04",
    badge: "EMBEDDED",
    title: "Line Follower Fire Bot",
    desc: "Autonomous hardware + software bot configured to follow defined tracks and perform targeted fire-safety and extinguishing operations.",
    stack: ["ROBOTICS", "EMBEDDED", "C"],
    href: "https://www.datascienceportfol.io/gkshitiz375",
  },
  {
    num: "05",
    badge: "+18% UTILIZATION",
    title: "Sales Performance Analysis",
    desc: "Analyzed multi-year retail datasets to surface seasonal demand patterns and product-level trends. Inventory recommendations improved stock utilization by 18%.",
    stack: ["POWER BI", "PANDAS", "MATPLOTLIB"],
    href: "https://www.datascienceportfol.io/gkshitiz375",
  },
  {
    num: "06",
    badge: "0.97 ROC-AUC",
    title: "Parkinson's Disease Prediction",
    desc: "Tackled severe class imbalance with SMOTE and resampling, reaching 98% recall and 0.97+ ROC-AUC through systematic feature engineering.",
    stack: ["SCIKIT-LEARN", "SMOTE", "PYTHON"],
    href: "https://www.datascienceportfol.io/gkshitiz375",
  },
];

function NavLink({ num, label, href }: { num: string; label: string; href: string }) {
  return (
    <a href={href} className="mono text-[11px] tracking-[0.15em] text-[#a1a1a1] hover:text-white transition-colors">
      <span className="text-[#00ffc0]">{num}</span> {label}
    </a>
  );
}

function GridLine({ className = "" }: { className?: string }) {
  return <div className={`bg-[#262626] ${className}`} />;
}

function Index() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#00ffc0] selection:text-black">
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <Particles
          particleCount={240}
          particleSpread={12}
          speed={0.14}
          particleColors={["#10b981","#10b981","#10b981"]}
          moveParticlesOnHover
          particleHoverFactor={1}
          alphaParticles
          particleBaseSize={100}
          sizeRandomness={1.1}
          cameraDistance={13}
          disableRotation={false}
        />
      </div>
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 inset-x-0 z-50 border-b border-[#262626] bg-black/80 backdrop-blur">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between">
            <a href="#" className="mono text-sm font-semibold tracking-tight">KG<span className="text-[#00ffc0]">.</span></a>
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((l) => <NavLink key={l.num} {...l} />)}
            </nav>
            <div className="flex items-center gap-5">
              <a 
                href="https://github.com/BANIYAA" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#a1a1a1] hover:text-[#00ffc0] hover:drop-shadow-[0_0_10px_rgba(0,255,192,0.8)] transition-all duration-300"
                title="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://www.datascienceportfol.io/gkshitiz375" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#a1a1a1] hover:text-[#00ffc0] hover:drop-shadow-[0_0_10px_rgba(0,255,192,0.8)] transition-all duration-300"
                title="Portfolio"
              >
                <Briefcase size={20} />
              </a>
              <a href="#contact" className="hidden md:inline-block mono text-[11px] tracking-[0.15em] border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors ml-2">
                GET IN TOUCH
              </a>
            </div>
          </div>
        </header>

      <main className="pt-16">
        {/* HERO */}
        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-20 pb-32">
          <div className="grid grid-cols-12 gap-6 lg:gap-10">
            {/* Left bio */}
            <div className="col-span-12 lg:col-span-7">
              <div className="flex items-center gap-3 mb-10">
                <span className="h-px w-10 bg-[#00ffc0]" />
                <span className="mono text-[11px] tracking-[0.2em] text-[#00ffc0]">HELLO, I'M</span>
              </div>
              <h1 className="font-sans font-black text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.1] tracking-[-0.04em] flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="whitespace-nowrap text-white">Kshitiz Gupta<span className="text-[#00ffc0]">.</span></span>
                <span className="text-[28px] sm:text-[40px] lg:text-[48px] font-medium tracking-tight">
                  <Typewriter />
                </span>
              </h1>

              <div className="mt-10 flex flex-wrap items-center gap-4 text-[#a1a1a1]">
                <span className="text-sm">AI/ML &amp; Data Analytics Professional</span>
                <span className="h-4 w-px bg-[#262626]" />
                <div className="mono text-[11px] tracking-[0.15em] text-[#00ffc0] flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#00ffc0] shadow-[0_0_8px_#00ffc0]" />PYTHON</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#00ffc0] shadow-[0_0_8px_#00ffc0]" />VISUALIZATION</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#00ffc0] shadow-[0_0_8px_#00ffc0]" />NLP</span>
                </div>
              </div>

              <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-[#a1a1a1]">
                Building production-grade chatbots, workflow automation systems, and LLM-powered applications. Currently turning ML research into shipping product.
              </p>

              <div className="mt-12 flex flex-wrap gap-3">
                <a href="#projects" className="mono text-[11px] tracking-[0.15em] bg-white text-black px-5 py-3 inline-flex items-center gap-3 hover:bg-[#00ffc0] transition-colors">
                  VIEW PROJECTS <span>→</span>
                </a>
                <a href="#" className="mono text-[11px] tracking-[0.15em] border border-white px-5 py-3 inline-flex items-center gap-3 hover:bg-white hover:text-black transition-colors">
                  DOWNLOAD RESUME <span>→</span>
                </a>
              </div>
            </div>

            {/* Right terminal + metrics */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <div className="group border border-[#262626] bg-[#0a0a0a] hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300">
                <div className="flex items-center justify-between border-b border-[#262626] px-4 py-2.5">
                  <span className="mono text-[11px] text-[#a1a1a1]">~/PROFILE.JSON</span>
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#262626]" />
                    <span className="h-2 w-2 rounded-full bg-[#262626]" />
                    <span className="h-2 w-2 rounded-full bg-[#00ffc0] shadow-[0_0_6px_#00ffc0]" />
                  </div>
                </div>
                <pre className="mono text-[12.5px] leading-relaxed p-5 text-[#a1a1a1] overflow-x-auto">
{`{
  "name":      `}<span className="text-white">"Kshitiz Gupta"</span>{`,
  "edu":       `}<span className="text-white">"B.Tech, VIT Vellore"</span>{`,
  "cgpa":      `}<span className="text-[#00ffc0]">8.98</span>{`,
  "stack":     `}<span className="text-white">["python","pytorch","fastapi"]</span>{`,
  "currently": `}<span className="text-white">"building llm apps"</span>{`,
  "status":    `}<span className="text-[#00ffc0]">"open_to_work"</span>{`
}`}
                </pre>
              </div>

              {/* Metric grid 2x2 with single 1px lines */}
              <div className="relative grid grid-cols-2">
                <GridLine className="absolute left-1/2 top-0 bottom-0 w-px" />
                <GridLine className="absolute top-1/2 left-0 right-0 h-px" />
                {[
                  { label: "CGPA", value: "8.98", accent: false },
                  { label: "PROJECTS", value: "7+", accent: false },
                  { label: "ACCURACY", value: "96%", accent: true },
                  { label: "STACK", value: "12+", accent: false },
                ].map((m) => (
                  <div key={m.label} className="p-6">
                    <div className="mono text-[10px] tracking-[0.2em] text-[#a1a1a1]">{m.label}</div>
                    <div className={`mt-3 text-4xl font-bold tracking-tight ${m.accent ? "text-[#00ffc0]" : "text-white"}`}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="border-t border-[#262626]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-28">
            <h2 className="font-black text-[48px] sm:text-[68px] lg:text-[88px] leading-[0.95] tracking-[-0.035em] max-w-5xl">
              Engineering ideas into shippable AI<span className="text-[#00ffc0]">.</span>
            </h2>
            <div className="mono text-[11px] tracking-[0.2em] text-[#a1a1a1] mt-6">// origin, focus, philosophy</div>

            <div className="grid grid-cols-12 gap-6 lg:gap-10 mt-20">
              <div className="col-span-12 lg:col-span-7 space-y-6 text-[15px] leading-relaxed text-[#a1a1a1] max-w-2xl">
                <p>
                  I'm a B.Tech graduate from <span className="text-[#00ffc0]">VIT Vellore</span> with a CGPA of 8.98 — focused on building production-grade chatbots, workflow automation systems, and LLM-powered applications.
                </p>
                <p>
                  My work sits at the intersection of <span className="text-white">ML research</span> and shipping product: fine-tuning models for narrow domains, designing retrieval pipelines that hold up under load, and writing the boring glue code that keeps systems alive at 3am.
                </p>
                <p>
                  I care about evaluation more than demos. If it can't be measured, it isn't done. If it can't be deployed, it doesn't count.
                </p>
              </div>

              <div className="col-span-12 lg:col-span-5">
                <div className="group border border-[#262626] bg-[#0a0a0a] hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-[#262626] px-4 py-2.5">
                    <span className="mono text-[11px] text-[#a1a1a1]">EDUCATION.LOG</span>
                    <span className="h-2 w-2 rounded-full bg-[#00ffc0] shadow-[0_0_6px_#00ffc0]" />
                  </div>
                  <div className="p-5 space-y-5">
                    <div>
                      <div className="mono text-[10px] tracking-[0.2em] text-[#a1a1a1]">DEGREE</div>
                      <div className="mt-1.5 text-sm">B.Tech, Computer Science</div>
                    </div>
                    <div>
                      <div className="mono text-[10px] tracking-[0.2em] text-[#a1a1a1]">INSTITUTE</div>
                      <div className="mt-1.5 text-sm">Vellore Institute of Technology — Vellore</div>
                    </div>
                    <div className="relative grid grid-cols-2 border-t border-[#262626] pt-5">
                      <GridLine className="absolute top-5 bottom-0 left-1/2 w-px" />
                      <div>
                        <div className="mono text-[10px] tracking-[0.2em] text-[#a1a1a1]">CGPA</div>
                        <div className="mt-2 text-3xl font-bold text-[#00ffc0]">8.98</div>
                      </div>
                      <div className="pl-6">
                        <div className="mono text-[10px] tracking-[0.2em] text-[#a1a1a1]">FOCUS</div>
                        <div className="mt-2 text-sm">AI/ML · Data</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" className="border-t border-[#262626]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-28">
            <h2 className="font-black text-[44px] sm:text-[60px] lg:text-[76px] leading-[0.95] tracking-[-0.035em] max-w-5xl">
              Where I've shipped<span className="text-[#00ffc0]">.</span>
            </h2>
            <div className="mono text-[11px] tracking-[0.2em] text-[#a1a1a1] mt-6">// professional experience</div>

            <div className="mt-16 space-y-6">
              {experience.map((e) => (
                <div key={e.company} className="group border border-[#262626] bg-[#0a0a0a] hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300">
                  <div className="grid grid-cols-12 gap-6 lg:gap-10 p-6 lg:p-8">
                    <div className="col-span-12 lg:col-span-4">
                      <div className="mono text-[11px] tracking-[0.2em] text-[#00ffc0]">{e.period}</div>
                      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{e.role}</h3>
                      <div className="mt-2 text-sm text-white">{e.company}</div>
                      <div className="mono text-[11px] tracking-[0.1em] text-[#a1a1a1] mt-1">{e.sub}</div>
                      <div className="mt-6 flex flex-wrap gap-1.5">
                        {e.stack.map((s) => (
                          <span key={s} className="mono text-[10px] tracking-[0.15em] text-[#a1a1a1] border border-[#262626] px-2 py-1">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8 lg:border-l lg:border-[#262626] lg:pl-10">
                      <ul className="space-y-4">
                        {e.points.map((pt, i) => (
                          <li key={i} className="flex gap-4 text-[15px] leading-relaxed text-[#a1a1a1]">
                            <span className="mono text-[#00ffc0] text-xs mt-1.5 shrink-0">0{i + 1}</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="border-t border-[#262626]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-28">
            <h2 className="font-black text-[44px] sm:text-[60px] lg:text-[76px] leading-[0.95] tracking-[-0.035em] max-w-5xl">
              Selected work — live and in progress<span className="text-[#00ffc0]">.</span>
            </h2>
            <div className="mono text-[11px] tracking-[0.2em] text-[#a1a1a1] mt-6">// click any card to explore</div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((p) => (
                <a
                  key={p.num}
                  href={p.href}
                  target={p.href.startsWith("http") ? "_blank" : undefined}
                  rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group text-left border border-[#262626] bg-[#0a0a0a] p-6 hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] hover:bg-[#0d0d0d] transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="mono text-[11px] tracking-[0.2em] text-[#a1a1a1]">{p.num}</span>
                    <span className="mono text-[10px] tracking-[0.2em] text-[#00ffc0] border border-[#00ffc0]/40 px-2 py-1">{p.badge}</span>
                  </div>
                  <h3 className="mt-12 text-xl font-semibold tracking-tight text-white group-hover:text-[#00ffc0] transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#a1a1a1]">{p.desc}</p>

                  <div className="mt-8 flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <span key={s} className="mono text-[10px] tracking-[0.15em] text-[#a1a1a1] border border-[#262626] px-2 py-1">{s}</span>
                    ))}
                  </div>
                  <div className="mt-6 mono text-[11px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] flex items-center gap-2">
                    EXPLORE <span>→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* STACK */}
        <section id="stack" className="pt-10">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stackData.map((col) => (
                <div key={col.category} className="group border border-[#262626] bg-[#0a0a0a] hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 p-8 lg:p-10">
                  <div className="mono text-[11px] tracking-[0.2em] text-[#a1a1a1] flex items-center gap-2 mb-8 group-hover:text-[#00ffc0] transition-colors">
                    <span className="h-1 w-1 bg-[#00ffc0]"></span>
                    {col.category}
                  </div>
                  <ul className="space-y-4">
                    {col.items.map((item) => (
                      <li 
                        key={item.name} 
                        className={`font-mono text-[13px] tracking-tight transition-colors ${item.accent ? 'text-[#00ffc0]' : 'text-white'} group-hover:text-[#00ffc0]`}
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Marquee */}
          <div className="border-y border-[#262626] bg-black overflow-hidden py-6 flex">
            <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap min-w-full">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-around w-full shrink-0">
                  {STACK_MARQUEE.map((word, j) => (
                    <div key={j} className="flex items-center gap-12 mx-6">
                      <span className="mono text-[12px] tracking-[0.2em] text-[#a1a1a1]">{word}</span>
                      <span className="text-[#00ffc0] text-[10px]">♦</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="border-t border-[#262626] mt-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-[#262626] bg-[#0a0a0a]">
              {/* Left Column: Form */}
              <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-[#262626]">
                <form
                  className="space-y-8"
                  onSubmit={(e) => { e.preventDefault(); }}
                >
                  <div>
                    <label className="mono text-[10px] tracking-[0.2em] text-[#a1a1a1] mb-3 block">NAME</label>
                    <input 
                      placeholder="Your full name"
                      className="w-full bg-[#050505] border border-[#262626] text-white px-4 py-3.5 text-[15px] focus:border-[#00ffc0] outline-none placeholder-[#333] hover:border-[#00ffc0] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="mono text-[10px] tracking-[0.2em] text-[#a1a1a1] mb-3 block">EMAIL</label>
                    <input 
                      type="email" 
                      placeholder="you@domain.com"
                      className="w-full bg-[#050505] border border-[#262626] text-white px-4 py-3.5 text-[15px] focus:border-[#00ffc0] outline-none placeholder-[#333] hover:border-[#00ffc0] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="mono text-[10px] tracking-[0.2em] text-[#a1a1a1] mb-3 block">MESSAGE</label>
                    <textarea 
                      rows={5} 
                      placeholder="What are you building?"
                      className="w-full bg-[#050505] border border-[#262626] text-white px-4 py-3.5 text-[15px] focus:border-[#00ffc0] outline-none resize-none placeholder-[#333] hover:border-[#00ffc0] transition-colors" 
                    />
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="bg-white text-black font-semibold text-sm px-6 py-3.5 hover:bg-[#00ffc0] transition-colors inline-flex items-center gap-3">
                      Send Message <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Details */}
              <div className="flex flex-col gap-4 p-6 lg:p-8 border-t lg:border-t-0 border-[#262626] bg-[#0a0a0a]">
                <div className="group p-6 lg:p-8 border border-[#262626] bg-[#050505] flex-1 flex flex-col justify-center hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mono text-[10px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] transition-colors mb-4">
                    <Mail size={14} /> EMAIL
                  </div>
                  <div className="text-[16px] text-white group-hover:text-[#00ffc0] transition-colors">gkshitiz375@gmail.com</div>
                </div>
                <div className="group p-6 lg:p-8 border border-[#262626] bg-[#050505] flex-1 flex flex-col justify-center hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mono text-[10px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] transition-colors mb-4">
                    <Phone size={14} /> PHONE
                  </div>
                  <div className="text-[16px] text-white group-hover:text-[#00ffc0] transition-colors">+91 7806995896</div>
                </div>
                <div className="group p-6 lg:p-8 border border-[#262626] bg-[#050505] flex-1 flex flex-col justify-center hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mono text-[10px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] transition-colors mb-4">
                    <MapPin size={14} /> LOCATION
                  </div>
                  <div className="text-[16px] text-white group-hover:text-[#00ffc0] transition-colors">India</div>
                </div>
                <div className="group p-6 lg:p-8 border border-[#262626] bg-[#050505] flex-1 flex flex-col justify-center hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-2 mono text-[10px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] transition-colors mb-4">
                    AVAILABILITY
                  </div>
                  <div className="flex items-center gap-3 text-[16px] text-white group-hover:text-[#00ffc0] transition-colors">
                    <span className="h-2.5 w-2.5 bg-[#00ffc0] group-hover:shadow-[0_0_8px_#00ffc0] transition-shadow"></span>
                    Open to full-time roles
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#262626]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-8 flex flex-wrap items-center justify-between gap-4">
            <div className="mono text-[11px] tracking-[0.2em] text-[#a1a1a1]">© 2026 KSHITIZ GUPTA</div>
            <div className="mono text-[11px] tracking-[0.2em] text-[#a1a1a1]">BUILT WITH <span className="text-[#00ffc0]">PRECISION</span></div>
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
}
