# AI Log

This document records relevant use of AI tools during the project.

The goal is not to record every prompt, but to document AI usage that influenced requirements, architecture, code, tests, documentation, mockups, or technical decisions.

## When to Register AI Usage

Register AI usage when it helps to:

- define or refine requirements;
- create or review user stories;
- define acceptance criteria;
- explore architecture or technical options;
- generate or improve code;
- generate or improve tests;
- debug an issue;
- create or improve documentation;
- create or refine mockups;
- support a technical spike.

## AI Usage Log

| Date | Team Member(s) | Tool | Purpose | Prompt / Input Summary | Output Used | Human Review / Changes Made | Related Files / MR |
|---|---|---|---|---|---|---|---|
| 2026-09-14 | Diogo Pinto, João Graça, Rafael Marques, Vera Ribeiro | Antigravity | Brainstorm and explore features within the project idea | Provided the initial project background (timetable optimization and professor reviews) and asked the AI to brainstorm and structure a comprehensive list of features aligned with course requirements (LLM core integration and multi-user collaboration). | Used a subset of the suggested ideas to discuss within the team and reach a consensus on which features actually made sense to implement. | The team filtered out overly complex features (such as direct Inforestudante integration) and selected only the features that aligned with our vision and timeline. | `docs/vision-and-scope.md` |
| 2026-09-14 | Diogo Pinto, João Graça, Rafael Marques, Vera Ribeiro | Gemini | Refine the Vision and Scope document | Asked the AI to review the initial draft of the Vision and Scope and suggest refinements based on the official template. | Used the AI's feedback to refine the document's structure and confirm that the vision and scope document met all the requirements. | The team reviewed the AI's suggestions, verified the alignment with the project goals, and applied the final refinements. | `docs/vision-and-scope.md` |
| 2026-09-19 | Diogo Pinto, João Graça, Rafael Marques, Vera Ribeiro | Gemini | Validate team's defined use cases and review UML relationships (includes/extends) | Provided the team's draft of primary actors and use cases to verify their correctness, check if any important cases were missing and review UML relationships like «include» and «extend» | Used the AI's feedback to validate our original list and confirm the «include» relationship for group management. | The team reviewed the actors (clarifying the LLM as a secondary supporting system), improved the goal of UC-04 to focus on natural-language prompts, and corrected UC-09 from a passive overlay into an active shared-chat session where members co-create a timetable together. | `docs/requirements/use-cases.md` |
| 2026-09-20 | Diogo Pinto, Vera Ribeiro | Antigravity | Design, iterate, and refine visual interface mockups according to the team's product vision for inclusion in the project specification | Provided the functional requirements and continuously prompted the AI through iterative rounds of feedback, instructing it to make successive adjustments to layouts, component placements, and visual details so the resulting screens would match exactly how we envisioned the application's user experience. | Used the refined visual screens to capture high-resolution screenshots of the key application views to embed directly into our project documentation. | The team maintained full creative direction over the design process: we critically evaluated each version, identified inconsistencies, and requested targeted adjustments whenever the output diverged from our envisioned interface, enforcing consistent proportions across screens, fixing hourly calendar alignments, eliminating unnecessary visual clutter, and compacting member cards until the final UI perfectly matched our concept. | `docs/mockups/*` |
- **Date:** 2026-09-23
- **Tool Used:** Gemini (AI Collaborator)
- **Scope:** Technical support for implementing and debugging the React component (`SpikeGroq.jsx`) interacting with the Groq Cloud API, plus drafting the English documentation report.

## Example
| Date | Team Member(s) | Tool | Purpose | Prompt / Input Summary | Output Used | Human Review / Changes Made | Related Files / MR |
|---|---|---|---|---|---|---|---|
| 2026-10-05 | Student 1, Student 2 | ChatGPT | Refine user stories | Asked for help improving initial user stories for the login feature. | Used part of the suggested wording for two user stories. | The team reviewed the suggestions, removed one unrealistic story, and adapted the acceptance criteria. | `docs/requirements/user-stories.md` |

## Notes

- AI-generated content must not be accepted blindly.
- The team is responsible for understanding and validating all AI-assisted work.
- Do not include private data, passwords, API keys, or sensitive information in AI prompts.
- If AI output influences an architectural decision, create or update an ADR in `docs/architecture/adr/`.
