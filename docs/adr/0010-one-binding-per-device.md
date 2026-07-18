# One Binding per device; rebind does not migrate

Each device has at most one active Binding to a Repository. Changing the Binding (`rebind`) retargets the CLI and Bridge at another valid Repository path after explicit confirmation; it never copies or merges data. Multi-repository everyday switching was rejected to keep the mental model and Bridge target unambiguous.
