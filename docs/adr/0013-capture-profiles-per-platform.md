# Capture knowledge is per-Platform Capture Profiles only

Web extraction knowledge lives only as Capture Profiles — one Profile per Platform (豆包 and 腾讯元宝 are distinct). Built-in support is preset Profiles; calibration writes or updates Profiles silently in the Repository. A separate code-level Capture Adapter noun was rejected so Import Adapter (export formats) and Capture Profile (page extraction) stay cleanly split, while still meeting the requirement that each Platform has its own capture logic.
