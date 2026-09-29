import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {courses as fallback} from "@/data/courses";
export const dynamic="force-dynamic";
export default async function Course({params}){
 const {id}=await params;
 const {data:c}=await supabaseAdmin().from("courses").select("*").eq("slug",id).single();
 const f=fallback[id];
 if(!c&&!f)return <main className="container"><h1>Course not found</h1></main>;
 if(!c)return <main className="container"><section className="hero"><span className="badge">COURSE</span><h1>{f.name}</h1><p className="muted">{f.description}</p><p><b>₹{f.price}</b></p></section><div className="card"><h2>Modules</h2>{f.modules.map((m,i)=><div className="card module" key={i}><div><b>Module {i+1}: {m[0]}</b><p className="muted">{m[1]}</p></div><a className="btn" href={`/course/${id}/access`}>Access</a></div>)}</div></main>;
 const {data:mods}=await supabaseAdmin().from("modules").select("id,title,description,position").eq("course_id",c.id).order("position");
 return <main className="container"><section className="hero"><span className="badge">COURSE</span><h1>{c.title}</h1><p className="muted">{c.description}</p><p><b>₹{c.price_inr}</b></p></section><div className="card"><h2>Modules</h2>{mods?.map((m,i)=><div className="card module" key={m.id}><div><b>Module {i+1}: {m.title}</b><p className="muted">{m.description}</p></div><a className="btn" href={`/course/${id}/access`}>Access</a></div>)}</div></main>
}