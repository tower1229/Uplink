# Capture uses Staging before atomic commit

A Capture is written through Staging first: chunked Bridge payloads accumulate and validate there, and only a successful commit promotes Evidence and normalized projections into durable Repository content. Resume attaches to the same in-progress Capture. Import need not share the Staging vocabulary in the first version. Leaving partial formal data on failure was rejected.
