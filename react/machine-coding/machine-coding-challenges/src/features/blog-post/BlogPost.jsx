import PostCard from "./PostCard";
import data from "./data.js";
export default function BlogPost() {
  return (
    <>
      <h1>Blog Post</h1>
      {data.map((post) => {
        return (
          <div
            key={post.id}
            style={{
              border: "1px solid red",
              marginBottom: "10px",
              padding: "10px",
              width: "500px",
              margin: "auto",
            }}
          >
            <PostCard
              title={post.title}
              body={post.body}
              tags={post.tags}
              reactions={post.reactions}
              views={post.views}
              userId={post.userId}
            />
          </div>
        );
      })}
    </>
  );
}
