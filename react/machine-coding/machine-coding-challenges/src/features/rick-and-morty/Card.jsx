import styles from "./Card.module.css";
export default function Card({ character }) {
  return (
    <div className={styles.card}>
      <img
        height={"100"}
        width={"100"}
        src={character.image}
        alt={character.name}
      ></img>
      <div>
        <strong>{character.name}</strong>
      </div>
      <div>{character.status}</div>
      <div>{character.species}</div>
    </div>
  );
}
