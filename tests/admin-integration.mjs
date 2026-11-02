/** Isolated HTTP integration audit. Never reads or writes the configured production DB. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';
import { JSDOM } from 'jsdom';

const run = randomUUID();
const folder = `audit-${run}`;
const temp = await mkdtemp(path.join(os.tmpdir(), 'rjadaun-audit-'));
const port = Number(process.env.AUDIT_PORT || 3107);
const origin = `http://127.0.0.1:${port}`;
let server, db, prisma;
let log = '';
let passed = 0;
const check = (name) => { passed++; console.log(`PASS ${name}`); };
const jar = new Map();
async function request(route, init = {}, authenticated = true) {
  const res = await fetch(origin + route, { ...init, redirect:'manual', headers:{ ...(authenticated ? {cookie:[...jar].map(([key,value])=>`${key}=${value}`).join('; ')} : {}), ...init.headers } });
  for (const cookie of res.headers.getSetCookie()) { const [pair] = cookie.split(';'); const index = pair.indexOf('='); jar.set(pair.slice(0,index),pair.slice(index+1)); }
  return res;
}
async function submit(route, changes, field = 'name') {
  const html = await (await request(route)).text();
  const dom = new JSDOM(html);
  const form = [...dom.window.document.querySelectorAll('form')].find(form=>form.querySelector(`[name="${field}"]`));
  assert.ok(form, `Form exists: ${route}`);
  const body=new FormData();
  for(const input of form.querySelectorAll('input,select,textarea')) {
    if(!input.name || input.disabled || (['checkbox','radio'].includes(input.type) && !input.checked)) continue;
    body.append(input.name,input.value);
  }
  for(const [key,value] of Object.entries(changes)) { if(value===null) body.delete(key); else body.set(key,String(value)); }
  dom.window.close();
  const response=await request(route,{method:'POST',body,headers:{Origin:origin}});
  const text=await response.text();
  return {status:response.status,text};
}

async function command(args, env) {
  const child = spawn(process.execPath,args,{env,stdio:['ignore','pipe','pipe']});
  let output=''; child.stdout.on('data',d=>output+=d); child.stderr.on('data',d=>output+=d);
  const [code] = await once(child,'exit');
  if(code!==0) throw new Error(output);
  return output;
}
try {
  const cachedBinary = path.join(os.homedir(),'.cache/mongodb-binaries/mongod-arm64-darwin-8.2.6');
  const systemBinary = process.env.MONGOMS_SYSTEM_BINARY || (existsSync(cachedBinary) ? cachedBinary : undefined);
  db = await MongoMemoryReplSet.create({ replSet:{ count:1, name:'audit', storageEngine:'wiredTiger' }, binary: systemBinary ? { systemBinary } : undefined });
  const databaseUrl = db.getUri('audit');
  const env = { ...process.env, DATABASE_URL:databaseUrl, AUTH_SECRET:randomUUID()+randomUUID(), AUTH_URL:origin, AUTH_TRUST_HOST:'true', NEXT_PUBLIC_SITE_URL:origin, STORAGE_PROVIDER:'local', EMAIL_PROVIDER:'log', NODE_ENV:'development', NEXT_TELEMETRY_DISABLED:'1' };
  await command(['node_modules/prisma/build/index.js','db','push','--skip-generate'],env);
  prisma = new PrismaClient({datasourceUrl:databaseUrl});
  const password=randomUUID();
  const admin=await prisma.user.create({data:{name:'Audit admin',email:'audit@example.test',role:'SUPER_ADMIN',passwordHash:await bcrypt.hash(password,4)}});
  await prisma.siteSetting.create({data:{id:'singleton',siteName:'Audit studio'}});
  const photo=await sharp({create:{width:120,height:80,channels:3,background:'#b29478'}}).png().toBuffer();
  const image=await prisma.media.create({data:{url:'/test-image.png',key:`${folder}/fixture`,filename:'fixture.png',mimeType:'image/png',size:photo.length,width:120,height:80}});
  await prisma.media.createMany({data:Array.from({length:29},(_,i)=>({url:'/test-image.png',key:`${folder}/fixture-${i}`,filename:`photo-${String(i).padStart(2,'0')}.png`,mimeType:'image/png',size:photo.length,width:120,height:80}))});
  const category=await prisma.category.create({data:{name:'Audit category',slug:'audit-category',coverId:image.id}});
  const project=await prisma.portfolioProject.create({data:{title:'Audit project',slug:'audit-project',status:'PUBLISHED',categoryId:category.id,coverId:image.id,images:{create:{mediaId:image.id}}}});
  const page=await prisma.page.create({data:{slug:'about',title:'About'}});
  await prisma.page.createMany({data:[{slug:'privacy-policy',title:'Privacy Policy',content:'<p>Test privacy page</p>'},{slug:'terms',title:'Terms',content:'<p>Test terms page</p>'}]});
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port',String(port)],{env,stdio:['ignore','pipe','pipe']});
  server.stdout.on('data',d=>log+=d); server.stderr.on('data',d=>log+=d);
  let ready=false;
  for(let attempt=0;attempt<90;attempt++) { try { if((await request('/api/auth/csrf',{},false)).ok) {ready=true;break;} } catch {} await new Promise(r=>setTimeout(r,1000)); }
  assert.ok(ready,'local Next server starts');
  assert.equal((await request('/api/admin/media',{},false)).status,401); check('media requires authentication');
  const csrf=await (await request('/api/auth/csrf')).json();
  const login=await request('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrfToken:csrf.csrfToken,email:'AUDIT@EXAMPLE.TEST',password,callbackUrl:origin+'/admin'})});
  assert.ok([302,303].includes(login.status));
  const session=await (await request('/api/auth/session')).json();
  assert.equal(session.user?.id,admin.id); check('credential login and email normalization');
  const first=await (await request('/api/admin/media')).json();
  const second=await (await request('/api/admin/media?page=2')).json();
  assert.equal(first.items.length,24); assert.equal(second.items.length,6); assert.equal(first.total,30);
  assert.equal(new Set([...first.items,...second.items].map(i=>i.id)).size,30); check('all 30 media records reachable across pages');
  for(const query of ['1.5','Infinity','-1','999999999999']) assert.equal((await request('/api/admin/media?page='+query)).status,200);
  const last=await (await request('/api/admin/media?page=100')).json(); assert.equal(last.page,2); check('invalid and out-of-range media pages');
  const search=await (await request('/api/admin/media?q=photo-28')).json(); assert.equal(search.total,1); check('media search across entire library');
  const upload=async(name,blob)=>{const body=new FormData();body.append('files',blob,name);body.append('folder',folder);return request('/api/admin/media',{method:'POST',body});};
  const uploadedResponse=await upload('audit-photo.png',new Blob([photo],{type:'image/png'}));
  assert.equal(uploadedResponse.status,200); const uploaded=(await uploadedResponse.json()).items[0];
  assert.equal(uploaded.mimeType,'image/webp'); assert.ok(uploaded.width); assert.equal((await request(uploaded.url,{},false)).status,200); check('upload, optimize, persist and serve image');
  const malformed=await upload('bad.jpg',new Blob(['invalid'],{type:'image/jpeg'}));assert.equal(malformed.status,400); check('damaged image receives actionable validation error');
  assert.equal((await upload('bad.html',new Blob(['<script>'],{type:'text/html'}))).status,400); check('unsupported files rejected');
  const update=await request(`/api/admin/media/${uploaded.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({altText:'Audit description',caption:'Saved caption'})});assert.equal(update.status,200);
  const editAgain=await request(`/api/admin/media/${uploaded.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({altText:'Changed description'})});assert.equal((await editAgain.json()).media.caption,'Saved caption');check('media metadata persists without erasing caption');
  assert.equal((await request(`/api/admin/media/${uploaded.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({caption:'x'.repeat(2001)})})).status,400);check('metadata length validation');
  assert.equal((await request(`/api/admin/media/${image.id}`,{method:'DELETE'})).status,409);assert.ok(await prisma.media.findUnique({where:{id:image.id}}));check('referenced media cannot be deleted');
  await prisma.siteSetting.update({where:{id:'singleton'},data:{faviconUrl:uploaded.url}});
  assert.equal((await request(`/api/admin/media/${uploaded.id}`,{method:'DELETE'})).status,409);check('favicon URL references protected');
  await prisma.siteSetting.update({where:{id:'singleton'},data:{faviconUrl:null}});
  assert.equal((await request(`/api/admin/media/${uploaded.id}`,{method:'DELETE'})).status,200);assert.equal((await request(uploaded.url,{},false)).status,404);check('unused image deletion removes file');
  const routes=['/','/about','/portfolio','/portfolio/audit-project','/services','/packages','/testimonials','/journal','/contact','/privacy-policy','/terms','/sitemap.xml','/robots.txt','/admin','/admin/media','/admin/hero','/admin/categories','/admin/portfolio','/admin/services','/admin/clients','/admin/testimonials','/admin/awards','/admin/stats','/admin/packages','/admin/pages','/admin/homepage','/admin/social','/admin/journal','/admin/settings','/admin/seo','/admin/inquiries','/admin/newsletter','/admin/activity','/admin/users','/admin/categories/'+category.id,'/admin/portfolio/'+project.id,'/admin/pages/'+page.id,'/admin/users/'+admin.id,...['hero','categories','portfolio','services','clients','testimonials','awards','stats','packages','social','journal','users'].map(s=>`/admin/${s}/new`)];
  for(const route of routes){const res=await request(route);const html=await res.text();assert.equal(res.status,200,`${route} HTTP ${res.status}`);assert.ok(!html.includes('Something went wrong'),`${route} error boundary`);check(`renders ${route}`);}
  for(const route of ['/api/admin/inquiries/export','/api/admin/newsletter/export']){const res=await request(route);assert.equal(res.status,200);assert.match(res.headers.get('Content-Type'),/text\/csv/);check(`CSV ${route}`);}
  const modules = [
    ['hero','heroSlide',{title:'Saved hero',imageId:image.id},'title'],
    ['categories','category',{name:'Saved category',slug:'saved-category',coverId:image.id},'name'],
    ['portfolio','portfolioProject',{title:'Saved portfolio',slug:'saved-portfolio',coverId:image.id,images:JSON.stringify([{mediaId:image.id,visible:true,focal:'CENTER',aspect:'SQUARE'}])},'title'],
    ['services','service',{name:'Saved service',slug:'saved-service',features:JSON.stringify(['Feature A','Feature B'])},'name'],
    ['clients','client',{name:'Saved client'},'name'],
    ['testimonials','testimonial',{name:'Saved testimonial',quote:'An audit testimonial'},'name'],
    ['awards','award',{name:'Saved award'},'name'],
    ['stats','stat',{value:'100',label:'Saved statistic'},'value'],
    ['packages','package',{name:'Saved package',features:JSON.stringify(['Feature A','Feature B'])},'name'],
    ['social','socialLink',{platform:'INSTAGRAM',url:'https://example.com',visible:null},'url'],
    ['journal','blogPost',{title:'Saved journal',slug:'saved-journal',content:'<p>Article</p>'},'title'],
    ['users','user',{name:'Saved user',email:'NEW@EXAMPLE.TEST',password:'Local-test-only-123',role:'EDITOR'},'name'],
  ];
  for(const [section,model,values,field] of modules) {
    const result=await submit(`/admin/${section}/new`,values,field);
    assert.equal(result.status,303,`${section} create returned ${result.status}`);
    const record=await prisma[model].findFirst({where:section==='social'?{platform:'INSTAGRAM'}:section==='stats'?{label:values.label}:section==='users'?{email:'new@example.test'}:{[field]:values[field]}});
    assert.ok(record,`${section} record persisted`);
    if(section==='social') assert.equal(record.visible,false);
    check(`create and persist ${section}`);
    const edit=await submit(`/admin/${section}/${record.id}`,section==='social'?{visible:'true'}:section==='users'?{name:'Updated user',password:''}:section==='stats'?{label:'Updated statistic'}:{[field]:'Updated '+section},field);
    assert.equal(edit.status,303,`${section} edit returned ${edit.status}`);
    if(section==='social') assert.equal((await prisma.socialLink.findUnique({where:{id:record.id}})).visible,true);
    if(section==='portfolio') assert.equal(await prisma.portfolioImage.count({where:{projectId:record.id}}),1);
    if(section==='services') assert.equal(await prisma.serviceFeature.count({where:{serviceId:record.id}}),2);
    if(section==='packages') assert.equal(await prisma.packageFeature.count({where:{packageId:record.id}}),2);
    check(`edit and persist ${section}`);
  }
  const duplicate=await submit('/admin/categories/new',{name:'Duplicate',slug:'saved-category'});
  assert.equal(duplicate.status,200);assert.equal(await prisma.category.count({where:{slug:'saved-category'}}),1);check('duplicate slug returns validation without creating a duplicate');
  const settings=await submit('/admin/settings',{siteName:'Updated studio'},'siteName');assert.equal(settings.status,303);assert.equal((await prisma.siteSetting.findUnique({where:{id:'singleton'}})).siteName,'Updated studio');check('save site settings');
  const pageSave=await submit('/admin/pages/'+page.id,{title:'Updated about'},'title');assert.equal(pageSave.status,303);assert.equal((await prisma.page.findUnique({where:{id:page.id}})).title,'Updated about');check('save page content');
  const cmsPage=await prisma.page.create({data:{slug:'services',title:'Services'}});
  const cmsSave=await submit('/admin/pages/'+cmsPage.id,{heading:'CMS services heading',subheading:'CMS services description',content:'<p>CMS services body</p>',seoTitle:'CMS SEO title'},'title');
  assert.equal(cmsSave.status,303);
  let servicesHtml=await (await request('/services',{},false)).text();
  for(const marker of ['CMS services heading','CMS services description','CMS services body','CMS SEO title']) assert.ok(servicesHtml.includes(marker),marker);
  check('CMS headings, body and SEO appear on public service page');
  const section=await prisma.pageSection.create({data:{pageId:cmsPage.id,key:'section-1'}});
  const sectionSave=await submit('/admin/pages/'+cmsPage.id,{heading:'CMS custom section',body:'<p>Custom section text</p>'},'body');
  assert.equal(sectionSave.status,200);assert.equal((await prisma.pageSection.findUnique({where:{id:section.id}})).heading,'CMS custom section');
  servicesHtml=await (await request('/services',{},false)).text();assert.ok(servicesHtml.includes('CMS custom section'));check('new CMS sections render on public page');
  const hidePage=await submit('/admin/pages/'+cmsPage.id,{visible:null},'title');assert.equal(hidePage.status,303);
  servicesHtml=await (await request('/services',{},false)).text();assert.ok(!servicesHtml.includes('CMS services heading'));check('hidden CMS page does not expose fallback content');
  await prisma.homeSection.create({data:{key:'HERO',label:'Hero',visible:false}});
  const homeHtml=await (await request('/',{},false)).text();assert.ok(!homeHtml.includes('aria-roledescription="carousel"'));check('hiding all homepage sections keeps them hidden');
  const contact=await submit('/contact',{name:'Test visitor',email:'visitor@example.test',message:'A local integration test inquiry'},'message');
  assert.equal(contact.status,200);assert.equal(await prisma.inquiry.count({where:{email:'visitor@example.test'}}),1);check('public inquiry persists');
  await prisma.user.update({where:{id:admin.id},data:{role:'ADMIN'}});
  const escalate=await submit('/admin/users/new',{name:'Escalate',email:'escalate@example.test',password:'Local-test-only-123',role:'SUPER_ADMIN'});
  assert.equal(escalate.status,200);assert.equal(await prisma.user.count({where:{email:'escalate@example.test'}}),0);check('admin cannot create a super admin');
  await prisma.user.update({where:{id:admin.id},data:{role:'EDITOR'}});
  const changed=await (await request('/api/auth/session')).json();assert.equal(changed.user.role,'EDITOR');check('role changes apply to existing session');
  const restricted=await request('/admin/settings');assert.ok(restricted.status===307 || (await restricted.text()).includes('NEXT_REDIRECT'));check('editor cannot access settings');
  await prisma.user.update({where:{id:admin.id},data:{status:'DISABLED'}});
  assert.equal((await request('/api/admin/media')).status,401);check('disabled accounts lose API access immediately');
  const disabledLogin=await request('/admin/login');assert.equal(disabledLogin.status,200);check('disabled account can reach login without redirect loop');
  console.log(`SUCCESS: ${passed} integration checks passed. Production data untouched.`);
  if(process.argv.includes('--build')) {
    server.kill('SIGTERM');await once(server,'exit');server=undefined;
    console.log('Building production bundle against isolated database…');
    const buildOutput=await command(['node_modules/next/dist/bin/next','build'],{...env,NODE_ENV:'production'});
    await writeFile(path.join(temp,'build.log'),buildOutput);
    console.log(`PASS production build. Log: ${path.join(temp,'build.log')}`);
  }
} catch(error) {
  await writeFile(path.join(temp,'server.log'),log);
  console.error(`Audit failed. Local server log: ${path.join(temp,'server.log')}`);
  console.error(error);process.exitCode=1;
} finally {
  if(server){server.kill('SIGTERM');await Promise.race([once(server,'exit'),new Promise(r=>setTimeout(r,5000))]);}
  await prisma?.$disconnect();await db?.stop();
  await rm(path.join(process.cwd(),'storage',folder),{recursive:true,force:true});
}
