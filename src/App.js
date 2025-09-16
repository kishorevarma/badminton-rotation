import React, { useState } from "react";

export default function App() {
  const [mode, setMode] = useState("1court");
  const [input, setInput] = useState("");
  const [numMatches, setNumMatches] = useState(7);
  const [names, setNames] = useState([]);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState(null);

  function parseInputToNames(raw) {
    return raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function generate() {
    setError(null);
    const parsed = parseInputToNames(input);
    const expected = mode === "1court" ? 7 : 9;
    if (parsed.length !== expected) {
      setError(`Please enter exactly ${expected} names.`);
      return;
    }
    setNames(parsed);

    const sched = [];
    if (mode === "1court") {
      let order = [...parsed];
      let lastSitting = [];

      for (let m = 0; m < numMatches; m++) {
        // pick 3 sitting players who didn't sit last match
        let sitPlayers = order
          .filter((p) => !lastSitting.includes(p))
          .slice(0, 3);

        // rest play
        let playing = order.filter((p) => !sitPlayers.includes(p));
        let team1 = [playing[0], playing[1]];
        let team2 = [playing[2], playing[3]];

        sched.push({ match: m + 1, team1, team2, sit: sitPlayers });

        // update last sitting players
        lastSitting = sitPlayers;

        // rotate order for next match to vary teams
        order.push(order.shift());
      }
    } else {
      // 2 courts, 9 players
      let order = [...parsed];
      let lastSitting = null;
      for (let m = 0; m < numMatches; m++) {
        const sitCandidates = order.filter((p) => p !== lastSitting);
        const sitPlayer = sitCandidates[0];
        lastSitting = sitPlayer;
        const playing = order.filter((p) => p !== sitPlayer);
        const court1 = {
          team1: [playing[0], playing[1]],
          team2: [playing[2], playing[3]],
        };
        const court2 = {
          team1: [playing[4], playing[5]],
          team2: [playing[6], playing[7]],
        };
        sched.push({ match: m + 1, courts: [court1, court2], sit: sitPlayer });
        order.push(order.shift());
      }
    }

    setSchedule(sched);
  }

  function printableText() {
    if (!schedule) return "";
    if (mode === "1court") {
      return schedule
        .map(
          (s) =>
            `Match ${s.match}: Team1 — ${s.team1.join(
              ", "
            )}, Team2 — ${s.team2.join(", ")}, Sit — ${s.sit.join(", ")}`
        )
        .join("\n");
    } else {
      return schedule
        .map(
          (s) =>
            `Match ${s.match} | Sit — ${
              s.sit
            }\nCourt 1: Team1 — ${s.courts[0].team1.join(
              ", "
            )}, Team2 — ${s.courts[0].team2.join(
              ", "
            )}\nCourt 2: Team1 — ${s.courts[1].team1.join(
              ", "
            )}, Team2 — ${s.courts[1].team2.join(", ")}`
        )
        .join("\n\n");
    }
  }

  function copyPrintable() {
    const text = printableText();
    if (!text) return;
    navigator.clipboard?.writeText(text);
    alert("Schedule copied to clipboard!");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-2">
          Badminton Team Scheduler
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Generate team schedules for either 1 court (7 players) or 2 courts (9
          players).
        </p>

        <div className="mb-3">
          <label className="mr-4">
            <input
              type="radio"
              checked={mode === "1court"}
              onChange={() => {
                setMode("1court");
                setSchedule(null);
                setInput("");
              }}
            />{" "}
            1 Court, 7 Players
          </label>
          <label>
            <input
              type="radio"
              checked={mode === "2courts"}
              onChange={() => {
                setMode("2courts");
                setSchedule(null);
                setInput("");
              }}
            />{" "}
            2 Courts, 9 Players
          </label>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "1court" ? "Enter 7 names" : "Enter 9 names"}
          className="w-full border rounded-lg p-3 mb-3 text-sm h-28 resize-none"
        />

        <div className="flex gap-2 mb-3">
          <label className="text-sm">Number of Matches:</label>
          <input
            type="number"
            min="1"
            value={numMatches}
            onChange={(e) => setNumMatches(Number(e.target.value))}
            className="border rounded p-1 w-16"
          />
        </div>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <button
          onClick={generate}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white mb-4"
        >
          Generate Schedule
        </button>

        {schedule && mode === "1court" && (
          <table className="w-full border-collapse border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Match</th>
                <th className="border border-gray-300 p-2">Team 1</th>
                <th className="border border-gray-300 p-2">Team 2</th>
                <th className="border border-gray-300 p-2">Sitting</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s) => (
                <tr key={s.match} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center font-medium">
                    {s.match}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {s.team1?.join(", ")}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {s.team2?.join(", ")}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {s.sit?.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {schedule && mode === "2courts" && (
          <table className="w-full border-collapse border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Match</th>
                <th className="border border-gray-300 p-2">Court</th>
                <th className="border border-gray-300 p-2">Team 1</th>
                <th className="border border-gray-300 p-2">Team 2</th>
                <th className="border border-gray-300 p-2">Sitting</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s) => (
                <React.Fragment key={s.match}>
                  {s.courts.map((c, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2 text-center font-medium">
                        {s.match}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {c.team1.join(", ")}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {c.team2.join(", ")}
                      </td>
                      {idx === 0 && (
                        <td className="border border-gray-300 p-2" rowSpan={2}>
                          {s.sit}
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}

        {schedule && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={copyPrintable}
              className="px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              Copy as text
            </button>
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                printableText()
              )}`}
              download="badminton_teams.txt"
              className="px-4 py-2 rounded-xl border border-gray-300"
            >
              Download .txt
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
