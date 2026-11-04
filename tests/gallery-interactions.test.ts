import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import * as React from "react";
import type { ComponentProps } from "react";
import { ProjectGallery } from "../src/components/public/project-gallery";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom") as {
  JSDOM: new (
    html: string,
    options: { url: string },
  ) => {
    window: Window & typeof globalThis & { close(): void };
  };
};

test("lightbox opens, navigates, cancels and restores focus and page scrolling", async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost" });
  const { window } = dom;
  const globals = {
    window,
    document: window.document,
    HTMLElement: window.HTMLElement,
    React,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries(globals)) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  // jsdom has no native dialog implementation. Test component state and cleanup;
  // actual browser focus containment and layout require visual/browser QA.
  window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  window.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(window.document.getElementById("root")!);
  const images = [1, 2, 3].map((id) => ({
    id: String(id),
    caption: `Caption ${id}`,
    altText: `Photograph ${id}`,
    aspect: "ORIGINAL",
    media: { url: `/test-${id}.jpg`, width: 800, height: 1200 },
  })) as ComponentProps<typeof ProjectGallery>["images"];
  const click = async (selector: string) => {
    const button = window.document.querySelector<HTMLButtonElement>(selector);
    assert.ok(button, selector);
    await React.act(() => button.click());
  };
  try {
    await React.act(() =>
      root.render(
        React.createElement(ProjectGallery, { images, layout: "MIXED", projectTitle: "Editorial portraits" }),
      ),
    );
    const trigger =
      window.document.querySelector<HTMLButtonElement>(".gallery-image")!;
    trigger.focus();
    window.document.body.style.overflow = "auto";
    await click(".gallery-image");
    const dialog = window.document.querySelector("dialog")!;
    const count = () => dialog.querySelector(".lightbox-top span")?.textContent;
    assert.equal(dialog.open, true);
    assert.equal(window.document.body.style.overflow, "hidden");
    assert.equal(count(), "1 / 3");
    assert.equal(dialog.querySelector(".lightbox-project-title")?.textContent, "Editorial portraits");
    await click('[aria-label="Next photograph"]');
    assert.equal(count(), "2 / 3");
    for (const [key, expected] of [
      ["End", "3 / 3"],
      ["ArrowRight", "1 / 3"],
      ["ArrowLeft", "3 / 3"],
      ["Home", "1 / 3"],
    ]) {
      await React.act(() =>
        dialog.dispatchEvent(
          new window.KeyboardEvent("keydown", { key, bubbles: true }),
        ),
      );
      assert.equal(count(), expected);
    }
    const stage = dialog.querySelector(".lightbox-stage")!;
    const pointer = async (type: string, x: number, y: number) => {
      await React.act(() => {
        stage.dispatchEvent(
          Object.assign(new window.Event(type, { bubbles: true }), {
            pointerType: "touch",
            clientX: x,
            clientY: y,
          }),
        );
      });
    };
    await pointer("pointerdown", 250, 100);
    await pointer("pointerup", 100, 110);
    assert.equal(count(), "2 / 3");
    await pointer("pointerdown", 250, 100);
    await pointer("pointerup", 100, 300);
    assert.equal(
      count(),
      "2 / 3",
      "Vertical scrolling must not advance photographs",
    );
    await click('[aria-label="Previous photograph"]');
    assert.equal(count(), "1 / 3");
    await click('[aria-label="Close photograph viewer"]');
    assert.equal(dialog.open, false);
    assert.equal(window.document.body.style.overflow, "auto");
    assert.ok(
      window.document.activeElement === trigger,
      "Focus returns to the photograph that opened the viewer",
    );
    await click(".gallery-image");
    await React.act(() =>
      dialog.dispatchEvent(new window.Event("cancel", { cancelable: true })),
    );
    assert.equal(dialog.open, false);
    assert.equal(window.document.body.style.overflow, "auto");
    assert.ok(
      window.document.activeElement === trigger,
      "Focus returns to the photograph that opened the viewer",
    );
  } finally {
    await React.act(() => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
