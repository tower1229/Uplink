# No application-level Repository encryption in v1

The Repository remains a user-inspectable filesystem tree. Confidentiality relies on OS permissions and optional full-disk encryption, not an Uplink passphrase or encrypted container. App-level vault encryption was rejected because it conflicts with "users can open and read their archive" and complicates Bridge writes, backup, and debugging.
