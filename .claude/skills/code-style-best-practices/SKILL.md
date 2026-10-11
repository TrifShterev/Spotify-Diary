---
name: code-style-best-practices
description: "Style preferences for TypeScript code in this project (frontend and backend). Use whenever writing, editing, refactoring, or reviewing TypeScript code, even if the user does not mention style."
---

# TypeScript Best Practices

Apply these style preferences to every TypeScript change. When editing existing code, follow them in the lines you touch.

## Omit curly braces for single-line statements

When the body of an `if`, `else`, `for`, `while`, or similar statement is a single statement that fits on one line, leave out the curly braces.

```ts
// Preferred
if (!user) return null;

if (isLoading) setStatus('loading');
else setStatus('idle');

for (const track of tracks) addTrack(track);
```

```ts
// Avoid
if (!user) {
  return null;
}

for (const track of tracks) {
  addTrack(track);
}
```

Keep the braces when:

- The body has more than one statement.
- The single statement is too long for one line and wraps onto several.
- One branch of an `if`/`else` chain needs braces. Then use braces on every branch of that chain.
