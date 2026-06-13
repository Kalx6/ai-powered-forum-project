/**
 * Post Question Page — /questions/ask
 * Two sections:
 *   1. Orange-bordered tips card ("Write questions people can answer in one pass")
 *   2. Form card: Title + rich-text body + AI Draft Coach + submit
 *
 * States: idle | validating | submitting | error | success
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  createQuestion,
  generateQuestionDraftCoach,
} from "../../services/question/question.service";
import styles from "./PostQuestion.module.css";

/* ─── tiny inline rich-text toolbar (B / I / code / link) ──────────────────── */
function ToolbarBtn({ title, children, onAction }) {
  return (
    <button
      type="button"
      title={title}
      className={styles.toolbar__btn}
      onMouseDown={(e) => {
        e.preventDefault();
        onAction();
      }}
    >
      {children}
    </button>
  );
}

function RichToolbar({ textareaRef, value, onChange }) {
  function wrap(before, after = before) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || "text";
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    onChange(next);
    // restore caret after React re-render
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        s + before.length,
        s + before.length + selected.length,
      );
    }, 0);
  }

  return (
    <div className={styles.toolbar}>
      <ToolbarBtn title="Bold" onAction={() => wrap("**")}>
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn title="Italic" onAction={() => wrap("_")}>
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn title="Inline code" onAction={() => wrap("`")}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Link" onAction={() => wrap("[", "](url)")}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </ToolbarBtn>
      <span className={styles.toolbar__count}>{value.length} characters</span>
    </div>
  );
}

/* ─── success screen ────────────────────────────────────────────────────────── */
function SuccessScreen({ questionHash, onAskAnother, onDashboard }) {
  const navigate = useNavigate();
  return (
    <div className={styles.success}>
      <div className={styles.success__icon} aria-hidden="true">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22C55E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h2 className={styles.success__heading}>Thread published</h2>
      <p className={styles.success__body}>
        Your post is indexed for keyword search and embedding-based similarity.
        Share the link in study groups, or stay on the thread to answer
        follow-up questions from peers.
      </p>
      <div className={styles.success__actions}>
        <button
          type="button"
          className={styles.success__textBtn}
          onClick={onDashboard}
        >
          Back to Dashboard
        </button>
        {questionHash && (
          <button
            type="button"
            className={styles.success__primaryBtn}
            onClick={() => navigate(`/question/${questionHash}`)}
          >
            View Question
          </button>
        )}
        <button
          type="button"
          className={styles.success__secondaryBtn}
          onClick={onAskAnother}
        >
          Ask Another
        </button>
      </div>
    </div>
  );
}

/* ─── main page ─────────────────────────────────────────────────────────────── */
export default function PostQuestion() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState(null);
  const [successHash, setSuccessHash] = useState(null); // null = form, string/true = success

  /* ── validation ──────────────────────────────────────────────────────────── */
  function validate() {
    let ok = true;
    if (title.trim().length < 5) {
      setTitleError("Question title must be at least 5 characters");
      ok = false;
    } else {
      setTitleError("");
    }
    if (content.trim().length < 10) {
      setContentError("Question content must be at least 10 characters");
      ok = false;
    } else {
      setContentError("");
    }
    return ok;
  }

  /* ── AI draft coach ──────────────────────────────────────────────────────── */
  async function handleCoach() {
    if (!validate()) return;
    setIsCoaching(true);
    setCoachFeedback(null);
    try {
      const res = await generateQuestionDraftCoach({ title, content });
      setCoachFeedback(res);
    } catch {
      setCoachFeedback({
        tips: [
          "Could not reach the AI coach. Try again or proceed with posting.",
        ],
      });
    } finally {
      setIsCoaching(false);
    }
  }

  /* ── submit ──────────────────────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await createQuestion({ title, content });
      const hash = res?.questionHash || res?.data?.questionHash || true;
      setSuccessHash(hash);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Failed to post question. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setTitleError("");
    setContentError("");
    setSubmitError("");
    setCoachFeedback(null);
    setSuccessHash(null);
  }

  /* ── success screen ──────────────────────────────────────────────────────── */
  if (successHash) {
    return (
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <p className={styles.pageHeader__eyebrow}>ASK THE COHORT</p>
          <h1 className={styles.pageHeader__heading}>Publish to the forum</h1>
          <p className={styles.pageHeader__sub}>
            Public threads help the whole cohort. Write as if a classmate will
            debug your issue tomorrow. They only know what you put on the page.
          </p>
        </header>
        <div className={styles.card}>
          <SuccessScreen
            questionHash={typeof successHash === "string" ? successHash : null}
            onAskAnother={resetForm}
            onDashboard={() => navigate("/dashboard")}
          />
        </div>
      </div>
    );
  }

  /* ── form ────────────────────────────────────────────────────────────────── */
  return (
    <div className={styles.page}>
      {/* page header */}
      <header className={styles.pageHeader}>
        <p className={styles.pageHeader__eyebrow}>ASK THE COHORT</p>
        <h1 className={styles.pageHeader__heading}>Publish to the forum</h1>
        <p className={styles.pageHeader__sub}>
          Public threads help the whole cohort. Write as if a classmate will
          debug your issue tomorrow. They only know what you put on the page.
        </p>
      </header>

      {/* tips card */}
      <div className={styles.tips}>
        <h2 className={styles.tips__heading}>
          Write questions people can answer in one pass
        </h2>
        <p className={styles.tips__intro}>
          Mentors volunteer their time. Give them runnable context, expected vs
          actual behavior, and a tight scope so they can reproduce the issue
          without guessing your setup.
        </p>

        <h3 className={styles.tips__subheading}>Checklist before you post</h3>
        <ul className={styles.tips__list}>
          <li>
            <strong>Title as a headline</strong> that states the symptom and
            tech stack (e.g., "React 19: state resets after navigation").
          </li>
          <li>
            <strong>Repro steps</strong> numbered, with environment (OS,
            browser, Node version) when it matters.
          </li>
          <li>
            <strong>Minimal code</strong> in fenced markdown blocks; trim
            unrelated lines so readers scan faster.
          </li>
          <li>
            <strong>Exact errors</strong> copied verbatim, including stack trace
            snippets when debugging backend routes.
          </li>
        </ul>

        <h3 className={styles.tips__subheading}>
          Validation rules (enforced by the form)
        </h3>
        <ul className={styles.tips__list}>
          <li>
            <strong>Title length:</strong> Must be between 5 and 255 characters.
          </li>
          <li>
            <strong>Body length:</strong> Must contain a minimum of 10
            characters detailing your problem.
          </li>
          <li>
            <strong>Single topic:</strong> Split unrelated bugs into separate
            threads so search and embeddings stay precise.
          </li>
        </ul>
      </div>

      {/* form card */}
      <div className={styles.card}>
        {submitError && (
          <div className={styles.submitError} role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* title */}
          <div className={styles.field}>
            <label className={styles.field__label} htmlFor="q-title">
              Title
            </label>
            <p className={styles.field__hint}>
              Be specific and imagine you're asking a question to another
              person.
            </p>
            <input
              id="q-title"
              type="text"
              className={`${styles.field__input} ${titleError ? styles["field__input--error"] : ""}`}
              placeholder="e.g. How do I handle state management using Context API in React?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              disabled={isSubmitting}
              maxLength={255}
            />
            {titleError && (
              <p className={styles.field__error} role="alert">
                {titleError}
              </p>
            )}
          </div>

          {/* body */}
          <div className={styles.field}>
            <label className={styles.field__label} htmlFor="q-content">
              What are the details of your problem?
            </label>
            <p className={styles.field__hint}>
              Introduce the problem and expand on what you put in the title.
              Minimum 10 characters.
            </p>
            <div
              className={`${styles.richEditor} ${contentError ? styles["richEditor--error"] : ""}`}
            >
              <RichToolbar
                textareaRef={textareaRef}
                value={content}
                onChange={(v) => {
                  setContent(v);
                  if (contentError) setContentError("");
                }}
              />
              <textarea
                id="q-content"
                ref={textareaRef}
                className={styles.richEditor__textarea}
                placeholder="Include all the information someone would need to answer your question… You can use Markdown to format your code!"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (contentError) setContentError("");
                }}
                disabled={isSubmitting}
                rows={10}
              />
            </div>
            {contentError && (
              <p className={styles.field__error} role="alert">
                {contentError}
              </p>
            )}
          </div>

          {/* AI coach row */}
          <div className={styles.coachRow}>
            <button
              type="button"
              className={styles.coachRow__btn}
              onClick={handleCoach}
              disabled={isCoaching || isSubmitting}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
              {isCoaching ? "Analyzing…" : "AI suggestions"}
            </button>
            <span className={styles.coachRow__note}>
              Suggestions only. You still choose what to post.
            </span>
            <hr className={styles.coachRow__divider} />
          </div>
          

          {/* coach feedback panel */}
          {coachFeedback && (
            <div
              className={styles.coachPanel}
              role="region"
              aria-label="AI feedback"
            >
              <p className={styles.coachPanel__heading}>
                AI Draft Coach feedback
              </p>
              {Array.isArray(coachFeedback.tips) &&
              coachFeedback.tips.length > 0 ? (
                <ul className={styles.coachPanel__list}>
                  {coachFeedback.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.coachPanel__empty}>
                  No suggestions — your draft looks solid!
                </p>
              )}
            </div>
          )}

          {/* form actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.formActions__cancel}
              onClick={() => navigate("/dashboard")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.formActions__submit}
              disabled={isSubmitting || isCoaching}
            >
              {isSubmitting ? (
                <>Posting…</>
              ) : (
                <>
                  Post Question
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
