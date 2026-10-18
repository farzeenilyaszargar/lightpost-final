import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { themeInitScript } from "../lib/theme";
import { isRouteActive } from "../lib/navigation";

test("saved theme is applied before hydration and tolerates unavailable storage", () => {
  for (const saved of ["true", "false", null, "invalid"]) {
    let dark = false;
    runInNewContext(themeInitScript, {
      document: { documentElement: { classList: { toggle: (_: string, value: boolean) => { dark = value; } } } },
      localStorage: { getItem: () => saved },
    });
    assert.equal(dark, saved === "true");
  }
  assert.doesNotThrow(() => runInNewContext(themeInitScript, {
    document: { documentElement: { classList: { toggle: () => assert.fail("should retain default theme") } } },
    localStorage: { getItem: () => { throw new Error("Storage blocked"); } },
  }));
});

test("navigation retains the correct section for aliases, articles, and games", () => {
  assert.equal(isRouteActive('/news/technology', '/news/science'), true);
  assert.equal(isRouteActive('/news/technology', '/news/science/story'), true);
  assert.equal(isRouteActive('/news/technology', '/news/science-extra'), false);
  assert.equal(isRouteActive("/", "/news/latest/"), true);
  assert.equal(isRouteActive("/", "/news/politics"), false);
  assert.equal(isRouteActive("/news/politics", "/news/politics/story"), true);
  assert.equal(isRouteActive("/news/politics", "/news/politics-extra"), false);
  assert.equal(isRouteActive("/fun", "/fun/sudoku"), true);
  assert.equal(isRouteActive("/fun", "/saved"), false);
});
