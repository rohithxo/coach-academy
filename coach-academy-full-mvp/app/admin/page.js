"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [session, setSession] = useState(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("499");
  const [desc, setDesc] = useState("");

  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");

  const [modTitle, setModTitle] = useState("");
  const [modDesc, setModDesc] = useState("");

  const [video, setVideo] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase()
      .auth.getSession()
      .then(({ data }) => {
        setSession(data.session);

        if (data.session) {
          load(data.session);
        }
      });
  }, []);

  async function load(s) {
    const r = await fetch("/api/admin/course", {
      headers: {
        Authorization: `Bearer ${s.access_token}`,
      },
    });

    const j = await r.json();

    if (r.ok) {
      setCourses(j.courses || []);
    } else {
      setMsg(j.error || "This account is not a coach.");
    }
  }

  async function coachSend() {
    setMsg("");

    const { error } = await supabase().auth.signInWithOtp({
      phone,
    });

    if (error) {
      setMsg(error.message);
    } else {
      setSent(true);
    }
  }

  async function coachVerify() {
    const { data, error } = await supabase().auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    setSession(data.session);
    await load(data.session);
  }

  async function create() {
    const r = await fetch("/api/admin/course", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        slug,
        description: desc,
        price_inr: Number(price),
        published: true,
      }),
    });

    const j = await r.json();

    setMsg(r.ok ? "Course created" : j.error);

    if (r.ok) {
      setTitle("");
      setSlug("");
      setDesc("");
      await load(session);
    }
  }

  async function selectCourse(id) {
    setCourseId(id);
    setModuleId("");

    if (!id) {
      setModules([]);
      return;
    }

    const r = await fetch(`/api/admin/module?course_id=${id}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const j = await r.json();

    setModules(j.modules || []);
  }

  async function addModule() {
    const r = await fetch("/api/admin/module", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        course_id: courseId,
        title: modTitle,
        description: modDesc,
      }),
    });

    const j = await r.json();

    setMsg(r.ok ? "Module added" : j.error);

    if (r.ok) {
      setModTitle("");
      setModDesc("");
      await selectCourse(courseId);
    }
  }

  async function upload() {
    if (!video || !moduleId) {
      setMsg("Please select a module and video.");
      return;
    }

    setMsg("Uploading video...");

    const fd = new FormData();

    fd.append("file", video);
    fd.append("module_id", moduleId);

    const r = await fetch("/api/admin/video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: fd,
    });

    const j = await r.json();

    setMsg(
      r.ok
        ? "Video uploaded and linked to the module."
        : j.error
    );

    if (r.ok) {
      setVideo(null);
      await selectCourse(courseId);
    }
  }

  async function saveQuiz() {
    try {
      const raw = document.getElementById("quizjson").value;

      const r = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
          questions: JSON.parse(raw),
        }),
      });

      const j = await r.json();

      setMsg(
        r.ok
          ? `Saved ${j.count} quiz questions.`
          : j.error
      );
    } catch (e) {
      setMsg("Invalid quiz JSON.");
    }
  }

  if (!session) {
    return (
      <main className="container">
        <div
          className="card"
          style={{
            maxWidth: 520,
            margin: "55px auto",
          }}
        >
          <span className="badge">COACH LOGIN</span>

          <h1>Coach Admin</h1>

          <p className="muted">
            Use the coach phone number configured in Supabase.
            Only accounts with role=coach can access the dashboard.
          </p>

          <input
            className="input"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {sent && (
            <input
              className="input"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          )}

          {msg && <div className="error">{msg}</div>}

          <button
            className="btn"
            onClick={sent ? coachVerify : coachSend}
          >
            {sent ? "Verify OTP" : "Send OTP"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="hero">
        <span className="badge">COACH ADMIN</span>

        <h1>Manage your academy</h1>

        <p className="muted">
          Create courses, modules and upload lesson videos.
        </p>
      </section>

      {msg && <div className="success">{msg}</div>}

      <div className="grid">
        {/* CREATE COURSE */}
        <div className="card">
          <h2>Create course</h2>

          <input
            className="input"
            placeholder="Course title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="input"
            placeholder="slug e.g. sql"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <input
            className="input"
            placeholder="Price in INR"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <textarea
            className="input"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <button className="btn" onClick={create}>
            Create course
          </button>
        </div>

        {/* ADD MODULE */}
        <div className="card">
          <h2>Add module</h2>

          <select
            className="input"
            value={courseId}
            onChange={(e) => selectCourse(e.target.value)}
          >
            <option value="">Select course</option>

            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Module title"
            value={modTitle}
            onChange={(e) => setModTitle(e.target.value)}
          />

          <textarea
            className="input"
            placeholder="Module description"
            value={modDesc}
            onChange={(e) => setModDesc(e.target.value)}
          />

          <button className="btn" onClick={addModule}>
            Add module
          </button>
        </div>

        {/* UPLOAD VIDEO */}
        <div className="card">
          <h2>Upload lesson video</h2>

          <select
            className="input"
            value={courseId}
            onChange={(e) => selectCourse(e.target.value)}
          >
            <option value="">Select course</option>

            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
          >
            <option value="">Select module</option>

            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.position}. {m.title}
                {m.video_path ? " ✓" : ""}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              setVideo(e.target.files?.[0] || null)
            }
          />

          <br />
          <br />

          <button className="btn" onClick={upload}>
            Upload & link video
          </button>

          <p className="muted">
            The video is stored privately and students receive
            a temporary signed URL after payment.
          </p>
        </div>
      </div>

      {/* QUIZ BUILDER */}
      <div
        className="card"
        style={{ marginTop: 20 }}
      >
        <h2>Quiz builder</h2>

        <p className="muted">
          Paste a JSON array of questions for the selected course.
          Example: a question with options 3, 4, 5 and correct option 4.
        </p>

        <textarea
          id="quizjson"
          className="input"
          style={{ minHeight: 150 }}
          placeholder='[{"question":"What does SELECT do?","options":["Reads data","Deletes data","Creates data"],"correct_option":"Reads data"}]'
        />

        <button
          className="btn"
          onClick={saveQuiz}
        >
          Save quiz
        </button>
      </div>

      {/* YOUR COURSES */}
      <div
        className="card"
        style={{ marginTop: 20 }}
      >
        <h2>Your courses</h2>

        {courses.map((c) => (
          <div
            className="module"
            key={c.id}
          >
            <b>{c.title}</b>

            <span className="badge">
              ₹{c.price_inr}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
