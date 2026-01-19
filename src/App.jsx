import React, { useReducer, useEffect, useCallback, useState } from "react";
import SelectField from "./components/Select";
import listOfGenreOption from "./store/genre.json";
import listOfMoodOption from "./store/mood.json";
import "./App.css";

const initialState = {
  genre: "",
  mood: "",
  level: "",
  aiResponses: [],
  availableMoodBasedOnGenre: []
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_GENRE":
      return { ...state, genre: action.payload, mood: "" };
    case "SET_MOOD":
      return { ...state, mood: action.payload };
    case "SET_LEVEL":
      return { ...state, level: action.payload };
    case "SET_AVAILABLE_MOOD":
      return { ...state, availableMoodBasedOnGenre: action.payload };
    case "ADD_RESPONSE":
      return { ...state, aiResponses: [...state.aiResponses, action.payload] };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { genre, mood, level, aiResponses, availableMoodBasedOnGenre } = state;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch({ type: "SET_AVAILABLE_MOOD", payload: listOfMoodOption[genre] || [] });
  }, [genre]);

  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) return;
    setLoading(true);
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. For each book, provide the title, author, and a brief explanation of why it matches their mood and reading level. Format it clearly.`
            }
          ]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "No recommendations available";
      dispatch({ type: "ADD_RESPONSE", payload: { text } });
    } catch (err) {
      console.error(err);
      dispatch({ type: "ADD_RESPONSE", payload: { text: "Error fetching recommendations. Please try again." } });
    } finally {
      setLoading(false);
    }
  }, [genre, mood, level]);

  return (
    <div className="app">
      <div className="card">
        <h1 className="title">AI Book Recommender</h1>
        <p className="subtitle">Discover books that match your mood and reading level</p>

        <div className="form">
          <SelectField
            placeholder="Select genre"
            id="genre"
            options={listOfGenreOption}
            onSelect={v => dispatch({ type: "SET_GENRE", payload: v })}
            value={genre}
          />

          <SelectField
            placeholder="Select mood"
            id="mood"
            options={availableMoodBasedOnGenre}
            onSelect={v => dispatch({ type: "SET_MOOD", payload: v })}
            value={mood}
          />

          <SelectField
            placeholder="Select level"
            id="level"
            options={["Beginner", "Intermediate", "Expert"]}
            onSelect={v => dispatch({ type: "SET_LEVEL", payload: v })}
            value={level}
          />

          <button
            className="btn"
            onClick={fetchRecommendations}
            disabled={loading}
          >
            {loading ? "Finding books..." : "Get Recommendations"}
          </button>
        </div>

        {loading && <div className="loader"></div>}

        <div className="results">
          {aiResponses.map((recommend, index) => (
            <div className="result-card" key={index}>
              <h3>Recommendation {index + 1}</h3>
              <p>{recommend.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}