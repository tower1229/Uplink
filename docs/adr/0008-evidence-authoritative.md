# Evidence is authoritative; normalized data is rebuildable

Imports and Captures append immutable Evidence. Normalized Conversations and Messages (and any indexes) are projections derived from Evidence plus Import Adapter / Capture Profile versions. When those versions improve, Uplink may delete and rebuild projections without rewriting Evidence. Making normalized rows immutable or patch-only was rejected because Adapter bugs would otherwise permanently stain the Repository.
