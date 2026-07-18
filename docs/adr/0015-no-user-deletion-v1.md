# No user deletion of committed archive content in v1

Once Evidence, Conversations, or Messages are committed, the first version provides no product operation to delete them. Disposable projections such as query indexes may still be rebuilt. Soft-delete of projections or hard-delete of Evidence was deferred to keep append-only semantics and attachment/shared-reference rules simple.
