import { test } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HeroPicture } from "../src/components/public/hero/hero-picture";
import { heroSlideSchema, contactSchema } from "../src/lib/validation/schemas";
import { ENQUIRY_LABEL, enquiryLabel } from "../src/lib/enquiry";

function render(props: React.ComponentProps<typeof HeroPicture>) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "React");
  Object.defineProperty(globalThis, "React", { configurable: true, value: React });
  try {
    return renderToStaticMarkup(React.createElement(HeroPicture, props));
  } finally {
    if (previous) Object.defineProperty(globalThis, "React", previous);
    else Reflect.deleteProperty(globalThis, "React");
  }
}

const image = { url: "/landscape.jpg", altText: "Fashion campaign" };
const mobileImage = { url: "/portrait.jpg", altText: "Fashion campaign portrait" };

test("hero uses a mobile picture source and independent focal point without preloading the desktop image", () => {
  const html = render({ image, mobileImage, title: "Campaign", focal: "LEFT", mobileFocal: "TOP", priority: true });
  assert.match(html, /<source media="\(max-width: 767px\)"/);
  assert.ok(html.indexOf("<source") < html.indexOf("<img"));
  assert.match(html, /srcSet="[^"]*portrait/);
  assert.match(html, /<img[^>]*srcSet="[^"]*landscape/);
  assert.match(html, /--hero-focal:left;--hero-mobile-focal:top/);
  assert.match(html, /loading="eager"/);
  assert.match(html, /fetchPriority="high"/);
  assert.ok(!html.includes('<link rel="preload"'), "A desktop-only preload would waste a mobile download");
});

test("legacy slides keep the desktop image and focal point on phones", () => {
  const html = render({ image, title: "Campaign", focal: "TOP_RIGHT", mobileFocal: "BOTTOM" });
  assert.ok(!html.includes("<source"));
  assert.match(html, /--hero-mobile-focal:top right/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /alt="Fashion campaign"/);
});

test("mobile-only and empty slides have usable fallbacks", () => {
  assert.match(render({ image: null, mobileImage, title: "Campaign", mobileFocal: "TOP" }), /--hero-focal:top/);
  assert.match(render({ image: null, title: "Campaign" }), /aria-hidden="true"/);
});

test("hero validation accepts legacy slides and removable mobile images but rejects invalid media references", () => {
  assert.equal(heroSlideSchema.parse({ title: "Existing slide" }).mobileFocal, "CENTER");
  assert.equal(heroSlideSchema.parse({ title: "New slide", mobileImageId: "1234567890abcdef12345678", mobileFocal: "TOP" }).mobileFocal, "TOP");
  assert.equal(heroSlideSchema.parse({ title: "Remove portrait", mobileImageId: "" }).mobileImageId, "");
  assert.equal(heroSlideSchema.safeParse({ title: "Bad reference", mobileImageId: "invalid" }).success, false);
});

test("short enquiry form needs only name, email and message; contact CTAs share one label", () => {
  assert.ok(contactSchema.safeParse({ name: "Visitor", email: "visitor@example.test", message: "A portrait shoot in Jaipur." }).success);
  for (const url of ["/contact", "/contact/", "/contact#enquiry", "/contact?shoot=portrait"]) {
    assert.equal(enquiryLabel(url, "Get in touch"), ENQUIRY_LABEL);
  }
  assert.equal(enquiryLabel("/portfolio", "View portfolio"), "View portfolio");
  assert.equal(enquiryLabel("https://example.com/booking", "Book a session"), "Book a session");
});
