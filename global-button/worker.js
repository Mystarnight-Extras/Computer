import { DurableObject } from 'cloudflare:workers';

const SHOP = [
  ['double','2x Clicks','Double your clicks for 30 seconds.',100],
  ['turbo','Turbo Click','Every press counts 5 times for 20 seconds.',500],
  ['lucky','Lucky Click','Chance to earn a bonus.',1200],
  ['gold','Golden Button','Adds +10 bonus clicks every press.',5000],
  ['mega','Mega Click','Adds +100 clicks once.',10000],
  ['auto','Auto Clicker','Adds 1 click every 5 seconds for 5 minutes.',25000],
  ['rainbow','Rainbow Mode','Makes the button go wild.',50000],
  ['combo','Combo Booster','Build a larger combo multiplier.',75000],
  ['storm','Click Storm','Drops 1,000 global clicks.',150000],
  ['portal','Click Portal','Adds a mysterious portal effect.',300000],
  ['galaxy','Galaxy Button','Unlocks the galaxy theme.',750000],
  ['infinity','Infinity Click','Massive one-time click bonus.',1500000]
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null,{headers:cors()});
    const id = env.CLICKER.idFromName('global');
    const stub = env.CLICKER.get(id);
    let response;
    if (url.pathname === '/count' && request.method === 'GET') response = await stub.fetch('https://do/count');
    else if (url.pathname === '/press' && request.method === 'POST') response = await stub.fetch('https://do/press');
    else if (url.pathname === '/shop' && request.method === 'GET') response = Response.json({items:SHOP});
    else response = Response.json({name:'Mystarsnight Clicker (Global!)',message:'API online',routes:['/count','/press','/shop']});
    const headers = new Headers(response.headers); for (const [k,v] of Object.entries(cors())) headers.set(k,v);
    return new Response(response.body,{status:response.status,headers});
  }
};

export class Clicker extends DurableObject {
  constructor(ctx, env){super(ctx,env); this.ctx=ctx; this.ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS game (id INTEGER PRIMARY KEY, clicks INTEGER NOT NULL, presses INTEGER NOT NULL)`); this.ctx.storage.sql.exec(`INSERT OR IGNORE INTO game(id,clicks,presses) VALUES(1,0,0)`);}
  async fetch(request){
    const path=new URL(request.url).pathname;
    if(path==='/count') return this.json(this.get());
    if(path==='/press') { const row=this.ctx.storage.sql.exec('UPDATE game SET clicks=clicks+1, presses=presses+1 WHERE id=1 RETURNING clicks,presses').one(); return this.json(row); }
    return this.json(this.get());
  }
  get(){return this.ctx.storage.sql.exec('SELECT clicks,presses FROM game WHERE id=1').one();}
  json(data){return Response.json(data);}
}
function cors(){return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'}}
