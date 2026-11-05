import assert from "node:assert/strict";
import test from "node:test";
import { parsePartnerKeys, partnerFor } from "../src/lib/partner-keys.ts";

const FAAJI = "f".repeat(40);
const OTHER = "o".repeat(40);

test("PARTNER_KEYS parses name:key pairs and skips bad ones", () => {
  const keys = parsePartnerKeys(` faaji:${FAAJI} , Other-App:${OTHER}, short:abc, :${FAAJI}, nocolon${FAAJI}, bad name:${FAAJI}`);
  assert.deepEqual([...keys.keys()], ["faaji", "other-app"]);
  assert.equal(parsePartnerKeys(undefined).size, 0);
  assert.equal(parsePartnerKeys("").size, 0);
});

test("partnerFor matches only a Bearer header with a known key", () => {
  const keys = parsePartnerKeys(`faaji:${FAAJI},other:${OTHER}`);
  assert.equal(partnerFor(`Bearer ${FAAJI}`, keys), "faaji");
  assert.equal(partnerFor(`bearer ${OTHER}`, keys), "other");
  for (const bad of [null, "", FAAJI, `Bearer ${FAAJI}x`, `Basic ${FAAJI}`, `Bearer ${FAAJI} extra`, "Bearer "])
    assert.equal(partnerFor(bad, keys), null, JSON.stringify(bad));
});
