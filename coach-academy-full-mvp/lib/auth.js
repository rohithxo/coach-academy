import {supabaseAdmin} from "./supabaseAdmin";
export async function requireUser(req){
  const auth=req.headers.get("authorization")||"";
  const token=auth.startsWith("Bearer ")?auth.slice(7):null;
  if(!token) throw new Error("Unauthorized");
  const {data,error}=await supabaseAdmin().auth.getUser(token);
  if(error||!data.user) throw new Error("Unauthorized");
  return data.user;
}
export async function requireCoach(req){
  const user=await requireUser(req);
  const {data}=await supabaseAdmin().from("profiles").select("role").eq("id",user.id).single();
  if(data?.role!=="coach") throw new Error("Coach access required");
  return user;
}
