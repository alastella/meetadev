import assert from "node:assert/strict";
import test from "node:test";
import { cleanHandle, handleProblem } from "../src/lib/handles.ts";

test("cleanHandle accepts what people paste", () => {
  for (const pasted of ["ada-lovelace", " Ada-Lovelace ", "@ada-lovelace", "meetadev.xyz/p/ada-lovelace", "https://www.meetadev.xyz/p/Ada-Lovelace/", "https://meetadev.xyz/p/ada-lovelace?x=1"])
    assert.equal(cleanHandle(pasted), "ada-lovelace", pasted);
});

test("handleProblem allows usernames, including generated ones, and explains the rest", () => {
  for (const ok of ["ada", "ada-lovelace", "dev-3f2a", "ada--3f2a", "a1b", "x".repeat(30)]) assert.equal(handleProblem(ok), null, ok);
  for (const bad of ["", "ab", "x".repeat(31), "-ada", "ada-", "ada lovelace", "ada_lovelace", "Ada", "ada.l", "adé"])
    assert.ok(handleProblem(bad), bad);
});
