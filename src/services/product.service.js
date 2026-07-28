import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

import { getFarmers } from "./farmer.service";
import { getProductReviews } from "./product-review.service";

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

export async function getMarketplaceProducts() {
  const [productSnapshot, farmers, reviews] = await Promise.all([
    getDocs(query(productsRef, orderBy("createdAt", "desc"))),
    getFarmers(),
    getProductReviews(),
  ]);

  const farmerMap = new Map(farmers.map((farmer) => [farmer.uid, farmer]));

  const ratingMap = new Map();

  for (const review of reviews) {
    const current = ratingMap.get(review.productId) ?? {
      total: 0,
      count: 0,
    };

    current.total += Number(review.rating);
    current.count += 1;

    ratingMap.set(review.productId, current);
  }

  return productSnapshot.docs.map((doc) => {
    const product = {
      id: doc.id,
      ...doc.data(),
    };

    const farmer = farmerMap.get(product.farmerId);

    const rating = ratingMap.get(product.id);

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

      productRating: rating
        ? Number((rating.total / rating.count).toFixed(1))
        : 0,

      reviewCount: rating?.count ?? 0,
    };
  });
}
