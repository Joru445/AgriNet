import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  documentId,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { getProductReviewSummaries } from "./product-review.service";

const productsRef = collection(db, "products");

export async function getProducts() {
  const q = query(productsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getProductById(id) {
  const snapshot = await getDoc(doc(db, "products", id));

  if (!snapshot.exists()) {
    throw new Error("Product not found.");
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getFarmerProducts(farmerId) {
  const q = query(
    productsRef,
    where("farmerId", "==", farmerId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function createProduct(data) {
  const docRef = await addDoc(productsRef, {
    name: data.name,
    category: data.category,
    price: Number(data.price),
    originalPrice:
      data.originalPrice !== "" &&
      data.originalPrice != null &&
      !isNaN(Number(data.originalPrice)) &&
      Number(data.originalPrice) > 0
        ? Number(data.originalPrice)
        : null,
    stock: Number(data.stock),
    unit: data.unit,

    farmerId: data.farmerId,

    images: data.images || [],

    available: data.available ?? true,

    ratingSummary: {
      average: 0,
      count: 0,
    },

    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateProduct(id, data) {
  await updateDoc(doc(db, "products", id), data);
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

export async function getMarketplaceProductsPage({ pageSize = 24, cursor } = {}) {
  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];

  if (cursor) constraints.splice(1, 0, startAfter(cursor));

  const productSnapshot = await getDocs(query(productsRef, ...constraints));
  const products = productSnapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...productDoc.data(),
  }));

  const farmerMap = await getFarmersByIds(
    [...new Set(products.map((product) => product.farmerId).filter(Boolean))],
  );

  // Fetch live review summaries for products with no ratingSummary or with count === 0 (stale)
  const staleProductIds = products
    .filter((product) => !product.ratingSummary || product.ratingSummary.count === 0)
    .map((product) => product.id);
  const liveRatingMap = await getProductReviewSummaries(staleProductIds);

  return {
    products: products.map((product) => {
      const farmer = farmerMap.get(product.farmerId);

      // Use live rating if available (for stale or missing ratingSummary)
      const liveRating = liveRatingMap.get(product.id);
      const rating = (liveRating && liveRating.count > 0)
        ? liveRating
        : (product.ratingSummary?.count > 0 ? product.ratingSummary : {});

      return {
        ...product,

      farmer: farmer
        ? {
            uid: farmer.uid,
            fullname: farmer.fullname,
            username: farmer.username,
            farmName: farmer.farmName,
            profilePicture: farmer.profilePicture,
            location: farmer.location,
            verified: farmer.verified === true,
          }
        : null,

        productRating: Number(rating.average ?? product.productRating ?? 0),
        reviewCount: Number(rating.count ?? product.reviewCount ?? 0),
      };
    }),
    cursor: productSnapshot.docs.at(-1) ?? null,
    hasMore: productSnapshot.docs.length === pageSize,
  };
}

async function getFarmersByIds(ids) {
  const farmers = new Map();
  if (!ids || ids.length === 0) return farmers;

  for (let index = 0; index < ids.length; index += 30) {
    const batch = ids.slice(index, index + 30);
    try {
      const snapshot = await getDocs(
        query(collection(db, "farmers"), where(documentId(), "in", batch)),
      );

      snapshot.docs.forEach((farmerDoc) => {
        farmers.set(farmerDoc.id, {
          uid: farmerDoc.id,
          ...farmerDoc.data(),
        });
      });
    } catch (err) {
      console.warn("Error fetching farmers batch:", err);
    }

    const missingIds = batch.filter((id) => !farmers.has(id));
    if (missingIds.length > 0) {
      try {
        const userSnapshot = await getDocs(
          query(collection(db, "users"), where(documentId(), "in", missingIds)),
        );
        userSnapshot.docs.forEach((userDoc) => {
          farmers.set(userDoc.id, {
            uid: userDoc.id,
            ...userDoc.data(),
          });
        });
      } catch (err) {
        console.warn("Error fetching fallback users batch:", err);
      }
    }
  }

  return farmers;
}
