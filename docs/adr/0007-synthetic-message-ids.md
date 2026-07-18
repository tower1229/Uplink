# Synthetic Message ids when Platforms lack native ids

When a Platform provides no stable message id, Uplink still assigns a Repository-stable Message id so later Captures can merge onto the same Message. The id is derived primarily from normalized content, role, and Conversation identity, with only weak use of position or neighborhood — not a fresh id per Capture. Deduplication on such Platforms is explicitly best-effort; identical repeated user texts may collide, which was accepted over unbounded duplicate Messages.
