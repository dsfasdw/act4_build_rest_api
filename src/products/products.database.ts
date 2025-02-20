import { Product, Products, UnitProduct } from "./products.interface";
import { v4 as random } from "uuid";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

let products: Products = loadProducts();


function loadProducts(): Products {
  try {
    const productsPath = resolve("products.json")
    const data = readFileSync(productsPath,"utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(`Error loading products: ${error}`);
    return {};
  }
}


function saveProducts(): void {
  try {
    const productsPath = resolve("products.json")
    writeFileSync(productsPath, JSON.stringify(products,null,2), "utf-8");
    console.log("Products saved successfully!");
  } catch (error) {
    console.log("Error saving products:", error);
  }
}


export const findAll = async (): Promise<UnitProduct[]> => Object.values(products);


export const findOne = async (id: string): Promise<UnitProduct | undefined> => products[id];


export const create = async (productInfo: Product): Promise<UnitProduct> => {
  let id = random();


  while (products[id]) {
    id = random();
  }

  const newProduct: UnitProduct = {
    id,
    ...productInfo,
  };

  products[id] = newProduct;
  saveProducts();

  return newProduct;
};


export const update = async (id: string, updateValues: Product): Promise<UnitProduct | null> => {
  if (!products[id]) {
    return null;
  }

  products[id] = {
    id, 
    ...updateValues,
  };

  saveProducts();

  return products[id];
};


export const remove = async (id: string): Promise<boolean> => {
  if (!products[id]) {
    return false;
  }

  delete products[id];
  saveProducts();
  return true;
};
