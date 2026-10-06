# A person still merges

A case study of Summer in Bloom. Directed by the creative director. 5 October 2026.

The public site at bloomgrowthagency.com is still the one the world sees. This story is about the next one, and about who is allowed to touch it while everyone is asleep.

## The brief

James picked the work back up with a clear end. The page in this repo would, in time, replace the agency site. Three people would make it. It would need care every week, including overnight. The care had to be good enough to trust, and small enough to review in the morning.

He set two limits before any file changed. Overnight work could open a pull request. It could not merge. The new site could have a preview. It could not take the live domain. He chose to build on his own computer, so the page could be opened and looked at in the same room as the decisions.

That is the whole plot. Everything after is how the studio held the line.

## The company

James merges. He is the only person who can put work on `main`, and the only person who can point the domain.

Marco holds the visual design. The brand hub is the written system. His Figma explorations are the website samples. When those two disagree, the disagreement is named and left for James. A motion sample from Marco is a reference. It waits for a reviewed implementation.

Kayla holds video, graphics, and the motion plan. She says what moves, when it moves, and what it should feel like.

The line they are writing toward is the one the brand already uses. Create great company. Direct, confident, warm, sharp.

## The page, before the team

The page was already a single scroll: Hero, Studio, Thesis, Fund Details, Team, Portfolio, Join us. Press lived on the portfolio rows. A News section had been taken off. Waves played on Team.

That order arrived the way the new rules would later require. Agents opened the pull requests. A person merged them, through pull request 23. The machines had already been useful. What they did not yet have was a contract.

## What a machine was trusted to do

A chat agent wrote the foundation on James's computer. Company names and press links moved out of the layout and into `content/`, so a nightly fix would show up as a change to words, not a change to the page. `AGENTS.md` said who decides, and which edits may happen with no one watching. `design/INTAKE.md` said how an image, a video, or a motion sample comes in. GitHub learned to lint, typecheck, and build. The readme was rewritten so it described the page that actually exists. The checks passed. The homepage answered on this computer.

James asked for the work to be saved, then uploaded. Two commits were saved here: the foundation, and a brand brief drawn from the hub and the Figma file. GitHub had moved on while that was being written. The upload stopped. The chat agent brought GitHub's page and the new notes together, kept the newer page, and uploaded the merge `6e87c31`. A person had asked for the upload. A machine did the reconciliation. Nobody forced the histories together.

Four agents were then drafted for the hours James is away.

The nightly steward runs on weekday mornings at 6:00. It opens one pull request for a safe fix, or a short issue when there is nothing to fix. The CI fixer wakes when a check fails and repairs that branch. The boundary reviewer reads each new pull request and says so when the diff leaves the safe list. The creative director reads each new pull request, and on weekday mornings at 9:00 studies the work and writes what it learned.

James saved them. A chat can open the editor. It cannot press save. That was the first time the loop showed its shape in the tools themselves. The machine prepares. The person commits the machine to the job.

## The morning there were two directors

James asked for every change to pass a creative director, and for a living design file that could be revised without rewriting the brand. The chat agent wrote `design/DESIGN.md` and extended the contract.

Then there were two creative directors. They would have read the same work and spoken twice. James turned one off. A check of the saved agents found a single creative director, still on. It comments. On a weekday morning it may edit the design notes. It leaves the page alone.

That is the judgment this case study is built to repeat. Taste is a role with one owner. A second voice doing the same job is noise.

Public talks from Cursor, from Lee Robinson, from Matt Pocock, and from design-system work at Figma and Monday.com describe the same shape. Narrow jobs. A pull request. A person merges. Taste written down in advance. The practice they insist on, and this studio is still building, is looking at the rendered preview. A comment on the diff can miss the chalk field, the type, and the motion.

## What the director is required to know

James asked the director to know the Motion install already running on Double Dutch Auctions. A chat agent read that repo and wrote `design/MOTION.md`. Double Dutch runs `motion` 13, with Motion+ used for live auction numbers, shared timings, and short travel. Bloom still runs `framer-motion` 11. The auction feeling stays on Double Dutch. The craft is what transferred: tokens before one-off timings, one owner per transition, reduced motion as an opacity change or an instant cut.

He then asked the director to keep feeding itself, at the standard of someone who has done this work for 30 years. The notebook in `design/NOTEBOOK.md` is that practice. After every review the director adds one dated note. Each weekday morning it studies one source, then the next: the preview, the brand hub, the Figma explorations, the Motion reference, the last change on `main`. Private memory between runs is on. If that memory and the notebook disagree, the notebook wins. A one-time observation does not become a rule by sitting in a scratch pad.

James also asked for five specialists under that director. Performance. Backend. Frontend. Breakpoints. Motion. They would report up, and they would comment in their own lane, so five people would not rewrite the hero on the same night. They have not been saved. The site has no server and no database. Until a form or an API exists, the backend lane is the content files, the build, and the preview.

## The loop

A machine may open the work. A person steps in before it is real.

James merges. James changes Vercel, DNS, or the domain. James accepts a new direction: type, color, layout, motion timing. Marco and Kayla's samples stay references until that acceptance. A disagreement between the hub and Figma waits for him. Saving, silencing, or rewriting an agent waits for him. Installing Motion+, or leaving `framer-motion`, waits for him.

A small repair can go through once the director says it is inside the safe list. Copy in `content/`. Alt text. A broken local image path when the file is already in `public/`. A dead press link that is the same article at a new address. A lint or type error that leaves the layout, the motion, and the meaning alone.

## The room

The people meet in person twice a week. The calendar already holds one standing call: Bloom Website, Fridays at 1:00pm Eastern. James, Marco, and Kayla are on it, along with Chris, Janina, and Ruslan.

The project coordinator runs the work. Read.ai records the call. Afterward the coordinator writes what was decided, who owns it, and what is still waiting on a person, and posts a few lines to `#bloom-web-2026`. The creative director is the partner on taste. A visual, motion, or voice change waits for that comment. The director does not run the week, and the coordinator does not decide how the page should look.

## Where the story pauses

The design notes, the Motion reference, the notebook, and this case study are on James's computer. Cloud agents read GitHub. Until he asks for the upload, the director on the weekday schedule cannot see the brief it is supposed to protect.

The saved director instructions still describe a single design file. They need to name the notebook and the Motion reference, and James has to save that change in the editor.

The director is told to look at the preview. The repo does not yet hand that agent a browser and the link.

The five specialists are a reporting line on paper.

Two design decisions are open, and they are his. Which ink hex ships. When the page moves from Mincho and Helvetica on chalk to Manifold, Archivo, JetBrains Mono, and Paper.

The page can be maintained overnight. It becomes the company site when a person says so.
