import Food from '../models/Food.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';

export const getAllFoods = async (query) => {
  const { category, search, sort, minPrice, maxPrice } = query;

  const filter = {};
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 }; // newest first, default
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };

  return Food.find(filter).populate('category', 'name image').sort(sortOption);
};

export const getFoodById = async (id) => {
  const food = await Food.findById(id).populate('category', 'name image');
  if (!food) {
    throw new ApiError(404, 'Food not found');
  }
  return food;
};

export const createFood = async (data) => {
  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) {
    throw new ApiError(400, 'Referenced category does not exist');
  }
  const food = await Food.create(data);
  return food.populate('category', 'name image');
};
export const updateFood = async (id, data) => {
  if (data.category) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      throw new ApiError(400, 'Referenced category does not exist');
    }
  }

  const food = await Food.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  }).populate('category', 'name image');

  if (!food) {
    throw new ApiError(404, 'Food not found');
  }
  return food;
};

export const deleteFood = async (id) => {
  const food = await Food.findByIdAndDelete(id);
  if (!food) {
    throw new ApiError(404, 'Food not found');
  }
  return food;
};