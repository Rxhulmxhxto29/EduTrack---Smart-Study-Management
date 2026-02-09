/**
 * Seed Data - Populates the database with sample data for all features
 * Runs automatically when using in-memory database
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Import all models
const User = require('../models/User');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Note = require('../models/Note');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const Progress = require('../models/Progress');
const Announcement = require('../models/Announcement');
const UserData = require('../models/UserData');
const Flashcard = require('../models/Flashcard');

const seedDatabase = async () => {
  console.log('\n📦 Seeding database with sample data...\n');

  try {
    // ==================== 1. CREATE USERS ====================
    // Passwords will be auto-hashed by the User model pre-save hook
    const student = await User.create({
      name: 'Rahul Mahato',
      email: 'student@edutrack.com',
      password: 'student123',
      role: 'student',
      branch: 'CSE',
      semester: 5,
      section: 'A',
      enrollmentNumber: 'CSE2023001',
      isActive: true
    });

    // Generate JWT token for the student
    const studentToken = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('  ✅ Student user created');
    console.log(`  🔑 Student Token: ${studentToken}`);

    // ==================== 2. CREATE SUBJECTS ====================
    const subjects = await Subject.create([
      {
        name: 'Data Structures & Algorithms',
        code: 'CS301',
        branch: 'CSE',
        semester: 5,
        credits: 4,
        description: 'Fundamental data structures and algorithm design techniques including arrays, linked lists, trees, graphs, sorting, and searching algorithms.',
        createdBy: student._id
      },
      {
        name: 'Database Management Systems',
        code: 'CS302',
        branch: 'CSE',
        semester: 5,
        credits: 4,
        description: 'Introduction to database concepts, ER modeling, relational algebra, SQL, normalization, transaction processing, and NoSQL databases.',
        createdBy: student._id
      },
      {
        name: 'Operating Systems',
        code: 'CS303',
        branch: 'CSE',
        semester: 5,
        credits: 3,
        description: 'Process management, memory management, file systems, I/O management, and distributed operating systems.',
        createdBy: student._id
      },
      {
        name: 'Computer Networks',
        code: 'CS304',
        branch: 'CSE',
        semester: 5,
        credits: 3,
        description: 'OSI model, TCP/IP, routing algorithms, network security, wireless networks, and application layer protocols.',
        createdBy: student._id
      },
      {
        name: 'Web Development',
        code: 'CS305',
        branch: 'CSE',
        semester: 5,
        credits: 3,
        description: 'HTML, CSS, JavaScript, React, Node.js, REST APIs, and full-stack web application development.',
        createdBy: student._id
      },
      {
        name: 'Discrete Mathematics',
        code: 'MA301',
        branch: 'CSE',
        semester: 5,
        credits: 3,
        description: 'Logic, sets, relations, functions, graph theory, combinatorics, and algebraic structures.',
        createdBy: student._id
      }
    ]);

    console.log('  ✅ 6 Subjects created');

    // ==================== 3. CREATE UNITS ====================
    const dsaUnits = await Unit.create([
      {
        subject: subjects[0]._id,
        unitNumber: 1,
        name: 'Arrays & Linked Lists',
        description: 'Linear data structures - arrays, singly linked lists, doubly linked lists, circular linked lists, and their operations.',
        topics: [
          { name: 'Array Operations & Complexity', isImportant: true },
          { name: 'Singly Linked List', isImportant: true },
          { name: 'Doubly Linked List', isImportant: false },
          { name: 'Circular Linked List', isImportant: false },
          { name: 'Dynamic Arrays & Amortized Analysis', isImportant: true }
        ],
        duration: '2 weeks'
      },
      {
        subject: subjects[0]._id,
        unitNumber: 2,
        name: 'Stacks & Queues',
        description: 'Stack and Queue implementations, applications, and variations.',
        topics: [
          { name: 'Stack Implementation & Applications', isImportant: true },
          { name: 'Infix to Postfix Conversion', isImportant: true },
          { name: 'Queue Types - Linear, Circular, Priority', isImportant: true },
          { name: 'Deque (Double-ended Queue)', isImportant: false }
        ],
        duration: '1.5 weeks'
      },
      {
        subject: subjects[0]._id,
        unitNumber: 3,
        name: 'Trees & Binary Search Trees',
        description: 'Tree data structures, binary trees, BST, AVL trees, and B-trees.',
        topics: [
          { name: 'Binary Tree Traversals', isImportant: true },
          { name: 'Binary Search Tree Operations', isImportant: true },
          { name: 'AVL Trees & Rotations', isImportant: true },
          { name: 'Heap & Priority Queue', isImportant: true },
          { name: 'B-Trees & B+ Trees', isImportant: false }
        ],
        duration: '2.5 weeks'
      },
      {
        subject: subjects[0]._id,
        unitNumber: 4,
        name: 'Graphs & Graph Algorithms',
        description: 'Graph representations, traversals, shortest paths, MST, and network flow.',
        topics: [
          { name: 'Graph Representations', isImportant: true },
          { name: 'BFS & DFS', isImportant: true },
          { name: 'Dijkstra\'s Algorithm', isImportant: true },
          { name: 'Kruskal\'s & Prim\'s MST', isImportant: true },
          { name: 'Topological Sorting', isImportant: false }
        ],
        duration: '2 weeks'
      },
      {
        subject: subjects[0]._id,
        unitNumber: 5,
        name: 'Sorting & Searching',
        description: 'Various sorting algorithms, searching techniques, and their analysis.',
        topics: [
          { name: 'Bubble, Selection, Insertion Sort', isImportant: false },
          { name: 'Merge Sort', isImportant: true },
          { name: 'Quick Sort', isImportant: true },
          { name: 'Heap Sort', isImportant: true },
          { name: 'Binary Search & Variations', isImportant: true },
          { name: 'Hashing & Hash Tables', isImportant: true }
        ],
        duration: '2 weeks'
      }
    ]);

    const dbmsUnits = await Unit.create([
      {
        subject: subjects[1]._id,
        unitNumber: 1,
        name: 'Introduction to DBMS',
        description: 'Database concepts, DBMS architecture, ER modeling, and data models.',
        topics: [
          { name: 'Database System Architecture', isImportant: true },
          { name: 'ER Model & ER Diagrams', isImportant: true },
          { name: 'Relational Model', isImportant: true },
          { name: 'Data Independence', isImportant: false }
        ],
        duration: '1.5 weeks'
      },
      {
        subject: subjects[1]._id,
        unitNumber: 2,
        name: 'SQL & Relational Algebra',
        description: 'SQL queries, relational algebra, and relational calculus.',
        topics: [
          { name: 'SQL DDL & DML Commands', isImportant: true },
          { name: 'Joins & Subqueries', isImportant: true },
          { name: 'Relational Algebra Operations', isImportant: true },
          { name: 'Views & Indexes', isImportant: false }
        ],
        duration: '2 weeks'
      },
      {
        subject: subjects[1]._id,
        unitNumber: 3,
        name: 'Normalization',
        description: 'Functional dependencies, normal forms, and database design.',
        topics: [
          { name: 'Functional Dependencies', isImportant: true },
          { name: '1NF, 2NF, 3NF', isImportant: true },
          { name: 'BCNF', isImportant: true },
          { name: 'Decomposition & Lossless Join', isImportant: true }
        ],
        duration: '2 weeks'
      },
      {
        subject: subjects[1]._id,
        unitNumber: 4,
        name: 'Transaction Management',
        description: 'ACID properties, concurrency control, and recovery.',
        topics: [
          { name: 'ACID Properties', isImportant: true },
          { name: 'Concurrency Control - Locking', isImportant: true },
          { name: 'Deadlock Handling', isImportant: true },
          { name: 'Recovery Techniques', isImportant: false }
        ],
        duration: '1.5 weeks'
      }
    ]);

    const osUnits = await Unit.create([
      {
        subject: subjects[2]._id,
        unitNumber: 1,
        name: 'Process Management',
        description: 'Processes, threads, CPU scheduling, and synchronization.',
        topics: [
          { name: 'Process States & PCB', isImportant: true },
          { name: 'CPU Scheduling Algorithms', isImportant: true },
          { name: 'Process Synchronization', isImportant: true },
          { name: 'Deadlocks', isImportant: true }
        ],
        duration: '3 weeks'
      },
      {
        subject: subjects[2]._id,
        unitNumber: 2,
        name: 'Memory Management',
        description: 'Memory allocation, paging, segmentation, and virtual memory.',
        topics: [
          { name: 'Paging & Page Tables', isImportant: true },
          { name: 'Segmentation', isImportant: false },
          { name: 'Virtual Memory & Demand Paging', isImportant: true },
          { name: 'Page Replacement Algorithms', isImportant: true }
        ],
        duration: '2.5 weeks'
      }
    ]);

    const allUnits = [...dsaUnits, ...dbmsUnits, ...osUnits];
    console.log(`  ✅ ${allUnits.length} Units created`);

    // ==================== 4. CREATE NOTES ====================
    const notes = await Note.create([
      {
        title: 'Introduction to Binary Search Trees',
        description: 'Complete guide to BST operations including insertion, deletion, and traversal with time complexity analysis.',
        content: `# Binary Search Trees (BST)

A Binary Search Tree is a node-based binary tree data structure with the following properties:
- The left subtree contains only nodes with keys lesser than the node's key
- The right subtree contains only nodes with keys greater than the node's key
- Both the left and right subtrees must also be binary search trees

## Operations & Time Complexity
| Operation | Average | Worst Case |
|-----------|---------|------------|
| Search    | O(log n)| O(n)       |
| Insert    | O(log n)| O(n)       |
| Delete    | O(log n)| O(n)       |

## Key Concepts
1. **Inorder traversal** of BST gives sorted output
2. **Balanced BST** guarantees O(log n) operations
3. **AVL trees** are self-balancing BSTs

## Important Formulas
- Height of balanced BST: h = log₂(n+1)
- Maximum nodes at level l: 2^l
- Total nodes in complete binary tree of height h: 2^(h+1) - 1`,
        subject: subjects[0]._id,
        unit: dsaUnits[2]._id,
        topic: 'Binary Search Tree Operations',
        rating: 5,
        tags: ['important', 'exam-focused', 'formulas'],
        isImportant: true,
        isExamFocused: true,
        hasFormulas: true,
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        section: 'A',
        viewCount: 42,
        aiScore: { quality: 88, completeness: 82, examRelevance: 95, overall: 88 },
        aiTags: ['exam-important', 'high-value', 'formula-heavy'],
        aiKeywords: [
          { word: 'BST', importance: 'critical' },
          { word: 'binary search tree', importance: 'critical' },
          { word: 'traversal', importance: 'high' },
          { word: 'insertion', importance: 'high' },
          { word: 'deletion', importance: 'high' },
          { word: 'time complexity', importance: 'medium' }
        ],
        aiSummary: {
          short: 'Comprehensive BST guide covering operations, complexity, and balanced trees.',
          detailed: 'This note covers Binary Search Trees from basics to advanced concepts including all CRUD operations with complexity analysis, BST properties, and self-balancing trees like AVL.',
          bulletPoints: ['BST property: left < root < right', 'Inorder traversal gives sorted output', 'Average case: O(log n)', 'AVL trees maintain balance'],
          keyPoints: ['BST Operations', 'Time Complexity', 'Balanced BST', 'AVL Trees']
        },
        aiAnalyzedAt: new Date()
      },
      {
        title: 'SQL Joins - Complete Reference',
        description: 'All types of SQL joins explained with examples and Venn diagrams.',
        content: `# SQL Joins

## Types of Joins
1. **INNER JOIN** - Returns matching rows from both tables
2. **LEFT JOIN** - Returns all rows from left + matching from right
3. **RIGHT JOIN** - Returns all rows from right + matching from left
4. **FULL OUTER JOIN** - Returns all rows when match in either table
5. **CROSS JOIN** - Cartesian product of both tables
6. **SELF JOIN** - Table joined with itself

## Syntax Examples

### INNER JOIN
\`\`\`sql
SELECT s.name, c.course_name
FROM students s
INNER JOIN courses c ON s.course_id = c.id;
\`\`\`

### LEFT JOIN
\`\`\`sql
SELECT s.name, g.grade
FROM students s
LEFT JOIN grades g ON s.id = g.student_id;
\`\`\`

## Important for Exams
- Know the difference between all join types
- Practice writing complex queries with multiple joins
- Understand NULL handling in outer joins`,
        subject: subjects[1]._id,
        unit: dbmsUnits[1]._id,
        topic: 'Joins & Subqueries',
        rating: 4,
        tags: ['important', 'exam-focused'],
        isImportant: true,
        isExamFocused: true,
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        viewCount: 35,
        aiScore: { quality: 85, completeness: 78, examRelevance: 92, overall: 85 },
        aiTags: ['exam-important', 'high-value', 'definition-rich'],
        aiKeywords: [
          { word: 'SQL joins', importance: 'critical' },
          { word: 'INNER JOIN', importance: 'critical' },
          { word: 'LEFT JOIN', importance: 'high' },
          { word: 'OUTER JOIN', importance: 'high' }
        ],
        aiSummary: {
          short: 'Complete SQL joins reference with all join types and examples.',
          detailed: 'Covers all SQL join types including INNER, LEFT, RIGHT, FULL OUTER, CROSS, and SELF joins with syntax examples.',
          bulletPoints: ['6 types of joins', 'INNER JOIN returns matching rows', 'LEFT JOIN keeps all left table rows', 'NULL handling in outer joins'],
          keyPoints: ['Join Types', 'SQL Syntax', 'NULL Handling', 'Complex Queries']
        },
        aiAnalyzedAt: new Date()
      },
      {
        title: 'Database Normalization - 1NF to BCNF',
        description: 'Step-by-step guide to database normalization with examples for each normal form.',
        content: `# Database Normalization

## Purpose
- Eliminate data redundancy
- Ensure data integrity
- Organize data efficiently

## Normal Forms

### First Normal Form (1NF)
- Each cell contains a single atomic value
- Each record is unique
- No repeating groups

### Second Normal Form (2NF)
- Must be in 1NF
- No partial dependency (all non-key attributes depend on entire primary key)

### Third Normal Form (3NF)
- Must be in 2NF
- No transitive dependency (non-key attributes don't depend on other non-key attributes)

### Boyce-Codd Normal Form (BCNF)
- Must be in 3NF
- For every functional dependency X → Y, X must be a super key

## Key Formula
**Armstrong's Axioms:**
1. Reflexivity: If Y ⊆ X, then X → Y
2. Augmentation: If X → Y, then XZ → YZ
3. Transitivity: If X → Y and Y → Z, then X → Z`,
        subject: subjects[1]._id,
        unit: dbmsUnits[2]._id,
        topic: 'Functional Dependencies',
        rating: 5,
        tags: ['important', 'exam-focused', 'formulas'],
        isImportant: true,
        isExamFocused: true,
        hasFormulas: true,
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        viewCount: 58,
        aiScore: { quality: 92, completeness: 90, examRelevance: 98, overall: 93 },
        aiTags: ['exam-important', 'high-value', 'pyq-relevant'],
        aiKeywords: [
          { word: 'normalization', importance: 'critical' },
          { word: '1NF 2NF 3NF', importance: 'critical' },
          { word: 'BCNF', importance: 'critical' },
          { word: 'functional dependency', importance: 'high' }
        ],
        aiSummary: {
          short: 'Step-by-step normalization guide from 1NF to BCNF.',
          detailed: 'Complete normalization reference covering all normal forms with clear definitions, examples, and Armstrong\'s axioms.',
          bulletPoints: ['1NF: Atomic values', '2NF: No partial dependency', '3NF: No transitive dependency', 'BCNF: Every determinant is a super key'],
          keyPoints: ['Normal Forms', 'Functional Dependencies', 'Armstrong\'s Axioms', 'Decomposition']
        },
        aiAnalyzedAt: new Date()
      },
      {
        title: 'Process Scheduling Algorithms',
        description: 'FCFS, SJF, Priority, Round Robin scheduling with Gantt charts and calculations.',
        content: `# CPU Scheduling Algorithms

## 1. First Come First Serve (FCFS)
- Non-preemptive
- Simple but can cause convoy effect
- Average waiting time can be high

## 2. Shortest Job First (SJF)
- Can be preemptive (SRTF) or non-preemptive
- Optimal average waiting time (non-preemptive)
- Starvation possible for long processes

## 3. Priority Scheduling
- Each process has a priority
- Can be preemptive or non-preemptive
- Aging solves starvation problem

## 4. Round Robin (RR)
- Preemptive with time quantum
- Fair allocation
- Performance depends on time quantum

## Formulas
- **Turnaround Time** = Completion Time - Arrival Time
- **Waiting Time** = Turnaround Time - Burst Time
- **Response Time** = First CPU time - Arrival Time
- **Throughput** = Number of processes / Total time

## Comparison Table
| Algorithm | Preemptive | Starvation | Overhead |
|-----------|-----------|------------|----------|
| FCFS      | No        | No         | Low      |
| SJF       | Both      | Yes        | Medium   |
| Priority  | Both      | Yes        | Medium   |
| RR        | Yes       | No         | High     |`,
        subject: subjects[2]._id,
        unit: osUnits[0]._id,
        topic: 'CPU Scheduling Algorithms',
        rating: 5,
        tags: ['important', 'exam-focused', 'formulas'],
        isImportant: true,
        isExamFocused: true,
        hasFormulas: true,
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        viewCount: 67,
        aiScore: { quality: 90, completeness: 88, examRelevance: 96, overall: 91 },
        aiTags: ['exam-important', 'high-value', 'formula-heavy', 'pyq-relevant'],
        aiKeywords: [
          { word: 'scheduling', importance: 'critical' },
          { word: 'FCFS', importance: 'critical' },
          { word: 'SJF', importance: 'critical' },
          { word: 'Round Robin', importance: 'critical' },
          { word: 'turnaround time', importance: 'high' }
        ],
        aiSummary: {
          short: 'All CPU scheduling algorithms with formulas and comparison.',
          detailed: 'Comprehensive guide covering FCFS, SJF, Priority, and Round Robin scheduling with formulas for turnaround, waiting, and response times.',
          bulletPoints: ['FCFS: Simple, convoy effect', 'SJF: Optimal avg wait', 'Priority: Aging prevents starvation', 'RR: Fair, time quantum dependent'],
          keyPoints: ['Scheduling Algorithms', 'Time Calculations', 'Comparison', 'Preemptive vs Non-preemptive']
        },
        aiAnalyzedAt: new Date()
      },
      {
        title: 'Page Replacement Algorithms',
        description: 'FIFO, LRU, Optimal page replacement with examples and Belady\'s anomaly.',
        content: `# Page Replacement Algorithms

## 1. FIFO (First In First Out)
- Replace the oldest page
- Simple to implement
- Suffers from Belady's Anomaly

## 2. LRU (Least Recently Used)
- Replace page not used for longest time
- Good performance, no Belady's anomaly
- Implementation: Counter or Stack based

## 3. Optimal (OPT)
- Replace page that won't be used for longest time in future
- Best performance (theoretical)
- Not implementable in practice

## Belady's Anomaly
- More frames can lead to more page faults (FIFO only)
- LRU and OPT are stack algorithms - no anomaly

## Page Fault Rate Formula
Page Fault Rate = Number of Page Faults / Total References`,
        subject: subjects[2]._id,
        unit: osUnits[1]._id,
        topic: 'Page Replacement Algorithms',
        rating: 4,
        tags: ['important', 'exam-focused'],
        isImportant: true,
        isExamFocused: true,
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        viewCount: 29,
        aiScore: { quality: 82, completeness: 75, examRelevance: 90, overall: 82 },
        aiTags: ['exam-important', 'quick-revision'],
        aiKeywords: [
          { word: 'page replacement', importance: 'critical' },
          { word: 'FIFO', importance: 'critical' },
          { word: 'LRU', importance: 'critical' },
          { word: 'Belady anomaly', importance: 'high' }
        ],
        aiSummary: {
          short: 'Page replacement algorithms: FIFO, LRU, Optimal with Belady\'s anomaly.',
          detailed: 'Covers all page replacement algorithms with pros/cons and the famous Belady\'s anomaly.',
          bulletPoints: ['FIFO: Simple but Belady\'s anomaly', 'LRU: Good performance', 'OPT: Best but theoretical', 'Stack algorithms avoid anomaly'],
          keyPoints: ['FIFO', 'LRU', 'Optimal', 'Belady\'s Anomaly']
        },
        aiAnalyzedAt: new Date()
      },
      {
        title: 'Dijkstra\'s Shortest Path Algorithm',
        description: 'Step-by-step explanation of Dijkstra\'s algorithm with example and pseudocode.',
        content: `# Dijkstra's Algorithm

## Purpose
Find shortest path from a source vertex to all other vertices in a weighted graph with non-negative edge weights.

## Algorithm Steps
1. Initialize distances: source = 0, all others = ∞
2. Add source to priority queue
3. While priority queue is not empty:
   - Extract vertex u with minimum distance
   - For each neighbor v of u:
     - If dist[u] + weight(u,v) < dist[v]:
       - Update dist[v] = dist[u] + weight(u,v)
       - Update parent[v] = u

## Time Complexity
- With adjacency matrix: O(V²)
- With binary heap: O((V + E) log V)
- With Fibonacci heap: O(E + V log V)

## Limitations
- Does NOT work with negative edge weights
- Use Bellman-Ford for negative weights

## Important: Exam frequently asks to trace the algorithm step by step.`,
        subject: subjects[0]._id,
        unit: dsaUnits[3]._id,
        topic: 'Dijkstra\'s Algorithm',
        rating: 5,
        tags: ['important', 'exam-focused'],
        isImportant: true,
        isExamFocused: true,
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        viewCount: 52,
        aiScore: { quality: 86, completeness: 80, examRelevance: 94, overall: 87 },
        aiTags: ['exam-important', 'high-value', 'pyq-relevant'],
        aiKeywords: [
          { word: 'Dijkstra', importance: 'critical' },
          { word: 'shortest path', importance: 'critical' },
          { word: 'greedy algorithm', importance: 'high' }
        ],
        aiSummary: {
          short: 'Dijkstra\'s shortest path algorithm with pseudocode and complexity.',
          detailed: 'Step-by-step Dijkstra\'s algorithm explanation with complexity analysis and limitations.',
          bulletPoints: ['Greedy approach', 'No negative weights', 'O((V+E)logV) with heap', 'Trace practice for exams'],
          keyPoints: ['Algorithm Steps', 'Time Complexity', 'Limitations', 'Exam Tips']
        },
        aiAnalyzedAt: new Date()
      },
      {
        title: 'Quick Sort - Divide and Conquer',
        description: 'Quick sort algorithm with partition logic, best/worst case analysis.',
        content: `# Quick Sort

## Algorithm
1. Choose a pivot element
2. Partition: Place pivot in correct position
3. Recursively sort left and right partitions

## Partition Logic (Lomuto)
- Choose last element as pivot
- Maintain index i for smaller elements
- Swap elements smaller than pivot to left side

## Time Complexity
- **Best Case:** O(n log n) - balanced partitions
- **Average Case:** O(n log n)  
- **Worst Case:** O(n²) - sorted array with last element as pivot
- **Space:** O(log n) for recursion stack

## Optimizations
1. Random pivot selection
2. Median of three
3. Use insertion sort for small subarrays

## vs Merge Sort
| Feature | Quick Sort | Merge Sort |
|---------|-----------|------------|
| Average | O(n log n) | O(n log n) |
| Worst   | O(n²)     | O(n log n) |
| Space   | O(log n)  | O(n)       |
| Stable  | No        | Yes        |
| Cache   | Better    | Worse      |`,
        subject: subjects[0]._id,
        unit: dsaUnits[4]._id,
        topic: 'Quick Sort',
        rating: 4,
        tags: ['important', 'revision'],
        isImportant: true,
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        viewCount: 38,
        aiScore: { quality: 84, completeness: 80, examRelevance: 88, overall: 84 },
        aiTags: ['exam-important', 'quick-revision'],
        aiAnalyzedAt: new Date()
      },
      {
        title: 'ACID Properties in DBMS',
        description: 'Detailed explanation of ACID properties with real-world examples.',
        content: `# ACID Properties

## Atomicity
- "All or nothing" - transaction is either fully completed or fully rolled back
- Example: Bank transfer - debit and credit must both succeed

## Consistency
- Database must remain in a consistent state before and after transaction
- All integrity constraints must be maintained

## Isolation
- Concurrent transactions should not interfere with each other
- Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable

## Durability
- Once a transaction is committed, changes are permanent
- Survives system crashes (WAL - Write Ahead Logging)

## Important for Exams
- Draw state diagrams for each property
- Give real-world examples
- Know isolation levels and their problems (dirty read, phantom read, etc.)`,
        subject: subjects[1]._id,
        unit: dbmsUnits[3]._id,
        topic: 'ACID Properties',
        rating: 4,
        tags: ['important', 'exam-focused'],
        isImportant: true,
        isExamFocused: true,
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        viewCount: 44,
        aiScore: { quality: 80, completeness: 76, examRelevance: 91, overall: 82 },
        aiTags: ['exam-important', 'definition-rich'],
        aiAnalyzedAt: new Date()
      },
      {
        title: 'React Hooks - useState & useEffect',
        description: 'Quick reference for React hooks with patterns and best practices.',
        content: `# React Hooks

## useState
- Manages component state
- Returns [state, setState] pair
- Can hold any type of value

## useEffect
- Side effects in function components
- Replaces componentDidMount, componentDidUpdate, componentWillUnmount
- Cleanup function for subscriptions

## Rules of Hooks
1. Only call at top level
2. Only call from React functions
3. Consistent call order every render

## Common Patterns
- Fetching data in useEffect
- Debouncing with useEffect + cleanup
- Derived state vs computed values`,
        subject: subjects[4]._id,
        rating: 3,
        tags: ['revision', 'homework'],
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        viewCount: 15,
        aiScore: { quality: 72, completeness: 60, examRelevance: 65, overall: 66 },
        aiTags: ['quick-revision', 'needs-review'],
        aiAnalyzedAt: new Date()
      },
      {
        title: 'OSI Model - 7 Layers',
        description: 'Complete OSI model reference with protocols at each layer.',
        content: `# OSI Model

## Layer 7 - Application
HTTP, FTP, SMTP, DNS, SNMP

## Layer 6 - Presentation
SSL/TLS, JPEG, ASCII, Encryption

## Layer 5 - Session
NetBIOS, RPC, Session management

## Layer 4 - Transport
TCP, UDP, Port numbers

## Layer 3 - Network
IP, ICMP, Routers, Logical addressing

## Layer 2 - Data Link
Ethernet, MAC address, Switches, Frames

## Layer 1 - Physical
Cables, Hubs, Bits transmission

## Mnemonic: "All People Seem To Need Data Processing"

## TCP vs UDP
| Feature | TCP | UDP |
|---------|-----|-----|
| Connection | Connection-oriented | Connectionless |
| Reliability | Reliable | Unreliable |
| Speed | Slower | Faster |
| Use case | Web, Email | Streaming, DNS |`,
        subject: subjects[3]._id,
        rating: 4,
        tags: ['important', 'exam-focused'],
        isImportant: true,
        isExamFocused: true,
        uploadedBy: student._id,
        visibility: 'private',
        branch: 'CSE',
        semester: 5,
        viewCount: 55,
        aiScore: { quality: 78, completeness: 85, examRelevance: 90, overall: 84 },
        aiTags: ['exam-important', 'definition-rich', 'quick-revision'],
        aiAnalyzedAt: new Date()
      }
    ]);

    console.log(`  ✅ ${notes.length} Notes created with AI analysis`);

    // ==================== 5. CREATE ASSIGNMENTS ====================
    const now = new Date();
    const assignments = await Assignment.create([
      {
        title: 'Implement Binary Search Tree',
        description: 'Write a program to implement BST with insert, delete, search, and inorder traversal operations. Include time complexity analysis for each operation. Submit the code along with a brief report (max 2 pages) explaining your approach and test cases.',
        subject: subjects[0]._id,
        unit: dsaUnits[2]._id,
        branch: 'CSE',
        semester: 5,
        sections: ['A', 'B'],
        maxMarks: 25,
        assignedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        createdBy: student._id,
        submissions: [{
          student: student._id,
          submittedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          remarks: 'Implemented all operations with detailed comments.',
          marksObtained: 22,
          feedback: 'Excellent work! Clean code with good complexity analysis. Minor deduction for missing edge case in delete operation.',
          gradedBy: student._id,
          gradedAt: new Date(),
          status: 'graded'
        }]
      },
      {
        title: 'SQL Queries - Practice Set',
        description: 'Solve the following SQL problems:\n1. Write a query to find the 2nd highest salary\n2. Find employees with duplicate emails\n3. Write a query using all types of joins\n4. Create a view for department-wise salary summary\n5. Write a stored procedure for employee report\n\nSubmit your .sql file with all queries and sample outputs.',
        subject: subjects[1]._id,
        unit: dbmsUnits[1]._id,
        branch: 'CSE',
        semester: 5,
        maxMarks: 20,
        assignedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        createdBy: student._id
      },
      {
        title: 'OS Process Scheduling Simulation',
        description: 'Simulate FCFS, SJF, Priority, and Round Robin scheduling algorithms. Given a set of processes with arrival and burst times, calculate and display:\n- Gantt Chart\n- Average Waiting Time\n- Average Turnaround Time\n\nUse any programming language. Submit source code and output screenshots.',
        subject: subjects[2]._id,
        unit: osUnits[0]._id,
        branch: 'CSE',
        semester: 5,
        maxMarks: 30,
        assignedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        createdBy: student._id
      },
      {
        title: 'Normalize a Database Schema',
        description: 'Given the following unnormalized relation, decompose it into 1NF, 2NF, 3NF, and BCNF:\n\nSTUDENT_COURSE(StudentID, StudentName, CourseID, CourseName, InstructorID, InstructorName, Grade, Department)\n\nShow all functional dependencies and explain each step of decomposition.',
        subject: subjects[1]._id,
        unit: dbmsUnits[2]._id,
        branch: 'CSE',
        semester: 5,
        maxMarks: 15,
        assignedDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdBy: student._id,
        submissions: [{
          student: student._id,
          submittedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          remarks: 'Complete normalization with all steps shown.',
          marksObtained: 14,
          feedback: 'Very well done! Clear presentation of functional dependencies.',
          gradedBy: student._id,
          gradedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          status: 'graded'
        }]
      },
      {
        title: 'Build a REST API with Node.js',
        description: 'Create a RESTful API for a simple todo application using Node.js and Express. Requirements:\n- CRUD operations for todos\n- Input validation\n- Error handling\n- Use MongoDB or any database\n- Write at least 5 API endpoints\n\nSubmit GitHub repository link.',
        subject: subjects[4]._id,
        branch: 'CSE',
        semester: 5,
        maxMarks: 40,
        assignedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        createdBy: student._id
      }
    ]);

    console.log(`  ✅ ${assignments.length} Assignments created`);

    // ==================== 6. CREATE TIMETABLE ====================
    const timetableEntries = await Timetable.create([
      // Monday
      { user: student._id, dayOfWeek: 'monday', startTime: '09:00', endTime: '10:00', subject: subjects[0]._id, type: 'lecture', room: 'Room 301', teacher: 'Dr. Priya Sharma', isRecurring: true },
      { user: student._id, dayOfWeek: 'monday', startTime: '10:00', endTime: '11:00', subject: subjects[1]._id, type: 'lecture', room: 'Room 204', teacher: 'Prof. Amit Verma', isRecurring: true },
      { user: student._id, dayOfWeek: 'monday', startTime: '11:00', endTime: '11:30', type: 'break', notes: 'Tea Break ☕', isRecurring: true },
      { user: student._id, dayOfWeek: 'monday', startTime: '11:30', endTime: '13:00', subject: subjects[0]._id, type: 'lab', room: 'Lab 102', teacher: 'Dr. Priya Sharma', isRecurring: true },
      { user: student._id, dayOfWeek: 'monday', startTime: '14:00', endTime: '15:00', subject: subjects[3]._id, type: 'lecture', room: 'Room 305', teacher: 'Dr. Ravi Kumar', isRecurring: true },
      
      // Tuesday
      { user: student._id, dayOfWeek: 'tuesday', startTime: '09:00', endTime: '10:00', subject: subjects[2]._id, type: 'lecture', room: 'Room 302', teacher: 'Prof. Neha Gupta', isRecurring: true },
      { user: student._id, dayOfWeek: 'tuesday', startTime: '10:00', endTime: '11:00', subject: subjects[4]._id, type: 'lecture', room: 'Lab 201', teacher: 'Dr. Sanjay Patel', isRecurring: true },
      { user: student._id, dayOfWeek: 'tuesday', startTime: '11:30', endTime: '13:00', subject: subjects[1]._id, type: 'lab', room: 'Lab 103', teacher: 'Prof. Amit Verma', isRecurring: true },
      { user: student._id, dayOfWeek: 'tuesday', startTime: '14:00', endTime: '15:00', subject: subjects[5]._id, type: 'lecture', room: 'Room 101', teacher: 'Dr. Anand Singh', isRecurring: true },
      
      // Wednesday
      { user: student._id, dayOfWeek: 'wednesday', startTime: '09:00', endTime: '10:00', subject: subjects[0]._id, type: 'lecture', room: 'Room 301', teacher: 'Dr. Priya Sharma', isRecurring: true },
      { user: student._id, dayOfWeek: 'wednesday', startTime: '10:00', endTime: '11:00', subject: subjects[3]._id, type: 'lecture', room: 'Room 305', teacher: 'Dr. Ravi Kumar', isRecurring: true },
      { user: student._id, dayOfWeek: 'wednesday', startTime: '11:30', endTime: '13:00', subject: subjects[2]._id, type: 'lab', room: 'Lab 104', teacher: 'Prof. Neha Gupta', isRecurring: true },
      { user: student._id, dayOfWeek: 'wednesday', startTime: '14:00', endTime: '15:00', subject: subjects[5]._id, type: 'tutorial', room: 'Room 101', teacher: 'Dr. Anand Singh', isRecurring: true },
      
      // Thursday
      { user: student._id, dayOfWeek: 'thursday', startTime: '09:00', endTime: '10:00', subject: subjects[1]._id, type: 'lecture', room: 'Room 204', teacher: 'Prof. Amit Verma', isRecurring: true },
      { user: student._id, dayOfWeek: 'thursday', startTime: '10:00', endTime: '11:00', subject: subjects[2]._id, type: 'lecture', room: 'Room 302', teacher: 'Prof. Neha Gupta', isRecurring: true },
      { user: student._id, dayOfWeek: 'thursday', startTime: '11:30', endTime: '13:00', subject: subjects[4]._id, type: 'lab', room: 'Lab 201', teacher: 'Dr. Sanjay Patel', isRecurring: true },
      { user: student._id, dayOfWeek: 'thursday', startTime: '14:00', endTime: '15:00', subject: subjects[0]._id, type: 'tutorial', room: 'Room 301', teacher: 'Dr. Priya Sharma', isRecurring: true },
      
      // Friday
      { user: student._id, dayOfWeek: 'friday', startTime: '09:00', endTime: '10:00', subject: subjects[3]._id, type: 'lecture', room: 'Room 305', teacher: 'Dr. Ravi Kumar', isRecurring: true },
      { user: student._id, dayOfWeek: 'friday', startTime: '10:00', endTime: '11:00', subject: subjects[5]._id, type: 'lecture', room: 'Room 101', teacher: 'Dr. Anand Singh', isRecurring: true },
      { user: student._id, dayOfWeek: 'friday', startTime: '11:30', endTime: '12:30', subject: subjects[4]._id, type: 'lecture', room: 'Lab 201', teacher: 'Dr. Sanjay Patel', isRecurring: true },
      
      // Saturday (optional classes)
      { user: student._id, dayOfWeek: 'saturday', startTime: '09:00', endTime: '10:30', subject: subjects[0]._id, type: 'tutorial', room: 'Room 301', teacher: 'Dr. Priya Sharma', notes: 'Extra doubt clearing session', isRecurring: true },
    ]);

    console.log(`  ✅ ${timetableEntries.length} Timetable entries created`);

    // ==================== 7. CREATE PROGRESS ====================
    const progressRecords = await Progress.create([
      {
        user: student._id,
        subject: subjects[0]._id,
        unit: dsaUnits[0]._id,
        topicProgress: [
          { topicName: 'Array Operations & Complexity', status: 'completed', confidenceLevel: 5, completedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), lastStudied: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
          { topicName: 'Singly Linked List', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000), lastStudied: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
          { topicName: 'Doubly Linked List', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
          { topicName: 'Circular Linked List', status: 'completed', confidenceLevel: 3, completedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
          { topicName: 'Dynamic Arrays & Amortized Analysis', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000) }
        ],
        unitStatus: 'completed',
        totalTimeSpent: 480,
        readyForExam: true,
        revisionCount: 2,
        lastRevisedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        user: student._id,
        subject: subjects[0]._id,
        unit: dsaUnits[1]._id,
        topicProgress: [
          { topicName: 'Stack Implementation & Applications', status: 'completed', confidenceLevel: 5, completedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
          { topicName: 'Infix to Postfix Conversion', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000) },
          { topicName: 'Queue Types - Linear, Circular, Priority', status: 'completed', confidenceLevel: 3, completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
          { topicName: 'Deque (Double-ended Queue)', status: 'in-progress', confidenceLevel: 2 }
        ],
        unitStatus: 'in-progress',
        totalTimeSpent: 320,
        revisionCount: 1
      },
      {
        user: student._id,
        subject: subjects[0]._id,
        unit: dsaUnits[2]._id,
        topicProgress: [
          { topicName: 'Binary Tree Traversals', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
          { topicName: 'Binary Search Tree Operations', status: 'in-progress', confidenceLevel: 3 },
          { topicName: 'AVL Trees & Rotations', status: 'in-progress', confidenceLevel: 2 },
          { topicName: 'Heap & Priority Queue', status: 'not-started', confidenceLevel: 1 },
          { topicName: 'B-Trees & B+ Trees', status: 'not-started', confidenceLevel: 1 }
        ],
        unitStatus: 'in-progress',
        totalTimeSpent: 180
      },
      {
        user: student._id,
        subject: subjects[0]._id,
        unit: dsaUnits[3]._id,
        topicProgress: [
          { topicName: 'Graph Representations', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
          { topicName: 'BFS & DFS', status: 'in-progress', confidenceLevel: 2 },
          { topicName: 'Dijkstra\'s Algorithm', status: 'not-started', confidenceLevel: 1 },
          { topicName: 'Kruskal\'s & Prim\'s MST', status: 'not-started', confidenceLevel: 1 },
          { topicName: 'Topological Sorting', status: 'not-started', confidenceLevel: 1 }
        ],
        unitStatus: 'in-progress',
        totalTimeSpent: 90
      },
      {
        user: student._id,
        subject: subjects[1]._id,
        unit: dbmsUnits[0]._id,
        topicProgress: [
          { topicName: 'Database System Architecture', status: 'completed', confidenceLevel: 5, completedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000) },
          { topicName: 'ER Model & ER Diagrams', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000) },
          { topicName: 'Relational Model', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
          { topicName: 'Data Independence', status: 'completed', confidenceLevel: 3, completedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000) }
        ],
        unitStatus: 'completed',
        totalTimeSpent: 360,
        readyForExam: true,
        revisionCount: 3,
        lastRevisedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        user: student._id,
        subject: subjects[1]._id,
        unit: dbmsUnits[1]._id,
        topicProgress: [
          { topicName: 'SQL DDL & DML Commands', status: 'completed', confidenceLevel: 5, completedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
          { topicName: 'Joins & Subqueries', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000) },
          { topicName: 'Relational Algebra Operations', status: 'in-progress', confidenceLevel: 3 },
          { topicName: 'Views & Indexes', status: 'not-started', confidenceLevel: 1 }
        ],
        unitStatus: 'in-progress',
        totalTimeSpent: 280
      },
      {
        user: student._id,
        subject: subjects[2]._id,
        unit: osUnits[0]._id,
        topicProgress: [
          { topicName: 'Process States & PCB', status: 'completed', confidenceLevel: 4, completedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) },
          { topicName: 'CPU Scheduling Algorithms', status: 'in-progress', confidenceLevel: 3 },
          { topicName: 'Process Synchronization', status: 'not-started', confidenceLevel: 1 },
          { topicName: 'Deadlocks', status: 'not-started', confidenceLevel: 1 }
        ],
        unitStatus: 'in-progress',
        totalTimeSpent: 150
      }
    ]);

    console.log(`  ✅ ${progressRecords.length} Progress records created`);

    // ==================== 8. CREATE ANNOUNCEMENTS ====================
    const announcements = await Announcement.create([
      {
        title: '📝 Mid-Semester Examination Schedule',
        message: 'Mid-semester exams will be held from March 1-10, 2026. The detailed timetable is attached. Students are advised to prepare thoroughly. No re-exam will be conducted without valid medical certificate.\n\nExam timings: 10:00 AM - 1:00 PM\nVenue: Examination Hall Block A & B',
        type: 'exam',
        priority: 'high',
        targetAudience: 'students',
        branch: 'CSE',
        semester: 5,
        isPinned: true,
        createdBy: student._id,
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: '🏫 DSA Lab Assignment Due Date Extended',
        message: 'Due to multiple requests, the due date for the BST Implementation assignment has been extended by 3 days. New deadline: February 14, 2026.\n\nPlease make sure to include all test cases and time complexity analysis.',
        type: 'academic',
        priority: 'medium',
        targetAudience: 'students',
        branch: 'CSE',
        semester: 5,
        sections: ['A', 'B'],
        createdBy: student._id,
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: '🎉 Tech Fest 2026 - Register Now!',
        message: 'Annual Tech Fest "InnoVerse 2026" is here! Events include:\n\n🏆 Hackathon (48 hours)\n💻 Competitive Programming Contest\n🤖 AI/ML Workshop\n🎮 Game Development Challenge\n📱 App Development Sprint\n\nRegistration deadline: February 20, 2026\nFee: ₹200 per participant\n\nRegister at: techfest.college.edu',
        type: 'event',
        priority: 'medium',
        targetAudience: 'all',
        isPinned: true,
        createdBy: student._id,
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: '📚 Library: New Books Available',
        message: 'New books added to the library:\n\n1. "Introduction to Algorithms" - CLRS (4th Edition)\n2. "Database System Concepts" - Silberschatz (7th Edition)\n3. "Operating System Concepts" - Galvin (10th Edition)\n4. "Computer Networking: A Top-Down Approach" - Kurose\n\nVisit the library counter to issue. Limited copies available!',
        type: 'general',
        priority: 'low',
        targetAudience: 'all',
        createdBy: student._id,
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: '⚠️ Holiday Notice - Republic Day',
        message: 'The college will remain closed on January 26, 2026 (Monday) on account of Republic Day. Regular classes will resume on January 27, 2026.',
        type: 'holiday',
        priority: 'medium',
        targetAudience: 'all',
        createdBy: student._id,
        publishedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        readBy: [{ user: student._id, readAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) }]
      },
      {
        title: '🔧 DBMS Lab - Install MySQL Workbench',
        message: 'All students are required to install MySQL Workbench 8.0 on their laptops before the next lab session. Download from: https://dev.mysql.com/downloads/workbench/\n\nAlso install MySQL Server Community Edition.',
        type: 'academic',
        priority: 'medium',
        targetAudience: 'students',
        branch: 'CSE',
        semester: 5,
        createdBy: student._id,
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        readBy: [{ user: student._id, readAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) }]
      }
    ]);

    console.log(`  ✅ ${announcements.length} Announcements created`);

    // ==================== 9. CREATE USER DATA ====================
    await UserData.create([
      {
        user: student._id,
        key: 'study_streak',
        data: {
          currentStreak: 12,
          longestStreak: 18,
          lastStudyDate: new Date().toISOString().split('T')[0],
          totalStudyDays: 45,
          weeklyGoal: 5,
          thisWeekDays: 4
        }
      },
      {
        user: student._id,
        key: 'favorites',
        data: {
          noteIds: [notes[0]._id.toString(), notes[2]._id.toString(), notes[3]._id.toString()],
          subjectIds: [subjects[0]._id.toString(), subjects[1]._id.toString()]
        }
      },
      {
        user: student._id,
        key: 'preferences',
        data: {
          theme: 'auto',
          notifications: true,
          emailDigest: 'weekly',
          studyReminder: '20:00',
          focusModeDuration: 25,
          showAIInsights: true
        }
      },
      {
        user: student._id,
        key: 'dashboard_data',
        data: {
          lastVisited: new Date().toISOString(),
          pinnedSubjects: [subjects[0]._id.toString(), subjects[1]._id.toString()],
          recentNotes: notes.slice(0, 5).map(n => n._id.toString()),
          studyGoal: { daily: 120, weekly: 600 },
          todayMinutes: 85
        }
      },
      {
        user: student._id,
        key: 'exam_mode_data',
        data: {
          enabled: false,
          subjects: [subjects[0]._id.toString(), subjects[1]._id.toString(), subjects[2]._id.toString()],
          examDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          focusTopics: ['Trees', 'Normalization', 'Scheduling'],
          revisionPlan: { day1: 'DSA Unit 1-2', day2: 'DBMS Unit 1-2', day3: 'OS Unit 1' }
        }
      }
    ]);

    console.log('  ✅ User preferences & data created');

    // ==================== 9. CREATE FLASHCARDS ====================
    const flashcards = await Flashcard.create([
      // DSA Flashcards
      {
        createdBy: student._id,
        subject: subjects[0]._id,
        subjectName: subjects[0].name,
        unit: allUnits[0]._id,
        question: 'What is the time complexity of binary search?',
        answer: 'O(log n) - Binary search divides the search space in half with each iteration, making it logarithmic.',
        hint: 'Think about how many times you can divide n by 2',
        tags: ['algorithms', 'time-complexity', 'searching'],
        difficulty: 'easy',
        deck: 'DSA Fundamentals',
        studyStats: {
          totalReviews: 3,
          correctCount: 2,
          lastReviewed: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          nextReview: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
        },
        interval: 3,
        easeFactor: 2.6
      },
      {
        createdBy: student._id,
        subject: subjects[0]._id,
        subjectName: subjects[0].name,
        unit: allUnits[1]._id,
        question: 'Explain the difference between Stack and Queue',
        answer: 'Stack follows LIFO (Last In First Out) principle - last element added is first to be removed. Queue follows FIFO (First In First Out) - first element added is first to be removed.',
        tags: ['data-structures', 'stack', 'queue'],
        difficulty: 'easy',
        deck: 'DSA Fundamentals',
        studyStats: {
          totalReviews: 5,
          correctCount: 5,
          lastReviewed: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          nextReview: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        interval: 7,
        easeFactor: 2.8
      },
      {
        createdBy: student._id,
        subject: subjects[0]._id,
        subjectName: subjects[0].name,
        unit: allUnits[2]._id,
        question: 'What is the height of a balanced binary tree with n nodes?',
        answer: 'log₂(n) - A balanced tree maintains roughly equal heights in left and right subtrees, resulting in logarithmic height.',
        hint: 'Related to binary search complexity',
        tags: ['trees', 'binary-tree', 'height'],
        difficulty: 'medium',
        deck: 'Trees & Graphs',
        studyStats: {
          totalReviews: 2,
          correctCount: 1,
          lastReviewed: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          nextReview: new Date()
        },
        interval: 1,
        easeFactor: 2.3
      },

      // DBMS Flashcards
      {
        createdBy: student._id,
        subject: subjects[1]._id,
        subjectName: subjects[1].name,
        unit: allUnits[3]._id,
        question: 'What are the ACID properties in DBMS?',
        answer: 'A - Atomicity: All or nothing transaction\nC - Consistency: Database remains in valid state\nI - Isolation: Concurrent transactions don\'t interfere\nD - Durability: Committed changes persist',
        tags: ['transactions', 'acid', 'database-theory'],
        difficulty: 'medium',
        deck: 'DBMS Concepts',
        studyStats: {
          totalReviews: 4,
          correctCount: 3,
          lastReviewed: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          nextReview: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
        },
        interval: 5,
        easeFactor: 2.5
      },
      {
        createdBy: student._id,
        subject: subjects[1]._id,
        subjectName: subjects[1].name,
        unit: allUnits[4]._id,
        question: 'What is normalization and why is it important?',
        answer: 'Normalization is the process of organizing database tables to reduce redundancy and dependency. It ensures data integrity, eliminates anomalies, and makes database maintenance easier.',
        tags: ['normalization', 'database-design'],
        difficulty: 'medium',
        deck: 'DBMS Concepts',
        studyStats: {
          totalReviews: 0,
          correctCount: 0
        },
        interval: 1,
        easeFactor: 2.5
      },

      // OS Flashcards
      {
        createdBy: student._id,
        subject: subjects[2]._id,
        subjectName: subjects[2].name,
        unit: allUnits[5]._id,
        question: 'Explain the difference between Process and Thread',
        answer: 'Process is an independent program in execution with its own memory space. Thread is a lightweight unit of execution within a process that shares the same memory space with other threads.',
        tags: ['process', 'thread', 'concurrency'],
        difficulty: 'easy',
        deck: 'OS Fundamentals',
        studyStats: {
          totalReviews: 6,
          correctCount: 6,
          lastReviewed: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          nextReview: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
        },
        interval: 14,
        easeFactor: 2.9
      },
      {
        createdBy: student._id,
        subject: subjects[2]._id,
        subjectName: subjects[2].name,
        unit: allUnits[6]._id,
        question: 'What is a deadlock and what are its necessary conditions?',
        answer: 'Deadlock is when two or more processes are waiting indefinitely for resources held by each other. Four necessary conditions: 1) Mutual Exclusion 2) Hold and Wait 3) No Preemption 4) Circular Wait',
        hint: 'Four conditions must all be present',
        tags: ['deadlock', 'synchronization', 'resource-management'],
        difficulty: 'hard',
        deck: 'OS Fundamentals',
        studyStats: {
          totalReviews: 3,
          correctCount: 2,
          lastReviewed: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          nextReview: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
        },
        interval: 3,
        easeFactor: 2.4
      },

      // Networks Flashcards
      {
        createdBy: student._id,
        subject: subjects[3]._id,
        subjectName: subjects[3].name,
        question: 'What is the difference between TCP and UDP?',
        answer: 'TCP is connection-oriented, reliable, ordered delivery with error checking and flow control. UDP is connectionless, unreliable, faster, no guarantee of delivery or order. TCP for accuracy, UDP for speed.',
        tags: ['tcp', 'udp', 'protocols'],
        difficulty: 'medium',
        deck: 'Networking',
        studyStats: {
          totalReviews: 2,
          correctCount: 2,
          lastReviewed: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          nextReview: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        },
        interval: 4,
        easeFactor: 2.6
      },

      // Web Dev Flashcards
      {
        createdBy: student._id,
        subject: subjects[4]._id,
        subjectName: subjects[4].name,
        question: 'What is the Virtual DOM in React?',
        answer: 'Virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to optimize updates by comparing (diffing) the virtual DOM with the real DOM and only updating what changed.',
        tags: ['react', 'virtual-dom', 'performance'],
        difficulty: 'medium',
        deck: 'Web Development',
        studyStats: {
          totalReviews: 1,
          correctCount: 1,
          lastReviewed: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          nextReview: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
        },
        interval: 2,
        easeFactor: 2.5
      },

      // Discrete Math Flashcards
      {
        createdBy: student._id,
        subject: subjects[5]._id,
        subjectName: subjects[5].name,
        question: 'What is the Pigeonhole Principle?',
        answer: 'If n items are placed into m containers and n > m, then at least one container must contain more than one item. Used in proofs and combinatorics.',
        hint: 'More pigeons than holes',
        tags: ['combinatorics', 'proof-technique'],
        difficulty: 'easy',
        deck: 'Math Fundamentals',
        studyStats: {
          totalReviews: 0,
          correctCount: 0
        },
        interval: 1,
        easeFactor: 2.5
      },
      {
        createdBy: student._id,
        subject: subjects[5]._id,
        subjectName: subjects[5].name,
        question: 'Define a relation that is reflexive, symmetric, and transitive',
        answer: 'An equivalence relation. Reflexive: aRa for all a. Symmetric: aRb implies bRa. Transitive: aRb and bRc implies aRc. Example: equality (=) is an equivalence relation.',
        tags: ['relations', 'equivalence', 'set-theory'],
        difficulty: 'hard',
        deck: 'Math Fundamentals',
        studyStats: {
          totalReviews: 1,
          correctCount: 0,
          lastReviewed: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          nextReview: new Date()
        },
        interval: 1,
        easeFactor: 2.3
      }
    ]);

    console.log('  ✅ 12 Flashcards created with study stats');

    // ==================== SUMMARY ====================
    console.log('\n' + '─'.repeat(50));
    console.log('📊 Seed Data Summary:');
    console.log('─'.repeat(50));
    console.log(`  👤 User:          student@edutrack.com`);
    console.log(`  📚 Subjects:      ${subjects.length}`);
    console.log(`  📖 Units:         ${allUnits.length}`);
    console.log(`  📝 Notes:         ${notes.length} (with AI analysis)`);
    console.log(`  📋 Assignments:   ${assignments.length}`);
    console.log(`  📅 Timetable:     ${timetableEntries.length} entries`);
    console.log(`  📈 Progress:      ${progressRecords.length} records`);
    console.log(`  📢 Announcements: ${announcements.length}`);
    console.log(`  🃏 Flashcards:    ${flashcards.length} (with spaced repetition)`);
    console.log('─'.repeat(50));
    console.log('\n  🔑 Login: student@edutrack.com / student123\n');

    return { studentToken, student, subjects };

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
};

module.exports = seedDatabase;
