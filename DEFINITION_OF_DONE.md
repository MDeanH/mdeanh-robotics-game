# Definition of done — pre-commit checklist
Run this before every commit. It encodes the spine and the verification habits; a commit
that fails a line is not done, whatever else it accomplishes.

- [ ] Change respects the spine (reread the lines in `CLAUDE.md`; name the one closest to
      being violated and say why it is not).
- [ ] Any suspected behavior was confirmed by a numeric probe / failing case, not just by
      reading the code.
- [ ] A regression test named after the defect exists for any bug fixed, and the suite is green.
- [ ] The harness ran against this change's own output, and its result — including a bad
      one — is recorded, not just observed.
- [ ] Every load-bearing claim in what ships carries an honest status; nothing unverified is
      worded as proven / working / driven.
- [ ] Research done for this change is in `RESEARCH_LOG.md` (sources, conclusion, open questions).
- [ ] The kept baseline still runs (check whenever the change touches what the baseline mirrors).
- [ ] `agent/memory/handoff.md` + `agent/memory/MEMORY.md` updated; relative dates made absolute.
- [ ] Load-bearing data files untouched (never truncate an append-only log).
- [ ] Commit message says what changed and why.
- [ ] Snapshot committed before any large self-review, so the review has a fixed target.
