import { type SeedCourse, type SeedLesson } from "./types";

export const bandBCourseSeed: SeedCourse = {
  band: "band-b",
  gradeRange: "Class 6-8",
  title: "AI Literacy Exploratory (Class 6-8)",
  description:
    "An exploratory middle-school AI literacy course covering AI domains, computational thinking, block-based model workflows, ethics and bias, AI careers in India, and data organization.",
  prerequisites:
    "Basic digital familiarity, curiosity about problem-solving, and readiness to discuss social impact and fairness.",
  totalDurationMinutes: 600,
  overview: `This Band B course helps students in Classes 6-8 move from basic AI awareness to structured understanding and early project thinking.

By the end of this course, students will be able to:
1) Explain AI domains (data, NLP, computer vision) with practical examples.
2) Apply computational thinking (decomposition, patterns, abstraction, algorithms) to everyday problems.
3) Describe and practice a block-based AI training workflow without relying on proprietary tools.
4) Identify fairness and bias issues in AI and suggest safer data/design choices.
5) Explore realistic AI-related career pathways in India and identify personal entry points.
6) Distinguish structured vs unstructured data and design beginner datasets with labels.

Course design:
- Scenario-led hooks grounded in Indian classroom and community contexts.
- Concept chapters with misconceptions explicitly corrected.
- Worked examples and activity guides written for teacher facilitation.
- Mixed-format quizzes with explanation-rich feedback.

Expected duration:
- 6 lessons (80-100 minutes each),
- plus a capstone/unit project integrating at least three lessons.

Assessment:
- Lesson quizzes and activity rubrics,
- discussion reflection,
- capstone showcase with peer review.`,
  glossary: [
    { term: "AI domain", definition: "A broad area where AI is applied, such as language, vision, or data-driven prediction." },
    { term: "NLP", definition: "Natural Language Processing, where machines process and generate human language." },
    { term: "Computer vision", definition: "AI methods that analyze images and videos to detect patterns and objects." },
    { term: "Decomposition", definition: "Breaking a complex problem into smaller, manageable parts." },
    { term: "Abstraction", definition: "Focusing on important details while ignoring less relevant details." },
    { term: "Algorithm", definition: "A clear sequence of steps to solve a problem." },
    { term: "Label", definition: "A target tag attached to training examples so a model can learn categories." },
    { term: "Bias", definition: "Systematic unfairness that can appear when data or design choices are unbalanced." },
    { term: "Dataset", definition: "A collection of examples used for analysis or model training." },
    { term: "Structured data", definition: "Data organized in rows/columns with a fixed format." },
    { term: "Unstructured data", definition: "Data like text, audio, or images that does not fit simple table format." },
    { term: "Feature", definition: "A measurable property used by a model to make predictions." },
  ],
  teacherGuide: {
    pacingPlan: [
      "Week 1: Lesson 1 (AI domains) + short observation assignment",
      "Week 2: Lesson 2 (computational thinking) with problem-framing practice",
      "Week 3: Lesson 3 (block-based AI workflow) hands-on activity lab",
      "Week 4: Lesson 4 (ethics and bias) scenario discussion circles",
      "Week 5: Lesson 5 (careers in India) + mentor interview style worksheet",
      "Week 6: Lesson 6 (data organization) + capstone kickoff",
      "Week 7: Capstone build and showcase",
    ],
    materialsChecklist: [
      "Chart paper, markers, sticky notes",
      "Sample datasets (printed and digital)",
      "Scenario cards for fairness discussions",
      "Rubric sheets for quiz and capstone review",
      "Project reflection templates",
    ],
    commonStruggles: [
      {
        challenge: "Students confuse AI domain names with specific apps.",
        strategy:
          "Use domain-purpose framing repeatedly: what input, what output, what decision support.",
      },
      {
        challenge: "Students find abstraction difficult.",
        strategy:
          "Start from familiar contexts (school timetable, lunch line planning) before AI examples.",
      },
      {
        challenge: "Ethics discussions become opinion-only without evidence.",
        strategy:
          "Require teams to reference data choices, stakeholders, and possible harms in every argument.",
      },
    ],
    parentNotes:
      "Encourage students to explain one AI concept per week at home and discuss one real decision where fairness or privacy matters.",
  },
  capstoneProject: {
    title: "Community AI Solution Blueprint",
    objective:
      "Teams design a responsible AI-assisted solution for a local school/community challenge, using decomposition, domain selection, data planning, and fairness checks.",
    durationMinutes: 180,
    deliverables: [
      "Problem decomposition chart",
      "Chosen AI domain with justification",
      "Mini dataset design (features, labels, sample rows/items)",
      "Bias and ethics risk checklist with mitigation ideas",
      "3-minute presentation and Q&A",
    ],
    rubric: [
      "Problem clarity and decomposition quality",
      "Appropriate domain and data reasoning",
      "Fairness and ethics awareness",
      "Feasibility and communication quality",
    ],
  },
  lessons: [
    {
      orderIndex: 1,
      slug: "ai-domains-data-nlp-computer-vision",
      title: "AI Domains: Data, NLP, and Computer Vision",
      estimatedDurationMinutes: 95,
      tags: ["ai-domains", "nlp", "computer-vision", "data"],
      hook: `At a district-level school event, three student teams presented technology ideas. Team one wanted to predict library demand using past borrowing records. Team two wanted a classroom tool that could summarize student questions in plain language. Team three wanted to detect whether safety helmets were worn at a workshop lab entrance using camera input. During jury questions, one student said, "All three are AI, so we can use one same model for everything." The jury member smiled and asked, "If all tools are same, why are your inputs so different?"

That question reveals a major idea for Class 6-8 students: AI is not one single skill. AI includes different domains, and each domain has different kinds of inputs, outputs, methods, and risks. In this lesson, we will study three foundational domains — data-focused AI, Natural Language Processing (NLP), and Computer Vision — and learn how AI "senses" the world through numbers, text, and images.`,
      conceptExplanation: `When we say "AI domain," we mean a broad area of tasks where AI methods are applied. Domain thinking helps us choose the right approach for a problem instead of forcing one method everywhere.

Domain 1: Data-focused AI
In this domain, AI learns patterns from structured data such as attendance tables, exam trends, bus timing records, or crop yield logs. Input often looks like rows and columns. Output might be a prediction (for example, expected demand next week) or a pattern insight (for example, peak usage period).

Domain 2: NLP (Natural Language Processing)
NLP handles language. Inputs are words, sentences, chat messages, essays, or speech converted to text. Outputs can be classification (positive/negative tone), summarization, translation support, question answering, or text generation. NLP systems rely heavily on context and language nuances.

Domain 3: Computer Vision
Computer vision processes images and video. Inputs include photos, frames, and pixel patterns. Outputs can include object detection, image classification, visual anomaly alerts, and scene understanding. Vision systems depend strongly on image quality, lighting, and camera angle.

Why domain awareness matters:
If a school wants to forecast canteen queue length, structured trend data may be best.
If a school wants to summarize student feedback forms, NLP is relevant.
If a school wants to detect whether lab coats are worn at entry, computer vision is relevant.
Wrong domain choice can waste effort and reduce accuracy.

How AI "senses" the world:
- Data domain "senses" through numeric and categorical records.
- NLP "senses" through language tokens and sequence patterns.
- Vision "senses" through pixels and spatial features.
None of these are human senses; they are mathematical representations.

Input-output framing:
A strong beginner skill is to write:
1) Input type
2) Target output
3) Why this domain fits
This one habit prevents many beginner design mistakes.

Misconception 1: "NLP means only translation."
Correction: NLP includes many language tasks such as summarization, classification, and retrieval support.

Misconception 2: "Vision models understand images like humans do."
Correction: vision models detect statistical visual features; they do not have human common sense automatically.

Misconception 3: "If problem uses AI, domain does not matter."
Correction: domain choice is foundational; it affects data collection, quality checks, and evaluation.

Domain overlap also exists. A single system can combine domains. Example: a road safety support tool may use vision for traffic footage and NLP for incident report text. Multi-domain systems are common in real applications, but beginners should first identify core domain needs clearly.

Evaluation differences:
- Data domain tasks often use prediction accuracy, error percentage, or trend stability.
- NLP tasks may use relevance, fluency, and factual consistency.
- Vision tasks may use detection precision and recall under diverse lighting.
Students should know that "good performance" is measured differently across domains.

Risk differences:
- Data domain risk: outdated or missing records causing weak predictions.
- NLP risk: misunderstanding context, producing incorrect statements.
- Vision risk: poor performance on dark images or uncommon object styles.
Domain literacy includes understanding these risk patterns.

Real project flow for domain selection:
Step 1: Define problem clearly.
Step 2: List available input data types.
Step 3: Map candidate domains.
Step 4: Choose one domain or combination.
Step 5: Define evaluation metrics and fairness checks.

Example walkthrough:
Problem: "Help school office estimate late arrivals each Monday."
Input available: past attendance logs, weather conditions, bus route delays.
Likely domain: data-focused prediction.
Why not NLP first? Because primary signal is tabular trends, not long text.

Another example:
Problem: "Organize hundreds of student suggestion comments."
Input: text comments.
Likely domain: NLP.
Possible output: grouped themes and summary.

Another example:
Problem: "Count occupied bicycle slots at school gate from camera image."
Input: images.
Likely domain: computer vision classification/detection.

Students should also ask quality questions:
- Is data recent?
- Is language sample diverse?
- Are images captured in varied conditions?
Domain success depends on data quality and coverage.

Domain choice and ethics are connected. If a domain captures sensitive inputs (voice, face, personal text), privacy safeguards become more important. Responsible design includes consent, minimal data use, and transparent purpose.

A practical classroom template:
Problem statement:
Input type:
Output type:
Selected domain:
Why:
Risk check:
This template helps teams communicate clearly and think systematically.

By middle school, learners should move beyond saying "AI did it." They should be able to explain which domain was used, what signals were processed, and where errors can occur. That is real AI literacy.

Domain confusion often appears in early projects when teams jump directly to model choice. A better approach is "domain-first planning":
1) define signal source,
2) define decision target,
3) define acceptable error risk,
4) choose domain accordingly.
This keeps projects realistic and easier to evaluate.

Students should also track domain assumptions. Example assumptions:
- language input will be in one language only,
- image quality will be clear,
- tabular records are complete.
When assumptions fail, domain performance can drop quickly. Writing assumptions helps teams plan fallback steps.

Cross-domain collaboration is a growing career skill. In many real projects, one teammate handles language data, another handles visual signals, and another interprets tabular trends. Middle-school students can simulate this by assigning domain specialists in team activities.

Another useful habit is creating "domain risk cards":
- input risk,
- bias risk,
- privacy risk,
- deployment risk.
Before finalizing design, teams review all cards and decide mitigation actions.

Domain literacy also supports communication with stakeholders. If students can explain, "This is primarily an NLP task with a supporting data domain module," they demonstrate deeper understanding than simply saying "we used AI."

Finally, domain-aware students become better evaluators of technology claims. They can ask, "What domain is this system using? What data supports that claim? Where can it fail?" These questions protect users from overhyped promises.

In summary, AI domains are not labels for memorization. They are decision tools. Domain awareness helps students choose better methods, define better datasets, and design safer solutions.`,
      workedExamples: [
        {
          title: "Choosing the Right Domain for Three School Problems",
          steps: [
            "Problem A: predict canteen demand by day -> identify tabular historical data.",
            "Problem B: summarize parent feedback messages -> identify language-heavy text input.",
            "Problem C: check whether sports bibs are worn in practice photos -> identify image input.",
            "Map A to data-focused AI, B to NLP, C to computer vision.",
            "List one risk for each (missing records, language ambiguity, poor lighting).",
            "Define one metric for each problem.",
          ],
          summary: "Domain selection improves design clarity, evaluation planning, and risk awareness.",
        },
      ],
      activity: {
        title: "Domain Detective Studio",
        materials: ["Problem cards", "Input sample cards", "Chart paper", "Markers", "Sticky dots"],
        estimatedTimeMinutes: 45,
        steps: [
          "Teams pick 6 problem cards from school/community contexts.",
          "For each card, teams identify input type and likely output.",
          "Assign primary AI domain and optional secondary domain.",
          "Write one risk and one mitigation for each case.",
          "Present two strongest and one debatable case to class.",
          "Class votes on most justified domain mapping.",
        ],
        successCriteria: [
          "Teams correctly identify domain for at least 5 of 6 cards with valid reasoning.",
          "Each case includes explicit input-output mapping.",
          "Each case includes at least one risk and mitigation statement.",
        ],
        facilitationNotes: [
          "Encourage evidence-based justification, not guessing.",
          "Use mismatched examples to trigger debate and deeper understanding.",
          "Reinforce that overlap is possible but primary domain must still be justified.",
        ],
      },
      discussionPrompts: [
        "Why is input type the first clue for choosing an AI domain?",
        "How can one project require more than one domain?",
        "Which domain do you think has the hardest fairness challenge and why?",
      ],
      quiz: [
        { type: "mcq", question: "A tool that groups student comments by theme mainly uses:", options: ["Computer vision", "NLP", "Only spreadsheets", "No AI domain"], answer: "NLP", explanation: "Theme extraction from text is an NLP task." },
        { type: "short", question: "Write one sentence defining an AI domain.", answerKeywords: ["area", "task", "ai"], explanation: "A domain is a broad task area where specific AI methods apply." },
        { type: "scenario", question: "Your team wants to detect if lab gloves are worn in images. Which domain is primary and why?", answerKeywords: ["vision", "image"], explanation: "The input is visual, so computer vision is primary." },
        { type: "mcq", question: "Which is true about NLP?", options: ["Only translation", "Processes language tasks", "Only image labeling", "No context needed"], answer: "Processes language tasks", explanation: "NLP handles multiple language tasks beyond translation." },
        { type: "short", question: "Name one risk specific to computer vision.", answerKeywords: ["lighting", "angle", "image"], explanation: "Vision quality depends on varied image conditions." },
        { type: "scenario", question: "Attendance records are missing for two months. How can that affect a data-focused AI model?", answerKeywords: ["prediction", "error", "missing"], explanation: "Incomplete records can reduce trend reliability." },
        { type: "mcq", question: "Best first step in domain selection is:", options: ["Pick favorite model", "Define problem and input type", "Collect random data", "Skip risk checks"], answer: "Define problem and input type", explanation: "Problem and input clarity guides domain choice." },
        { type: "short", question: "Give one example of a project that combines two AI domains.", answerKeywords: ["text", "image", "vision", "nlp"], explanation: "Many real systems combine domains for richer outputs." },
      ],
      extension:
        "Choose one community issue and draft a one-page domain selection note with input, output, primary domain, secondary domain, and risk checks.",
      realWorldConnection:
        "In India, many public and private systems combine language processing, image analysis, and trend data analytics to improve service delivery; successful teams choose domain combinations based on problem needs, not hype.",
    },
    {
      orderIndex: 2,
      slug: "computational-thinking-for-ai",
      title: "Computational Thinking: Decomposition, Patterns, Abstraction, Algorithms",
      estimatedDurationMinutes: 95,
      tags: ["computational-thinking", "decomposition", "algorithms"],
      hook: `A school planned an inter-house science exhibition with 600 visitors expected. Student coordinators had to handle entry flow, poster judging, stage schedule, and food tokens. At first they made one long to-do list and got confused quickly. Then one student said, "Let's break this into smaller systems." They separated the work into gates, hall map, volunteer shifts, and announcements. Suddenly the problem looked manageable.

This is the core of computational thinking: solving complex problems using structured reasoning. In AI projects, computational thinking is not optional. Before any model, students must frame the problem correctly. In this lesson, we will explore decomposition, pattern recognition, abstraction, and algorithms as practical tools for AI-age problem solving.

By the end of the planning meeting, the student team had another realization: every confusion they faced came from unclear structure, not from lack of effort. They had ideas, but no method. Computational thinking gives that method. It helps learners convert stress into sequence, and sequence into action. This is why CT is treated as a core skill in modern AI literacy classrooms.`,
      conceptExplanation: `Computational thinking is a method of approaching problems so they can be solved logically and efficiently. It does not mean only coding. It means designing thinking steps that can later support code, workflow, or automation.

Four core pillars:
1) Decomposition
2) Pattern recognition
3) Abstraction
4) Algorithm design

Decomposition:
Break a large challenge into smaller components. Example: "Improve school library system" can be decomposed into borrowing queue, catalog search, return reminders, and shelf planning. Smaller components are easier to analyze and test.

Pattern recognition:
Look for repetition, similarity, and trend. Example: if peak borrowing happens after lunch daily, that pattern informs staffing and scheduling decisions.

Abstraction:
Focus on important details and ignore noise. In a transport problem, bus delays and weather may matter; student shoe color does not. Abstraction helps teams avoid overload.

Algorithm:
Create a clear sequence of steps to solve a task. Example: "If user forgot ID card, then verify via class list, then issue temporary pass, then record event." Algorithms should be unambiguous and testable.

Why this matters in AI:
AI systems need well-framed problems. If decomposition is poor, data collection becomes messy. If abstraction is weak, models include irrelevant features. If algorithmic thinking is absent, teams cannot build reproducible pipelines.

Misconception 1: "Computational thinking means writing code only."
Correction: computational thinking is broader; code is one implementation path.

Misconception 2: "Decomposition makes problems longer."
Correction: decomposition makes complexity visible and manageable.

Misconception 3: "Algorithms are only for computers."
Correction: humans use algorithms daily (recipes, attendance workflow, emergency protocol).

Example AI planning using four pillars:
Problem: reduce late homework submissions.
Decompose into reminder timing, assignment clarity, transport delays, and support access.
Recognize patterns in submission logs by day/class/topic.
Abstract to most influential factors (deadline timing, workload clustering).
Design intervention algorithm (weekly reminder sequence + support checkpoints).

Computational thinking also improves teamwork. Different students can own subproblems and still align under one shared workflow. This is important in school AI projects where time and resources are limited.

Abstraction quality check:
Ask "If we remove this variable, does prediction quality likely change?"
If no, it may be noise.
If yes, it may be meaningful.
This question helps middle school learners think scientifically about feature selection.

Algorithm quality check:
- Are steps ordered?
- Are conditions clear?
- Are exceptions handled?
- Can another team follow it without asking extra questions?
Good algorithms are reproducible.

Pattern recognition caution:
Not every repeated trend is causal truth. Example: if library crowd increases on rainy days, rain may be linked, but exam schedules might be the stronger driver. Students should avoid quick assumptions and test multiple hypotheses.

Computational thinking and ethics:
How we decompose problems can include or exclude people. If a team ignores accessibility needs during abstraction, the final solution may be unfair. Responsible computational thinking keeps diverse users in view.

Classroom use:
- Decompose chapter revision planning.
- Identify mistake patterns in practice tests.
- Abstract core causes.
- Build an algorithm for weekly improvement.
Students can apply these skills far beyond AI.

AI workflow mapping with CT pillars:
1) Define objective,
2) Decompose tasks,
3) Identify data needs,
4) Abstract relevant features,
5) Draft algorithm for pipeline,
6) Test and refine.

When learners master these steps early, they become better project designers, not just tool users.

Computational thinking supports confidence. Many students fear complex projects because they see one huge challenge. CT gives a method to enter that challenge step by step.

In middle school, this is a career-level skill foundation. Whether students later choose engineering, design, business, medicine, or public policy, structured problem framing remains valuable.

A deeper middle-school skill is "constraint-aware algorithm design." Students should ask:
- what if resources are limited?
- what if timeline is short?
- what if data quality is mixed?
Algorithms improve when constraints are explicit.

Teams can also use "versioned thinking." Version 1 algorithm may be simple. Version 2 can include exceptions. Version 3 can optimize for fairness and efficiency. This staged approach prevents paralysis and supports progress.

Another useful habit is defining stop conditions:
- when does a process end?
- when do we escalate to teacher/human supervisor?
- when do we mark case as unresolved?
Without stop conditions, workflows become inconsistent.

Computational thinking also improves communication with non-technical stakeholders. If students can explain decomposition and algorithm choices clearly, principals, parents, and peers can review decisions constructively. This is important for trust in school projects.

In AI work, debugging often means debugging thinking first. If output is poor, teams should check:
1) problem definition clarity,
2) decomposition completeness,
3) abstraction quality,
4) algorithm steps and branching logic.
This approach saves time compared to random trial-and-error.

Finally, computational thinking builds leadership. Students who can structure group work, assign subproblems, and coordinate iterations become effective project leaders even before advanced coding.

Teams can also use metric-based retrospectives:
- cycle time (how long tasks took),
- error count (how many mismatches appeared),
- rework points (where confusion repeated),
- clarity score (how understandable algorithm was to peers).
Tracking these metrics helps students see CT as measurable progress, not abstract theory.

One additional maturity habit is scenario branching. Students should ask, "If condition A fails, what is Plan B?" Branching logic improves resilience and reflects real-world uncertainty.

Summary:
Computational thinking is the bridge between problem and solution. In AI literacy, it helps learners choose meaningful inputs, organize tasks, and build transparent workflows that others can evaluate and improve.`,
      workedExamples: [
        {
          title: "Reducing Morning Gate Congestion",
          steps: [
            "Define problem: long queue at school gate from 7:45 to 8:05.",
            "Decompose into entry checks, bag scans, ID issues, and late-pass handling.",
            "Identify patterns: highest load on Mondays and after rainy mornings.",
            "Abstract key factors: number of active gates, scan speed, missing ID frequency.",
            "Design algorithm for gate operation and fallback lane allocation.",
            "Test proposal on simulated 15-minute timeline and revise.",
          ],
          summary: "CT pillars convert a messy operational issue into testable workflow decisions.",
        },
      ],
      activity: {
        title: "Problem to Pipeline Lab",
        materials: ["Scenario sheets", "Flowchart templates", "Markers", "Timer", "Sticky notes"],
        estimatedTimeMinutes: 50,
        steps: [
          "Each team selects one scenario (library, lunch line, homework, bus stop).",
          "Complete decomposition grid with at least four subproblems.",
          "List three patterns from provided mini-data.",
          "Circle important variables and cross out noise (abstraction step).",
          "Write an algorithm in ordered steps with conditions.",
          "Swap with another team for reproducibility testing.",
        ],
        successCriteria: [
          "At least four valid subproblems identified.",
          "Algorithm is clear enough for another team to execute without clarification.",
          "Abstraction step includes justification for included/excluded variables.",
        ],
        facilitationNotes: [
          "Prompt students to justify variable relevance with evidence.",
          "Use peer review to emphasize clarity and reproducibility.",
          "Encourage revisions after feedback, not one-shot completion.",
        ],
      },
      discussionPrompts: [
        "Which CT pillar do students usually skip first, and what is the cost of skipping it?",
        "How can abstraction improve fairness instead of hiding important differences?",
        "What makes an algorithm understandable by someone outside your team?",
      ],
      quiz: [
        { type: "mcq", question: "Decomposition means:", options: ["Coding in one file", "Breaking a problem into smaller parts", "Ignoring details", "Collecting random data"], answer: "Breaking a problem into smaller parts", explanation: "Decomposition reduces complexity through structured breakdown." },
        { type: "short", question: "Give one example of pattern recognition in school operations.", answerKeywords: ["trend", "queue", "attendance", "submission"], explanation: "Pattern recognition identifies repeated behavior in data or workflow." },
        { type: "scenario", question: "A team includes student uniform color in a homework delay model. What CT concern appears here?", answerKeywords: ["irrelevant", "abstraction", "noise"], explanation: "Irrelevant variables indicate poor abstraction." },
        { type: "mcq", question: "A good algorithm is:", options: ["Ambiguous", "Stepwise and testable", "Only visual", "Different every time"], answer: "Stepwise and testable", explanation: "Algorithm quality depends on clarity and repeatability." },
        { type: "short", question: "Why is computational thinking useful before model building?", answerKeywords: ["problem", "data", "structure"], explanation: "It clarifies problem framing and data requirements before implementation." },
        { type: "scenario", question: "Two teams solve same problem but produce very different results. Which CT step can align them better?", answerKeywords: ["algorithm", "clear steps", "reproducible"], explanation: "Shared algorithm specification improves consistency." },
        { type: "mcq", question: "Which statement is correct?", options: ["CT is only for coding classes", "CT supports multiple subjects", "CT ignores fairness", "CT removes teamwork"], answer: "CT supports multiple subjects", explanation: "CT methods apply across domains and disciplines." },
        { type: "short", question: "Name the four CT pillars.", answerKeywords: ["decomposition", "pattern", "abstraction", "algorithm"], explanation: "The four pillars form the core computational thinking framework." },
      ],
      extension:
        "Take one home routine (morning preparation, study planning, or event planning) and redesign it using all four CT pillars in a one-page flowchart.",
      realWorldConnection:
        "Across Indian logistics, education, healthcare, and governance projects, teams rely on decomposition and algorithmic workflow design before introducing AI models; structured problem framing improves outcomes.",
    },
    {
      orderIndex: 3,
      slug: "intro-block-based-ai-workflow",
      title: "Intro to Block-Based AI Workflows: Training and Classification",
      estimatedDurationMinutes: 100,
      tags: ["block-based-ai", "training-workflow", "classification"],
      hook: `A middle-school innovation club wanted to build a simple classifier for waste sorting awareness. They had no advanced coding experience, but they used a visual block-style workflow to collect examples, assign labels, train a simple model, and test predictions. Their first attempt failed because they used too few examples and inconsistent labels. After improving the data collection process, the classifier became much better.

This story shows why block-based AI learning matters for Class 6-8 students. You can learn AI logic without writing heavy code first. In this lesson, we will study an original block-based workflow model that teaches core ideas: dataset collection, labeling, training, testing, error analysis, and iteration.

When the club compared first and second attempts, they saw that improvement came from process discipline, not luck. They stopped saying "model is bad" and started saying "our dataset version needs improvement." That change in language is powerful because it builds ownership. Middle-school learners can absolutely practice this level of technical maturity.`,
      conceptExplanation: `Block-based AI workflows use visual blocks (or step modules) to represent AI pipeline stages. Instead of writing full code syntax, learners connect logic blocks and parameter settings. This allows middle-school students to focus on concepts first.

Typical workflow stages:
1) Define task
2) Collect examples
3) Label examples
4) Split train/test
5) Train model
6) Test predictions
7) Analyze errors
8) Improve data or settings

Task definition:
Start with a clear classification goal. Example: classify voice samples as "quiet class" or "noisy class," or classify images as "recyclable" vs "non-recyclable". Vague goals cause poor outcomes.

Data collection:
Gather diverse examples. For image classification, include different lighting, angles, and object sizes. For sound classification, include varied recording distances and background noise. Diversity supports generalization.

Labeling:
Labels are target names attached to examples. Label quality is critical. If similar examples are labeled inconsistently, the model learns confusion.

Train-test split:
Students must reserve a test set not used in training. Otherwise, results look falsely high. This is a key scientific practice.

Training block:
The model learns patterns from labeled training examples. In beginner tools, this may happen via one "train" button, but conceptually it is still an optimization process.

Testing block:
Run unseen examples and record results. Students should not celebrate accuracy without checking failure cases.

Error analysis:
Where did predictions fail?
- specific lighting condition?
- specific accent?
- similar-looking classes?
Error analysis guides improvement.

Iteration:
Add better examples, clean labels, or adjust classes, then retrain and test again. AI workflow is iterative by design.

Misconception 1: "Block-based means not real AI."
Correction: block-based workflows still represent real AI pipeline logic.

Misconception 2: "One-click training means no need to understand data."
Correction: data quality still determines performance.

Misconception 3: "If training accuracy is high, project is done."
Correction: validation on unseen examples and fairness checks are still essential.

What students learn from block-based AI:
- pipeline thinking,
- data discipline,
- evaluation mindset,
- iterative improvement.
These are transferable skills for future coding-based AI too.

Classroom quality checklist for block projects:
1) Is class definition clear?
2) Are labels consistent?
3) Is data balanced across classes?
4) Is test set separate?
5) Are failure cases documented?

Without this checklist, students may accidentally build misleading demos.

Bias warning in block projects:
If one class has many more examples than another, the model may overpredict the larger class. Balanced dataset planning is important even at beginner stage.

Workflow documentation:
Students should maintain a project log:
- objective,
- data count per class,
- train/test split,
- version changes,
- test results,
- improvement actions.
Documentation turns activity into engineering practice.

Evaluation beyond one number:
Accuracy alone can hide class imbalance. Students can track class-wise performance using confusion tables simplified for middle school (correct/incorrect by class).

Practical refinement strategies:
- collect edge cases,
- remove noisy examples,
- standardize capture conditions where possible,
- add underrepresented class examples,
- simplify label scheme if classes overlap too much.

Block-based AI is especially useful for introducing responsible habits:
- think before collecting data,
- ask permission when collecting voice/image samples,
- avoid sensitive personal data unless explicitly needed and approved,
- explain project limits honestly.

The goal is not "perfect model in one period." The goal is learning process discipline.

By Class 6-8, students can understand that model quality is not a mystery. It is a result of clear objectives, strong data, careful testing, and transparent iteration.

When students later transition to code-based AI, these habits become a major advantage. They already understand the lifecycle, so they can focus on syntax and advanced methods without losing conceptual clarity.

A key intermediate concept for Band B is "distribution shift." Even if classroom test accuracy is decent, real-world use may have different conditions. Students should simulate this by testing with samples collected in a different room, time, or background noise profile.

Another critical idea is threshold decisions. Some block workflows allow confidence thresholds. Raising threshold may reduce false positives but increase missed detections. Students can discuss these trade-offs with simple examples and decide what matters for their use case.

Teams should also include failure communication:
- when unsure, the system should say "not confident,"
- user should get guidance to re-capture input,
- high-impact actions should require confirmation.
This improves safety and user trust.

Project retrospectives are useful:
1) what worked,
2) what failed,
3) what changed after iteration,
4) what we would do differently next time.
Retrospectives convert activity into long-term skill growth.

Middle-school learners can also practice reproducibility by sharing exact workflow settings with another team and checking whether results are similar. This introduces scientific rigor in an accessible format.

Finally, block-based workflows help students connect AI learning with confidence. They realize that models are engineered systems shaped by decisions, not mysterious black boxes that only experts can touch.

To deepen rigor, teams can maintain a confusion log:
- which label pairs are often confused,
- what input conditions trigger confusion,
- what data additions reduced that confusion.
This habit trains learners to improve systematically instead of guessing random fixes.

Students can also define acceptance criteria before training begins. Example: "At least 80% correct on each class with no class below 70%." Predefined criteria reduce post-result bias and keep evaluation honest. This reinforces engineering discipline and transparent expectations.

Summary:
Block-based AI workflows are powerful bridges from concept to practice. They make AI learning accessible while preserving scientific rigor.`,
      workedExamples: [
        {
          title: "Classroom Sound Level Classifier",
          steps: [
            "Define classes: QUIET, MODERATE, NOISY.",
            "Collect 45 audio clips with balanced class counts.",
            "Label clips carefully and remove low-quality recordings.",
            "Split 70% for training and 30% for testing.",
            "Train model using block workflow.",
            "Test on unseen clips; note confusion between moderate and noisy.",
            "Add more boundary examples and retrain.",
          ],
          summary: "Balanced data and iterative error-focused refinement improve beginner model reliability.",
        },
      ],
      activity: {
        title: "Visual Blocks AI Studio Simulation",
        materials: ["Sample dataset cards", "Workflow board templates", "Colored tokens", "Result sheets"],
        estimatedTimeMinutes: 55,
        steps: [
          "Teams choose one classification task from scenario cards.",
          "Design class labels and collect mock examples from cards.",
          "Create train/test split physically using colored tokens.",
          "Run a simulated training/testing round with provided result rules.",
          "Document errors and propose one data improvement cycle.",
          "Repeat with improved dataset and compare outcomes.",
        ],
        successCriteria: [
          "Teams maintain balanced class counts or justify imbalance.",
          "Teams document at least two concrete error patterns.",
          "Second round shows improved or better-explained model behavior.",
        ],
        facilitationNotes: [
          "Keep focus on workflow reasoning, not only final score.",
          "Encourage students to discuss data ethics while collecting examples.",
          "Use comparison sheets to highlight effect of iteration.",
        ],
      },
      discussionPrompts: [
        "Why does block-based AI still require strict data quality habits?",
        "What kinds of project logs make model improvement easier?",
        "How can beginner teams avoid overconfidence after first good result?",
      ],
      quiz: [
        { type: "mcq", question: "In block-based AI, the most critical foundation is:", options: ["Fancy UI", "Data quality and labels", "Internet speed", "Color theme"], answer: "Data quality and labels", explanation: "Even visual workflows depend on strong data discipline." },
        { type: "short", question: "Why should test data be separate from training data?", answerKeywords: ["unseen", "fair", "evaluate"], explanation: "Separate test data gives a fair estimate of real performance." },
        { type: "scenario", question: "Your model predicts one class too often because that class has 5x more examples. What should you do?", answerKeywords: ["balance", "more examples", "class"], explanation: "Class imbalance can bias predictions; rebalance dataset." },
        { type: "mcq", question: "Error analysis helps teams:", options: ["Hide failures", "Identify improvement targets", "Skip retraining", "Avoid labels"], answer: "Identify improvement targets", explanation: "Error analysis directs meaningful iteration." },
        { type: "short", question: "Name one item that should be in a project log.", answerKeywords: ["split", "results", "version", "data count"], explanation: "Documentation supports reproducibility and iterative learning." },
        { type: "scenario", question: "A team reports high training score but poor test score. What likely happened?", answerKeywords: ["overfit", "test", "generalization"], explanation: "High train and low test suggests weak generalization/overfitting." },
        { type: "mcq", question: "Block-based workflows are best described as:", options: ["Not real AI", "Concept-first AI pipeline learning", "Only gaming tools", "Only for adults"], answer: "Concept-first AI pipeline learning", explanation: "They teach genuine pipeline concepts through visual steps." },
        { type: "short", question: "Give one ethical precaution when collecting voice/image examples.", answerKeywords: ["permission", "consent", "privacy"], explanation: "Consent and privacy safeguards are essential during data collection." },
      ],
      extension:
        "Design a one-page improvement plan for a classifier after first test failure, including new data strategy, label cleanup, and retest criteria.",
      realWorldConnection:
        "Many early-stage AI teams in Indian schools, labs, and startups prototype workflows visually before scaling to code-heavy systems, because structured iteration and data discipline are more important than tool complexity at the beginning.",
    },
    {
      orderIndex: 4,
      slug: "ai-ethics-and-bias-basics",
      title: "AI Ethics and Bias Basics: Fairness, Data Choices, and Case Scenarios",
      estimatedDurationMinutes: 95,
      tags: ["ai-ethics", "bias", "fairness"],
      hook: `A school introduced an AI-based suggestion tool to help shortlist students for a public-speaking club. The tool used past participation records. After the first run, students noticed that new students and those from sections with fewer previous events were rarely suggested. The teacher asked the class, "Is the system wrong, or is our data incomplete?" That single question changed the discussion from blame to ethics and design.

AI ethics is not only about advanced law. It begins with everyday questions in school projects: Who is included in the data? Who is left out? Who benefits? Who is at risk? In this lesson, we explore fairness, bias, and responsible decision-making using age-appropriate case scenarios.

By the end of that class conversation, students understood a major insight: fairness problems are often design problems. If we improve data and process thoughtfully, outcomes can become more responsible. Ethics is not only criticism after failure; it is good planning before deployment.`,
      conceptExplanation: `AI ethics means applying values like fairness, accountability, transparency, and safety while designing and using AI systems. For Class 6-8 students, ethics should be practical: use clear cases, stakeholders, and design choices.

What is bias?
Bias is a systematic unfair tendency in outcomes. In AI, bias can appear from unbalanced data, flawed labels, narrow feature design, or unfair deployment context.

Bias can happen even without bad intention. That is why process checks matter.

Sources of bias:
1) Data bias: examples do not represent all relevant groups.
2) Label bias: human labels include assumptions or stereotypes.
3) Measurement bias: selected variables are poor proxies.
4) Deployment bias: tool used in context different from training context.

Fairness in middle-school terms:
A fair system should not repeatedly disadvantage a group because of weak data/design choices. Fairness does not always mean identical treatment; it means justified and responsible treatment with harm checks.

Case structure for classroom ethics:
Step 1: Define decision task.
Step 2: Identify stakeholders.
Step 3: Inspect data coverage.
Step 4: Check possible harm.
Step 5: Propose mitigation.
Step 6: Decide whether deployment is acceptable.

Misconception 1: "Bias means system is useless forever."
Correction: many bias issues can be reduced through better data and governance.

Misconception 2: "Ethics is separate from technical design."
Correction: dataset, labels, and evaluation metrics are ethical choices too.

Misconception 3: "If model accuracy is high, fairness is automatic."
Correction: high overall accuracy can still hide poor outcomes for smaller groups.

Example scenario:
A language support tool is trained mostly on one language style. Students with different accents receive poor transcriptions. Overall score appears acceptable, but subgroup experience is unfair. Improvement requires more diverse training samples and subgroup testing.

Ethics checklist for school projects:
- Did we collect diverse examples?
- Did we document data limits?
- Did we evaluate by subgroup or context?
- Did we define safe fallback when uncertain?
- Did we include teacher/human review for high-impact decisions?

Human oversight:
For important outcomes, AI should assist, not replace final judgment. Human review can catch context-specific errors and reduce harm.

Transparency:
Users should understand what a system does and does not do. Overclaiming model capability is unethical because it creates false trust.

Privacy and ethics overlap:
Collecting unnecessary personal data for convenience is ethically weak. Ethical design prefers minimum necessary data and consent.

Trade-offs:
Sometimes improving one metric affects another. Students should learn to discuss trade-offs honestly instead of hiding them. Ethical reasoning is about justified decisions, not perfect numbers.

Error response ethics:
When bias is discovered, teams should:
1) pause deployment if harm risk is high,
2) communicate limits,
3) fix data/process,
4) retest,
5) document improvements.

School-level relevance:
Even classroom projects can influence peer opportunities. Therefore fairness checks are meaningful now, not only in industry.

Role of diverse teams:
When design teams include varied perspectives, they spot blind spots earlier. Collaborative diversity improves ethical quality.

Evidence-based ethics discussion:
Students should support claims with observed outcomes, subgroup patterns, and clear stakeholder analysis. This avoids debates based only on personal opinion.

Fairness does not mean avoiding AI. It means building AI responsibly.

By learning ethics and bias in middle school, students become creators who ask better questions and users who detect risk early.

Students should learn to ask fairness questions during every project checkpoint:
- planning checkpoint: who might be excluded?
- data checkpoint: what gaps exist?
- testing checkpoint: which subgroup fails more?
- deployment checkpoint: what human override exists?
Checkpoint-based ethics is easier to apply than last-minute review.

Another practical tool is a harm matrix:
Rows = stakeholder groups
Columns = potential harms (error, exclusion, privacy risk, misuse risk)
Teams score severity and likelihood, then prioritize mitigation. This converts vague concern into actionable planning.

Ethical communication matters too. If a system has known limits, teams should state them clearly in project demos. Honest limitation statements are signs of maturity, not weakness.

Students should also understand escalation pathways. If they observe potentially harmful bias during pilot testing, they must know whom to inform and what evidence to provide. Responsible response includes documentation, not rumor.

Fairness work is continuous. Even improved systems can drift over time as data patterns change. Periodic audits help maintain quality.

Finally, middle-school ethics training builds future professional habits. Students who learn fairness-by-design now are more likely to create trustworthy systems later.

Ethics teams can also use periodic stakeholder check-ins. Ask student users, teachers, and affected groups whether outcomes feel fair in practice. Lived feedback often reveals blind spots that raw metrics miss.

Another important concept is proportionality: not every problem needs high-risk data collection. If a goal can be met using less sensitive inputs, that option is ethically stronger and easier to justify.

Students should finally practice policy-style recommendations in simple language: what to keep, what to change, and what to monitor. This exercise builds decision responsibility, not just criticism skills.

Ethics learning becomes strongest when students revisit the same case after mitigation and compare outcomes before and after changes. This "before-after fairness review" teaches that responsible AI is an improvement journey.

It also builds accountability language: what changed, why it changed, and which outcomes improved for previously under-served groups.

That communication habit makes ethics review actionable for teachers, peers, and project stakeholders.
It supports safer, more transparent deployment decisions.

Summary:
AI ethics is practical responsibility. Data choices shape outcomes. Fairness checks, transparency, and human oversight are essential parts of AI literacy.`,
      workedExamples: [
        {
          title: "Club Shortlisting Fairness Review",
          steps: [
            "System uses past participation records to suggest club candidates.",
            "Stakeholder mapping identifies new students as potentially underrepresented.",
            "Audit shows dataset has very few records for recently joined students.",
            "Team adds additional criteria and balancing strategy.",
            "Retest compares subgroup suggestion rates and quality indicators.",
            "Teacher review step added before final shortlist.",
          ],
          summary: "Fairness improved by expanding representation and adding oversight.",
        },
      ],
      activity: {
        title: "Bias Case Review Circle",
        materials: ["Case scenario cards", "Stakeholder map sheets", "Fairness checklist", "Markers"],
        estimatedTimeMinutes: 50,
        steps: [
          "Teams select one school/community AI case scenario.",
          "Fill stakeholder map and identify who may be left out.",
          "List potential bias sources in data, labels, and deployment.",
          "Design two mitigation steps and one monitoring metric.",
          "Present findings and defend fairness reasoning in Q&A.",
          "Class votes on strongest mitigation plan based on evidence.",
        ],
        successCriteria: [
          "Each team identifies at least two realistic bias sources.",
          "Mitigation plan includes both data and process improvements.",
          "Teams articulate stakeholder impact clearly.",
        ],
        facilitationNotes: [
          "Guide students to focus on evidence and impact, not blame.",
          "Ensure at least one mitigation includes human oversight.",
          "Encourage respectful disagreement with reasoned arguments.",
        ],
      },
      discussionPrompts: [
        "Can a model be accurate overall but unfair for some groups? Explain with an example.",
        "Why should ethics checks be done before deployment, not only after complaints?",
        "What role should humans keep in high-impact AI decisions?",
      ],
      quiz: [
        { type: "mcq", question: "Bias in AI most often means:", options: ["System crash", "Systematic unfairness in outcomes", "High speed", "No data"], answer: "Systematic unfairness in outcomes", explanation: "Bias is about repeated unfair patterns, not random errors alone." },
        { type: "short", question: "Name one source of bias in AI projects.", answerKeywords: ["data", "label", "deployment", "measurement"], explanation: "Bias can originate from multiple stages of the lifecycle." },
        { type: "scenario", question: "A speech tool works well for one accent but poorly for another. What fairness action is needed?", answerKeywords: ["diverse", "data", "retest"], explanation: "Add diverse samples and retest subgroup outcomes." },
        { type: "mcq", question: "High overall accuracy guarantees fairness for all groups.", options: ["True", "False"], answer: "False", explanation: "Aggregate metrics can hide subgroup inequities." },
        { type: "short", question: "Why is stakeholder mapping important in ethics review?", answerKeywords: ["impact", "who", "affected"], explanation: "It identifies who benefits and who may be harmed." },
        { type: "scenario", question: "You detect unfair outcomes in a school pilot. What should happen first?", answerKeywords: ["pause", "review", "fix"], explanation: "High-risk deployment should be reviewed and improved before expansion." },
        { type: "mcq", question: "Which is an ethical design choice?", options: ["Collect all possible personal data", "Collect minimum necessary data with consent", "Hide model limitations", "Skip monitoring"], answer: "Collect minimum necessary data with consent", explanation: "Data minimization and consent reduce privacy and harm risk." },
        { type: "short", question: "Write one reason human oversight remains important.", answerKeywords: ["context", "error", "safety"], explanation: "Humans can handle context and catch harmful edge cases." },
      ],
      extension:
        "Choose one school process and write a fairness audit note with stakeholders, risks, mitigation, and monitoring indicators.",
      realWorldConnection:
        "As AI systems expand across Indian sectors, fairness audits and responsible data practices are becoming essential to maintain trust and ensure systems serve diverse populations without systematic exclusion.",
    },
    {
      orderIndex: 5,
      slug: "ai-careers-in-india",
      title: "AI Careers in India: Roles, Pathways, and Entry Points",
      estimatedDurationMinutes: 90,
      tags: ["ai-careers", "career-awareness", "skills"],
      hook: `During career week, students asked a mentor panel one common question: "If we like AI, do we all have to become programmers?" The panel laughed and said, "AI careers include many roles — data collection, model design, testing, ethics review, domain consulting, product planning, and user education." One student from Class 7 replied, "So I can enter AI through many doors?"

Exactly. AI careers are not one narrow track. In this lesson, students will learn what people who build and use AI actually do, which skills matter at middle-school stage, and how learners in India can plan realistic pathways from school to future opportunities together.

Students also noted that career confidence increases when roles are seen in action, not only read as job titles. So this lesson emphasizes role simulation, evidence-building, and reflection. The aim is not to decide one fixed career now, but to develop direction, discipline, and adaptability.`,
      conceptExplanation: `AI career literacy helps students connect classroom learning with future possibilities. It reduces confusion and builds purposeful skill planning.

Common AI-linked role families:
1) Data roles: data collection, cleaning, annotation, quality checks.
2) Model roles: algorithm experimentation, training, evaluation.
3) Product roles: define user needs, scope features, coordinate teams.
4) Domain roles: apply AI in healthcare, agriculture, education, logistics, environment, finance, governance.
5) Ethics and governance roles: fairness audits, policy alignment, risk management.
6) Communication roles: technical writing, user training, support documentation.

Students should understand that AI work is team-based. Rarely does one person do everything.

Skill clusters for middle-school learners:
- Foundational math reasoning (ratios, trends, logical reasoning),
- language clarity (asking good questions, documenting),
- computational thinking,
- data awareness,
- collaboration and presentation.
These skills are more important now than trying to memorize advanced jargon.

Misconception 1: "Only top coders can enter AI."
Correction: coding is important for many tracks, but multiple roles need communication, domain understanding, data quality, and ethics.

Misconception 2: "AI careers are only in big cities."
Correction: AI-linked opportunities are growing across diverse geographies through education, services, industry, agriculture, and digital public systems.

Misconception 3: "AI jobs are only about replacing people."
Correction: many roles focus on augmentation, safety, and improving service quality.

Career pathway concept:
Stage 1 (school): build fundamentals, projects, communication.
Stage 2 (higher secondary): deepen math, computing, and domain interests.
Stage 3 (college/training): specialized learning and internships.
Stage 4 (early career): role-specific skill building and portfolio growth.

Portfolio culture:
Students should keep evidence of learning:
- mini projects,
- reflection notes,
- dataset design exercises,
- ethics analysis,
- presentations.
A portfolio tells a better story than marks alone.

Domain + AI combinations:
- agriculture + AI,
- health + AI,
- language services + AI,
- transport + AI,
- climate + AI.
Students can choose domains they care about and apply AI responsibly.

Entry points for middle-school stage:
- school innovation clubs,
- open problem-solving challenges,
- local issue mapping projects,
- peer teaching sessions.
The goal is capability building, not credential collection.

Important non-technical skills:
- teamwork,
- empathy for users,
- ethical judgment,
- clear communication under uncertainty.
AI systems affect real people; human-centered skills matter.

How to choose a direction:
Ask:
1) What problems interest me?
2) Do I enjoy data, language, visual reasoning, or system design?
3) Do I prefer coding-heavy or coordination-heavy work?
4) What evidence can I build this year?

Teacher and parent support:
Adults should encourage exploration, not rigid labeling too early. Students can experiment with multiple role types before specialization.

Career myths to avoid:
- "One course guarantees career."
- "Only one exam decides everything."
- "AI path has no room for creativity."
Real pathways are iterative and multi-skill.

Responsible ambition:
Students should aim not only for "high-paying job" but also for impact, fairness, and long-term learning. AI careers evolve quickly; adaptability is key.

School-level plan:
- quarterly mini project,
- one presentation per term,
- one reflection on ethics and user impact,
- one teamwork role rotation.
This builds career-ready habits steadily.

In the Indian context, multilingual needs, large-scale service delivery, and diverse user settings make AI work especially interdisciplinary. Students who combine technical and social understanding will be valuable contributors.

Career preparation should include communication artifacts:
- concise project summaries,
- role reflections,
- peer feedback logs,
- challenge-to-solution narratives.
These artifacts help students explain growth to teachers, mentors, and future interviewers.

Students should also practice "skill stacking." Example:
data literacy + presentation + domain curiosity = strong entry foundation.
One skill alone is useful; combinations are powerful.

Mentorship awareness matters. Learners can seek guidance from teachers, alumni, and local professionals. Good mentors help students set realistic goals and avoid comparison traps.

Another crucial habit is updating plans periodically. A pathway chosen in Class 6 may evolve by Class 8 after exposure to new projects. Adaptive planning is a strength, not inconsistency.

Career readiness also includes ethics readiness. Students should be able to discuss not only "what I built" but also "who may be affected" and "how I reduced risk." This is increasingly valued in modern AI teams.

Finally, confidence grows through contribution. When students solve one local problem meaningfully, they begin seeing themselves as capable participants in future AI ecosystems.

Students can strengthen readiness by practicing role rotation each term. A learner who has tried data cleaning, presentation, and ethics review gains broader career perspective and stronger team empathy.

Career planning can also include "skill evidence tags" for each project artifact: problem framing, data handling, fairness analysis, communication quality, and collaboration reliability. These tags help students track growth concretely.

Schools can add reflection checkpoints each term where students compare planned skills with demonstrated skills and set realistic next goals. This keeps motivation high and progress measurable.

Students should also learn professional habits such as deadline discipline, respectful feedback, and documentation completeness. These habits influence success in every AI role, technical or non-technical.

As students practice these habits repeatedly, career confidence becomes evidence-based rather than guess-based.

It also helps learners make informed subject choices in higher classes with clearer purpose.
Over time, this clarity reduces anxiety and improves focus.
It also supports better mentorship conversations, clearer project choices, and stronger long-term study planning for evolving opportunities.
This benefits students today.

Summary:
AI careers are diverse, team-based, and skill-driven. Middle-school learners should focus on foundations, portfolio habits, ethics, and exploratory problem-solving.`,
      workedExamples: [
        {
          title: "Career Mapping for a School AI Project",
          steps: [
            "Project goal: improve lost-and-found item tracking.",
            "Identify team roles: data collector, label reviewer, workflow designer, fairness checker, presenter.",
            "Map each role to future career families.",
            "List skills needed per role and current student readiness.",
            "Set one-month growth targets per student.",
            "Review reflection on preferred role after project completion.",
          ],
          summary: "Career awareness grows when students experience role diversity in real projects.",
        },
      ],
      activity: {
        title: "AI Career Role Studio",
        materials: ["Role cards", "Skill matrix templates", "Reflection sheets", "Markers"],
        estimatedTimeMinutes: 45,
        steps: [
          "Students form teams and pick one local problem statement.",
          "Assign at least five AI-related project roles.",
          "Fill skill matrix: current level, desired level, learning actions.",
          "Create a 3-minute role-based project plan presentation.",
          "Swap plans with peer team for feedback.",
          "Each student writes personal entry-point plan for next 6 months.",
        ],
        successCriteria: [
          "Teams identify multiple role types beyond coding-only roles.",
          "Each role includes at least three required skills.",
          "Every student defines one practical personal action step.",
        ],
        facilitationNotes: [
          "Highlight non-technical contributions as equally important.",
          "Encourage realistic and measurable student action plans.",
          "Use feedback to reduce stereotype-driven career assumptions.",
        ],
      },
      discussionPrompts: [
        "Why is AI career planning stronger when linked to real problems, not only job titles?",
        "Which non-technical skill do you think will matter most in AI teams and why?",
        "How can students in middle school build a meaningful portfolio without advanced coding?",
      ],
      quiz: [
        { type: "mcq", question: "Which statement is correct?", options: ["AI careers are only coding jobs", "AI careers include diverse role families", "AI careers need no teamwork", "AI careers avoid ethics"], answer: "AI careers include diverse role families", explanation: "AI ecosystems require many specialized and collaborative roles." },
        { type: "short", question: "Name one non-technical skill important for AI work.", answerKeywords: ["communication", "teamwork", "ethics", "empathy"], explanation: "AI projects involve people, decisions, and collaboration." },
        { type: "scenario", question: "You enjoy problem analysis but not heavy coding. Which AI role family might suit you?", answerKeywords: ["product", "domain", "ethics", "data"], explanation: "Several AI roles center on analysis, planning, and governance." },
        { type: "mcq", question: "A strong middle-school AI career step is:", options: ["Wait until college", "Build project portfolio gradually", "Memorize job names only", "Avoid teamwork"], answer: "Build project portfolio gradually", explanation: "Portfolio habits show growth and practical engagement." },
        { type: "short", question: "Why is role diversity useful in AI teams?", answerKeywords: ["different", "skills", "better"], explanation: "Complex projects need complementary expertise." },
        { type: "scenario", question: "A project has good model output but poor user adoption. Which role may need strengthening?", answerKeywords: ["product", "communication", "user"], explanation: "User-centered planning and communication are essential for adoption." },
        { type: "mcq", question: "Which is a career myth?", options: ["Multiple pathways exist", "One short course guarantees success", "Skills grow over time", "Portfolio matters"], answer: "One short course guarantees success", explanation: "Career growth is iterative and multi-dimensional." },
        { type: "short", question: "Write one personal action you can take this term toward AI career readiness.", answerKeywords: ["project", "practice", "presentation", "reflection"], explanation: "Action-oriented planning builds readiness early." },
      ],
      extension:
        "Interview a teacher or local professional about one technology-supported workflow and map the hidden AI-related roles involved.",
      realWorldConnection:
        "Across India, AI-linked work is emerging in sectors such as education support, agriculture advisory, language services, logistics, and healthcare operations; students who build strong foundations and portfolios can enter through multiple pathways.",
    },
    {
      orderIndex: 6,
      slug: "how-ai-sees-and-organizes-data",
      title: "How AI Sees and Organizes Data: Structured, Unstructured, Labels, and Datasets",
      estimatedDurationMinutes: 95,
      tags: ["data-literacy", "datasets", "labels", "structured-data"],
      hook: `A Class 8 team wanted to build a simple model to predict when the school water station would need refilling. They collected daily numbers in a table. Another team wanted to analyze student feedback comments and photo logs from cleanliness drives. They quickly realized both teams were "using data," but the data looked very different. One had clean rows and columns. The other had text and images.

This is a key AI literacy moment: AI does not see data like humans do. Data must be organized, represented, and labeled in ways models can process. In this lesson, we study structured vs unstructured data, labels, datasets, and beginner dataset design principles for reliable AI projects.

When the teams compared their notebooks, they realized that "data collection" is only the beginning. Real progress comes from organization quality, labeling clarity, and documentation discipline. This lesson helps students develop those habits so they can build dependable models later.`,
      conceptExplanation: `Data literacy is the foundation of AI literacy. Before model selection, teams must understand what kind of data they have and how to prepare it.

Structured data:
Data stored in fixed schema (rows and columns), such as attendance table, marks sheet, inventory records, or weather logs. Each column has a defined meaning (date, count, category, etc.).

Unstructured data:
Data without fixed tabular structure, such as text essays, audio clips, images, videos, and social feedback comments. Unstructured data often requires preprocessing and feature extraction.

Semi-structured data:
Some data has partial structure (for example, key-value records, tagged logs). Middle-school students can treat this as "between table and free-form."

Why this distinction matters:
The representation affects cleaning steps, labeling, model choice, and evaluation metrics.

Labels:
A label is target information attached to examples. In classification tasks, labels define categories (e.g., recyclable/non-recyclable). In prediction tasks, labels may be numeric targets (e.g., demand count).

Dataset quality dimensions:
1) Completeness
2) Consistency
3) Balance
4) Relevance
5) Timeliness
6) Documentation
Students should learn to inspect each dimension before training.

Misconception 1: "More data always means better model."
Correction: more low-quality or irrelevant data can reduce performance.

Misconception 2: "Unstructured data cannot be used in AI until advanced coding."
Correction: unstructured data can be used with guided workflows and clear labeling discipline.

Misconception 3: "Labels are obvious, so we can assign quickly."
Correction: labeling requires clear definitions and consistency checks.

Dataset planning workflow:
Step 1: Define objective.
Step 2: Define input type and target label.
Step 3: Decide sampling strategy.
Step 4: Create labeling guideline.
Step 5: Collect and clean data.
Step 6: Split train/validation/test.
Step 7: Document limits and bias risks.

Feature concept:
A feature is a measurable property used by a model. In structured data, features are often columns. In unstructured data, features may be extracted signals (word frequencies, visual patterns, sound frequencies).

Data cleaning examples:
- remove duplicates,
- handle missing values,
- fix inconsistent category names,
- check impossible values (negative age, invalid date),
- standardize units.

Labeling protocol:
Teams should write a labeling guide with:
- category definitions,
- boundary cases,
- example references,
- disagreement resolution rule.
This improves consistency between reviewers.

Balanced datasets:
If one class dominates heavily, models may underperform on minority classes. Balance can be improved through targeted collection or weighting strategies (at beginner level, targeted collection is easiest).

Data ethics:
Do not collect sensitive personal data without clear purpose and consent.
Use minimum necessary data.
Anonymize where possible.
Document permissions.
Data organization is also an ethical practice.

Evaluation and data:
Poor results may come from weak data, not only weak model. Students should test data assumptions first before changing algorithms.

Structured vs unstructured example:
Problem: understand school cleanliness feedback.
Structured part: date, location, issue type, priority score.
Unstructured part: free-text comments + photos.
A hybrid dataset can combine both for richer insight.

Dataset documentation:
Every project should keep a "data card":
- purpose,
- source,
- sample size,
- known gaps,
- update frequency,
- safety/privacy notes.
Data cards improve transparency.

Collaboration:
Data preparation is team work. Collectors, labelers, reviewers, and analysts must coordinate definitions and timelines.

Middle-school project readiness:
Students can build strong beginner datasets by being careful, consistent, and reflective. This matters more than using advanced models too early.

When learners understand data organization deeply, they avoid many AI project failures. They can explain why model outcomes change and how to improve responsibly.

Students should also learn schema evolution. Early schema may miss useful fields. Teams can revise schema versions, but must document changes clearly so old and new records remain interpretable.

Another important concept is inter-annotator agreement in simple terms: do two reviewers label the same item similarly? If not, definition ambiguity may exist. Checking agreement improves label reliability.

Data lineage is another mature habit. Students should track where each sample came from and when it was collected. Lineage helps debug strange results and supports accountability.

Dataset maintenance matters after initial build:
- remove stale entries,
- update changing categories,
- monitor new edge cases,
- revisit privacy constraints.
Datasets are living assets, not one-time files.

Students can also practice baseline comparisons. Before complex modeling, compare against simple rules. If simple baseline performs similarly, data or objective may need redesign.

In collaborative projects, assign clear data roles:
- collector,
- cleaner,
- label reviewer,
- documentation owner.
Role clarity reduces confusion and improves quality.

Another advanced-yet-accessible skill is dataset validation checklists before modeling:
1) schema validity,
2) label completeness,
3) range checks,
4) duplicate checks,
5) privacy checks.
Validation checklists reduce downstream debugging.

Teams should also define update cadence. If a dataset represents changing behavior, refresh plans are needed. Without updates, models can become stale and less reliable even if they worked earlier.

A final data maturity practice is documenting rejection reasons for removed samples. Knowing why data was excluded helps teams audit consistency and avoid silent bias introduction during cleaning.

When teams combine these practices, they shift from "collect data quickly" to "build trustworthy data systems." That mindset is the real foundation for dependable AI learning and deployment.

It also prepares learners to explain data decisions clearly during project reviews, which is a core expectation in responsible AI work.

Clear explanations improve trust and peer collaboration.
They also improve debugging speed.

Summary:
AI "sees" the world through representations we create. Better data structure, better labels, and better documentation lead to better and fairer AI outcomes.`,
      workedExamples: [
        {
          title: "Designing a School Cleanliness Dataset",
          steps: [
            "Define objective: classify cleanliness complaints by urgency.",
            "Create structured columns: date, location, issue type, severity score.",
            "Collect unstructured input: comment text and optional photo.",
            "Write label guide for urgency levels with examples.",
            "Clean duplicates and inconsistent location names.",
            "Split dataset and review class balance before model testing.",
          ],
          summary: "Combining structured and unstructured data requires clear schema and labeling rules.",
        },
      ],
      activity: {
        title: "Dataset Design Workshop",
        materials: ["Sample raw records", "Schema template sheets", "Label guide template", "Markers"],
        estimatedTimeMinutes: 55,
        steps: [
          "Teams receive mixed raw data (numbers, comments, image descriptions).",
          "Design structured schema with at least six fields.",
          "Identify unstructured elements and propose handling strategy.",
          "Create label definitions and annotate sample items.",
          "Run quality audit (missing values, imbalance, ambiguity).",
          "Present dataset card with ethics/privacy notes.",
        ],
        successCriteria: [
          "Schema clearly separates structured and unstructured components.",
          "Label guide includes boundary cases and examples.",
          "Dataset card includes known limitations and safety notes.",
        ],
        facilitationNotes: [
          "Push teams to justify why each field is included.",
          "Emphasize consistency checks during annotation.",
          "Require explicit consent/privacy discussion for sensitive fields.",
        ],
      },
      discussionPrompts: [
        "Why can weak labels damage model quality even when dataset size is large?",
        "When should a team combine structured and unstructured data?",
        "How does data documentation support fairness and accountability?",
      ],
      quiz: [
        { type: "mcq", question: "Which is structured data?", options: ["Random photo set", "Attendance table with columns", "Voice recordings", "Essay paragraphs"], answer: "Attendance table with columns", explanation: "Structured data has fixed schema with rows/columns." },
        { type: "short", question: "Define label in AI dataset context.", answerKeywords: ["target", "category", "output"], explanation: "Labels specify the target outcome models learn to predict." },
        { type: "scenario", question: "Two annotators label same item differently. What should team do?", answerKeywords: ["guideline", "resolve", "consistency"], explanation: "Use labeling protocol and resolve disagreement systematically." },
        { type: "mcq", question: "A major risk of class imbalance is:", options: ["Faster download", "Biased predictions toward majority class", "Cleaner labels automatically", "No effect"], answer: "Biased predictions toward majority class", explanation: "Imbalance can reduce minority-class performance." },
        { type: "short", question: "Name one item that belongs in a dataset card.", answerKeywords: ["source", "purpose", "size", "gaps", "privacy"], explanation: "Documentation improves transparency and reproducibility." },
        { type: "scenario", question: "Your dataset has many missing values in key column. What should happen before training?", answerKeywords: ["clean", "impute", "fix", "review"], explanation: "Data cleaning is necessary before reliable model training." },
        { type: "mcq", question: "Which statement is true?", options: ["Unstructured data is unusable for AI", "Only model choice matters", "Data representation affects model outcomes", "Labels are optional"], answer: "Data representation affects model outcomes", explanation: "Input representation strongly influences performance." },
        { type: "short", question: "Why is data minimization an ethical principle?", answerKeywords: ["privacy", "necessary", "risk"], explanation: "Collecting only necessary data reduces harm and privacy risk." },
      ],
      extension:
        "Create a mini dataset blueprint for a school issue with schema, label guide, quality checks, and ethics notes.",
      realWorldConnection:
        "In Indian public and private digital systems, effective AI projects often begin with strong data organization practices, including schema design, annotation quality, and documentation, before scaling model complexity.",
    },
  ] as SeedLesson[],
};
