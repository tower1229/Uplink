# Only the CLI writes the Repository via Bridge

The browser extension may read Platform pages and propose Capture payloads, but it must not write the Repository filesystem itself. All Capture commits go through the Native Messaging Bridge to the CLI, which validates, stages, and atomically commits. Direct extension writes were rejected because they weaken path-safety, schema checks, and the collect-vs-store separation.
