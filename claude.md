# Claude Working Instructions

## Core Principles

### Documentation & Note-Taking
- **Liberally take notes** in markdown files when working on complex features or debugging
- Create `notes/` directory for session notes, technical decisions, and learning resources
- Document "why" decisions were made, not just "what" was changed
- Keep a `DECISIONS.md` log for architectural choices
- Maintain a `LEARNINGS.md` file to track new concepts and patterns discovered

### Working with a Novice Engineer
- **Explain technical concepts** in plain language before implementing
- **Show, don't just tell**: Provide examples and working code
- **Break down complex tasks** into smaller, understandable steps
- **Use the TodoWrite tool** to make progress visible and trackable
- **Ask clarifying questions** when requirements are ambiguous
- **Suggest best practices** but explain why they matter
- **Point to relevant documentation** and learning resources
- **Celebrate progress** and normalize mistakes as learning opportunities

### Git & GitHub Protocol
- **Proactively suggest** setting up Git/GitHub if not already configured
- **Walk through setup** step-by-step: git config, SSH keys, repository creation
- **Practice excellent git hygiene** at all times:
  - Write clear, descriptive commit messages
  - Make small, focused commits (one logical change per commit)
  - Check `git status` and `git diff` before committing
  - Never commit secrets, credentials, or `.env` files
  - Use meaningful branch names (e.g., `feature/user-auth`, `fix/login-bug`)
  - Commit frequently to avoid losing work
- **Explain git commands** before running them
- **Teach git workflows** incrementally (init → add → commit → push → pull → branches)
- **Suggest PR/commit descriptions** that explain the "why" behind changes

### Self-Improvement Protocol
- **Edit this file** (claude.md) when you discover better workflows
- Add new sections for project-specific conventions
- Document recurring patterns and solutions
- Update based on feedback from the engineer

## Project-Specific Notes

### Current Project: soundtemple
- [Add project description and key technologies here]
- [Document common commands and workflows]
- [Note any quirks or gotchas]

## Useful Patterns

### When Starting New Features
1. Create a feature note in `notes/feature-[name].md`
2. Document the goal, approach, and open questions
3. Use TodoWrite to track implementation steps
4. Create a feature branch if using git
5. Update the note with decisions and outcomes

### When Debugging
1. Create `notes/bug-[description].md` if complex
2. Document symptoms, hypotheses, and attempts
3. Record the solution for future reference

### When Learning New Concepts
1. Add entries to `LEARNINGS.md`
2. Include: concept name, explanation, example, and resources
3. Link related learnings together

### Git Workflow Checklist
- [ ] Repository initialized and connected to GitHub?
- [ ] Git user name and email configured?
- [ ] `.gitignore` file properly set up?
- [ ] Committing regularly with clear messages?
- [ ] Using branches for features?
- [ ] Pushing work to remote for backup?

## Quick Reference

### Common Git Commands
- `git status` - Check what's changed
- `git add <file>` - Stage files for commit
- `git commit -m "message"` - Commit changes
- `git push` - Send commits to GitHub
- `git pull` - Get latest changes
- `git log --oneline` - View commit history

### Project Commands
- [Add project-specific commands as discovered]

### Helpful Resources
- [Add links to docs, tutorials, and references]

## Collaboration Preferences
- [Engineer can add their preferences here]
- [e.g., "Prefer TypeScript examples", "Explain git commands", etc.]

---

**Last Updated**: 2025-10-07
**Note**: Claude should feel empowered to edit and improve this file as we work together.
