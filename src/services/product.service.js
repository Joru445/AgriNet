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
  const legacyProductIds = products
    .filter((product) => !product.ratingSummary)
    .map((product) => product.id);
  const legacyRatingMap = await getProductReviewSummaries(legacyProductIds);

  return {
    products: products.map((product) => {
      const farmer = farmerMap.get(product.farmerId);
      const rating = product.ratingSummary ?? legacyRatingMap.get(product.id) ?? {};

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

  for (let index = 0; index < ids.length; index += 30) {
    const batch = ids.slice(index, index + 30);
    const snapshot = await getDocs(
      query(collection(db, "farmers"), where(documentId(), "in", batch)),
    );

    snapshot.docs.forEach((farmerDoc) => {
      farmers.set(farmerDoc.id, {
        uid: farmerDoc.id,
        ...farmerDoc.data(),
      });
    });
  }

  return farmers;
}
