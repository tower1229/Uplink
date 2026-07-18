# Byte-identical Imports share Evidence; reparse rebuilds projections

An official export package is identified by content hash. Re-importing the same bytes does not copy Evidence again and is skipped by default. An explicit reparse may rebuild normalized projections under a new processing version while still citing the original Evidence. Always creating a new Evidence copy was rejected as wasteful and confusing given append-only Evidence.
