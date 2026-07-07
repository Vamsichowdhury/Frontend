import { useState, useEffect } from "react";
import Card from "./Card";
import styles from "./RickAndMorty.module.css";

export default function RickAndMorty() {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortingOrder, setSortingOrder] = useState("a-z");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "https://rickandmortyapi.com/api/character",
        );
        const data = await response.json();
        setData(data.results);
        console.log("Fetched data:", data.results);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const searchText = e.target.value.toLowerCase();
    setSearchText(searchText);
  };

  const filteredData = data.filter(
    (character) =>
      character.name.toLowerCase().includes(searchText) &&
      (filter === "all" || character.status.toLowerCase() === filter),
  );
  const sortedData = filteredData.sort((a, b) => {
    if (sortingOrder === "a-z") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
  return (
    <div>
      <h1>Rick and Morty</h1>
      <input
        type="text"
        placeholder="search character..."
        onChange={handleSearch}
      />
      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="alive">Alive</option>
        <option value="dead">Dead</option>
        <option value="unknown">Unknown</option>
      </select>
      <select onChange={(e) => setSortingOrder(e.target.value)}>
        <option value="a-z">A-Z</option>
        <option value="z-a">Z-A</option>
      </select>
      <div className={styles.cardContainer}>
        {sortedData.length > 0 ? (
          sortedData.map((character) => {
            return (
              <div key={character.id}>
                <Card character={character} />
              </div>
            );
          })
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
