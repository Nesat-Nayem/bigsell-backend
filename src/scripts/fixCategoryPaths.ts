import mongoose from 'mongoose';
import { ProductCategory as Category } from '../app/modules/Product-category/product-category.model';
import config from '../app/config';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function connectDB() {
  await mongoose.connect(config.database_url as string);
  console.log('Connected to DB');
}

async function fixCategoryPaths() {
  // Load all categories (not lean; we will save)
  const categories = await Category.find({ isDeleted: false });
  console.log(`Loaded ${categories.length} categories`);

  // Build map and children adjacency
  const byId = new Map<string, any>();
  const childrenMap = new Map<string | null, any[]>();

  categories.forEach((doc: any) => {
    byId.set(String(doc._id), doc);
    const p = doc.parentId ? String(doc.parentId) : null;
    if (!childrenMap.has(p)) childrenMap.set(p, []);
    childrenMap.get(p)!.push(doc);
  });

  // Queue roots (parentId null or parent not found)
  const roots: any[] = [];
  for (const doc of categories) {
    const pid = doc.parentId ? String(doc.parentId) : null;
    if (!pid || !byId.has(pid)) {
      roots.push(doc);
    }
  }

  let updated = 0;

  // BFS from roots
  const queue: Array<{ node: any; parent: any | null }> = [];
  roots.forEach((root) => queue.push({ node: root, parent: null }));

  const visited = new Set<string>();

  while (queue.length > 0) {
    const { node, parent } = queue.shift()!;
    const id = String(node._id);
    if (visited.has(id)) continue; // prevent cycles
    visited.add(id);

    // Ensure slug exists
    if (!node.slug || typeof node.slug !== 'string' || !node.slug.trim()) {
      node.slug = generateSlug(node.title || 'category');
    }

    // Compute level & path
    const oldLevel = node.level;
    const oldPath = node.path;

    if (!parent) {
      node.level = 0;
      node.path = node.slug;
    } else {
      node.level = (parent.level || 0) + 1;
      node.path = `${parent.path}/${node.slug}`;
    }

    if (node.level !== oldLevel || node.path !== oldPath) {
      await node.save();
      updated++;
      console.log(`Updated ${node.title} -> level: ${node.level}, path: ${node.path}`);
    }

    // Enqueue children
    const childList = childrenMap.get(id) || [];
    childList.forEach((child) => queue.push({ node: child, parent: node }));
  }

  console.log(`Done. Updated ${updated} categories.`);
}

(async function run() {
  try {
    await connectDB();
    await fixCategoryPaths();
  } catch (err) {
    console.error('Error fixing category paths:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
})();
