export default function RecepieCard({ recepie }) {
  return (
    <div
      style={{
        border: "1px solid black",
        margin: "2px",
        padding: "10px",
      }}
    >
      <h3>Name: {recepie.name}</h3>
      <p>Cuisine: {recepie.cuisine}</p>
      <h6>Rating: {recepie.rating}</h6>
    </div>
  );
}
