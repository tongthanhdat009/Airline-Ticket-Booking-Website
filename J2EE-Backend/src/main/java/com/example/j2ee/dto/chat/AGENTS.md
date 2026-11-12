<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/chat

## Purpose
Payloads for the live chat feature: starting a session, sending messages, and the admin side (session list, assignment, close, stats).

## Key Files
| File | Description |
|------|-------------|
| `StartChatRequest.java` | Customer identity for a new session: `hoTen`, `email`, `soDienThoai`. |
| `StartChatResponse.java` | New session id, status and greeting message. |
| `SendMessageRequest.java` | `sessionId` + `noiDung` for a chat message. |
| `ChatMessageDTO.java` | Message view: sender (`customer`/`admin`/`system`), type (`TEXT`/`SYSTEM`), timestamp. |
| `ChatSessionDTO.java` | Session view: customer info, assigned admin, status, message count, last message preview. |
| `AssignRequest.java` | `sessionId` to assign a session to the calling admin. |
| `CloseRequest.java` | `sessionId` to close a session. |
| `ChatStatsDTO.java` | Admin counters: `waitingCount`, `activeCount`, `idleCount`. |

## For AI Agents

### Working In This Directory
- `sessionId` is the business key across all chat payloads — never reuse a numeric id here.
- Message and session objects are also broadcast over STOMP; changing a field changes the WebSocket contract with the frontend.
- `ChatStatsDTO` is pushed by the idle-timeout scheduler, so its constructor arity is part of the contract.

### Testing Requirements
- Message/session shape changes need a check against the frontend WebSocket consumer in `J2EE-Frontend`.
- Extend the controller tests under `src/test/java/com/example/j2ee/controller/` for chat endpoints.

### Common Patterns
- `messageType` is `TEXT` or `SYSTEM`; system messages are written by `ChatIdleTimeoutScheduler`, never by the client.
- Session statuses seen in the code: `WAITING_FOR_ADMIN`, `IN_PROGRESS`, `WAITING_FOR_USER`, `IDLE`, `RESOLVED`.

## Dependencies

### Internal
- `../../service/LiveChatService.java`, `../../scheduler/ChatIdleTimeoutScheduler.java`, `../../service/AIChatRagService.java` - the code that produces and consumes these payloads.

### External
- Spring WebSocket STOMP - DTOs are serialized onto `/topic/chat/**`.

<!-- MANUAL: -->
