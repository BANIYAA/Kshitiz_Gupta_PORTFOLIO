import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { G as Github, B as Briefcase, S as Send, M as Mail, P as Phone, a as MapPin } from "../_libs/lucide-react.mjs";
import { R as Renderer, C as Camera, G as Geometry, P as Program, M as Mesh } from "../_libs/ogl.mjs";
const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];
const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const int = parseInt(hex, 16);
  const r = (int >> 16 & 255) / 255;
  const g = (int >> 8 & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};
const vertex = (
  /* glsl */
  `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`
);
const fragment = (
  /* glsl */
  `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`
);
const Particles = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio = 1,
  className
}) => {
  const containerRef = reactExports.useRef(null);
  const mouseRef = reactExports.useRef({ x: 0, y: 0 });
  reactExports.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const renderer = new Renderer({
      dpr: pixelRatio,
      depth: false,
      alpha: true
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);
    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize, false);
    resize();
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height * 2 - 1);
      mouseRef.current = { x, y };
    };
    if (moveParticlesOnHover) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = particleColors && particleColors.length > 0 ? particleColors : defaultColors;
    for (let i = 0; i < count; i++) {
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }
    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors }
    });
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * pixelRatio },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 }
      },
      transparent: true,
      depthTest: false
    });
    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    let animationFrameId;
    let lastTime = performance.now();
    let elapsed = 0;
    const update = (t) => {
      animationFrameId = requestAnimationFrame(update);
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * speed;
      program.uniforms.uTime.value = elapsed * 1e-3;
      if (moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * particleHoverFactor;
        particles.position.y = -mouseRef.current.y * particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }
      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 2e-4) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 5e-4) * 0.15;
        particles.rotation.z += 0.01 * speed;
      }
      renderer.render({ scene: particles, camera });
    };
    animationFrameId = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("resize", resize);
      if (moveParticlesOnHover) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
    pixelRatio
  ]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef, className: `particles-container ${className}` });
};
const PHRASES = ["Code is Written.", "Workflows are Automated.", "Models are Optimized.", "Ideas are Deployed."];
function Typewriter() {
  const [text, setText] = reactExports.useState("");
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const [loopNum, setLoopNum] = reactExports.useState(0);
  const [typingSpeed, setTypingSpeed] = reactExports.useState(100);
  reactExports.useEffect(() => {
    let timer = setTimeout(() => {
      const i = loopNum % PHRASES.length;
      const fullText = PHRASES[i];
      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
      setTypingSpeed(isDeleting ? 40 : 100);
      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2e3);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative inline-flex items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "invisible whitespace-nowrap", children: "Workflows are Automated." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute left-0 whitespace-nowrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-[#00ffc0] to-white bg-clip-text text-transparent", children: text }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0] font-light animate-[pulse_1s_infinite] ml-1", children: "|" })
    ] })
  ] });
}
const navLinks = [{
  num: "01.",
  label: "ABOUT",
  href: "#about"
}, {
  num: "02.",
  label: "EXPERIENCE",
  href: "#experience"
}, {
  num: "03.",
  label: "PROJECTS",
  href: "#projects"
}, {
  num: "04.",
  label: "STACK",
  href: "#stack"
}, {
  num: "05.",
  label: "CONTACT",
  href: "#contact"
}];
const experience = [{
  role: "AI/ML Intern",
  company: "MPOnline Limited",
  sub: "TCS & MP Government JV — Bhopal, India",
  period: "APR 2026 — PRESENT",
  points: ["Engineered an NLP-driven conversational chatbot with advanced intent recognition, cutting manual support overhead and accelerating query resolution.", "Architected new modules for the HRMS web portal and optimized internal workflows, driving cross-functional operational efficiency.", "Built end-to-end automated RAG pipelines using n8n, integrating disparate internal tools and APIs to eliminate repetitive manual work."],
  stack: ["PYTHON", "NLP", "RAG", "N8N", "FASTAPI"]
}];
const stackData = [{
  category: "CORE",
  items: [{
    name: "NLP"
  }, {
    name: "LLM Fine-Tuning"
  }, {
    name: "Workflow Automation"
  }, {
    name: "Machine Learning"
  }, {
    name: "RAG"
  }]
}, {
  category: "LANGUAGES",
  items: [{
    name: "Python"
  }, {
    name: "SQL"
  }, {
    name: "Java"
  }, {
    name: "JavaScript"
  }]
}, {
  category: "LIBRARIES",
  items: [{
    name: "Pandas"
  }, {
    name: "NumPy"
  }, {
    name: "PyTorch"
  }, {
    name: "Hugging Face"
  }, {
    name: "Scikit-learn"
  }]
}, {
  category: "TOOLS",
  items: [{
    name: "n8n"
  }, {
    name: "FastAPI"
  }, {
    name: "Streamlit"
  }, {
    name: "Power BI"
  }, {
    name: "AWS",
    accent: true
  }, {
    name: "Docker"
  }]
}];
const STACK_MARQUEE = ["TUNING", "FASTAPI", "STREAMLIT", "HUGGING FACE", "n8n", "POWER BI"];
const projects = [{
  num: "01",
  badge: "LIVE",
  title: "Resume Parser & Ranker",
  desc: "Full-stack web app for automated, scalable resume screening. NLP pipeline extracts skills; job-aware algorithm dynamically scores resumes against selected roles.",
  stack: ["STREAMLIT", "FASTAPI", "NLP", "PYTHON"],
  href: "https://resumescreening-and-ranking-h4dpczsqncvjvrarjblomd.streamlit.app/"
}, {
  num: "02",
  badge: "GITHUB",
  title: "Real-Time Data Orchestration Bot",
  desc: "LLM-backed orchestrator fusing multiple external APIs — live news, weather, temperature — into one conversational interface, with a location-aware travel guide.",
  stack: ["LLM", "PYTHON", "APIS"],
  href: "https://github.com/BANIYAA"
}, {
  num: "03",
  badge: "96% ACCURACY",
  title: "LLM Fine-Tuning — Sentiment",
  desc: "Fine-tuned a pre-trained LLM on a labeled Twitter sentiment dataset reaching 96% test accuracy, with 70% on AI-generated synthetic data for cross-domain robustness.",
  stack: ["HUGGINGFACE", "TRANSFORMERS", "PYTORCH"],
  href: "https://colab.research.google.com/drive/1UhutgyXDmnp-Zd4HGwVztnCESFw7mrZs?usp=sharing"
}, {
  num: "04",
  badge: "EMBEDDED",
  title: "Line Follower Fire Bot",
  desc: "Autonomous hardware + software bot configured to follow defined tracks and perform targeted fire-safety and extinguishing operations.",
  stack: ["ROBOTICS", "EMBEDDED", "C"],
  href: "https://www.datascienceportfol.io/gkshitiz375"
}, {
  num: "05",
  badge: "+18% UTILIZATION",
  title: "Sales Performance Analysis",
  desc: "Analyzed multi-year retail datasets to surface seasonal demand patterns and product-level trends. Inventory recommendations improved stock utilization by 18%.",
  stack: ["POWER BI", "PANDAS", "MATPLOTLIB"],
  href: "https://www.datascienceportfol.io/gkshitiz375"
}, {
  num: "06",
  badge: "0.97 ROC-AUC",
  title: "Parkinson's Disease Prediction",
  desc: "Tackled severe class imbalance with SMOTE and resampling, reaching 98% recall and 0.97+ ROC-AUC through systematic feature engineering.",
  stack: ["SCIKIT-LEARN", "SMOTE", "PYTHON"],
  href: "https://www.datascienceportfol.io/gkshitiz375"
}];
function NavLink({
  num,
  label,
  href
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href, className: "mono text-[11px] tracking-[0.15em] text-[#a1a1a1] hover:text-white transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: num }),
    " ",
    label
  ] });
}
function GridLine({
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `bg-[#262626] ${className}` });
}
function Index() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen bg-black text-white selection:bg-[#00ffc0] selection:text-black", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 w-full h-full", style: {
      zIndex: 0
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Particles, { particleCount: 240, particleSpread: 12, speed: 0.14, particleColors: ["#10b981", "#10b981", "#10b981"], moveParticlesOnHover: true, particleHoverFactor: 1, alphaParticles: true, particleBaseSize: 100, sizeRandomness: 1.1, cameraDistance: 13, disableRotation: false }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "fixed top-0 inset-x-0 z-50 border-b border-[#262626] bg-black/80 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#", className: "mono text-sm font-semibold tracking-tight", children: [
          "KG",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: "." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden lg:flex items-center gap-8", children: navLinks.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { ...l }, l.num)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://github.com/BANIYAA", target: "_blank", rel: "noopener noreferrer", className: "text-[#a1a1a1] hover:text-[#00ffc0] hover:drop-shadow-[0_0_10px_rgba(0,255,192,0.8)] transition-all duration-300", title: "GitHub", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.datascienceportfol.io/gkshitiz375", target: "_blank", rel: "noopener noreferrer", className: "text-[#a1a1a1] hover:text-[#00ffc0] hover:drop-shadow-[0_0_10px_rgba(0,255,192,0.8)] transition-all duration-300", title: "Portfolio", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#contact", className: "hidden md:inline-block mono text-[11px] tracking-[0.15em] border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors ml-2", children: "GET IN TOUCH" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "pt-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-[1400px] px-6 lg:px-10 pt-20 pb-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-6 lg:gap-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-12 lg:col-span-7", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-10 bg-[#00ffc0]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[11px] tracking-[0.2em] text-[#00ffc0]", children: "HELLO, I'M" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-sans font-black text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.1] tracking-[-0.04em] flex flex-wrap items-center gap-x-4 gap-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "whitespace-nowrap text-white", children: [
                "Kshitiz Gupta",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: "." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[28px] sm:text-[40px] lg:text-[48px] font-medium tracking-tight", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typewriter, {}) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 flex flex-wrap items-center gap-4 text-[#a1a1a1]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "AI/ML & Data Analytics Professional" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-4 w-px bg-[#262626]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mono text-[11px] tracking-[0.15em] text-[#00ffc0] flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#00ffc0] shadow-[0_0_8px_#00ffc0]" }),
                  "PYTHON"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#00ffc0] shadow-[0_0_8px_#00ffc0]" }),
                  "VISUALIZATION"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#00ffc0] shadow-[0_0_8px_#00ffc0]" }),
                  "NLP"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-8 max-w-xl text-[15px] leading-relaxed text-[#a1a1a1]", children: "Building production-grade chatbots, workflow automation systems, and LLM-powered applications. Currently turning ML research into shipping product." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#projects", className: "mono text-[11px] tracking-[0.15em] bg-white text-black px-5 py-3 inline-flex items-center gap-3 hover:bg-[#00ffc0] transition-colors", children: [
                "VIEW PROJECTS ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "→" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#", className: "mono text-[11px] tracking-[0.15em] border border-white px-5 py-3 inline-flex items-center gap-3 hover:bg-white hover:text-black transition-colors", children: [
                "DOWNLOAD RESUME ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "→" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-12 lg:col-span-5 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group border border-[#262626] bg-[#0a0a0a] hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-[#262626] px-4 py-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[11px] text-[#a1a1a1]", children: "~/PROFILE.JSON" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-[#262626]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-[#262626]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-[#00ffc0] shadow-[0_0_6px_#00ffc0]" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("pre", { className: "mono text-[12.5px] leading-relaxed p-5 text-[#a1a1a1] overflow-x-auto", children: [
                `{
  "name":      `,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: '"Kshitiz Gupta"' }),
                `,
  "edu":       `,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: '"B.Tech, VIT Vellore"' }),
                `,
  "cgpa":      `,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: "8.98" }),
                `,
  "stack":     `,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: '["python","pytorch","fastapi"]' }),
                `,
  "currently": `,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: '"building llm apps"' }),
                `,
  "status":    `,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: '"open_to_work"' }),
                `
}`
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(GridLine, { className: "absolute left-1/2 top-0 bottom-0 w-px" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GridLine, { className: "absolute top-1/2 left-0 right-0 h-px" }),
              [{
                label: "CGPA",
                value: "8.98",
                accent: false
              }, {
                label: "PROJECTS",
                value: "7+",
                accent: false
              }, {
                label: "ACCURACY",
                value: "96%",
                accent: true
              }, {
                label: "STACK",
                value: "12+",
                accent: false
              }].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px] tracking-[0.2em] text-[#a1a1a1]", children: m.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-3 text-4xl font-bold tracking-tight ${m.accent ? "text-[#00ffc0]" : "text-white"}`, children: m.value })
              ] }, m.label))
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "about", className: "border-t border-[#262626]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1400px] px-6 lg:px-10 py-28", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-black text-[48px] sm:text-[68px] lg:text-[88px] leading-[0.95] tracking-[-0.035em] max-w-5xl", children: [
            "Engineering ideas into shippable AI",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: "." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[11px] tracking-[0.2em] text-[#a1a1a1] mt-6", children: "// origin, focus, philosophy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-6 lg:gap-10 mt-20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-12 lg:col-span-7 space-y-6 text-[15px] leading-relaxed text-[#a1a1a1] max-w-2xl", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "I'm a B.Tech graduate from ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: "VIT Vellore" }),
                " with a CGPA of 8.98 — focused on building production-grade chatbots, workflow automation systems, and LLM-powered applications."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "My work sits at the intersection of ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: "ML research" }),
                " and shipping product: fine-tuning models for narrow domains, designing retrieval pipelines that hold up under load, and writing the boring glue code that keeps systems alive at 3am."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "I care about evaluation more than demos. If it can't be measured, it isn't done. If it can't be deployed, it doesn't count." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-12 lg:col-span-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group border border-[#262626] bg-[#0a0a0a] hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-[#262626] px-4 py-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[11px] text-[#a1a1a1]", children: "EDUCATION.LOG" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-[#00ffc0] shadow-[0_0_6px_#00ffc0]" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px] tracking-[0.2em] text-[#a1a1a1]", children: "DEGREE" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-sm", children: "B.Tech, Computer Science" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px] tracking-[0.2em] text-[#a1a1a1]", children: "INSTITUTE" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-sm", children: "Vellore Institute of Technology — Vellore" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid grid-cols-2 border-t border-[#262626] pt-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(GridLine, { className: "absolute top-5 bottom-0 left-1/2 w-px" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px] tracking-[0.2em] text-[#a1a1a1]", children: "CGPA" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-3xl font-bold text-[#00ffc0]", children: "8.98" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-6", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[10px] tracking-[0.2em] text-[#a1a1a1]", children: "FOCUS" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm", children: "AI/ML · Data" })
                  ] })
                ] })
              ] })
            ] }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "experience", className: "border-t border-[#262626]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1400px] px-6 lg:px-10 py-28", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-black text-[44px] sm:text-[60px] lg:text-[76px] leading-[0.95] tracking-[-0.035em] max-w-5xl", children: [
            "Where I've shipped",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: "." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[11px] tracking-[0.2em] text-[#a1a1a1] mt-6", children: "// professional experience" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 space-y-6", children: experience.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group border border-[#262626] bg-[#0a0a0a] hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-6 lg:gap-10 p-6 lg:p-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-12 lg:col-span-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[11px] tracking-[0.2em] text-[#00ffc0]", children: e.period }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-2xl font-semibold tracking-tight", children: e.role }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm text-white", children: e.company }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[11px] tracking-[0.1em] text-[#a1a1a1] mt-1", children: e.sub }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap gap-1.5", children: e.stack.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[10px] tracking-[0.15em] text-[#a1a1a1] border border-[#262626] px-2 py-1", children: s }, s)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-12 lg:col-span-8 lg:border-l lg:border-[#262626] lg:pl-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-4", children: e.points.map((pt, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-4 text-[15px] leading-relaxed text-[#a1a1a1]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono text-[#00ffc0] text-xs mt-1.5 shrink-0", children: [
                "0",
                i + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pt })
            ] }, i)) }) })
          ] }) }, e.company)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "projects", className: "border-t border-[#262626]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1400px] px-6 lg:px-10 py-28", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-black text-[44px] sm:text-[60px] lg:text-[76px] leading-[0.95] tracking-[-0.035em] max-w-5xl", children: [
            "Selected work — live and in progress",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: "." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[11px] tracking-[0.2em] text-[#a1a1a1] mt-6", children: "// click any card to explore" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: projects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: p.href, target: p.href.startsWith("http") ? "_blank" : void 0, rel: p.href.startsWith("http") ? "noopener noreferrer" : void 0, className: "group text-left border border-[#262626] bg-[#0a0a0a] p-6 hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] hover:bg-[#0d0d0d] transition-all duration-300 flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[11px] tracking-[0.2em] text-[#a1a1a1]", children: p.num }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[10px] tracking-[0.2em] text-[#00ffc0] border border-[#00ffc0]/40 px-2 py-1", children: p.badge })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-12 text-xl font-semibold tracking-tight text-white group-hover:text-[#00ffc0] transition-colors", children: p.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-[#a1a1a1]", children: p.desc }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex flex-wrap gap-1.5", children: p.stack.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[10px] tracking-[0.15em] text-[#a1a1a1] border border-[#262626] px-2 py-1", children: s }, s)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 mono text-[11px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] flex items-center gap-2", children: [
              "EXPLORE ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "→" })
            ] })
          ] }, p.num)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "stack", className: "pt-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-[1400px] px-6 lg:px-10 py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: stackData.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group border border-[#262626] bg-[#0a0a0a] hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 p-8 lg:p-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mono text-[11px] tracking-[0.2em] text-[#a1a1a1] flex items-center gap-2 mb-8 group-hover:text-[#00ffc0] transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 bg-[#00ffc0]" }),
              col.category
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-4", children: col.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: `font-mono text-[13px] tracking-tight transition-colors ${item.accent ? "text-[#00ffc0]" : "text-white"} group-hover:text-[#00ffc0]`, children: item.name }, item.name)) })
          ] }, col.category)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-y border-[#262626] bg-black overflow-hidden py-6 flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex animate-[marquee_20s_linear_infinite] whitespace-nowrap min-w-full", children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-around w-full shrink-0", children: STACK_MARQUEE.map((word, j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-12 mx-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono text-[12px] tracking-[0.2em] text-[#a1a1a1]", children: word }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0] text-[10px]", children: "♦" })
          ] }, j)) }, i)) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "contact", className: "border-t border-[#262626] mt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-[1200px] px-6 lg:px-10 py-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-0 border border-[#262626] bg-[#0a0a0a]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-[#262626]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-8", onSubmit: (e) => {
            e.preventDefault();
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mono text-[10px] tracking-[0.2em] text-[#a1a1a1] mb-3 block", children: "NAME" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Your full name", className: "w-full bg-[#050505] border border-[#262626] text-white px-4 py-3.5 text-[15px] focus:border-[#00ffc0] outline-none placeholder-[#333] hover:border-[#00ffc0] transition-colors" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mono text-[10px] tracking-[0.2em] text-[#a1a1a1] mb-3 block", children: "EMAIL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", placeholder: "you@domain.com", className: "w-full bg-[#050505] border border-[#262626] text-white px-4 py-3.5 text-[15px] focus:border-[#00ffc0] outline-none placeholder-[#333] hover:border-[#00ffc0] transition-colors" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mono text-[10px] tracking-[0.2em] text-[#a1a1a1] mb-3 block", children: "MESSAGE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { rows: 5, placeholder: "What are you building?", className: "w-full bg-[#050505] border border-[#262626] text-white px-4 py-3.5 text-[15px] focus:border-[#00ffc0] outline-none resize-none placeholder-[#333] hover:border-[#00ffc0] transition-colors" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "bg-white text-black font-semibold text-sm px-6 py-3.5 hover:bg-[#00ffc0] transition-colors inline-flex items-center gap-3", children: [
              "Send Message ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 16 })
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 p-6 lg:p-8 border-t lg:border-t-0 border-[#262626] bg-[#0a0a0a]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group p-6 lg:p-8 border border-[#262626] bg-[#050505] flex-1 flex flex-col justify-center hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mono text-[10px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] transition-colors mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 14 }),
                " EMAIL"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[16px] text-white group-hover:text-[#00ffc0] transition-colors", children: "gkshitiz375@gmail.com" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group p-6 lg:p-8 border border-[#262626] bg-[#050505] flex-1 flex flex-col justify-center hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mono text-[10px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] transition-colors mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14 }),
                " PHONE"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[16px] text-white group-hover:text-[#00ffc0] transition-colors", children: "+91 7806995896" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group p-6 lg:p-8 border border-[#262626] bg-[#050505] flex-1 flex flex-col justify-center hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mono text-[10px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] transition-colors mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14 }),
                " LOCATION"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[16px] text-white group-hover:text-[#00ffc0] transition-colors", children: "India" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group p-6 lg:p-8 border border-[#262626] bg-[#050505] flex-1 flex flex-col justify-center hover:border-[#00ffc0] hover:shadow-[0_0_20px_rgba(0,255,192,0.15)] transition-all duration-300 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mono text-[10px] tracking-[0.2em] text-[#a1a1a1] group-hover:text-[#00ffc0] transition-colors mb-4", children: "AVAILABILITY" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[16px] text-white group-hover:text-[#00ffc0] transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 bg-[#00ffc0] group-hover:shadow-[0_0_8px_#00ffc0] transition-shadow" }),
                "Open to full-time roles"
              ] })
            ] })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-[#262626]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1400px] px-6 lg:px-10 py-8 flex flex-wrap items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono text-[11px] tracking-[0.2em] text-[#a1a1a1]", children: "© 2026 KSHITIZ GUPTA" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mono text-[11px] tracking-[0.2em] text-[#a1a1a1]", children: [
            "BUILT WITH ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00ffc0]", children: "PRECISION" })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Index as component
};
