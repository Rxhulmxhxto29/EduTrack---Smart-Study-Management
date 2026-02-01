import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/common/Card';
import { BookOpen, Star, Download, Eye, ArrowLeft, FileText, Calendar, User } from 'lucide-react';

// Mock notes data
const MOCK_NOTES = {
  '1': {
    _id: '1',
    title: 'Introduction to Trees',
    description: 'Complete guide to tree data structures including BST, AVL, and Red-Black trees. This comprehensive note covers all the fundamental concepts you need to understand tree-based data structures.',
    content: `
## Tree Data Structures

### What is a Tree?
A tree is a non-linear data structure that represents hierarchical relationships between elements. It consists of nodes connected by edges.

### Key Terminology
- **Root**: The topmost node of the tree
- **Parent**: A node that has child nodes
- **Child**: A node that has a parent node
- **Leaf**: A node with no children
- **Height**: The longest path from root to leaf
- **Depth**: The path length from root to a node

### Binary Search Tree (BST)
A BST is a tree where each node has at most two children, and:
- Left subtree contains only nodes with keys less than the node's key
- Right subtree contains only nodes with keys greater than the node's key

#### BST Operations
1. **Search**: O(log n) average, O(n) worst case
2. **Insert**: O(log n) average, O(n) worst case
3. **Delete**: O(log n) average, O(n) worst case

### AVL Trees
AVL trees are self-balancing BSTs where the height difference between left and right subtrees is at most 1.

### Red-Black Trees
Red-Black trees are also self-balancing BSTs with the following properties:
1. Every node is either red or black
2. The root is always black
3. Red nodes can't have red children
4. Every path from root to null has the same number of black nodes
    `,
    subject: { _id: '1', name: 'Data Structures' },
    unit: { name: 'Unit 3 - Trees' },
    tags: ['important', 'exam-focused'],
    averageRating: 4.5,
    totalRatings: 23,
    downloadCount: 156,
    viewCount: 342,
    uploadedBy: { name: 'Dr. Smith' },
    createdAt: new Date().toISOString()
  },
  '2': {
    _id: '2',
    title: 'Database Normalization',
    description: 'Understanding 1NF, 2NF, 3NF, and BCNF with practical examples.',
    content: `
## Database Normalization

### What is Normalization?
Normalization is the process of organizing data to minimize redundancy and dependency.

### First Normal Form (1NF)
- Eliminate repeating groups
- Create separate tables for each set of related data
- Identify each set of related data with a primary key

### Second Normal Form (2NF)
- Must be in 1NF
- Remove partial dependencies (non-key attributes dependent on part of a composite key)

### Third Normal Form (3NF)
- Must be in 2NF
- Remove transitive dependencies (non-key attributes dependent on other non-key attributes)

### Boyce-Codd Normal Form (BCNF)
- Must be in 3NF
- Every determinant must be a candidate key
    `,
    subject: { _id: '2', name: 'Database Systems' },
    unit: { name: 'Unit 2 - Normalization' },
    tags: ['important'],
    averageRating: 4.8,
    totalRatings: 45,
    downloadCount: 234,
    viewCount: 567,
    uploadedBy: { name: 'Prof. Johnson' },
    createdAt: new Date().toISOString()
  }
};

function NotesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState(0);
  
  const note = MOCK_NOTES[id] || MOCK_NOTES['1']; // Default to first note if not found

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRating = (rating) => {
    setUserRating(rating);
    alert(`You rated this note ${rating} stars! (Demo mode)`);
  };

  const handleDownload = () => {
    alert('Download started! (Demo mode)');
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/notes')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Notes
        </button>

        {/* Note Header */}
        <Card>
          <div className="space-y-4">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                {note.subject.name}
              </span>
              {note.tags.map(tag => (
                <span key={tag} className="px-3 py-1 text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full capitalize">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{note.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{note.description}</p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {note.unit.name}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {note.uploadedBy.name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(note.createdAt)}
              </span>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-yellow-400" />
                {note.averageRating.toFixed(1)} ({note.totalRatings} ratings)
              </span>
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Eye className="w-4 h-4" />
                {note.viewCount} views
              </span>
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Download className="w-4 h-4" />
                {note.downloadCount} downloads
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        </Card>

        {/* Note Content */}
        <Card>
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {note.content}
            </div>
          </div>
        </Card>

        {/* Rating Section */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate this Note</h3>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= userRating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
            {userRating > 0 && (
              <span className="ml-4 text-gray-600 dark:text-gray-400">
                You rated this {userRating} star{userRating > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </Card>

        {/* Related Notes */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(MOCK_NOTES)
              .filter(n => n._id !== note._id)
              .slice(0, 2)
              .map(relatedNote => (
                <div
                  key={relatedNote._id}
                  onClick={() => navigate(`/notes/${relatedNote._id}`)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white">{relatedNote.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {relatedNote.subject.name}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}

export default NotesDetail;
