const {useState, useEffect} = React;

function useLocalStorage(key, initial){
  const [state, setState] = useState(()=>{
    try{ const v = localStorage.getItem(key); return v? JSON.parse(v) : initial }catch(e){ return initial }
  });
  useEffect(()=>{ localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
}

function NewPost({onCreate}){
  const [text, setText] = useState('');
  function submit(e){
    e.preventDefault();
    if(!text.trim()) return;
    onCreate({id:Date.now().toString(), text: text.trim(), createdAt: new Date().toISOString(), likes:0, comments:[]});
    setText('');
  }
  return (
    <div className="card new-post">
      <form onSubmit={submit}>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's happening?"></textarea>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}>
          <button type="submit">Post</button>
        </div>
      </form>
    </div>
  );
}

function Post({p, onLike, onComment}){
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  function addComment(e){ e.preventDefault(); if(!comment.trim()) return; onComment(p.id, {id:Date.now().toString(), text:comment.trim(), createdAt:new Date().toISOString()}); setComment(''); setShowComment(true); }
  return (
    <div className="card post">
      <div className="avatar" />
      <div className="post-body">
        <div className="meta"><strong>User</strong><div className="small"> • {new Date(p.createdAt).toLocaleString()}</div></div>
        <div style={{marginTop:8}}>{p.text}</div>
        <div className="actions">
          <div className="action" onClick={()=>onLike(p.id)}>❤️ {p.likes}</div>
          <div className="action" onClick={()=>setShowComment(s=>!s)}>💬 {p.comments.length}</div>
        </div>
        {showComment && (
          <div className="comments-list">
            {p.comments.map(c=> (
              <div key={c.id} className="comment"><div className="small">{c.text}</div><div className="small">{new Date(c.createdAt).toLocaleString()}</div></div>
            ))}
            <form onSubmit={addComment} style={{marginTop:8,display:'flex',gap:8}}>
              <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write a comment" style={{flex:1}} />
              <button>Reply</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function App(){
  const [posts, setPosts] = useLocalStorage('simple-social-posts', []);

  function createPost(post){ setPosts([post, ...posts]); }
  function likePost(id){ setPosts(posts.map(p=> p.id===id? {...p, likes: p.likes+1} : p)); }
  function commentPost(id, comment){ setPosts(posts.map(p=> p.id===id? {...p, comments:[...p.comments, comment]} : p)); }

  return (
    <div className="app">
      <div className="header">
        <h1>Simple Social</h1>
        <div className="small">Local demo • no backend</div>
      </div>
      <NewPost onCreate={createPost} />
      <div className="posts">
        {posts.length===0 && <div className="card">No posts yet — be the first!</div>}
        {posts.map(p=> <Post key={p.id} p={p} onLike={likePost} onComment={commentPost} />)}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
