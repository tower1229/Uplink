# Message body precedence across Evidence

When multiple Imports or Captures attach Evidence to the same Message, the Repository keeps all Evidence append-only and maintains a single normalized message body. Precedence is: official Import over Capture, then completeness (richer/longer structured content), then newer capture time. Last-write-wins and first-write-locks were rejected because Captures are more often partial, while silent freezes hide better later Evidence.
