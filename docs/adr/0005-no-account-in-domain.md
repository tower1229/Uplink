# No Account in the domain model

Conversation identity is `(Platform, conversationId)` only. Multi-login identity on a Platform is not a first-class domain concept and does not participate in deduplication keys. Optional account metadata may still appear on Evidence or audit records as opaque notes, but it must not define Conversation boundaries. Splitting by Account was rejected to keep the first-version model small; users who need hard isolation can use separate Repositories via rebind.
