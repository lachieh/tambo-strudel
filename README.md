# StrudelLM

An AI-powered live coding music environment that combines [Strudel](https://strudel.cc/) with [Tambo AI](https://tambo.co) to generate music patterns through natural language.

**Try it**: Ask the AI to "create a funky drum beat", "make an 80s synthwave track", or "build a lo-fi hip hop beat" and watch it generate real-time audio patterns.

## What is Strudel?

[Strudel](https://strudel.cc/) is a live coding environment for creating music patterns in the browser. It's a JavaScript port of [TidalCycles](https://tidalcycles.org/), a popular live coding language used by musicians worldwide. Strudel lets you write concise code that generates complex rhythmic and melodic patterns.

## Features

- **Natural Language to Music** - Describe what you want and the AI writes Strudel code
- **Genre-Aware** - Understands musical styles from synthwave to drum & bass
- **Real-Time Playback** - Hear your patterns instantly as they're generated
- **Iterative Refinement** - Ask for changes like "make it more chill" or "add more reverb"
- **Dynamic Sample Discovery** - AI can explore available sounds and samples

## How It Works

This app integrates Strudel with Tambo AI to create an AI assistant that can write and execute Strudel code:

```
┌─────────────────────────────────────────────────────────────────┐
│                        StrudelLM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    │
│   │   User      │───▶│  Tambo AI   │───▶│  Strudel REPL   │    │
│   │   Chat      │    │  Assistant  │    │  (Audio Engine) │    │
│   └─────────────┘    └─────────────┘    └─────────────────┘    │
│         │                   │                    │              │
│         │                   │                    │              │
│         ▼                   ▼                    ▼              │
│   "Make a drum      Generates valid      Plays audio in        │
│    beat"            Strudel code         real-time              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture

1. **TamboProvider** - Wraps the app and connects to Tambo's AI backend
2. **StrudelService** - Singleton service managing the Strudel audio engine
3. **updateRepl Tool** - Tambo tool that validates and executes Strudel code
4. **listSamples Tool** - Tambo tool for discovering available sounds and samples
5. **System Prompt** - Comprehensive guide teaching the AI Strudel syntax, genre conventions, and music production techniques

### Key Files

- `src/lib/tambo.ts` - Tambo configuration with tools and system prompt
- `src/strudel/lib/service.ts` - Strudel audio engine service
- `src/strudel/tools/validateAndUpdateRepl.ts` - Tool for AI to update the REPL
- `src/strudel/tools/listSamples.ts` - Tool for discovering available samples
- `src/strudel/lib/prompt.md` - Comprehensive system prompt teaching AI about Strudel

### The Tool Pattern

Instead of rendering components, this app uses Tambo's **tool system** to let the AI control the Strudel REPL directly:

```typescript
// The AI calls this tool to update the music
export const validateAndUpdateRepl: TamboTool = {
  name: "updateRepl",
  description: "Update the Strudel REPL with new pattern code...",
  tool: async (code: string) => {
    // Validates code first, throws error if invalid
    // AI will automatically retry with fixed code
    const result = await service.updateAndPlay(code);
    if (!result.success) {
      throw new Error(`Invalid pattern: ${result.error}`);
    }
    return "Pattern updated";
  },
};
```

## Example Prompts

Try these to get started:

- "Create a house beat with a 909 kick and hi-hats"
- "Make an 80s synthwave track with arpeggios"
- "Build a lo-fi hip hop beat with jazzy chords"
- "Create an ambient soundscape with evolving pads"
- "Make a drum & bass pattern with rolling bass"
- "Add some reverb to the snare"
- "Make it faster and more intense"

## Get Started

1. Clone this repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Tambo API key:
   ```bash
   npx tambo init
   ```
   Or rename `example.env.local` to `.env.local` and add your API key from [tambo.co/dashboard](https://tambo.co/dashboard).

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [localhost:3000](http://localhost:3000) and start making music!

## Learn More

- [Tambo Documentation](https://docs.tambo.co) - Learn about building AI apps with Tambo
- [Strudel Documentation](https://strudel.cc/learn) - Learn Strudel pattern syntax
- [TidalCycles](https://tidalcycles.org/) - The original live coding language

## Built With

- [Tambo AI](https://tambo.co) - Generative UI Agent framework
- [Strudel](https://strudel.cc/) - Live coding music environment
- [Next.js](https://nextjs.org/) - React framework
