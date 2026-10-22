-- 1. Default Site Settings
insert into public.site_settings (id, site_title, site_tagline, intro_heading, intro_subtext, about_markdown, contact_email, social_links)
values (
  'global',
  'JeptahzRepo',
  'Computer Science & Engineering Knowledge Archive',
  'An Open Vault for Computing, Software Architecture & Ideas',
  'Curated documents, production software showcases, course syllabi, and technical devlogs by a Computer Science student and software builder.',
  '### The Vision Behind JeptahzRepo

Welcome to **JeptahzRepo** — a deliberate, monochromatic knowledge repository built to document the journey through computer science, software engineering, and systems architecture.

Here you will find:
- **Deep Technical Documentation:** Rigorous breakdowns of algorithms, distributed systems theory, and operating system internals.
- **Production Software Showcase:** Real applications with downloadable builds, architecture notes, and GitHub source code.
- **Curriculum Syllabi:** Curated course roadmaps, lecture summaries, and textbook references.
- **Raw Engineering Ideas:** Unfiltered devlogs and conceptual drafts.',
  'jeptah@example.com',
  '{"github":"https://github.com/jeptah","twitter":"https://twitter.com/jeptah","linkedin":"https://linkedin.com/in/jeptah","gdrive":"https://drive.google.com/drive"}'::jsonb
) on conflict (id) do update set
  site_title = excluded.site_title,
  site_tagline = excluded.site_tagline,
  intro_heading = excluded.intro_heading,
  intro_subtext = excluded.intro_subtext,
  about_markdown = excluded.about_markdown,
  contact_email = excluded.contact_email,
  social_links = excluded.social_links;

-- 2. Taxonomy Topics
insert into public.topics (slug, name, description, icon, sort_order, is_visible)
values ('apps', 'Application Showcase', 'Featured software builds, desktop utilities, and web applications', 'Box', 1, true)
on conflict (slug) do nothing;
insert into public.topics (slug, name, description, icon, sort_order, is_visible)
values ('docs', 'Documentation & Theory', 'In-depth computer science theory, algorithm patterns, and cheatsheets', 'BookOpen', 2, true)
on conflict (slug) do nothing;
insert into public.topics (slug, name, description, icon, sort_order, is_visible)
values ('courses', 'Courses & Curriculum', 'University syllabi, self-study roadmaps, and lecture archives', 'GraduationCap', 3, true)
on conflict (slug) do nothing;
insert into public.topics (slug, name, description, icon, sort_order, is_visible)
values ('projects', 'Code Repositories', 'Source code repositories, assignments, and architectural prototypes', 'Code2', 4, true)
on conflict (slug) do nothing;
insert into public.topics (slug, name, description, icon, sort_order, is_visible)
values ('resources', 'Curated Links & Tools', 'Hand-picked developer tools, research papers, and technical references', 'Link2', 5, true)
on conflict (slug) do nothing;
insert into public.topics (slug, name, description, icon, sort_order, is_visible)
values ('ideas', 'Raw Ideas & Devlogs', 'Brainstorming logs, thesis concepts, and software blueprints', 'Lightbulb', 6, true)
on conflict (slug) do nothing;

-- 3. Software Applications Showcase
insert into public.apps (title, slug, tagline, description, version, badge, category, carousel_images, repo_url, gdrive_url, demo_url, install_instructions, tech_stack, is_featured, sort_order)
values (
  'OmniForge Developer Studio',
  'omniforge-studio',
  'A high-performance modular workspace, terminal multiplexer, and API workbench.',
  '### OmniForge Studio

OmniForge is an experimental developer workspace engineered with Rust and React/Tauri. It combines an ultra-low latency terminal emulator with an embedded SQLite query profiler and dynamic HTTP/gRPC inspection surface.

#### Key Features:
- **GPU-Accelerated Rendering:** Powered by wgpu with zero frame drops during heavy terminal logs.
- **Unified Session State:** Persists running background processes and split-pane configurations.
- **Offline First:** Stores all session histories locally with encrypted SQLite vaults.

#### System Requirements:
- Windows 10/11 (x64) or macOS 12+ (Apple Silicon / Intel)
- 500MB available disk storage
- 4GB RAM minimum',
  'v1.2.4',
  'Active',
  'Desktop App',
  '[{"url":"https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80","caption":"OmniForge Main Workspace & Multi-Pane Terminal Interface"},{"url":"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80","caption":"Real-time Memory Profiler & Low-Level Process Inspector"},{"url":"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80","caption":"Dark Monochromatic Settings Palette and Keybindings Manager"}]'::jsonb,
  'https://github.com/jeptah/omniforge-studio',
  'https://drive.google.com/file/d/example-omniforge-installer/view',
  'https://omniforge.dev',
  '### Installation Guide
1. Download the `.msi` or `.dmg` installer using the **Install via GDrive** button above.
2. Verify the SHA-256 checksum: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
3. Run the installer and accept permissions for desktop shortcut creation.
4. Launch OmniForge and run `omniforge --init` in your terminal.',
  ARRAY['Rust', 'Tauri', 'React', 'TypeScript', 'Tailwind CSS', 'SQLite']::text[],
  true,
  1
) on conflict (slug) do nothing;
insert into public.apps (title, slug, tagline, description, version, badge, category, carousel_images, repo_url, gdrive_url, demo_url, install_instructions, tech_stack, is_featured, sort_order)
values (
  'NeuralGraph Algorithmic Visualizer',
  'neuralgraph-visualizer',
  'Interactive 3D graph-theoretic algorithm engine and neural topology inspector.',
  '### NeuralGraph

NeuralGraph is an educational and analytical tool designed to render large-scale graph structures (Dijkstra, A*, Tarjan''s SCC, Bellman-Ford) in real time with interactive node manipulation and step-by-step state playback.',
  'v0.9.8',
  'Beta',
  'Web Utility',
  '[{"url":"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80","caption":"3D Force-Directed Graph Layout Simulation"},{"url":"https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80","caption":"Step-by-Step Shortest Path Traversal Log"}]'::jsonb,
  'https://github.com/jeptah/neuralgraph',
  'https://drive.google.com/file/d/example-neuralgraph/view',
  'https://neuralgraph.dev',
  '### Web & Desktop Installation
- Web version is hosted directly on Vercel.
- Desktop package can be installed via Google Drive binary package.',
  ARRAY['Three.js', 'Next.js', 'WebAssembly', 'TypeScript']::text[],
  true,
  2
) on conflict (slug) do nothing;
insert into public.apps (title, slug, tagline, description, version, badge, category, carousel_images, repo_url, gdrive_url, demo_url, install_instructions, tech_stack, is_featured, sort_order)
values (
  'Archivist Backup & Verification CLI',
  'archivist-cli',
  'Zero-dependency streaming directory backup utility with cryptographic checksum verification.',
  '### Archivist CLI

Built for computer science students and engineers managing large project directories. Archivist streams snapshots into deduplicated tarballs with automated Google Drive and S3 cloud mirroring.',
  'v2.0.1',
  'Active',
  'CLI Tool',
  '[{"url":"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80","caption":"Archivist Terminal Output with Progress Bar and Integrity Hash"}]'::jsonb,
  'https://github.com/jeptah/archivist-cli',
  'https://drive.google.com/file/d/example-archivist/view',
  NULL,
  '### Cargo Installation
```bash
cargo install archivist-cli
```
Or download pre-compiled binary via Google Drive button.',
  ARRAY['Rust', 'Tokio', 'SHA-256', 'Google Drive API']::text[],
  false,
  3
) on conflict (slug) do nothing;

-- 4. Archival Knowledge Entries
insert into public.entries (title, slug, type, topic_slug, summary, content, file_url, file_name, file_size, external_url, cover_image_url, gallery_images, metadata, tags, is_pinned, is_published)
values (
  'Distributed Consensus: Comparative Analysis of Raft and Paxos',
  'distributed-consensus-raft-vs-paxos',
  'doc',
  'docs',
  'An architectural breakdown of state machine replication, leader election, log compaction, and network partition recovery.',
  '## Introduction to State Machine Replication

In modern distributed computing, maintaining consistent state across asynchronous, failure-prone nodes requires robust consensus protocols. While **Paxos** laid theoretical foundations, **Raft** was engineered explicitly for understandability and operational debuggability.

### The Raft Invariant Triangle

1. **Election Safety:** At most one leader can be elected in a given term.
2. **Leader Append-Only:** A leader never overwrites or truncates its own entries; it only appends new log records.
3. **Log Matching:** If two logs contain an entry with the same index and term, then the logs are identical in all entries through the given index.

```python
class RaftNode:
    def __init__(self, node_id, peers):
        self.node_id = node_id
        self.peers = peers
        self.current_term = 0
        self.voted_for = None
        self.log = []
        self.state = ''FOLLOWER''

    def start_election(self):
        self.state = ''CANDIDATE''
        self.current_term += 1
        self.voted_for = self.node_id
        # Broadcast RequestVote RPCs
```

### Practical Tradeoffs in Network Partitions

When split-brain scenarios occur, Raft guarantees safety by requiring a strict quorum ($\lfloor n/2 \rfloor + 1$). The minority partition continues accepting speculative writes but cannot commit them until the partition heals, ensuring zero dirty reads.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"read_time":"8 min read","difficulty":"Advanced","tags":["Distributed Systems","Algorithms","Fault Tolerance"]}'::jsonb,
  ARRAY['Distributed Systems', 'Algorithms', 'Fault Tolerance']::text[],
  true,
  true
) on conflict (slug) do nothing;
insert into public.entries (title, slug, type, topic_slug, summary, content, file_url, file_name, file_size, external_url, cover_image_url, gallery_images, metadata, tags, is_pinned, is_published)
values (
  'CS 350: Advanced Operating Systems & Kernel Architecture',
  'cs350-operating-systems-curriculum',
  'course',
  'courses',
  'Complete course curriculum notes, assembly lab assignments, virtual memory paging mechanics, and Linux kernel module development.',
  '## Course Overview

- **Subject:** Computer Science 350 - Advanced Systems Architecture
- **Prerequisites:** C Programming, Computer Organization, Assembly (x86-64 / RISC-V)
- **Primary Textbook:** *Operating Systems: Three Easy Pieces* (Remzi & Andrea Arpaci-Dusseau)

### Module Breakdown

#### 1. Virtual Memory & Multi-Level Page Tables
- Translation Lookaside Buffers (TLB) and hit/miss penalty latency.
- Demand paging, page fault handler traps, and Clock (Second Chance) replacement algorithms.

#### 2. Concurrency & Synchronization Primitives
- Hardware atomics (`compare-and-swap`, `test-and-set`).
- Spinlocks vs. Futex sleeping mutexes in modern Linux kernels.
- Condition variables, semaphores, and solving the Dining Philosophers / Producer-Consumer dilemmas.

#### 3. File System Internals
- Inode structures, indirect blocks, and directory index b-trees (ext4 vs XFS).
- Journaling file systems: metadata journaling vs full write-ahead logging.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"semester":"Fall 2026","credits":4,"code":"CS-350"}'::jsonb,
  ARRAY['Operating Systems', 'Linux', 'Kernel', 'C']::text[],
  true,
  true
) on conflict (slug) do nothing;
insert into public.entries (title, slug, type, topic_slug, summary, content, file_url, file_name, file_size, external_url, cover_image_url, gallery_images, metadata, tags, is_pinned, is_published)
values (
  'Dynamic Programming: The Finite State Machine Paradigm',
  'dynamic-programming-finite-state-machine',
  'doc',
  'docs',
  'A systematic approach to solving complex interval, knapsack, and multi-state LeetCode Hard problems with state transition tables.',
  '## Demystifying State Transitions in DP

Many students struggle with dynamic programming because they try to visualize all recursive paths simultaneously. Instead, treating the problem as a **Finite State Automaton (FSM)** simplifies recurrence relation discovery.

### The 4-Step Formulation
1. **Define Subproblems:** What minimal information uniquely identifies the current snapshot?
2. **State Transition:** How does state $S_{i}$ relate to $S_{i-1}$?
3. **Base Cases:** What are the boundary conditions where the answer is trivial?
4. **Order of Computation:** In what direction does topological dependency flow?',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"read_time":"6 min read","difficulty":"Intermediate"}'::jsonb,
  ARRAY['Data Structures', 'Algorithms', 'LeetCode']::text[],
  false,
  true
) on conflict (slug) do nothing;
insert into public.entries (title, slug, type, topic_slug, summary, content, file_url, file_name, file_size, external_url, cover_image_url, gallery_images, metadata, tags, is_pinned, is_published)
values (
  'Decentralized P2P Academic Syllabus & Exam Archive',
  'p2p-academic-syllabus-vault-idea',
  'idea',
  'ideas',
  'Conceptual architectural design for an immutable, peer-to-peer student repository using IPFS and verifiable content hashes.',
  '### The Thesis

University course materials, assignment starters, and past exams are frequently lost or trapped behind predatory commercial paywalls. We can engineer a distributed protocol where universities and student clubs maintain synchronized archival nodes.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"status":"Brainstorming","maturity":"Conceptual Draft"}'::jsonb,
  ARRAY['P2P', 'Decentralized', 'IPFS', 'Open Science']::text[],
  false,
  true
) on conflict (slug) do nothing;
insert into public.entries (title, slug, type, topic_slug, summary, content, file_url, file_name, file_size, external_url, cover_image_url, gallery_images, metadata, tags, is_pinned, is_published)
values (
  'Essential Systems & Architecture References',
  'systems-architecture-bookmarks',
  'link',
  'resources',
  'Curated bookmarks to high-value computing documentation, distributed systems papers, and open courses.',
  'A live-updated compilation of foundational computer science papers, including Turing''s original papers, Google''s MapReduce/BigTable/Spanner whitepapers, and the Raft consensus specification.',
  NULL,
  NULL,
  NULL,
  'https://github.com/jeptahz/curated-systems',
  NULL,
  NULL,
  '{"category":"External Curated Resource"}'::jsonb,
  ARRAY['Bookmarks', 'Papers', 'Architecture']::text[],
  false,
  true
) on conflict (slug) do nothing;
