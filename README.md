# BeatLab Interactive Music Studio

Shared repository of the BeatLab team (ACTAM project). `main` is the clean base of the project: everyone starts from it and works on their own branch.

The BeatLab studio app itself is a separate project in a personal repository: https://github.com/NavidRahmani94/beatlab-interactive-music-studio . This repository is only for the shared team work.

## Branches

| Branch | Content |
|---|---|
| `main` | Clean shared base. Only reviewed work is merged here. |
| `sound-engine` | The two sound engines (classic Tone.js engine and the AudioWorklet engine 2), with tests and its own README. |

## How to work

1. Update your copy: `git checkout main` and `git pull`.
2. Create your own branch from `main`, for example `git checkout -b yourname-feature`.
3. Work and commit in small steps with clear messages.
4. Push your branch: `git push -u origin yourname-feature`.
5. When a part is ready, open a pull request into `main`. Another member reviews it, then it is merged.

In GitHub Desktop: Branch > New branch (based on `main`), commit your changes, then Publish branch.

## Rules

- Do not commit directly to `main`.
- Do not commit `node_modules/` or build output (see `.gitignore`).
- Keep each part in its own folder so the pieces can be combined into one project later.

## License

MIT, see [LICENSE](LICENSE).
