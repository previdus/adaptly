'use client';

import React, { useMemo, useState, type FormEvent } from 'react';
import QuestionDiagram from '../QuestionDiagram';
import { Check } from 'lucide-react';
import type { Attempt, Question } from '../../lib/learning';
import {
  buildGuidedHintSteps,
  buildManipulativeModel,
} from '../../lib/ux-variants';

type Props = {
  q: Question;
  answer: string;
  result: Attempt | null;
  hintOpen: boolean;
  onAnswer: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCloseHint: () => void;
};

function TactileManipulativeView({ q }: { q: Question }) {
  const model = useMemo(() => buildManipulativeModel(q), [q]);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [splitAt, setSplitAt] = useState<number>(() =>
    model.kind === 'array-splitter' ? model.splitRow : 1
  );
  const [revealCarry, setRevealCarry] = useState<boolean>(false);
  const [hopIndex, setHopIndex] = useState<number>(0);

  if (q.diagram) return <QuestionDiagram diagram={q.diagram}/>;

  if (model.kind === 'array-splitter') {
    const clampedSplit = Math.min(model.rows - 1, Math.max(1, splitAt));
    const topPart = clampedSplit * model.cols;
    const bottomPart = (model.rows - clampedSplit) * model.cols;

    return (
      <div
        className="manipulative-box"
        data-testid="tactile-manipulative"
        data-manipulative-kind="array-splitter"
      >
        <div className="manipulative-header">
          <span>🧮 Touchable Array Explorer</span>
          <span>
            Tap rows to skip-count ({model.rows} × {model.cols})
          </span>
        </div>
        <div className="array-Interactive-rows">
          {model.rowTotals.map((runningTotal, idx) => {
            const isHighlighted = idx <= selectedRow;
            return (
              <button
                key={idx}
                type="button"
                className="array-row-btn"
                aria-pressed={isHighlighted}
                data-testid={`array-row-toggle-${idx}`}
                onClick={() => setSelectedRow(idx)}
              >
                <span>
                  Row {idx + 1}:{' '}
                  {Array.from({ length: Math.min(8, model.cols) }, () => '★').join(
                    ' '
                  )}
                </span>
                <strong data-testid={`array-row-sum-${idx}`}>
                  = {runningTotal}
                </strong>
              </button>
            );
          })}
        </div>
        {model.rows >= 3 && (
          <div className="array-split-bar">
            <label htmlFor="array-split-range">
              Split into friendly chunks:
            </label>
            <input
              id="array-split-range"
              type="range"
              min={1}
              max={model.rows - 1}
              value={clampedSplit}
              data-testid="array-split-slider"
              onChange={(e) => setSplitAt(Number(e.target.value))}
            />
            <span data-testid="array-split-equation">
              ({clampedSplit} × {model.cols} = {topPart}) + (
              {model.rows - clampedSplit} × {model.cols} = {bottomPart})
            </span>
          </div>
        )}
      </div>
    );
  }

  if (model.kind === 'column-carry') {
    return (
      <div
        className="manipulative-box"
        data-testid="tactile-manipulative"
        data-manipulative-kind="column-carry"
      >
        <div className="manipulative-header">
          <span>🧱 Place-Value Workboard</span>
          <span>
            {model.a} {model.operator} {model.b}
          </span>
        </div>
        <div className="carry-workboard" data-testid="carry-workboard">
          <div className="carry-columns">
            <span>Ones → {model.onesProductOrSum}</span>
            <span>|</span>
            <span>Keep {model.onesDigit}</span>
            {revealCarry && (
              <span data-testid="carry-revealed-badge">
                | Regroup: +{model.carryValue} ten ({model.tensStepLabel})
              </span>
            )}
          </div>
          <button
            type="button"
            className="manip-chip-btn"
            aria-pressed={revealCarry}
            data-testid="carry-toggle-btn"
            onClick={() => setRevealCarry((prev) => !prev)}
          >
            {revealCarry ? 'Hide Regroup Step' : 'Inspect Regroup / Carry'}
          </button>
        </div>
      </div>
    );
  }

  if (model.kind === 'number-track') {
    const activeStop = model.stopsA[hopIndex % model.stopsA.length] ?? model.jumpA;
    return (
      <div
        className="manipulative-box"
        data-testid="tactile-manipulative"
        data-manipulative-kind="number-track"
      >
        <div className="manipulative-header">
          <span>🦘 Interactive Skip-Track ({model.mode.toUpperCase()})</span>
          <button
            type="button"
            className="manip-chip-btn"
            data-testid="track-hop-btn"
            onClick={() => setHopIndex((prev) => prev + 1)}
          >
            Hop along track → ({activeStop})
          </button>
        </div>
        <div className="track-stops-row">
          {model.stopsA.map((val, idx) => (
            <span
              key={`a-${val}-${idx}`}
              className={
                'track-stop-pill ' +
                (idx === hopIndex % model.stopsA.length ? 'is-active ' : '') +
                (val === model.meetingPoint ? 'is-meet' : '')
              }
            >
              {val}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="manipulative-box"
      data-testid="tactile-manipulative"
      data-manipulative-kind="word-chips"
    >
      <div className="manipulative-header">
        <span>🔎 Question Inspector</span>
        <span>{model.tokens.length} words</span>
      </div>
      <div className="track-stops-row">
        {model.tokens.map((tok, idx) => (
          <span key={`${tok}-${idx}`} className="track-stop-pill">
            {tok}
          </span>
        ))}
      </div>
    </div>
  );
}

function GuidedRescueHintView({
  q,
  onSelectFinalAnswer,
  onCloseHint,
}: {
  q: Question;
  onSelectFinalAnswer: (val: string) => void;
  onCloseHint: () => void;
}) {
  const steps = useMemo(() => buildGuidedHintSteps(q), [q]);
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [feedback, setFeedback] = useState('');

  const activeStepIndex = step1Done ? 1 : 0;
  const activeStep = steps[activeStepIndex];

  function handlePick(choice: string) {
    if (activeStepIndex === 0) {
      if (choice === steps[0].expected) {
        setStep1Done(true);
        setFeedback('Spot on! Now complete Step 2.');
      } else {
        setFeedback(`Try checking ${steps[0].expected} first.`);
      }
      return;
    }

    if (choice === steps[1].expected) {
      setStep2Done(true);
      setFeedback('Rescue complete! Your answer is filled in.');
      onSelectFinalAnswer(choice);
    } else {
      setFeedback('Almost there! Check the Step 1 bridge clue.');
    }
  }

  return (
    <div
      className="guided-hint-card"
      role="status"
      data-testid="guided-hint-box"
    >
      <div className="guided-hint-step-label">
        <span>
          💡 Interactive 2-Step Rescue · Step {activeStepIndex + 1} of 2
        </span>
        <button
          type="button"
          className="manip-chip-btn"
          onClick={onCloseHint}
        >
          Close hint
        </button>
      </div>
      <p className="guided-hint-prompt" data-testid="guided-hint-prompt">
        {activeStep.prompt}
      </p>
      <div className="guided-choices-row">
        {activeStep.choices.map((choice, idx) => {
          const isStepSolved =
            (activeStepIndex === 0 && step1Done && choice === steps[0].expected) ||
            (activeStepIndex === 1 && step2Done && choice === steps[1].expected);
          return (
            <button
              key={`${choice}-${idx}`}
              type="button"
              className={
                'guided-choice-btn ' + (isStepSolved ? 'is-correct' : '')
              }
              data-testid={`hint-step-${activeStepIndex + 1}-choice-${idx}`}
              data-choice-value={choice}
              onClick={() => handlePick(choice)}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {(feedback || activeStep.bridgeNote) && (
        <p className="guided-bridge-note" data-testid="guided-hint-feedback">
          {feedback || activeStep.bridgeNote}
        </p>
      )}
    </div>
  );
}

export default function TactilePracticePanel({
  q,
  answer,
  result,
  hintOpen,
  onAnswer,
  onSubmit,
  onCloseHint,
}: Props) {
  const disabled = !!result;

  function appendDigit(digit: string) {
    if (disabled) return;
    const next = (answer + digit).replace(/^0+(?=\d)/, '').slice(0, 7);
    onAnswer(next);
  }

  function backspace() {
    if (disabled) return;
    onAnswer(answer.slice(0, -1));
  }

  function clearAll() {
    if (disabled) return;
    onAnswer('');
  }

  return (
    <div className="tactile-lab-stack" key={q.prompt}>
      {!result && <TactileManipulativeView q={q} />}

      {hintOpen && !result && (
        <GuidedRescueHintView
          q={q}
          onSelectFinalAnswer={(val) => onAnswer(val)}
          onCloseHint={onCloseHint}
        />
      )}

      <form
        className={'tactile-answer-form ' + (q.options ? 'has-choices' : '')}
        onSubmit={onSubmit}
      >
        {q.options ? (
          <>
            <label>Tap your answer</label>
            <div
              className="grammar-options"
              role="radiogroup"
              aria-label="Answer choices"
            >
              {q.options.map((option, i) => (
                <button
                  type="button"
                  role="radio"
                  key={option}
                  className={
                    'grammar-option ' +
                    (answer === option ? 'selected' : '') +
                    (result && option === q.answer ? ' correct-option' : '') +
                    (result && answer === option && !result.correct
                      ? ' wrong-option'
                      : '')
                  }
                  onClick={() => onAnswer(option)}
                  disabled={disabled}
                  aria-checked={answer === option}
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  {option}
                </button>
              ))}
            </div>
            <button
              className="check-answer choice-check"
              disabled={disabled || answer.trim() === ''}
              aria-label="Check selected answer"
            >
              <Check size={20} />
              <span>Lock In Answer</span>
            </button>
          </>
        ) : (
          <div className="tactile-keypad-shell" data-testid="tactile-keypad">
            <div className="tactile-readout-row">
              <label htmlFor="answer">3D Tactile Answer Pad</label>
              <input
                id="answer"
                inputMode="none"
                type="text"
                value={answer}
                onChange={(e) =>
                  onAnswer(e.target.value.replace(/\D/g, '').slice(0, 7))
                }
                placeholder="?"
                disabled={disabled}
                required
                aria-label="Your answer"
                autoComplete="off"
                data-testid="tactile-answer-input"
              />
            </div>

            <div
              className="tactile-keypad-grid"
              role="group"
              aria-label="Number keypad"
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
                <button
                  key={d}
                  type="button"
                  className="keypad-btn"
                  disabled={disabled}
                  data-testid={`keypad-digit-${d}`}
                  onClick={() => appendDigit(d)}
                >
                  {d}
                </button>
              ))}
              <button
                type="button"
                className="keypad-btn keypad-btn-clear"
                disabled={disabled || !answer}
                data-testid="keypad-backspace"
                aria-label="Backspace digit"
                onClick={backspace}
              >
                ⌫
              </button>
              <button
                type="button"
                className="keypad-btn keypad-btn-clear"
                disabled={disabled || !answer}
                data-testid="keypad-clear"
                aria-label="Clear answer"
                onClick={clearAll}
              >
                C
              </button>
              <button
                type="submit"
                className="keypad-btn keypad-btn-submit"
                disabled={disabled || answer.trim() === ''}
                data-testid="keypad-submit"
                aria-label="Submit answer"
              >
                <Check size={18} /> Lock In ({answer || '?'})
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
