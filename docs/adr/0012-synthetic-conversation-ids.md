# Synthetic Conversation ids when Platforms lack native thread ids

When a Platform page does not expose a stable conversation id, Uplink still assigns a Repository-stable conversation id so later Captures of the same thread can merge. The id is derived best-effort from origin, URL or DOM clues, and early message fingerprints. Creating a new Conversation per Capture or refusing Capture without a native id was rejected as too fragmented or too narrow for target Platforms.
