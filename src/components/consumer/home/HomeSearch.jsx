import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "../marketplace/SearchBar";

export default function HomeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSearch(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      navigate("/marketplace");
      return;
    }

    const params = new URLSearchParams({
      search: trimmed,
    });

    navigate(`/marketplace?${params.toString()}`);
  }

  return (
    <SearchBar
      value={query}
      onChange={setQuery}
      onSubmit={handleSearch}
    />
  );
}