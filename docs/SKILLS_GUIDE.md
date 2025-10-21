# Blok Development Skills Guide

## What are Skills?

Skills are specialized folders with instructions that Claude Code loads on-demand to help with specific tasks. They make Claude an expert in your domain-specific patterns.

## Installed Skills

### 1. 🤖 blok-ai-analyzer
**When to use**: Testing AI message analysis, creating new intents, debugging routing

**Example prompts**:
```
Analyze this message: "El aire acondicionado gotea agua en mi sala"

Test how the AI would handle: "Hay un escape de gas en el pasillo"

Create 5 test cases for noise complaints in Spanish

What intent should "¿Cuándo vence la cuota?" trigger?
```

**What it does**:
- Analyzes messages using Blok's intent categories
- Provides detailed reasoning for classifications
- Suggests routing (owner/renter/admin)
- Generates bilingual responses
- Extracts structured data (category, urgency)

### 2. 🗄️ supabase-migration-builder
**When to use**: Adding tables, modifying schema, creating indexes, RLS policies

**Example prompts**:
```
Create a migration to add a 'notes' field to maintenance_requests

Add a table for tracking building amenities with reservation system

Create an index on messages.created_at for better performance

Add RLS policy so residents can only see their own conversations
```

**What it does**:
- Generates migration SQL following Blok's patterns
- Includes indexes, RLS policies, constraints
- Uses proper naming conventions (snake_case, timestamptz)
- Adds comments for documentation
- Provides migration filename with timestamp

### 3. 🌎 bilingual-content
**When to use**: Adding UI text, AI responses, emails, landing page content

**Example prompts**:
```
Translate this feature name: "Visitor Access Request"

Add bilingual labels for a new "Building Rules" section

Create AI response template for when amenity reservation fails

Review this Spanish text for Puerto Rican accuracy: [text]
```

**What it does**:
- Provides Spanish/English translations
- Uses Puerto Rican Spanish (not Mexican/Spain variants)
- Maintains formal "usted" tone in Spanish
- Ensures cultural appropriateness
- Updates translations.ts structure

## How to Use Skills

Skills are **automatically loaded** by Claude Code when your task matches the skill's domain. You don't need to explicitly "activate" them.

**Just ask naturally:**

Instead of:
```
Create a SQL migration for adding a 'priority_score' integer to the residents table
```

You can now simply say:
```
Add priority_score to residents
```

Claude will:
1. Detect it's a database task
2. Load the **supabase-migration-builder** skill
3. Generate migration following your patterns
4. Provide the properly formatted SQL

## Example Workflows

### Workflow 1: Testing AI Message Analysis

```
You: Test these messages from residents:
1. "El generador no prendió durante el apagón"
2. "Necesito los documentos del edificio"
3. "El vecino tiene la música muy alta"

Claude: [Loads blok-ai-analyzer skill]
[Provides detailed analysis for each message with intent, priority, routing]
```

### Workflow 2: Adding a Feature

```
You: Add a table for tracking building announcements with title, content, priority

Claude: [Loads supabase-migration-builder skill]
[Generates complete migration with table, indexes, RLS, triggers]
[Provides filename: 20250120163000_add_building_announcements.sql]

You: Now add bilingual UI for creating announcements

Claude: [Loads bilingual-content skill]
[Provides Spanish/English translations for UI labels]
[Updates translations.ts structure]
```

### Workflow 3: Multi-Skill Task

```
You: Add a "Complaint" feature where residents can report issues and get auto-responses

Claude:
[Loads blok-ai-analyzer] - Creates "complaint" intent and routing logic
[Loads supabase-migration-builder] - Generates complaints table migration
[Loads bilingual-content] - Creates response templates in both languages
[Provides complete implementation plan]
```

## Advanced: Skill Stacking

Skills can work together for complex tasks:

```
You: Build a voting system for owners

Claude automatically uses:
- supabase-migration-builder → polls, poll_options, poll_votes tables
- bilingual-content → UI translations for voting interface
- blok-ai-analyzer → Intent for "I want to vote on X"
```

## Testing Your Skills

Try these commands to verify skills are working:

```bash
# 1. Test blok-ai-analyzer
Ask Claude: "Analyze this message: El elevador está atascado"

# 2. Test supabase-migration-builder
Ask Claude: "Add a 'photos' column to maintenance_requests"

# 3. Test bilingual-content
Ask Claude: "Translate 'Quick Reply' for the dashboard"
```

## Benefits for Your Development

### Before Skills
```
You: Add a migration for polls
Claude: [Generic SQL that doesn't match your patterns]
You: Use UUID, add RLS, enable cascading deletes, use snake_case
Claude: [Fixes migration]
You: Add updated_at trigger
Claude: [Adds trigger]
You: Add comments
Claude: [Adds comments]
[10+ back-and-forth messages]
```

### After Skills
```
You: Add polls table
Claude: [Loads supabase-migration-builder]
[Generates complete migration with UUID, RLS, triggers, comments, indexes - all in one go]
[Follows your exact patterns automatically]
[1 message, done right]
```

## Skill Portability

These skills work across:
- ✅ Claude Code (what you're using now)
- ✅ Claude.ai web app
- ✅ Claude API (for automation)

You can share skills with your team:
```bash
# Share via git
cd ~/.claude/skills
git init
git add .
git commit -m "Blok development skills"
git remote add origin your-repo
git push

# Team members install
cd ~/.claude/skills
git clone your-repo .
```

## Creating More Skills

Use the **skill-creator** skill to generate new ones:

```
You: Create a skill for testing Twilio WhatsApp webhooks

Claude: [Loads skill-creator]
[Generates SKILL.md with instructions for WhatsApp testing]
[Includes webhook payload examples, testing patterns]
```

## Next Steps

1. **Test the skills** - Try the example prompts above
2. **Integrate into workflow** - Use them when building features
3. **Create more skills** - Add skills for Stripe, broadcasting, etc.
4. **Share with team** - Version control in git for collaboration

## Skill Files Location

Your skills are stored at:
```
~/.claude/skills/
├── blok-ai-analyzer/
│   └── SKILL.md
├── supabase-migration-builder/
│   └── SKILL.md
└── bilingual-content/
    └── SKILL.md
```

You can edit these files directly to refine the instructions as your project evolves.

## Pro Tips

1. **Skills learn from your codebase** - They reference your actual files (CLAUDE.md, migrations/, etc.)
2. **Skills are composable** - Multiple skills can activate for complex tasks
3. **Skills are contextual** - Only load when relevant (efficient token usage)
4. **Skills are updatable** - Edit SKILL.md files as patterns evolve
5. **Skills are shareable** - Same format across Claude Code, API, and web app

---

**You're now equipped with domain-specific AI assistance for Blok development!** 🚀

Try it out: "Test this message from a renter: La nevera de mi apartamento no enfría"
