export default function PostCard({
  title,
  body,
  tags,
  reactions,
  views,
  userId,
}) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{body}</p>
      <p>Tags: {tags.join(", ")}</p>
      <p>
        Reactions: Likes - {reactions.likes}, Dislikes - {reactions.dislikes}
      </p>
      <p>Views: {views}</p>
      <p>User ID: {userId}</p>
    </div>
  );
}
