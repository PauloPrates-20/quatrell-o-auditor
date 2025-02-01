"use strict";var R=Object.create;var C=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var O=Object.getOwnPropertyNames;var G=Object.getPrototypeOf,T=Object.prototype.hasOwnProperty;var D=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of O(e))!T.call(t,s)&&s!==r&&C(t,s,{get:()=>e[s],enumerable:!(o=P(e,s))||o.enumerable});return t};var h=(t,e,r)=>(r=t!=null?R(G(t)):{},D(e||!t||!t.__esModule?C(r,"default",{value:t,enumerable:!0}):r,t));var v=h(require("fs")),u=h(require("path")),a=require("discord.js");var y=h(require("dotenv"));y.default.config();var{DISCORD_TOKEN:F,DISCORD_CLIENT_ID:J,DISCORD_GUILD_ID:Y,CHANNELS_BANK:Q,CHANNELS_XP:V,CHANNELS_TREASURE:Z,CHANNELS_TRANSFERENCIES:ee,CHANNELS_GENERAL:te,FIREBASE_API_KEY:$,FIREBASE_AUTH_DOMAIN:j,FIREBASE_PROJECT_ID:B,FIREBASE_STORAGE_BUCKET:U,FIREBASE_MESSAGING_SENDER_ID:k,FIREBASE_APP_ID:M,COLLECTIONS_USERS:H}=process.env,b={apiKey:$,authDomain:j,projectId:B,storageBucket:U,messagingSenderId:k,appId:M},E={users:H},_=F;var I=require("firebase/app"),n=require("firebase/firestore");var S=[{xp:0,level:1},{xp:1,level:2},{xp:2,level:3},{xp:5,level:4},{xp:9,level:5},{xp:14,level:6},{xp:20,level:7},{xp:27,level:8},{xp:35,level:9},{xp:45,level:10},{xp:56,level:11},{xp:68,level:12},{xp:81,level:13},{xp:95,level:14},{xp:110,level:15},{xp:126,level:16},{xp:143,level:17},{xp:161,level:18},{xp:180,level:19},{xp:200,level:20},{xp:221,level:21}],w=[{level:1,tier:"<:01_iniciante:1012215299774357504>"},{level:4,tier:"<:02_cobre:1012215321421168710>"},{level:7,tier:"<:03_prata:1012215335774064711>"},{level:10,tier:"<:04_ouro:1012215352375115786>"},{level:13,tier:"<:05_platina:1012215369710182450>"},{level:16,tier:"<:06_cobalto:1012215386164428930>"},{level:19,tier:"<:07_adamante:1012215399733018714>"}];var g=class{constructor(e,r=0,o={comum:0,transmutacao:0,ressureicao:0},s={}){this.id=e,this.gold=r,this.gems=o,this.characters=s}addGold(e){this.gold+=e}subGold(e){this.gold-=e}registerCharacter(e,r){this.characters[r]=Object.assign({},e)}deleteCharacter(e){delete this.characters[e]}renameCharacter(e,r,o){this.characters[r]={...this.characters[e],name:o},delete this.characters[e]}addXp(e,r){let o=this.characters[e];o.xp+=r,this.changeLevel(o)}subXp(e,r){let o=this.characters[e];o.xp-=r,this.changeLevel(o)}setXp(e,r){let o=this.characters[e];o.xp=r,this.changeLevel(o)}changeLevel(e){for(let r of S)e.xp>=r.xp&&(e.level=r.level);this.changeTier(e)}changeTier(e){for(let r of w)e.level>=r.level&&(e.tier=r.tier)}addGems(e,r){this.gems[e]+=r}subGems(e,r){this.gems[e]-=r}};var q=(0,I.initializeApp)(b),K=(0,n.getFirestore)(q);async function f(t){let e=(0,n.doc)(K,E.users,t);try{let o=(await(0,n.getDoc)(e)).data();if(o)return new g(o.id,o.gold,o.gems,o.characters);throw new Error("Player not found")}catch(r){console.error(r.message)}}var i=new a.Client({intents:[a.GatewayIntentBits.Guilds,a.GatewayIntentBits.GuildMessages,a.GatewayIntentBits.MessageContent]});i.commands=new a.Collection;var N=u.default.join(__dirname,"commands"),X=v.default.readdirSync(N);for(let t of X){let e=u.default.join(N,t),r=v.default.readdirSync(e).filter(o=>o.endsWith(".ts"));for(let o of r){let s=u.default.join(e,o),c=require(s);"data"in c&&"execute"in c?i.commands.set(c.data.name,c):console.log(`[WARNING] Command at ${s} is missing a required "data" or "execute" property.`)}}i.once(a.Events.ClientReady,t=>{console.log(`Ready. Logged as ${t.user.tag}`)});i.on(a.Events.InteractionCreate,async t=>{if(t.isAutocomplete()){let o=i.commands.get(t.commandName);if(o.data.name==="personagem"){let s=await f(t.member.id);if(!s){await t.respond([]);return}let c=t.options.getFocused(!0);if(c.name==="personagem"){let m=Object.keys(s.characters).map(d=>{let l=s.characters[d];return{name:l.name,value:l.name}}).filter(d=>d.name.toLowerCase().includes(c.value.toLowerCase()));await t.respond(m.slice(0,25))}}else if(o.data.name==="ajustar"&&t.options.getSubcommand()==="xp"){let s=t.options.getFocused(!0);if(s.name==="personagem"){let m=(t.options.data[0]?.options||[]).find(p=>p.name==="jogador").value;if(console.log("Target member: ",m),!m){console.error("Target member was not found."),await t.respond([]);return}let d=await t.guild.members.fetch(m),l=await f(d.id);if(!l){await t.respond([]);return}let L=Object.keys(l.characters).map(p=>{let x=l.characters[p];return{name:x.name,value:x.name}}).filter(p=>p.name.toLowerCase().includes(s.value.toLowerCase()));await t.respond(L)}}}if(!t.isChatInputCommand())return;let r=t.client.commands.get(t.commandName);if(!r){console.error(`No command matching ${t.commandName} found`);return}try{r.execute(t)}catch(o){t.replied||t.deferred?await t.followUp({content:`Ocorreu um erro ao executar o comando: ${o}`,ephemeral:!0}):await t.reply({content:`Ocorreu um erro ao executar o comando: ${o}`,ephemeral:!0})}});i.login(_);
