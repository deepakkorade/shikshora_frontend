import { useState } from 'react';
import { Library, Plus, Search, Book, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LibraryModule() {
  const [books, setBooks] = useState([
    { id: 1, title: 'Introduction to Quantum Mechanics', author: 'David J. Griffiths', isbn: '978-1107189638', category: 'Physics', copies: 6, available: 4 }
  ]);

  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: 'Physics', copies: 1, available: 1 });

  const handleCreateBook = (e) => {
    e.preventDefault();
    setBooks([...books, { id: Date.now(), ...newBook }]);
    setShowAddForm(false);
    setNewBook({ title: '', author: '', isbn: '', category: 'Physics', copies: 1, available: 1 });
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Library Catalog</h2>
          <p className="text-sm text-text-muted">Register book catalogs, track borrowed volumes, and manage late fines.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Book
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4.5 h-4.5 text-text-muted absolute left-3 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books by title or author..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-input border border-border/40 text-sm text-foreground focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBooks.map((b) => (
          <div key={b.id} className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-md transition-all flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <Book className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1 flex-grow">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{b.category}</span>
              <h3 className="font-bold text-foreground text-sm mt-1">{b.title}</h3>
              <p className="text-xs text-text-muted">Author: {b.author}</p>
              <span className="text-[10px] text-text-muted block">ISBN: {b.isbn || 'N/A'}</span>
              
              <div className="flex gap-4 pt-2 text-[11px]">
                <span className="text-text-muted">Total Copies: <span className="font-bold text-foreground">{b.copies}</span></span>
                <span className="text-text-muted">Available: <span className="font-bold text-green-500">{b.available}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Add Book Volume</h3>
              <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleCreateBook} className="space-y-4">
              <Input label="Book Title *" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} required />
              <Input label="Author Name *" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} required />
              <Input label="ISBN Number" value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Category</label>
                  <select value={newBook.category} onChange={(e) => setNewBook({ ...newBook, category: e.target.value })} className="w-full h-11 px-3 rounded-xl bg-input border border-border/50 text-xs text-foreground focus:outline-none">
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Literature">Literature</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>
                <Input label="Total Copies *" type="number" min="1" value={newBook.copies} onChange={(e) => setNewBook({ ...newBook, copies: parseInt(e.target.value), available: parseInt(e.target.value) })} required />
              </div>
              <Button type="submit">Catalog Book</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
