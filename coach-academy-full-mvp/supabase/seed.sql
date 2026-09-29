-- Optional starter data. Run after schema.sql.
insert into public.courses(slug,title,description,price_inr,published) values
('sql','SQL','Master SQL from basics to interview-ready queries.',499,true),
('python','Python','Build strong Python fundamentals and practical skills.',699,true),
('java','Java','Learn Core Java and object-oriented programming.',699,true),
('soft-skills','Soft Skills','Improve communication and workplace readiness.',399,true)
on conflict(slug) do nothing;

-- After creating your coach user in Supabase Auth, run:
-- update public.profiles set role='coach' where id='YOUR-COACH-USER-UUID';
-- Then add modules and quiz_questions through the Admin UI/API or SQL.
