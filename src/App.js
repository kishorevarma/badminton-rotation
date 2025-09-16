import React, { useState } from "react";

export default function App() {
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
    if (parsed.length !== 7) {
      setError("Please enter exactly 7 names.");
      return;
    }
    setNames(parsed);

    const sched = [];
    const sitting = Array(7).fill(false);
    let order = [...parsed];

    for (let m = 0; m < numMatches; m++) {
      // pick 4 players who didn't sit last match
      let playing = [];
      for (let i = 0; i < 7; i++) {
        if (!sitting[i] && playing.length < 4) playing.push(order[i]);
      }
      // if less than 4 (first match), fill from sitting
      if (playing.length < 4) {
        for (let i = 0; i < 7; i++) {
          if (!playing.includes(order[i])) playing.push(order[i]);
          if (playing.length === 4) break;
        }
      }
      // assign teams
      const team1 = [playing[0], playing[1]];
      const team2 = [playing[2], playing[3]];
      const sitPlayers = order.filter((p) => !playing.includes(p));
      sched.push({ team1, team2, sit: sitPlayers });
      // update sitting for next match
      sitting.fill(false);
      sitPlayers.forEach((p) => {
        sitting[order.indexOf(p)] = true;
      });
      // rotate order for next match to vary teams
      order.push(order.shift());
    }
    setSchedule(sched);
  }

  function printableText() {
    if (!schedule) return "";
    return schedule
      .map(
        (match, i) =>
          `Match ${i + 1}: Team1 — ${match.team1.join(
            ", "
          )}, Team2 — ${match.team2.join(", ")}, Sit — ${match.sit.join(", ")}`
      )
      .join("\n");
  }

  function copyPrintable() {
    const text = printableText();
    if (!text) return;
    navigator.clipboard?.writeText(text);
    alert("Schedule copied to clipboard!");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-start justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-2">
          Badminton 7-player Teams
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter exactly 7 names (comma or newline separated). Generates teams
          for each match.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="One per line or comma separated"
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

        {schedule && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Match</th>
                <th className="border border-gray-300 p-2">Team 1</th>
                <th className="border border-gray-300 p-2">Team 2</th>
                <th className="border border-gray-300 p-2">Sitting</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((match, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center font-medium">
                    {i + 1}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {match.team1.join(", ")}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {match.team2.join(", ")}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {match.sit.join(", ")}
                  </td>
                </tr>
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
