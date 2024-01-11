<div align="center">
  <img src="static/logo.png" width="184">

<h1><b>ASTRA</b></h1>

<a href="https://nersent.com"><img src="https://cdn.nersent.com/public/badges/made_by_nersent.svg" alt="Made by Nersent" /></a>
<a href="https://nersent.com"><img src="https://cdn.nersent.com/public/badges/stage_in_dev.svg" alt="In development" /></a>
<a href="https://discord.gg/P7Vn4VX"><img src="https://cdn.nersent.com/public/badges/discord.svg" alt="Discord" /></a>

</div>

**ASTRA**: Interactive LLM playground with Linux sandbox.

Run code, search the web, retrieve latest news, and more.

> Note: This project is in an early development stage. Expect breaking changes.

<div align="center">
  <img src="static/demo_plot.gif" width="800">
</div>

## Installation

```bash
# Clone the repository
git clone https://github.com/nersent/astra
cd astra

# Install the dependencies
pnpm install

# Modify astra/ui/.env
# Modify astra/service/.env

# Build sandbox image
make astra.sandbox.build

# Run database
make astra.docker

# Run server
make astra.service

# Run UI
make astra.ui
```

## References

- Large Language Models Understand and Can be Enhanced by Emotional Stimuli, https://twitter.com/literallydenis/status/1724909799593120044

- Getting Emotional With Large Language Models (LLMs) Can Increase Performance by 115% (Case Study) https://www.godofprompt.ai/blog/getting-emotional-with-large-language-models-llms-can-increase-performance-by-115-case-study

- Large Language Models Understand and Can Be Enhanced by Emotional Stimuli https://arxiv.org/pdf/2307.11760.pdf

- Large Language Models are Zero-Shot Reasoners https://arxiv.org/pdf/2205.11916.pdf

- Chain-of-Thought Prompting Elicits Reasoning in Large Language Models https://arxiv.org/abs/2201.11903

- LARGE LANGUAGE MODELS AS OPTIMIZERS https://arxiv.org/pdf/2309.03409.pdf

- Toolformer: Language Models Can Teach Themselves to Use Tools https://arxiv.org/abs/2302.04761

- New prompt trick: "I'm going to tip $200 for a perfect solution!" – helps ChapGPT to write more detailed answers to the question, statistically checked. https://twitter.com/literallydenis/status/1730965217125839142

- Supercharged Custom Instructions for ChatGPT (non-coding) and ChatGPT Advanced Data Analysis (coding). https://github.com/spdustin/ChatGPT-AutoExpert/blob/main/System%20Prompts.md

- Prompt engineering https://platform.openai.com/docs/guides/prompt-engineering/strategy-write-clear-instructions

- https://www.promptingguide.ai/techniques/ape

---

Made by [Nersent](https://nersent.com)
