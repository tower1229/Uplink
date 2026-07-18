# Attachments are first-class; Capture is best-effort

Attachments are content-addressed Repository objects referenced by Messages. Official Imports are expected to extract binaries whenever the export includes them. Browser Captures attempt to retrieve visible or downloadable binaries but must still commit Conversations and Messages when retrieval fails — incomplete binaries are an Evidence gap, not a failed Capture.
