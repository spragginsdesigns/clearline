# Contributing

Thanks for helping. Clearline is a harm reduction project, so a few things matter more than usual.

## Ground rules

- **Plain, non-judgmental language.** Say what was found and what it means for someone's safety. No moralizing, no
  scare tactics, no slang that glamorizes use.
- **Never weaken privacy.** No change may publish anything finer than a week and a broad area, or anything that could
  identify a person, seller or venue. See `docs/DATA.md`.
- **Accuracy over looks.** Every figure is computed from `data/`. Don't hard-code numbers, and don't add a chart that
  could mislead (for example a pie chart of things that can co-occur).
- **Dark mode only.** Please don't add a light theme.
- **Accessible.** Status always gets an icon and a label, never color alone. Keep text contrast readable and the
  layout usable at 390px wide.

## Workflow

```bash
bun install
bun run dev
bun run lint && bun run build   # both must pass before a PR
```

Check any visual change in a browser at desktop and phone widths, and add a line to `CHANGELOG.md` under
`## Unreleased`.

Commits follow Conventional Commits: `feat(substances): add a nitazene callout`.

## Corrections to chemistry or harm reduction advice

If you work in drug checking or harm reduction and something on the site is wrong, please open an issue. That kind of
correction is the most valuable contribution there is.
