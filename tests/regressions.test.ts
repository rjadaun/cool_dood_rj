import { csvCell } from "../src/lib/csv";
import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { processImage } from "../src/lib/media/process";
import { validateUpload, MAX_UPLOAD_BYTES, mediaPage } from "../src/lib/media/shared";
import { readMediaResponse, prepareImage } from "../src/lib/media/client";
import { socialSchema, portfolioImageSchema, contactSchema, userSchema } from "../src/lib/validation/schemas";
import { LocalStorageProvider } from "../src/lib/storage/local";

test("media pagination rejects unsafe query values", () => {
  for (const value of [null, "", "NaN", "Infinity", "1.5", "-1", "0", "999999999999"]) assert.equal(mediaPage(value), 1);
  assert.equal(mediaPage("3"), 3);
});
test("upload validation rejects empty, oversized and unsupported files", () => {
  assert.match(validateUpload({type:"image/jpeg",size:0})!, /empty/);
  assert.match(validateUpload({type:"image/jpeg",size:MAX_UPLOAD_BYTES+1})!, /15 MB/);
  assert.match(validateUpload({type:"text/html",size:100})!, /JPEG/);
  assert.equal(validateUpload({type:"image/png",size:MAX_UPLOAD_BYTES}), null);
});
test("upload responses handle HTML hosting errors and expired sessions", async () => {
  await assert.rejects(readMediaResponse(new Response("<h1>Too big</h1>", {status:413})), /upload limit/);
  await assert.rejects(readMediaResponse(new Response("Unauthorized", {status:401})), /session expired/);
  await assert.rejects(readMediaResponse(new Response("oops", {status:200})), /unexpected response/);
});
test("small files preserve original names and bytes", async () => {
  const file = new File(["image"], "photo.png", {type:"image/png"});
  assert.equal(await prepareImage(file), file);
});
test("large photographs are resized before upload and resources released", async () => {
  let closed = false;
  const bitmap = { width:6000, height:4000, close:()=>{closed=true;} };
  const canvas = { width:0, height:0, getContext:()=>({drawImage:()=>{}}), toBlob:(callback:(blob:Blob)=>void)=>callback(new Blob(["compressed"],{type:"image/webp"})) };
  const originalBitmap = globalThis.createImageBitmap;
  const originalDocument = globalThis.document;
  Object.assign(globalThis, { createImageBitmap:async()=>bitmap, document:{createElement:()=>canvas} });
  try {
    const file = new File([new Uint8Array(5*1024*1024)], "camera.jpg", {type:"image/jpeg"});
    const prepared = await prepareImage(file);
    assert.equal(prepared.name, "camera.jpg"); assert.equal(prepared.type, "image/webp");
    assert.equal(canvas.width,2560); assert.equal(canvas.height,1707); assert.ok(closed);
  } finally { Object.assign(globalThis, {createImageBitmap:originalBitmap, document:originalDocument}); }
});
test("checkbox false values and account email normalization survive validation", () => {
  assert.equal(socialSchema.parse({platform:"INSTAGRAM",url:"https://example.com",visible:"false"}).visible,false);
  assert.equal(socialSchema.parse({platform:"INSTAGRAM",url:"https://example.com",visible:"true"}).visible,true);
  assert.equal(portfolioImageSchema.parse({mediaId:"0123456789abcdef01234567",visible:false}).visible,false);
  assert.equal(userSchema.parse({name:"Test",email:"ADMIN@EXAMPLE.COM",role:"EDITOR"}).email,"admin@example.com");
});
test("contact dates reject invalid values", () => {
  assert.equal(contactSchema.safeParse({name:"Test",email:"a@example.com",message:"A valid inquiry message",preferredDate:"2026-02-31"}).success,false);
});
test("image processing caps dimensions, strips active SVG, keeps transparency", async () => {
  const raster = await sharp({create:{width:3200,height:1600,channels:4,background:{r:255,g:0,b:0,alpha:0.5}}}).png().toBuffer();
  const result = await processImage(raster,"image/png");
  assert.equal(result?.width,2560); assert.equal(result?.height,1280);
  assert.match(result!.blurDataUrl,/^data:image\/webp;base64,/);
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><script>alert(1)</script><rect width="50" height="50" fill="red"/></svg>');
  const converted = await processImage(svg,"image/svg+xml");
  assert.equal(converted?.contentType,"image/webp");
  assert.equal((await sharp(converted!.buffer).metadata()).hasAlpha,true);
  await assert.rejects(processImage(Buffer.from("not an image"),"image/jpeg"));
});
test("local storage blocks sibling-directory traversal for every operation", async () => {
  const storage = new LocalStorageProvider();
  for (const key of ["../storage-other/private", "../../etc/passwd", "/etc/passwd"]) {
    await assert.rejects(storage.read(key),/Invalid key/);
    await assert.rejects(storage.put({key,body:Buffer.from("x"),contentType:"text/plain"}),/Invalid key/);
    await assert.rejects(storage.remove(key),/Invalid key/);
  }
});

test("CSV exports neutralize formulas and preserve embedded quotes", () => {
  assert.equal(csvCell('=1+1'), "'=1+1");
  assert.equal(csvCell('  @SUM(1)'), "'  @SUM(1)");
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
});
