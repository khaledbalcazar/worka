"use client";

import { useMemo, useState } from "react";

// Worka Play: juegos cortos diarios (como los de LinkedIn) que además
// preparan al candidato para entrevistas.

const QUIZ: { q: string; options: string[]; correct: number; tip: string }[] = [
  {
    q: "¿Qué conviene llevar a una entrevista presencial?",
    options: [
      "Nada, con ir alcanza",
      "CV impreso y cédula",
      "Solo el celular",
      "Un familiar de apoyo",
    ],
    correct: 1,
    tip: "Llevar tu CV impreso y tu cédula muestra preparación y agiliza el papeleo.",
  },
  {
    q: "Si una oferta te pide una 'pequeña inversión inicial'…",
    options: [
      "Es una oportunidad única",
      "Pago solo si es poco",
      "Es una estafa: nunca se paga por trabajar",
      "Depende de la empresa",
    ],
    correct: 2,
    tip: "Ningún empleo real te cobra por empezar. Denunciá esas ofertas en Worka.",
  },
  {
    q: "¿Cuál es la mejor respuesta a '¿por qué querés este trabajo?'",
    options: [
      "Porque necesito plata",
      "Porque queda cerca",
      "Conecto lo que sé hacer con lo que busca la empresa",
      "No sé, me anoté a todo",
    ],
    correct: 2,
    tip: "Mostrá que entendés el puesto y qué aportás vos. Eso te separa del montón.",
  },
  {
    q: "¿Cuándo conviene llegar a la entrevista?",
    options: [
      "Justo a la hora",
      "10-15 minutos antes",
      "Media hora tarde con excusa",
      "El día siguiente",
    ],
    correct: 1,
    tip: "Llegar un poco antes te da tiempo a calmarte y causa buena impresión.",
  },
  {
    q: "En tu CV, ¿qué es lo más importante?",
    options: [
      "Que sea largo",
      "Colores llamativos",
      "Datos de contacto correctos y experiencia clara",
      "Poner todos tus hobbies",
    ],
    correct: 2,
    tip: "Si tu número está mal escrito, la empresa no puede llamarte. Revisalo siempre.",
  },
];

const WORDS = ["CAJERO", "SUELDO", "OFICIO", "TALLER", "LEGAJO"];

function todayWord(): string {
  const day = Math.floor(Date.now() / 86400000);
  return WORDS[day % WORDS.length];
}

export default function GamesPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-lg lg:text-2xl font-bold text-primary-dark">
          🎮 Worka Play
        </h1>
        <p className="text-sm text-gray-500">
          Un ratito por día: jugá, aprendé a conseguir trabajo y volvé mañana
          por más.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Quiz />
        <WordGame />
      </div>
      <section className="card p-5">
        <h2 className="font-semibold text-primary-dark mb-2">
          🎯 Preparate para la entrevista
        </h2>
        <ul className="space-y-1.5 text-sm text-gray-600">
          <li>• Investigá la empresa 10 minutos antes de ir.</li>
          <li>• Practicá en voz alta tu presentación de 30 segundos.</li>
          <li>• Prepará 2 preguntas para hacerle a la empresa.</li>
          <li>• Ropa limpia y prolija vale más que ropa cara.</li>
          <li>• Apagá el celular antes de entrar.</li>
        </ul>
      </section>
    </div>
  );
}

function Quiz() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = step >= QUIZ.length;

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-primary-dark">🧠 Quiz laboral</h2>
        <span className="text-xs text-gray-400">
          {done ? "Terminado" : `${step + 1} / ${QUIZ.length}`}
        </span>
      </div>
      {done ? (
        <div className="text-center py-6 animate-pop">
          <p className="text-4xl mb-2">
            {score === QUIZ.length ? "🏆" : score >= 3 ? "🎉" : "💪"}
          </p>
          <p className="font-bold text-primary-dark">
            {score} de {QUIZ.length} correctas
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {score === QUIZ.length
              ? "¡Perfecto! Estás listo/a para cualquier entrevista."
              : "Mañana hay preguntas nuevas. ¡Seguí practicando!"}
          </p>
          <button
            className="btn-secondary mt-4"
            onClick={() => {
              setStep(0);
              setScore(0);
              setPicked(null);
            }}
          >
            Jugar de nuevo
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700">{QUIZ[step].q}</p>
          <div className="space-y-2 mt-3">
            {QUIZ[step].options.map((opt, i) => {
              const isPicked = picked === i;
              const isCorrect = i === QUIZ[step].correct;
              return (
                <button
                  key={opt}
                  disabled={picked !== null}
                  onClick={() => {
                    setPicked(i);
                    if (isCorrect) setScore((s) => s + 1);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                    picked === null
                      ? "border-gray-200 hover:border-primary"
                      : isCorrect
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                        : isPicked
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-gray-100 text-gray-400"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="mt-3 animate-fade-up">
              <p className="text-xs text-gray-600 bg-blue-50 rounded-xl px-3 py-2">
                💡 {QUIZ[step].tip}
              </p>
              <button
                className="btn-primary w-full mt-2"
                onClick={() => {
                  setStep((s) => s + 1);
                  setPicked(null);
                }}
              >
                {step + 1 === QUIZ.length ? "Ver resultado" : "Siguiente"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function WordGame() {
  const word = useMemo(todayWord, []);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const won = guesses.includes(word);
  const lost = !won && guesses.length >= 5;

  function submit() {
    const guess = draft.toUpperCase().replace(/[^A-ZÑ]/g, "");
    if (guess.length !== 6 || guesses.includes(guess)) return;
    setGuesses((g) => [...g, guess]);
    setDraft("");
  }

  function letterClass(guess: string, i: number): string {
    if (guess[i] === word[i]) return "bg-emerald-500 text-white";
    if (word.includes(guess[i])) return "bg-amber-400 text-white";
    return "bg-gray-200 text-gray-500";
  }

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-primary-dark">🔤 Palabra del día</h2>
        <span className="text-xs text-gray-400">{guesses.length}/5 intentos</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Una palabra del mundo del trabajo, 6 letras. 🟩 posición correcta, 🟨
        está pero en otro lugar.
      </p>
      <div className="space-y-1.5">
        {guesses.map((g) => (
          <div key={g} className="flex gap-1.5">
            {g.split("").map((ch, i) => (
              <span
                key={i}
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${letterClass(g, i)}`}
              >
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>
      {won ? (
        <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2.5 mt-3 animate-pop">
          🎉 ¡Adivinaste! Mañana hay una palabra nueva.
        </p>
      ) : lost ? (
        <p className="text-sm text-gray-600 bg-surface rounded-xl px-3 py-2.5 mt-3">
          La palabra era <strong>{word}</strong>. ¡Mañana tenés revancha!
        </p>
      ) : (
        <div className="flex gap-2 mt-3">
          <input
            className="input flex-1 uppercase tracking-widest"
            maxLength={6}
            placeholder="ESCRIBÍ"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button
            className="btn-primary shrink-0"
            disabled={draft.length !== 6}
            onClick={submit}
          >
            Probar
          </button>
        </div>
      )}
    </section>
  );
}
