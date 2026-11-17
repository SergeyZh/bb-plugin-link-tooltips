import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { installLinkTooltips, linkDestination } from "./tooltips.ts";

function fixture() {
  const dom = new JSDOM('<a href="https://example.org/report?q=1#part" title="Report"><span>Open</span></a>');
  const doc = dom.window.document;
  const controller = new AbortController();
  const dispose = installLinkTooltips(doc, controller.signal);
  const anchor = doc.querySelector("a")!;
  const hover = (target: Element = anchor) => target.dispatchEvent(new dom.window.MouseEvent("mouseover", { bubbles: true }));
  const leave = (relatedTarget: EventTarget | null = null) => anchor.dispatchEvent(new dom.window.MouseEvent("mouseout", { bubbles: true, relatedTarget }));
  return { dom, doc, controller, dispose, anchor, hover, leave };
}

test("preserves URL semantics and displays decoded cross-platform file paths", () => {
  assert.equal(linkDestination("https://example.org/a%2Fb?q=x%26y#part"), "https://example.org/a%2Fb?q=x%26y#part");
  assert.equal(linkDestination("file:///Users/test/My%20report.pdf#L12"), "/Users/test/My report.pdf#L12");
  assert.equal(linkDestination("file:///C:/Work/report.pdf"), "C:/Work/report.pdf");
  assert.equal(linkDestination("file://server/share/report.pdf"), "//server/share/report.pdf");
  assert.equal(linkDestination("file:///bad%ZZ.pdf"), "file:///bad%ZZ.pdf");
  assert.equal(linkDestination("#heading"), null);
  assert.equal(linkDestination(""), null);
});

test("hovering a child adds destination, preserves title and leaves navigation alone", () => {
  const f = fixture();
  try {
    f.hover(f.anchor.querySelector("span")!);
    assert.equal(f.anchor.title, "Report\nhttps://example.org/report?q=1#part");
    f.leave(f.anchor.querySelector("span"));
    f.hover();
    assert.equal(f.anchor.title, "Report\nhttps://example.org/report?q=1#part");
    assert.equal(f.anchor.dispatchEvent(new f.dom.window.MouseEvent("click", { cancelable: true })), true);
    assert.equal(f.anchor.getAttribute("href"), "https://example.org/report?q=1#part");
    f.leave();
    assert.equal(f.anchor.title, "Report");
  } finally { f.dispose(); f.dom.window.close(); }
});

test("newly streamed links work and abort restores an absent title", () => {
  const f = fixture();
  try {
    const added = f.doc.createElement("a");
    added.href = "file:///tmp/a%20b.txt#L4";
    f.doc.body.append(added);
    f.hover(added);
    assert.equal(added.title, "/tmp/a b.txt#L4");
    f.controller.abort();
    assert.equal(added.hasAttribute("title"), false);
    f.hover(added);
    assert.equal(added.hasAttribute("title"), false);
    f.dispose();
  } finally { f.dispose(); f.dom.window.close(); }
});

test("cleanup does not overwrite a title subsequently changed by the host", () => {
  const f = fixture();
  try {
    f.hover();
    f.anchor.title = "Updated by BB";
    f.dispose();
    assert.equal(f.anchor.title, "Updated by BB");
  } finally { f.dispose(); f.dom.window.close(); }
});

test("switching links restores previous title and window blur restores current title", () => {
  const f = fixture();
  try {
    f.hover();
    const added = f.doc.createElement("a");
    added.href = "/tmp/report.pdf";
    added.setAttribute("title", "");
    f.doc.body.append(added);
    f.hover(added);
    assert.equal(f.anchor.title, "Report");
    assert.equal(added.title, "/tmp/report.pdf");
    f.dom.window.dispatchEvent(new f.dom.window.Event("blur"));
    assert.equal(added.getAttribute("title"), "");
  } finally { f.dispose(); f.dom.window.close(); }
});

test("fragment links and already aborted mounts are unchanged", () => {
  const f = fixture();
  try {
    f.anchor.href = "#heading";
    f.hover();
    assert.equal(f.anchor.title, "Report");
    f.controller.abort();
    const dispose = installLinkTooltips(f.doc, f.controller.signal);
    f.anchor.href = "https://example.org";
    f.hover();
    assert.equal(f.anchor.title, "Report");
    dispose();
  } finally { f.dispose(); f.dom.window.close(); }
});
