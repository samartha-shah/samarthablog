import React, { useState, useEffect } from 'react';
import './BlogApp.css';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  image?: string;
}

const BlogApp: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/posts')
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error('Error fetching posts:', err));
  }, []);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditId(null);
    setImage(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    const post: BlogPost = {
      id: editId ?? crypto.randomUUID(),
      title,
      content,
      createdAt: new Date().toISOString(),
      image: image || undefined,
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `http://localhost:5000/posts/${editId}`
      : 'http://localhost:5000/posts';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    })
      .then((res) => {
        if (res.ok) {
          if (editId) {
            setPosts((prev) => prev.map((p) => (p.id === editId ? post : p)));
          } else {
            setPosts((prev) => [post, ...prev]);
          }
          resetForm();
        }
      })
      .catch((err) => console.error('Error submitting post:', err));
  };

  const deletePost = (id: string) => {
    fetch(`http://localhost:5000/posts/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        if (editId === id) resetForm();
      })
      .catch((err) => console.error('Error deleting post:', err));
  };

  const startEditing = (post: BlogPost) => {
    setEditId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setImage(post.image || null);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Samartha's Blog</h1>

      {/* Form */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post..."
          style={{ width: '100%', padding: '10px', height: '100px', marginBottom: '10px' }}
        />

        {/* Image Upload */}
        <div style={{ marginBottom: '10px' }}>
          <input
            type="file"
            accept="image/*"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
          <button
            type="button"
            onClick={() => document.getElementById('fileInput')?.click()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            Upload Image
          </button>

          {image && (
            <>
              <img
                src={image}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', marginTop: '10px' }}
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  marginTop: '5px',
                  cursor: 'pointer',
                }}
              >
                Remove Image
              </button>
            </>
          )}
        </div>

        {/* Submit/Cancel */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            style={{ padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            {editId ? 'Update Post' : 'Publish'}
          </button>
          {editId && (
            <button
              onClick={resetForm}
              style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Posts */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post) => (
          <li key={post.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '5px' }}>{post.title}</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Published on {new Date(post.createdAt).toLocaleString()}
            </p>
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                style={{ maxWidth: '100%', maxHeight: '300px', margin: '10px 0' }}
              />
            )}
            <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => startEditing(post)}
                style={{ marginRight: '10px', padding: '6px 12px', backgroundColor: '#f1c40f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Edit
              </button>
              <button
                onClick={() => deletePost(post.id)}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogApp;
