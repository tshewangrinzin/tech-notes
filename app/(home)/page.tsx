import {
  ArrowRight,
  Binary,
  Brain,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Github,
  Layers,
  Layout,
  Library,
  Monitor,
  Network,
  Search,
  ShieldCheck,
  Table2,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";

const pathways = [
  {
    name: "Terminal",
    icon: Terminal,
    href: "/docs/terminal",
    description: "Master the command line basics.",
  },
  {
    name: "Git",
    icon: GitBranch,
    href: "/docs/GitHub",
    description: "Version control your projects effectively.",
  },
  {
    name: "GitHub",
    icon: Github,
    href: "/docs/GitHub",
    description: "Collaborate and host your code online.",
  },
  {
    name: "IDEs",
    icon: Code2,
    href: "/docs",
    description: "Set up your development environment.",
  },
];

const chapters = [
  {
    id: 1,
    name: "Number System",
    icon: Binary,
    description: "Signed binary, 2's complement, and ranges.",
  },
  {
    id: 2,
    name: "Data Representation",
    icon: Database,
    description: "Data types, arrays, records, and compression.",
  },
  {
    id: 3,
    name: "Computer System",
    icon: Cpu,
    description: "Memory hierarchy and Boolean minimization.",
  },
  {
    id: 4,
    name: "Memory Management",
    icon: Layers,
    description: "Paging, segmentation, and CPU scheduling.",
  },
  {
    id: 5,
    name: "Algorithm & Data Structure",
    icon: Library,
    description: "Linked lists, stacks, and queues.",
  },
  {
    id: 6,
    name: "Searching & Sorting",
    icon: Search,
    description: "Search/sort algorithms and Big-O.",
  },
  {
    id: 8,
    name: "Network & Web",
    icon: Network,
    description: "Troubleshooting and hosting management.",
  },
  {
    id: 9,
    name: "Emerging Tech",
    icon: Zap,
    description: "Cellular networks and components.",
  },
  {
    id: 12,
    name: "Artificial Intelligence",
    icon: Brain,
    description: "ANNs, Decision Trees, and RL.",
  },
  {
    id: 13,
    name: "Robotics",
    icon: Monitor,
    description: "Integration, modularity, and perception.",
  },
  {
    id: 16,
    name: "Cybersecurity",
    icon: ShieldCheck,
    description: "Encryption, protocols, and risk management.",
  },
  {
    id: 17,
    name: "NumPy",
    icon: Table2,
    description: "N-D arrays and mathematical operations.",
  },
  {
    id: 18,
    name: "Database Management",
    icon: Database,
    description: "Architecture, normalization, and dependencies.",
  },
  {
    id: 19,
    name: "SQL",
    icon: Code2,
    description: "DDL, DML, and DQL construction.",
  },
  {
    id: 20,
    name: "Web Integration",
    icon: Layout,
    description: "MVC architecture and Flask integration.",
  },
  {
    id: 21,
    name: "JavaScript",
    icon: Code2,
    description: "Variables, loops, DOM, and events.",
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-fd-background">
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-fd-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-linear-to-r from-fd-primary to-fd-primary/60 bg-clip-text text-transparent">
            Technology Notes
          </h1>
          <p className="text-xl md:text-2xl text-fd-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            A comprehensive collection of notes for Computer Science, Web
            Development, and Emerging Technologies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/docs"
              className="px-8 py-4 bg-fd-primary text-fd-primary-foreground rounded-full font-semibold hover:opacity-90 transition shadow-lg shadow-fd-primary/20 flex items-center gap-2"
            >
              Start Learning <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Learning Pathways */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-10 text-center">
          Learning Pathways
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pathways.map((path) => (
            <Link
              key={path.name}
              href={path.href}
              className="group p-6 rounded-2xl border border-fd-border bg-fd-card/50 hover:bg-fd-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-fd-primary/10 text-fd-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <path.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{path.name}</h3>
              <p className="text-fd-muted-foreground text-sm">
                {path.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CS Curriculum Grid */}
      <section className="py-20 px-6 bg-fd-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Computer Science Roadmap
            </h2>
            <p className="text-fd-muted-foreground max-w-2xl mx-auto">
              Master the fundamentals and advanced concepts of modern computing
              through our structured curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="p-6 rounded-2xl border border-fd-border bg-fd-background hover:border-fd-primary/50 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-lg bg-fd-muted text-fd-primary font-mono text-xs font-bold">
                    CH {chapter.id}
                  </div>
                  <chapter.icon className="text-fd-primary/70" size={20} />
                </div>
                <h3 className="text-lg font-bold mb-2 leading-tight">
                  {chapter.name}
                </h3>
                <p className="text-fd-muted-foreground text-sm line-clamp-2">
                  {chapter.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="py-24 px-6 text-center">
        <div className="p-12 rounded-3xl bg-linear-to-br from-fd-primary to-fd-primary/80 text-fd-primary-foreground max-w-4xl mx-auto shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
            Ready to Dive In?
          </h2>
          <p className="text-fd-primary-foreground/80 mb-10 text-lg relative z-10">
            Join other students in mastering the technology stack that powers
            the world.
          </p>
          <Link
            href="/docs"
            className="inline-block px-10 py-4 bg-fd-background text-fd-foreground rounded-full font-bold hover:scale-105 transition-transform relative z-10"
          >
            Explore All Notes
          </Link>
        </div>
      </section>
    </main>
  );
}
