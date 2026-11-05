# Partner API: is this username on meetadev, and in the event?

For event apps such as Faaji with a quest like **"Join DevFest Ilorin on meetadev"**.

## The flow

1. The quest asks the attendee for their **meetadev username**. They find it on **My badge** in meetadev, under their
   name (`@ada-lovelace`), and can change it under **Edit badge → Username**.
2. Not on meetadev yet? Send them to the event's page, e.g. `https://www.meetadev.xyz/e/devfest-ilorin-2026`.
   They sign in with Google, make their badge and join the event, then come back with their username.
3. When they submit, **your server** asks meetadev about that username. Mark the quest right when both answers are `true`.

## Request

```
POST https://www.meetadev.xyz/api/partner/onboarded
Authorization: Bearer <your partner key>
Content-Type: application/json

{ "username": "ada-lovelace", "event": "devfest-ilorin-2026" }
```

- `username` (required): what the attendee typed. `@ada-lovelace`, `Ada-Lovelace` and `meetadev.xyz/p/ada-lovelace`
  all work; meetadev tidies it.
- `event` (optional): the meetadev event slug, the last part of its link `https://www.meetadev.xyz/e/<slug>`.
  Leave it out to check the profile only.

Call it **from your server only** (for Firebase, a Cloud Function or a callable function). Never put the key in the web app.

## Response

`200`:

```json
{ "username": "ada-lovelace", "onboarded": true, "joinedEvent": true }
```

- `username`: the tidied username that was checked. Store it with the quest if you like.
- `onboarded`: the username belongs to a meetadev account with a finished badge. `false` if no one has it, the badge
  isn't finished, or the account is suspended.
- `joinedEvent`: that person has joined the event. Always `false` when `onboarded` is `false`; `null` when no `event` was sent.

| Status | Meaning |
| --- | --- |
| 400 | `event` isn't a slug, or the body isn't JSON |
| 401 | missing or wrong key |
| 404 | no meetadev event with that slug (check your configuration) |
| 429 | more than 600 checks a minute from your app |
| 503 | partner checks aren't set up on meetadev yet |

## What to show the attendee

- `onboarded: false`: "We couldn't find that username. Copy it from My badge on meetadev, or join here first:
  meetadev.xyz/e/devfest-ilorin-2026"
- `joinedEvent: false`: "Nearly there. Open meetadev.xyz/e/devfest-ilorin-2026 and tap Join, then try again."

## Example (Node / Cloud Functions)

```js
const res = await fetch("https://www.meetadev.xyz/api/partner/onboarded", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.MEETADEV_PARTNER_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ username: answer, event: "devfest-ilorin-2026" }),
});
if (!res.ok) throw new Error(`meetadev check failed: ${res.status}`);
const { username, onboarded, joinedEvent } = await res.json();
const correct = onboarded && joinedEvent === true;
```

Usernames are public (they're in profile links), so a username alone doesn't prove the attendee owns it. If one
username shows up on several Faaji accounts, treat it as suspicious, or allow each username to complete the quest once.

## Getting a key

meetadev issues each partner its own key and stores it in the `PARTNER_KEYS` environment variable as `name:key`.
Ask hello@meetadev.xyz. Keys can be rotated or revoked at any time by changing that variable.
